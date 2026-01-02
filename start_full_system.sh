#!/bin/bash
# 🚀 CLAS2E FULL SYSTEM STARTUP SCRIPT
# ===================================
# Avvia automaticamente tutto il sistema Clas2e:
# - Frontend Next.js (localhost:3000)
# - Backend AI FastAPI (localhost:8000)
# - Database e tutti i servizi

echo "🎓 🚀 AVVIO COMPLETO SISTEMA CLAS2E AI ECOSYSTEM v6.0"
echo "======================================================"
echo ""

# Verifica che siamo nella directory giusta
if [ ! -f "package.json" ] || [ ! -d "badge_ai_system" ]; then
    echo "❌ Errore: Script deve essere eseguito dalla directory root di clas2e"
    echo "💡 Usa: cd /path/to/clas2e && ./start_full_system.sh"
    exit 1
fi

# Verifica dipendenze
echo "📦 Verifica dipendenze..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non trovato. Installa Node.js prima di continuare."
    exit 1
fi

if ! command -v python &> /dev/null; then
    echo "❌ Python non trovato. Installa Python prima di continuare."
    exit 1
fi

# Installa dipendenze se necessario
if [ ! -d "node_modules" ]; then
    echo "📦 Installazione dipendenze Node.js..."
    npm install
fi

if [ ! -d "badge_ai_system/__pycache__" ]; then
    echo "🐍 Verifica dipendenze Python..."
    cd badge_ai_system
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    fi
    cd ..
fi

echo ""
echo "🏁 AVVIO SISTEMA COMPLETO..."
echo "=============================="
echo ""

# Avvia il backend AI in background
echo "🔧 Avvio Backend AI (FastAPI)..."
cd badge_ai_system
python app/main.py &
BACKEND_PID=$!
cd ..

echo "⏳ Attesa avvio backend (10 secondi)..."
sleep 10

# Verifica che il backend sia attivo
echo "🔍 Verifica backend..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend AI attivo: http://localhost:8000"
    echo "   📖 API Docs: http://localhost:8000/docs"
else
    echo "⚠️  Backend non raggiungibile, ma continuo con frontend..."
fi

echo ""

# Avvia il frontend Next.js
echo "🌐 Avvio Frontend Next.js..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 SISTEMA CLAS2E COMPLETO ATTIVO!"
echo "==================================="
echo ""
echo "🌐 Frontend (Next.js):    http://localhost:3000"
echo "🔗 Backend API (FastAPI): http://localhost:8000"
echo "📖 API Documentation:     http://localhost:8000/docs"
echo "🧪 Test Suite:           python badge_ai_system/test_ai_system.py"
echo ""
echo "📊 Dashboard AI:         http://localhost:3000/dashboard"
echo "🎓 Learning Analytics:   http://localhost:3000/analytics"
echo ""

# Funzione di cleanup quando lo script viene interrotto
cleanup() {
    echo ""
    echo "🛑 Arresto sistema..."
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    echo "👋 Sistema arrestato. Arrivederci!"
    exit 0
}

# Cattura segnali di interruzione
trap cleanup SIGINT SIGTERM

echo "💡 Comandi utili:"
echo "  • Test AI:           python badge_ai_system/test_ai_system.py --quick"
echo "  • Test completo:     python badge_ai_system/test_ai_system.py"
echo "  • Stop sistema:      Ctrl+C"
echo ""
echo "🎯 Il sistema AI ultra-enhanced è ora completamente operativo!"
echo "🚀 Testa tutte le funzionalità dal frontend o usa l'API direttamente."
echo ""

# Mantieni lo script attivo
wait
