Param()
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Push-Location $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\run_dev.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; .\run_dev.ps1"
