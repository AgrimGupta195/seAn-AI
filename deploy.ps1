# SeAnAI Docker Deployment Script for Windows PowerShell
# Usage: .\deploy.ps1 [production|development]

param(
    [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"

$ComposeFile = "docker-compose.yml"

if ($Environment -eq "production") {
    $ComposeFile = "docker-compose.prod.yml"
    Write-Host "🚀 Deploying to PRODUCTION..." -ForegroundColor Yellow
} else {
    Write-Host "🚀 Deploying to DEVELOPMENT..." -ForegroundColor Cyan
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "📝 Please copy env.template to .env and fill in your values" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Building Docker images..." -ForegroundColor Cyan
docker compose -f $ComposeFile build

Write-Host "🛑 Stopping existing containers..." -ForegroundColor Cyan
docker compose -f $ComposeFile down

Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker compose -f $ComposeFile up -d

Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "📊 Service status:" -ForegroundColor Cyan
docker compose -f $ComposeFile ps

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Services:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173"
Write-Host "   Backend:  http://localhost:5000"
Write-Host "   Python:   http://localhost:8000"
Write-Host ""
Write-Host "📋 View logs: docker compose -f $ComposeFile logs -f" -ForegroundColor Yellow
Write-Host "🛑 Stop:     docker compose -f $ComposeFile down" -ForegroundColor Yellow

