Param()
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Push-Location $PSScriptRoot

if (-Not (Test-Path ".env.local")) {
  if (Test-Path ".env.local.example") {
    Copy-Item ".env.local.example" ".env.local"
  }
}

npm install
Write-Host "Iniciando Next.js em http://127.0.0.1:3000 ..." -ForegroundColor Green
npm run dev
