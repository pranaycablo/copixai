# scripts/run-all.ps1
# HERO AI — GLOBAL LAUNCH RUNNER
# Starts Backend Engine and Launches Frontend

Write-Host "`n🚀 STARTING HERO AI ECOSYSTEM...`n" -ForegroundColor Cyan

# 1. Start Backend
Write-Host "📡 Launching Backend Engine on Port 5000..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "../backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm start"

# 2. Wait a bit for backend
Start-Sleep -Seconds 2

# 3. Open Frontend
Write-Host "🎨 Opening Frontend Interface..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "../frontend/index.html"
Start-Process "explorer.exe" "$frontendPath"

Write-Host "`n✅ HeroAi is now initializing." -ForegroundColor Green
Write-Host "🔗 Admin Panel: frontend/admin.html" -ForegroundColor Red
Write-Host "🔗 API Health: http://localhost:5000/health" -ForegroundColor Gray
Write-Host "`nMonitor the backend window for live logs.`n"

