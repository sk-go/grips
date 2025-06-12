# Test Audio Upload

$config = Get-Content .env | ConvertFrom-StringData
$BUCKET_NAME = $config.BUCKET_NAME

# Upload test audio
$testFile = "test-audio.wav"
Write-Host "📤 Uploading test audio..." -ForegroundColor Yellow
gsutil cp $testFile gs://$BUCKET_NAME/test/

Write-Host "✅ Check Firestore for results!" -ForegroundColor Green