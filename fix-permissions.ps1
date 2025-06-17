# Load config from .env file via helper
$config = & "$PSScriptRoot\load-env.ps1"
$PROJECT_ID   = $config["PROJECT_ID"]
$REGION       = $config["REGION"]
$BUCKET_NAME  = $config["BUCKET_NAME"]

Write-Host "🔧 Fixing GCP permissions for $PROJECT_ID..." -ForegroundColor Green

# Get the project number
$PROJECT_NUMBER = $(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
Write-Host "Project Number: $PROJECT_NUMBER" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 1. Ensure dedicated runtime Service Account exists (grips-backend-sa)
# ------------------------------------------------------------------------------
$APP_SERVICE_ACCOUNT_NAME  = "grips-backend-sa"
$APP_SERVICE_ACCOUNT_EMAIL = "$APP_SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
$sa_exists = gcloud iam service-accounts list --filter="email=$APP_SERVICE_ACCOUNT_EMAIL" --format="value(email)"

if (-not $sa_exists) {
    Write-Host "Creating dedicated service account: $APP_SERVICE_ACCOUNT_EMAIL" -ForegroundColor Cyan
    gcloud iam service-accounts create $APP_SERVICE_ACCOUNT_NAME `
        --display-name="GRIPS Backend Service Account" `
        --project=$PROJECT_ID
} else {
    Write-Host "Dedicated service account $APP_SERVICE_ACCOUNT_EMAIL already exists." -ForegroundColor Green
}

# Helper function to bind a role only if it is not already bound
function Bind-RoleIfMissing {
    param(
        [string]$member,
        [string]$role
    )
    $alreadyBound = gcloud projects get-iam-policy $PROJECT_ID `
        --flatten="bindings[]" `
        --filter="bindings.members:$member bindings.role:$role" `
        --format="value(bindings.role)"
    if (-not $alreadyBound) {
        gcloud projects add-iam-policy-binding $PROJECT_ID `
            --member=$member `
            --role=$role `
            --quiet
        Write-Host "  + bound $role to $member" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ $member already has $role" -ForegroundColor Green
    }
}

# ------------------------------------------------------------------------------
# 2. Bind roles to runtime SA
# ------------------------------------------------------------------------------
Write-Host "Granting data-plane permissions to runtime service account..." -ForegroundColor Blue
Bind-RoleIfMissing "serviceAccount:$APP_SERVICE_ACCOUNT_EMAIL" "roles/secretmanager.secretAccessor"
Bind-RoleIfMissing "serviceAccount:$APP_SERVICE_ACCOUNT_EMAIL" "roles/iam.serviceAccountTokenCreator"
Bind-RoleIfMissing "serviceAccount:$APP_SERVICE_ACCOUNT_EMAIL" "roles/pubsub.publisher"
Bind-RoleIfMissing "serviceAccount:$APP_SERVICE_ACCOUNT_EMAIL" "roles/datastore.user"
Bind-RoleIfMissing "serviceAccount:$APP_SERVICE_ACCOUNT_EMAIL" "roles/eventarc.eventReceiver"
Bind-RoleIfMissing "serviceAccount:$APP_SERVICE_ACCOUNT_EMAIL" "roles/storage.objectCreator"
Bind-RoleIfMissing "serviceAccount:$APP_SERVICE_ACCOUNT_EMAIL" "roles/storage.objectViewer"

# ------------------------------------------------------------------------------
# 3. Cloud Build service account permissions
# ------------------------------------------------------------------------------
$CLOUD_BUILD_SA = "$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"
Write-Host "Granting build/deploy permissions to Cloud Build SA ($CLOUD_BUILD_SA)..." -ForegroundColor Blue
# Cloud Run & Cloud Functions deploy rights
Bind-RoleIfMissing "serviceAccount:$CLOUD_BUILD_SA" "roles/run.admin"
Bind-RoleIfMissing "serviceAccount:$CLOUD_BUILD_SA" "roles/cloudfunctions.admin"
# Artifact Registry write rights
Bind-RoleIfMissing "serviceAccount:$CLOUD_BUILD_SA" "roles/artifactregistry.writer"
# Allow Cloud Build SA to impersonate runtime SA (actAs)
$bindingExists = gcloud iam service-accounts get-iam-policy $APP_SERVICE_ACCOUNT_EMAIL `
    --filter="bindings.role:roles/iam.serviceAccountUser AND bindings.members:serviceAccount:$CLOUD_BUILD_SA" `
    --format="value(bindings.role)" 2>$null
