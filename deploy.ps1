# SeAnAI Docker Deployment Script for Windows PowerShell
# Usage: .\deploy.ps1 [production|development]

param(
    [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"

$ComposeFile = "docker-compose.yml"
$BackendContainer = "seanai-backend"
$FrontendContainer = "seanai-frontend"
$PythonContainer = "seanai-python"

if ($Environment -eq "production") {
    $ComposeFile = "docker-compose.prod.yml"
    Write-Host "🚀 Deploying to PRODUCTION..." -ForegroundColor Yellow
    $BackendContainer = "seanai-backend-prod"
    $FrontendContainer = "seanai-frontend-prod"
    $PythonContainer = "seanai-python-prod"
} else {
    Write-Host "🚀 Deploying to DEVELOPMENT..." -ForegroundColor Cyan
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "📝 Please copy env.template to .env and fill in your values" -ForegroundColor Yellow
    exit 1
}

function Wait-ForHealthyContainer {
    param(
        [string]$ContainerName,
        [int]$TimeoutSeconds = 180
    )

    $interval = 5
    $elapsed = 0

    Write-Host "⏳ Waiting for $ContainerName to become healthy..." -ForegroundColor DarkYellow

    while ($elapsed -lt $TimeoutSeconds) {
        try {
            $status = docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' $ContainerName 2>$null
        } catch {
            Start-Sleep -Seconds $interval
            $elapsed += $interval
            continue
        }

        if ($status -eq "healthy" -or $status -eq "running") {
            Write-Host "✅ $ContainerName is healthy." -ForegroundColor Green
            return
        }

        if ($status -eq "unhealthy") {
            throw "$ContainerName reported an unhealthy status."
        }

        Start-Sleep -Seconds $interval
        $elapsed += $interval
    }

    throw "$ContainerName did not become healthy within $TimeoutSeconds seconds."
}

Write-Host "📦 Building Docker images..." -ForegroundColor Cyan
docker compose -f $ComposeFile build

Write-Host "🛑 Stopping existing containers..." -ForegroundColor Cyan
docker compose -f $ComposeFile down

Write-Host "🚀 Starting Python + Backend services first..." -ForegroundColor Cyan
docker compose -f $ComposeFile up -d python backend

Wait-ForHealthyContainer -ContainerName $PythonContainer
Wait-ForHealthyContainer -ContainerName $BackendContainer

Write-Host "🚀 Starting frontend after backend is healthy..." -ForegroundColor Cyan
docker compose -f $ComposeFile up -d frontend

Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "📊 Service status:" -ForegroundColor Cyan
docker compose -f $ComposeFile ps

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Services:" -ForegroundColor Cyan
if ($Environment -eq "production") {
    Write-Host "   Frontend: http://localhost (mapped to ports 80/443)"
    Write-Host "   Backend:  http://localhost:5000"
    Write-Host "   Python:   http://localhost:8000"
} else {
    Write-Host "   Frontend: http://localhost:5173"
    Write-Host "   Backend:  http://localhost:5000"
    Write-Host "   Python:   http://localhost:8000"
}
Write-Host ""
Write-Host "📋 View logs: docker compose -f $ComposeFile logs -f" -ForegroundColor Yellow
Write-Host "🛑 Stop:     docker compose -f $ComposeFile down" -ForegroundColor Yellow

