@echo off
echo 🚀 AI Badge System - Complete Docker Setup
echo ===========================================

echo.
echo 🐳 Building and starting all services...
docker-compose up --build -d

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 15 /nobreak > nul

echo.
echo 🔍 Checking service status...
docker-compose ps

echo.
echo 📊 Service URLs:
echo - API: http://localhost:8000
echo - Dashboard: http://localhost:8501
echo - API Docs: http://localhost:8000/docs
echo - WebSocket: ws://localhost:8765

echo.
echo 🧪 Testing connections...
echo Testing API health...
curl -s http://localhost:8000/health >nul 2>&1 && echo ✅ API responding || echo ❌ API not responding

echo.
echo 🎉 Setup complete!
echo.
echo 💡 Useful commands:
echo - View logs: docker-compose logs -f [service-name]
echo - Stop services: docker-compose down
echo - Restart: docker-compose restart
echo.
echo 🔄 The AI Badge System is now running with full database support!

pause
