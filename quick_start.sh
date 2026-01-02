#!/bin/bash
# 🚀 QUICK START SCRIPT PER SISTEMA AI CLAS2E
# ============================================

echo "🎓 AVVIO RAPIDO SISTEMA AI ULTRA-ENHANCED CLAS2E"
echo "================================================="

# Verifica che siamo nella directory giusta
if [ ! -f "badge_ai_system/test_ai_system.py" ]; then
    echo "❌ Errore: Script deve essere eseguito dalla directory root di clas2e"
    echo "💡 Usa: cd /path/to/clas2e && ./quick_start.sh"
    exit 1
fi

cd badge_ai_system

echo "📦 Verifica dipendenze Python..."
python -c "import fastapi, uvicorn, torch, transformers, sklearn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Alcune dipendenze potrebbero mancare. Installale con:"
    echo "   pip install fastapi uvicorn torch transformers scikit-learn"
fi

echo ""
echo "🏁 AVVIO SERVER..."
echo "📍 URL: http://localhost:8000"
echo "📖 Docs API: http://localhost:8000/docs"
echo "🧪 Test Script: python test_ai_system.py"
echo ""

# Avvia server in background
python app/main.py &
SERVER_PID=$!

echo "⏳ Attesa avvio server (10 secondi)..."
sleep 10

# Test connettività
echo ""
echo "🔍 TEST CONNETTIVITÀ..."
curl -s http://localhost:8000/health | python -m json.tool 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server attivo e funzionante!"
else
    echo "❌ Server non raggiungibile"
fi

echo ""
echo "🎯 PROSSIMI PASSI:"
echo "1. Apri browser: http://localhost:8000/docs"
echo "2. Esegui test completo: python test_ai_system.py"
echo "3. Test interattivo: python test_ai_system.py --interactive"
echo ""

echo "🛑 Per fermare il server: kill $SERVER_PID"
echo ""
echo "🎉 SISTEMA AI CLAS2E PRONTO! 🚀🤖📚"
