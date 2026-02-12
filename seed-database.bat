@echo off
REM SeaTrace - Database Seeding Script
REM Populates MongoDB with sample coastal hazard data

echo ============================================================
echo     SeaTrace Database Seeding
echo ============================================================
echo.

echo Checking MongoDB connection...
timeout /t 2 /nobreak >nul

cd backend
echo Seeding database with sample data...
call npm run seed

if errorlevel 1 (
    echo.
    echo ERROR: Database seeding failed!
    echo Make sure MongoDB is running.
    echo.
    pause
    exit /b 1
)

cd ..
echo.
echo ============================================================
echo Database seeding completed successfully!
echo ============================================================
echo.
pause
