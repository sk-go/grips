# Copy utils.py to each function directory
$functions = @(
    "audio_processor",
    "nlp_engine",
    "pw_client"
)

foreach ($function in $functions) {
    $source = "backend/utils.py"
    $destination = "backend/functions/$function/utils.py"
    
    Write-Host "Copying utils.py to $function..."
    Copy-Item -Path $source -Destination $destination -Force
}

Write-Host "✅ Utils copied successfully!" 