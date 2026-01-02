# 🚀 AI Badge System - Quick Start Guide

## ⚡ Avvio Rapido (2 minuti)

### **1. Avvia Tutto Automaticamente**
```bash
cd badge_ai_system
.\start_system.bat
```

Questo comando:
- ✅ Costruisce tutti i container Docker
- ✅ Avvia database PostgreSQL + Redis
- ✅ Avvia API FastAPI + Dashboard Streamlit
- ✅ Inizializza database con dati di test
- ✅ Verifica connessioni

### **2. Verifica che Tutto Funzioni**
Dopo l'avvio, apri nel browser:
- **API Health**: http://localhost:8000/health
- **Dashboard**: http://localhost:8501
- **API Docs**: http://localhost:8000/docs

## 🎯 Test del Sistema

### **Test AI Badge Assignment**
```bash
# Assegna badge automaticamente
curl -X POST "http://localhost:8000/users/test-user-id/assign-badges"

# Ottieni analisi utente
curl "http://localhost:8000/users/test-user-id/analysis"

# Ottieni raccomandazioni
curl "http://localhost:8000/users/test-user-id/recommendations"
```

### **Test Dashboard**
- Apri http://localhost:8501
- Inserisci un User ID (es: test-user-id)
- Clicca "Analyze User"
- Vedrai statistiche, badge, e raccomandazioni AI

## 🛠️ Comandi Utili

### **Gestione Container**
```bash
# Vedi stato servizi
docker-compose ps

# Vedi logs
docker-compose logs -f ai-badge-api

# Riavvia servizio
docker-compose restart ai-badge-api

# Ferma tutto
docker-compose down
```

### **Database**
```bash
# Connetti al database
docker exec -it ai-badge-system_postgres_1 psql -U postgres -d classeviva

# Vedi utenti
SELECT * FROM users;

# Vedi badge assegnati
SELECT u.email, b.name, ub.earned_at
FROM user_badges ub
JOIN users u ON ub.user_id = u.id
JOIN badges b ON ub.badge_id = b.id;
```

## 🔧 Configurazione

### **Modifica Variabili Ambiente**
Il file `.env` contiene tutte le configurazioni. Modificalo per:
- Cambiare password database
- Configurare host Redis
- Impostare segreti API

### **Aggiungere Nuovi Badge**
1. Modifica `init-db.sql` per aggiungere badge
2. Ricostruisci: `docker-compose up --build`

### **Training Modelli AI**
```bash
# Entra nel container API
docker exec -it ai-badge-system_ai-badge-api_1 bash

# Esegui training
python scripts/train_models.py
```

## 🏆 Cosa Include il Sistema

- ✅ **API FastAPI** completa con 10+ endpoint
- ✅ **Dashboard Streamlit** per analytics
- ✅ **Database PostgreSQL** con dati di test
- ✅ **Redis** per caching e pub/sub
- ✅ **AI Engine** con modelli ML
- ✅ **WebSocket** per real-time monitoring
- ✅ **Sistema Badge** intelligente
- ✅ **Docker** completo e production-ready

## 🎉 Il Sistema è Pronto!

Il tuo **Sistema AI Badge** è completamente operativo con:
- 🤖 Intelligenza artificiale per assegnazione badge
- 📊 Dashboard interattiva per monitoraggio
- 🗄️ Database PostgreSQL configurato
- 🔄 Sistema di monitoraggio real-time
- 📈 Analytics e raccomandazioni AI

**Buon divertimento con il tuo sistema AI!** 🚀✨
