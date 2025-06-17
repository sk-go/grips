# Test Audio Upload

$config = Get-Content .env | ConvertFrom-StringData
$BUCKET_NAME = $config.BUCKET_NAME

$testFile = "test-audio.wav"
$client = "TESTCLIENT"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$destPath = "clients/$client/audio/$timestamp.wav"

Write-Host "📤 Uploading test audio to $destPath ..." -ForegroundColor Yellow
gsutil cp $testFile gs://$BUCKET_NAME/$destPath

Write-Host "✅ Check Firestore for results!" -ForegroundColor Green 