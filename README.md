# 🎓 Clas2e - Piattaforma di Apprendimento Collaborativo

> **Piattaforma digitale della classe X per comunicazione, condivisione e collaborazione**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

## 🌟 Caratteristiche Principali

- **🧑‍🎓 Area Personale** - Gestisci il tuo profilo e monitora i tuoi progressi
- **💬 Forum** - Partecipa alle discussioni e collabora con i compagni
- **🔍 Ricerca Avanzata** - Trova facilmente materiali e contenuti didattici
- **🎖️ Sistema di Badge** - Guadagna riconoscimenti per i tuoi risultati
- **🤖 AI Integrata** - Supporto personalizzato all'apprendimento

## 🚀 Come Iniziare

### Prerequisiti

- Node.js 18+ e npm 9+
- Python 3.9+
- Un account Supabase

### Installazione

1. **Clona il repository**
   ```bash
   git clone https://github.com/tu-utente/clas2e.git
   cd clas2e
   ```

2. **Installa le dipendenze**
   ```bash
   # Frontend
   npm install
   
   # Backend AI (opzionale)
   cd badge_ai_system
   pip install -r requirements.txt
   ```

3. **Configurazione**
   Crea un file `.env.local` nella root del progetto con le tue credenziali:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_chiave_anonima
   
   # Configurazione AI (opzionale)
   AI_API_KEY=chiave_api_ai
   ```

### Avvio

```bash
# Sviluppo (frontend + backend)
npm run dev

# Solo frontend
npm run dev

# Solo backend AI
cd badge_ai_system
uvicorn app.main:app --reload
```

## 🏗️ Struttura del Progetto

```
clas2e/
├── app/                 # App Next.js (pages router)
├── badge_ai_system/     # Sistema AI e backend
├── components/          # Componenti condivisi
├── lib/                 # Utility e configurazioni
├── public/              # File statici
└── styles/              # Stili globali
```

## 🌐 Accesso

- **Sito Web**: [http://localhost:3000](http://localhost:3000)
- **Documentazione API**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Dashboard AI**: [http://localhost:8501](http://localhost:8501)

## 🤝 Contributi

I contributi sono ben accetti! Per favore leggi le nostre [linee guida per i contributi](CONTRIBUTING.md) prima di inviare una pull request.

## 📄 Licenza

Questo progetto è concesso in licenza con la licenza MIT - vedi il file [LICENSE](LICENSE) per i dettagli.

## ✨ Ringraziamenti

- [Next.js](https://nextjs.org/) - Il framework web React
- [Supabase](https://supabase.com/) - Backend open source
- [FastAPI](https://fastapi.tiangolo.com/) - Framework per API moderne
- [Shadcn UI](https://ui.shadcn.com/) - Componenti UI accessibili
