@echo off
echo 🛑 Arresto Sistema Completo
echo ==========================

echo.
echo 🐳 Arresto Sistema AI Badge...
cd badge_ai_system
docker-compose down

echo.
echo ✅ Sistema AI fermato!

echo.
echo 💡 Per riavviare tutto: .\start_full_system.bat
echo.
pause
