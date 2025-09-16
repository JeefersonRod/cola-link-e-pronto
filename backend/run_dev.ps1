Param()
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Push-Location $PSScriptRoot

if (-Not (Test-Path ".venv")) {
  python -m venv .venv
}
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt

Write-Host "Iniciando FastAPI em http://127.0.0.1:8000 ..." -ForegroundColor Green
uvicorn main:app --reload --host 127.0.0.1 --port 8000
