@echo off
REM SeaTrace - ML Model Training Script
REM Trains the ML models on Indian coastal hazard data before launching

echo ============================================================
echo     SeaTrace ML Model Training
echo     Indian Coastal Hazard Prediction Models
echo ============================================================
echo.

cd ml

REM Activate Python virtual environment
call venv\Scripts\activate.bat

echo Training ML models on Indian coastal data...
echo This will take 30-60 seconds...
echo.

REM Train the models
python src/predict.py

if errorlevel 1 (
    echo.
    echo ERROR: Model training failed!
    call venv\Scripts\deactivate.bat
    cd ..
    pause
    exit /b 1
)

call venv\Scripts\deactivate.bat
cd ..

echo.
echo ============================================================
echo ML Model Training Complete!
echo ============================================================
echo.
echo Models saved to ml/data/trained_models.pkl
echo Ready to make predictions on Indian coastal hazards!
echo.
pause
