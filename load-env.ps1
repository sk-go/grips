# Utility: load-env.ps1
# Usage: $config = & "$PSScriptRoot\load-env.ps1"
param(
    [string]$Path = ".env"
)

$envConfig = @{}

if (-Not (Test-Path $Path)) {
    Throw "Cannot find .env file at path '$Path'"
}

Get-Content $Path | ForEach-Object {
    if ($_ -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envConfig[$key] = $value
    }
}

return $envConfig 