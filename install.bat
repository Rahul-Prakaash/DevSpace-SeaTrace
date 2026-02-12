@echo off
REM SeaTrace - One-Click Installer
REM Installs all dependencies for frontend, backend, and ML service

echo ============================================================
echo     SeaTrace Installation Script
echo     Team PrismShift - Devspace 2026
echo ============================================================
echo.

REM Check for Node.js
echo [1/4] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo     Node.js found!

REM Check for Python
echo [2/4] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Please download and install Python from https://python.org/
    pause
    exit /b 1
)
echo     Python found!

echo.
echo ============================================================
echo Installing Frontend Dependencies...
echo ============================================================
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
cd ..
echo     Frontend dependencies installed!

echo.
echo ============================================================
echo Installing Backend Dependencies...
echo ============================================================
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
cd ..
echo     Backend dependencies installed!

echo.
echo ============================================================
echo Installing ML Service Dependencies...
echo ============================================================
cd ml

REM Create virtual environment if it doesn't exist
if not exist "venv\" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install packages
echo Installing Python packages...
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: ML service installation failed!
    pause
    exit /b 1
)
call venv\Scripts\deactivate.bat
cd ..
echo     ML dependencies installed!

echo.
echo ============================================================
echo Creating Environment Files...
echo ============================================================

REM Create .env files from examples if they don't exist
if not exist "frontend\.env" (
    copy frontend\.env.example frontend\.env >nul
    echo     Frontend .env created
)

if not exist "backend\.env" (
    copy backend\.env.example backend\.env
    echo     Backend .env created
)

if not exist "ml\.env" (
    copy ml\.env.example ml\.env
    echo     ML .env created
)

echo.
echo ============================================================
echo Installation Complete!
echo ============================================================
echo.
echo Next steps:
echo   1. Make sure MongoDB is running
echo   2. Run seed-database.bat to populate sample data
echo   3. Run start-seatrace.bat to launch the application
echo.
pause
