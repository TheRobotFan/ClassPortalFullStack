# 🎖️ Sistema Completo: Sito + AI Badge System

## 🚀 Avvio Rapido

### Opzione 1: Script Automatico (Raccomandato)
```bash
# Avvia tutto automaticamente
.\start_full_system.bat

# Ferma tutto
.\stop_full_system.bat
```

### Opzione 2: Comandi NPM
```bash
# Avvia sito + AI insieme
npm run dev:full

# Solo AI
npm run start:ai

# Test integrazione
npm run test:integration

# Ferma AI
npm run stop:ai
```

## 📋 Cosa Include

### 🌐 **Sito Principale (Next.js)**
- **URL**: http://localhost:3000
- **Features**: Piattaforma educativa completa
- **Database**: Supabase integrato

### 🤖 **Sistema AI Badge**
- **Dashboard**: http://localhost:8501
- **API**: http://localhost:8000/docs
- **Database**: Condiviso con sito principale
- **Features**:
  - 📊 Monitoraggio utenti automatico
  - 🏆 Assegnazione badge intelligente
  - 📈 Analytics real-time
  - 🎯 Previsioni AI

## 🎯 Come Funziona

1. **Avvio**: `.\start_full_system.bat`
2. **AI Monitora**: Automaticamente tutti gli utenti del database
3. **Badge Assegnati**: Basati su attività reali (XP, quiz, commenti)
4. **Dashboard**: Controllo completo del sistema AI

## 🔧 Troubleshooting

### Se l'AI non si avvia:
```bash
# Verifica Docker
docker --version

# Riavvia solo AI
npm run start:ai
```

### Se il sito non funziona:
```bash
# Installa dipendenze
npm install

# Avvia solo sito
npm run dev
```

## 📊 Architettura

```
🌐 Sito Next.js (localhost:3000)
    ↓
🗄️ Supabase Database (condiviso)
    ↓
🤖 Sistema AI Badge
    ├── 🎛️ Dashboard (localhost:8501)
    ├── 🔗 API (localhost:8000)
    └── 📊 Redis (cache)
```

## 🎉 Risultato

**Sistema completamente integrato dove l'AI monitora e premia automaticamente ogni utente del sito principale!** 🚀✨
