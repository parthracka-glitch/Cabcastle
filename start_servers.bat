@echo off
echo Starting Cab Castle Goa (Express TypeScript) Backend and Frontend...
echo.

cd /d "%~dp0"

start "Cab Castle Express Backend (Port 8000)" cmd /k "cd backend && npm run dev"

timeout /t 2 >nul

start "Cab Castle Frontend (Port 3000)" cmd /k "cd frontend && npm start"

echo.
echo Both servers are launching!
echo Backend API Endpoint: http://localhost:8000/api
echo Frontend Web App: http://localhost:3000
echo.
pause
