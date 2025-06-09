# Deployment Script für GRIPS (Gen2)

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

Write-Host "🚀 Deploying GRIPS to $PROJECT_ID..." -ForegroundColor Green

# Ensure we're using the correct project
gcloud config set project $PROJECT_ID

# The correct format for the Cloud Storage service account
$GCS_SERVICE_ACCOUNT="service-$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')@gs-project-accounts.iam.gserviceaccount.com"

# Now grant the permissions
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$GCS_SERVICE_ACCOUNT" `
  --role="roles/pubsub.publisher"

# Enable required APIs für Gen2
Write-Host "🔧 Enabling required APIs..." -ForegroundColor Blue
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable pubsub.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable eventarc.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Create Pub/Sub topics
Write-Host "📨 Creating Pub/Sub topics..." -ForegroundColor Blue
gcloud pubsub topics create transcription-complete 2>$null
gcloud pubsub topics create pw-actions 2>$null

# Deploy Cloud Functions (Gen2)
Write-Host "☁️  Deploying Cloud Functions..." -ForegroundColor Blue

# Audio Processor Function (Gen2 with Pub/Sub trigger)
Write-Host "Deploying audio-processor..." -ForegroundColor Yellow
gcloud functions deploy audio-processor `
    --gen2 `
    --source=backend/functions/audio_processor `
    --runtime=python39 `
    --trigger-topic=gcs-notifications `
    --region=$REGION `
    --entry-point=process_audio `
    --memory=512MB `
    --timeout=540s `
    --set-env-vars="GCP_PROJECT=$PROJECT_ID"

# NLP Engine Function (Gen2)
Write-Host "Deploying nlp-engine..." -ForegroundColor Yellow
gcloud functions deploy nlp-engine `
    --gen2 `
    --source=backend/functions/nlp_engine `
    --runtime=python39 `
    --trigger-topic=transcription-complete `
    --region=$REGION `
    --entry-point=process_transcription `
    --memory=1GB `
    --timeout=540s `
    --set-env-vars="GCP_PROJECT=$PROJECT_ID"

# PW Client Function (Gen2)
Write-Host "Deploying pw-client..." -ForegroundColor Yellow
gcloud functions deploy pw-client `
    --gen2 `
    --source=backend/functions/pw_client `
    --runtime=python39 `
    --trigger-topic=pw-actions `
    --region=$REGION `
    --entry-point=handle_pw_action `
    --memory=512MB `
    --timeout=300s `
    --set-env-vars="GCP_PROJECT=$PROJECT_ID"

Write-Host "✅ Deployment complete!" -ForegroundColor Green