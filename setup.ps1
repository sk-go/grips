# GRIPS Setup Script - Now Idempotent

# Check if .env file exists to determine if we are setting up a new project or configuring an existing one
if (Test-Path ".env") {
    Write-Host "Found existing .env file. Configuring project from .env..." -ForegroundColor Cyan
    $config = Get-Content ".env" | ConvertFrom-StringData
    $PROJECT_ID = $config.PROJECT_ID
    $REGION = $config.REGION
    $BUCKET_NAME = $config.BUCKET_NAME
    
    # Ensure gcloud is configured to use the correct project
    Write-Host "Configuring gcloud for existing project: $PROJECT_ID" -ForegroundColor Cyan
    gcloud config set project $PROJECT_ID
} else {
    Write-Host "No .env file found. Starting setup for a new project..." -ForegroundColor Yellow
    $PROJECT_ID = "grips-assistant-$(Get-Random -Maximum 9999)"
    $REGION = "europe-west3"
    $BUCKET_NAME = "$PROJECT_ID-audio"

    Write-Host "🚀 Setting up NEW GRIPS Assistant Project..." -ForegroundColor Green
    Write-Host "New Project ID: $PROJECT_ID" -ForegroundColor Cyan

    # Create new GCP project
    gcloud projects create $PROJECT_ID --name="GRIPS Assistant"
    gcloud config set project $PROJECT_ID

    # Enable billing (user needs to link billing account manually)
    Write-Host "Please link a billing account for project '$PROJECT_ID' at:" -ForegroundColor Yellow
    Write-Host "https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
    Read-Host "Press Enter after linking billing account"

    # Create .env file
    Write-Host "📝 Creating .env file..." -ForegroundColor Blue
    @"
PROJECT_ID=$PROJECT_ID
BUCKET_NAME=$BUCKET_NAME
REGION=$REGION
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

Write-Host "🔧 Enabling required APIs for project $PROJECT_ID..." -ForegroundColor Blue
gcloud services enable `
    cloudfunctions.googleapis.com `
    cloudbuild.googleapis.com `
    cloudscheduler.googleapis.com `
    eventarc.googleapis.com `
    run.googleapis.com `
    firestore.googleapis.com `
    storage.googleapis.com `
    secretmanager.googleapis.com `
    pubsub.googleapis.com `
    cloudresourcemanager.googleapis.com `
    artifactregistry.googleapis.com

# Create Artifact Registry repository for Docker images if it doesn't exist
Write-Host "🖼️  Checking Artifact Registry repository..." -ForegroundColor Blue
$repoExists = gcloud artifacts repositories list --project=$PROJECT_ID --location=$REGION --filter="name:grips-repo" --format="value(name)"
if (-not $repoExists) {
    Write-Host "Creating Artifact Registry 'grips-repo'..." -ForegroundColor Blue
    gcloud artifacts repositories create grips-repo `
        --repository-format=docker `
        --location=$REGION `
        --description="Docker repository for GRIPS application" `
        --project=$PROJECT_ID --quiet
} else {
    Write-Host "Artifact Registry 'grips-repo' already exists." -ForegroundColor Green
}

# The following commands are now idempotent, checking for existence before creating.
# Create Firestore database
Write-Host "📊 Setting up Firestore..." -ForegroundColor Blue
$firestoreDb = gcloud firestore databases describe --database='(default)' --project=$PROJECT_ID --format="value(name)" 2>$null
if (-not $firestoreDb) {
    Write-Host "Creating Firestore database..." -ForegroundColor Blue
    gcloud firestore databases create --region=$REGION --project=$PROJECT_ID
} else {
    Write-Host "Firestore database already exists." -ForegroundColor Green
}

# Create Cloud Storage bucket
Write-Host "🗂️  Creating storage bucket..." -ForegroundColor Blue
if (-not (gsutil ls gs://$BUCKET_NAME 2>$null)) {
    Write-Host "Creating Cloud Storage bucket gs://$BUCKET_NAME..." -ForegroundColor Blue
    gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME
} else {
    Write-Host "Cloud Storage bucket gs://$BUCKET_NAME already exists." -ForegroundColor Green
}

# Create Pub/Sub topics
Write-Host "📨 Creating Pub/Sub topics..." -ForegroundColor Blue
$topics = @("transcription-complete", "pw-actions")
foreach ($topic in $topics) {
    $topicExists = gcloud pubsub topics describe $topic --project=$PROJECT_ID --format="value(name)" 2>$null
    if (-not $topicExists) {
        Write-Host "Creating Pub/Sub topic '$topic'..." -ForegroundColor Blue
        gcloud pubsub topics create $topic --project=$PROJECT_ID
    } else {
        Write-Host "Pub/Sub topic '$topic' already exists." -ForegroundColor Green
    }
}

Write-Host "✅ Setup for project $PROJECT_ID is complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run setup-secrets.ps1 if you haven't already."
Write-Host "2. Run fix-permissions.ps1 to set up service accounts."
Write-Host "3. Run deploy.ps1 to deploy the application."

Write-Host "PROJECT_ID: $PROJECT_ID" -ForegroundColor Cyan
Write-Host "BUCKET_NAME: $BUCKET_NAME" -ForegroundColor Cyan 