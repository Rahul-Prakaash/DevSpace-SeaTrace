@echo off
REM SeaTrace - One-Click Launcher
REM Launches all services automatically with ML model training

title SeaTrace Launcher

echo ============================================================
echo     SeaTrace - Coastal Hazard Mapping Platform
echo     Team PrismShift - Devspace 2026
echo ============================================================
echo.

REM Check if MongoDB is running
echo [1/4] Checking MongoDB connection...
timeout /t 1 /nobreak >nul

REM Try to connect to MongoDB
mongosh --quiet --eval "db.version()" >nul 2>&1
if errorlevel 1 (
    echo.
    echo WARNING: MongoDB is not running!
    echo Please start MongoDB before launching SeaTrace.
    echo.
    echo Options:
    echo   1. Run 'mongod' in another terminal
    echo   2. Start MongoDB as a service: net start MongoDB
    echo.
    choice /C YN /M "Do you want to continue anyway"
    if errorlevel 2 exit /b 1
)
echo     MongoDB is ready!

REM Train ML models if not already trained
echo.
echo [2/4] Checking ML models...
if not exist "ml\data\trained_models.pkl" (
    echo     No trained models found. Training now...
    call train-models.bat
) else (
    echo     ML models found and ready!
)

REM Create .env files if they don't exist
if not exist "backend\.env" (
    copy backend\.env.example backend\.env >nul 2>&1
)
if not exist "ml\.env" (
    copy ml\.env.example ml\.env >nul 2>&1
)
if not exist "frontend\.env" (
    copy frontend\.env.example frontend\.env >nul 2>&1
)

echo.
echo [3/4] Starting backend services...
echo.

REM Start Backend API in new window
start "SeaTrace Backend API" cmd /k "cd backend && npm run dev"
echo     Backend API starting on http://localhost:3000

REM Wait for backend to initialize
timeout /t 3 /nobreak >nul

REM Start ML Service in new window
start "SeaTrace ML Service" cmd /k "cd ml && venv\Scripts\activate && python src/api.py"
echo     ML Service starting on http://localhost:5000

REM Wait for ML service to initialize
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Starting frontend...
echo.

REM Start Frontend in new window and open browser
start "SeaTrace Frontend" cmd /k "cd frontend && npm run dev"
echo     Frontend starting on http://localhost:5173

REM Wait a bit then open browser
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ============================================================
echo     SeaTrace is now running!
echo ============================================================
echo.
echo Services:
echo   - Frontend:  http://localhost:5173
echo   - Backend:   http://localhost:3000
echo   - ML API:    http://localhost:5000
echo.
echo TIPS:
echo   - Keep this window and the service windows open
echo   - Press Ctrl+C in service windows to stop them
echo   - Close all windows when done
echo.
echo ============================================================
echo.
echo Press any key to open the application in your browser...
pause >nul
start http://localhost:5173
