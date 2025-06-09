# Load config from .env file
$config = @{}
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^([^=]+)=(.*)$") {
        $config[$matches[1]] = $matches[2]
    }
}

$PROJECT_ID = $config.PROJECT_ID
$REGION = $config.REGION
$BUCKET_NAME = $config.BUCKET_NAME

Write-Host "🔧 Fixing GCP permissions for $PROJECT_ID..." -ForegroundColor Green

# Get the project number
$PROJECT_NUMBER = $(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
Write-Host "Project Number: $PROJECT_NUMBER" -ForegroundColor Cyan

# The correct format for the Cloud Storage service account
$GCS_SERVICE_ACCOUNT = "service-$PROJECT_NUMBER@gs-project-accounts.iam.gserviceaccount.com"
Write-Host "GCS Service Account: $GCS_SERVICE_ACCOUNT" -ForegroundColor Cyan

# Grant necessary permissions
Write-Host "Granting Pub/Sub Publisher role..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$GCS_SERVICE_ACCOUNT" `
  --role="roles/pubsub.publisher"

# Grant permissions to the default compute service account as well
$COMPUTE_SERVICE_ACCOUNT = "$PROJECT_NUMBER-compute@developer.gserviceaccount.com"
Write-Host "Granting permissions to Compute Service Account: $COMPUTE_SERVICE_ACCOUNT" -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$COMPUTE_SERVICE_ACCOUNT" `
  --role="roles/pubsub.publisher"

# Grant permissions to the Cloud Functions service account
$FUNCTIONS_SERVICE_ACCOUNT = "$PROJECT_ID@appspot.gserviceaccount.com"
Write-Host "Granting permissions to Functions Service Account: $FUNCTIONS_SERVICE_ACCOUNT" -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$FUNCTIONS_SERVICE_ACCOUNT" `
  --role="roles/pubsub.publisher"

# Grant Eventarc service agent necessary roles
$EVENTARC_SERVICE_ACCOUNT = "service-$PROJECT_NUMBER@gcp-sa-eventarc.iam.gserviceaccount.com"
Write-Host "Granting permissions to Eventarc Service Account: $EVENTARC_SERVICE_ACCOUNT" -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$EVENTARC_SERVICE_ACCOUNT" `
  --role="roles/eventarc.serviceAgent"

Write-Host "Creating alternative pubsub topic for bucket notifications..." -ForegroundColor Yellow
gcloud pubsub topics create gcs-notifications --project=$PROJECT_ID

Write-Host "Setting up bucket notifications..." -ForegroundColor Yellow
gsutil notification create -t gcs-notifications -f json gs://$BUCKET_NAME

Write-Host "✅ Permissions fixed!" -ForegroundColor Green
Write-Host "Now update your deployment script to use the pubsub topic trigger instead of storage trigger" -ForegroundColor Yellow