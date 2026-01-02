@echo off
echo 🔍 Testing AI Badge System
echo ==========================

echo.
echo Checking Docker services...
docker-compose ps

echo.
echo Testing API health...
curl -s http://localhost:8000/health || echo "❌ API not responding"

echo.
echo Testing dashboard connectivity...
curl -s http://localhost:8501 | findstr "Streamlit" >nul && echo "✅ Dashboard responding" || echo "❌ Dashboard not responding"

echo.
echo 🎯 If services are not ready, wait a few more seconds and run again.
echo.
echo 📋 Access URLs:
echo - API: http://localhost:8000
echo - Dashboard: http://localhost:8501
echo - API Docs: http://localhost:8000/docs

pause
