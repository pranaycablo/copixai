@echo off
title COPIX AI — GLOBAL LAUNCH RUNNER
echo 🚀 STARTING COPIX AI ECOSYSTEM...

:: Check if backend exists
if not exist "backend" (
    echo [ERROR] Backend folder not found. Please run this from the project root.
    pause
    exit
)

:: Start Backend
echo 📡 Launching Backend Engine on Port 5000...
start cmd /k "cd backend && npm start"

:: Wait for backend
timeout /t 3 /nobreak > nul

:: Open Frontend
echo 🎨 Opening Live Frontend Interface...
start http://localhost:5000

echo.
echo ✅ CopixAI is now initializing.
echo 🔗 Admin Panel: frontend/admin.html
echo 🔗 API Health: http://localhost:5000/health
echo.
echo Monitor the backend window for live logs.
pause
