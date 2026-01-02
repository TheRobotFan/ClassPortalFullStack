@echo off
echo 🚀 Avvio Sistema Completo: Sito + AI Badge System
echo ================================================

echo.
echo 🐳 Avvio Sistema AI Badge...
cd badge_ai_system
docker-compose up --build -d

echo.
echo ⏳ Attendo avvio servizi AI (20 secondi)...
timeout /t 20 /nobreak > nul

echo.
echo 🔍 Testando Sistema AI...
call test_system.bat

echo.
echo 🌐 Avvio Sito Principale (Next.js)...
cd ..
npm run dev

echo.
echo ✅ Sistema Completo Avviato!
echo.
echo 📋 URLs Disponibili:
echo    🌐 Sito Principale: http://localhost:3000
echo    🎖️ Dashboard AI:    http://localhost:8501
echo    🔗 API AI:         http://localhost:8000/docs
echo.
echo 🎯 Il sistema AI monitora automaticamente tutti gli utenti!
echo.
pause
