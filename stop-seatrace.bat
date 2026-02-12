@echo off
REM SeaTrace - Quick Stop Script
REM Closes all SeaTrace service windows

echo Stopping all SeaTrace services...

REM Kill Node.js processes (backend + frontend)
taskkill /FI "WINDOWTITLE eq SeaTrace*" /F >nul 2>&1

REM Kill Python processes (ML service)
for /f "tokens=2" %%a in ('tasklist ^| findstr /I "python.exe"') do (
    tasklist /FI "PID eq %%a" /FI "WINDOWTITLE eq SeaTrace*" >nul 2>&1
    if not errorlevel 1 taskkill /PID %%a /F >nul 2>&1
)

echo.
echo All SeaTrace services stopped.
pause
