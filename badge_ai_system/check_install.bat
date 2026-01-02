@echo off
echo 🚀 AI Badge System - Installation Check
echo ======================================

echo.
echo 🔍 Checking Python...
python --version 2>nul && echo ✅ Python OK || echo ❌ Python not found

echo.
echo 🔍 Checking FastAPI...
python -c "import fastapi; print('✅ FastAPI installed:', fastapi.__version__)" 2>nul || echo ❌ FastAPI not installed

echo.
echo 🔍 Checking other key packages...
python -c "import uvicorn, streamlit, pandas, scikit-learn; print('✅ Core packages OK')" 2>nul || echo ❌ Some packages missing

echo.
echo 🔍 Checking project structure...
if exist app\main.py echo ✅ API file exists
if exist dashboard\app.py echo ✅ Dashboard file exists
if exist ai\ai_engine.py echo ✅ AI engine exists

echo.
echo 📁 Checking directories...
if exist ai\models echo ✅ AI models directory exists
if exist logs echo ✅ Logs directory exists (will be created on first run)

echo.
echo 🎯 Next steps:
echo 1. If packages are missing: pip install -r requirements.txt
echo 2. Start API server: uvicorn app.main:app --reload
echo 3. Start dashboard: streamlit run dashboard/app.py
echo 4. Test API: curl http://localhost:8000/health

echo.
pause
