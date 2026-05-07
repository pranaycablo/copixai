# run-all.ps1
# HERO AI — GLOBAL LAUNCH RUNNER
# Starts Backend Engine and Launches Frontend

Write-Host "`n🚀 STARTING HERO AI ECOSYSTEM...`n" -ForegroundColor Cyan

# 1. Start Backend
Write-Host "📡 Launching Backend Engine on Port 5000..." -ForegroundColor Yellow
$backendPath = "backend"
if (Test-Path $backendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"
} else {
    Write-Host "[ERROR] Backend folder not found!" -ForegroundColor Red
    return
}

# 2. Wait a bit for backend
Start-Sleep -Seconds 3

# 3. Open Frontend
Write-Host "🎨 Opening Frontend Interface..." -ForegroundColor Yellow
$frontendPath = "frontend/index.html"
if (Test-Path $frontendPath) {
    Start-Process "explorer.exe" "$frontendPath"
}

Write-Host "`n✅ HeroAi is now initializing." -ForegroundColor Green
Write-Host "🔗 Admin Panel: frontend/admin.html" -ForegroundColor Red
Write-Host "🔗 API Health: http://localhost:5000/health" -ForegroundColor Gray
Write-Host "`nMonitor the backend window for live logs.`n"

