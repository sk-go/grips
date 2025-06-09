# GRIPS Setup Script
param([string]$ProjectName = "grips-assistant-$(Get-Random -Maximum 9999)")

$PROJECT_ID = $ProjectName
$REGION = "europe-west3"
$BUCKET_NAME = "$PROJECT_ID-audio"

Write-Host "🚀 Setting up GRIPS Assistant..." -ForegroundColor Green
Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Cyan

# Create new GCP project
gcloud projects create $PROJECT_ID --name="GRIPS Assistant"
gcloud config set project $PROJECT_ID

# Enable billing (user needs to link billing account manually)
Write-Host "Please link a billing account for project $PROJECT_ID:" -ForegroundColor Yellow
Write-Host "https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
Read-Host "Press Enter after linking billing account"

# Enable required APIs
Write-Host "🔧 Enabling APIs..." -ForegroundColor Blue
gcloud services enable `
    cloudfunctions.googleapis.com `
    cloudbuild.googleapis.com `
    cloudscheduler.googleapis.com `
    eventarc.googleapis.com `
    run.googleapis.com `
    firestore.googleapis.com `
    storage.googleapis.com `
    secretmanager.googleapis.com `
    pubsub.googleapis.com

# Create Firestore database
Write-Host "📊 Setting up Firestore..." -ForegroundColor Blue
gcloud firestore databases create --region=$REGION

# Create Cloud Storage bucket
Write-Host "🗂️  Creating storage bucket..." -ForegroundColor Blue
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME

# Create Pub/Sub topics
Write-Host "📨 Creating Pub/Sub topics..." -ForegroundColor Blue
gcloud pubsub topics create transcription-complete
gcloud pubsub topics create pw-actions

# Create .env file
Write-Host "📝 Creating .env file..." -ForegroundColor Blue
@"
PROJECT_ID=$PROJECT_ID
BUCKET_NAME=$BUCKET_NAME
REGION=$REGION
"@ | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run setup-secrets.ps1 to configure API keys"
Write-Host "2. Run deploy.ps1 to deploy the application"
Write-Host ""
Write-Host "PROJECT_ID: $PROJECT_ID" -ForegroundColor Cyan
Write-Host "BUCKET_NAME: $BUCKET_NAME" -ForegroundColor Cyan 