if (-not $bindingExists) {
    Write-Host "  + granting roles/iam.serviceAccountUser on $APP_SERVICE_ACCOUNT_EMAIL to Cloud Build SA" -ForegroundColor Yellow
    gcloud iam service-accounts add-iam-policy-binding $APP_SERVICE_ACCOUNT_EMAIL `
        --member="serviceAccount:$CLOUD_BUILD_SA" `
        --role="roles/iam.serviceAccountUser" --quiet
} else {
    Write-Host "  ✓ Cloud Build SA already has roles/iam.serviceAccountUser on runtime SA" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# 4. Eventarc / PubSub SA permissions
# ------------------------------------------------------------------------------
$PUBSUB_SA = "service-$PROJECT_NUMBER@gcp-sa-pubsub.iam.gserviceaccount.com"
Write-Host "Granting Pub/Sub service account ($PUBSUB_SA) publish permission..." -ForegroundColor Blue
Bind-RoleIfMissing "serviceAccount:$PUBSUB_SA" "roles/pubsub.publisher"

# ------------------------------------------------------------------------------
# 5. Eventarc service agent permissions
# ------------------------------------------------------------------------------
$EVENTARC_SA = "service-$PROJECT_NUMBER@gcp-sa-eventarc.iam.gserviceaccount.com"
Write-Host "Granting Eventarc service agent ($EVENTARC_SA) required role..." -ForegroundColor Blue
Bind-RoleIfMissing "serviceAccount:$EVENTARC_SA" "roles/eventarc.serviceAgent"

# Grant Eventarc service agent storage.admin so it can set bucket notifications
Bind-RoleIfMissing "serviceAccount:$EVENTARC_SA" "roles/storage.admin"

# ------------------------------------------------------------------------------
# 6. Cloud Storage service agent permissions for Pub/Sub notifications
# ------------------------------------------------------------------------------
$GCS_SA = "service-$PROJECT_NUMBER@gs-project-accounts.iam.gserviceaccount.com"
Write-Host "Granting Cloud Storage service agent ($GCS_SA) Pub/Sub publish permission..." -ForegroundColor Blue
Bind-RoleIfMissing "serviceAccount:$GCS_SA" "roles/pubsub.publisher"

# ------------------------------------------------------------------------------
# 7. Allow service agents to impersonate runtime SA (TokenCreator)
# ------------------------------------------------------------------------------
foreach ($AGENT in @($EVENTARC_SA, $PUBSUB_SA, $CLOUD_BUILD_SA)) {
    Write-Host "Granting iam.serviceAccountTokenCreator on $APP_SERVICE_ACCOUNT_EMAIL to $AGENT..." -ForegroundColor Blue
    $already = gcloud iam service-accounts get-iam-policy $APP_SERVICE_ACCOUNT_EMAIL `
        --filter="bindings.role:roles/iam.serviceAccountTokenCreator AND bindings.members:serviceAccount:$AGENT" `
        --format="value(bindings.role)" 2>$null
    if (-not $already) {
        gcloud iam service-accounts add-iam-policy-binding $APP_SERVICE_ACCOUNT_EMAIL `
            --member="serviceAccount:$AGENT" `
            --role="roles/iam.serviceAccountTokenCreator" --quiet
    } else {
        Write-Host "  ✓ $AGENT already has TokenCreator on runtime SA" -ForegroundColor Green
    }
}

# ------------------------------------------------------------------------------
# 8. Cloud Functions service agent permissions
# ------------------------------------------------------------------------------
$GCF_SA = "service-$PROJECT_NUMBER@gcf-admin-robot.iam.gserviceaccount.com"
Write-Host "Granting Cloud Functions service agent ($GCF_SA) Cloud Run admin permission..." -ForegroundColor Blue
Bind-RoleIfMissing "serviceAccount:$GCF_SA" "roles/run.admin"

# Allow it to impersonate the runtime SA (needed when --service-account= is used)
$already = gcloud iam service-accounts get-iam-policy $APP_SERVICE_ACCOUNT_EMAIL `
    --filter="bindings.role:roles/iam.serviceAccountUser AND bindings.members:serviceAccount:$GCF_SA" `
    --format="value(bindings.role)" 2>$null
if (-not $already) {
    gcloud iam service-accounts add-iam-policy-binding $APP_SERVICE_ACCOUNT_EMAIL `
        --member="serviceAccount:$GCF_SA" `
        --role="roles/iam.serviceAccountUser" --quiet
    Write-Host "  + granted iam.serviceAccountUser on runtime SA to Cloud Functions SA" -ForegroundColor Yellow
}

# ------------------------------------------------------------------------------
# 8. Compute Engine default service account permissions (used by Cloud Build workers)
# ------------------------------------------------------------------------------
$COMPUTE_SA = "$PROJECT_NUMBER-compute@developer.gserviceaccount.com"
Write-Host "Granting Cloud Run admin to Compute Engine default SA ($COMPUTE_SA)..." -ForegroundColor Blue
Bind-RoleIfMissing "serviceAccount:$COMPUTE_SA" "roles/run.admin"

Write-Host "✅ Permissions fixed (idempotent)" -ForegroundColor Green