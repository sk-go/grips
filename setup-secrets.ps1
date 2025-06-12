# API Keys Setup Script

Write-Host "🔐 Storing API Keys in Secret Manager..." -ForegroundColor Green

# AssemblyAI Key
Write-Host "Setting up AssemblyAI API Key..." -ForegroundColor Blue
$assemblyKey = Read-Host "AssemblyAI API Key" -AsSecureString
$assemblyKeyText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($assemblyKey))
echo $assemblyKeyText | gcloud secrets create assemblyai-api-key --data-file=-

# OpenAI Key
Write-Host "Setting up OpenAI API Key..." -ForegroundColor Blue
$openaiKey = Read-Host "OpenAI API Key" -AsSecureString
$openaiKeyText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($openaiKey))
echo $openaiKeyText | gcloud secrets create openai-api-key --data-file=-

# PW API Credentials
Write-Host "Setting up Professional Works API credentials..." -ForegroundColor Blue
$pwToken = Read-Host "PW API Token" -AsSecureString
$pwTokenText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($pwToken))
echo $pwTokenText | gcloud secrets create pw-api-token --data-file=-

$pwUser = Read-Host "PW User ID"
echo $pwUser | gcloud secrets create pw-user-id --data-file=-

Write-Host "✅ Secrets stored successfully!" -ForegroundColor Green 