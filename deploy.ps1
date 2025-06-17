# Main Deployment Script
# This script triggers the consolidated Cloud Build pipeline.

# Load config from .env file
$config = @{}
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^([^=]+)=(.*)$") {
        $config[$matches[1]] = $matches[2]
    }
}

$PROJECT_ID = $config.PROJECT_ID
$BUCKET_NAME = $config.BUCKET_NAME

Write-Host "🚀 Triggering Cloud Build deployment for $PROJECT_ID..." -ForegroundColor Green

# Copy utils.py to all function directories
Write-Host "📦 Copying utils.py to function directories..." -ForegroundColor Blue
.\copy_utils.ps1

# Ensure we're using the correct project
gcloud config set project $PROJECT_ID

# Submit the build to Google Cloud Build
gcloud builds submit . --config cloudbuild.yaml --substitutions=_BUCKET_NAME=$BUCKET_NAME