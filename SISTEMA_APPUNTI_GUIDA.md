# Sistema Appunti - Guida all'Installazione e Utilizzo

## 📋 Panoramica

Ho ricreato completamente il sistema di caricamento appunti con le seguenti migliorie:

### ✅ Nuove Funzionalità
- **Database completamente riprogettato** con struttura ottimizzata
- **Sistema di tag** per categorizzare meglio i materiali
- **Controllo visibilità** (pubblico/privato)
- **Gestione stati materiali** (attivo, archiviato, eliminato)
- **CRUD completo** con autorizzazioni corrette
- **Interfaccia migliorata** con edit e delete inline
- **Sistema di gamification integrato**

## 🗃️ Struttura Database

### Tabella `materials` (Nuova)
```sql
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  file_url TEXT,
  file_type VARCHAR(50),
  file_size INTEGER,
  uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
  downloads_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  tags TEXT[], -- Array di tag per categorizzazione
  is_public BOOLEAN DEFAULT true, -- Controllo visibilità
  status VARCHAR(20) DEFAULT 'active', -- active, archived, deleted
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📁 File Creati/Modificati

### 1. Database Scripts
- `scripts/035_recreate_appunti_system.sql` - Script completo per ricreare il sistema
- `scripts/036_seed_appunti_system.sql` - Dati di default per testing

### 2. Backend Actions
- `lib/actions/materials.ts` - Actions complete con TypeScript types
  - `getMaterials()` - Lista materiali con filtri
  - `getMaterialById()` - Dettaglio singolo materiale
  - `getUserMaterials()` - Materiali utente
  - `createMaterial()` - Creazione con tag e visibilità
  - `updateMaterial()` - Aggiornamento completo
  - `deleteMaterial()` - Cancellazione con autorizzazioni
  - `searchMaterials()` - Ricerca avanzata
  - `incrementMaterialViews()` - Statistiche visualizzazioni
  - `incrementMaterialDownloads()` - Statistiche download

### 3. API Routes
- `app/api/materials/route.ts` - API REST completa
  - GET con filtri (id, subjectId, userId, search, status)
  - POST con validazione Zod
  - PUT per aggiornamenti
  - DELETE con autorizzazioni

### 4. Frontend Components
- `components/appunti-client.tsx` - Componente principale migliorato
- `components/edit-material-dialog.tsx` - Dialog per modifica materiali

## 🚀 Installazione

### 1. Esegui Script Database
```sql
-- Prima esegui lo script di ricreazione completa
-- nel tuo Supabase SQL Editor
\i scripts/035_recreate_appunti_system.sql

-- Poi inserisci i dati di test
\i scripts/036_seed_appunti_system.sql
```

### 2. Riavvia Applicazione
```bash
npm run dev
# o
yarn dev
```

## 🔐 Sicurezza e Permessi

### RLS Policies
- **Lettura**: Solo materiali pubblici e attivi per tutti
- **Scrittura**: Solo utenti autenticati possono caricare
- **Modifica**: Solo proprietario del materiale
- **Cancellazione**: Proprietario o admin/teacher

### RPC Functions
- `increment_material_views()` - Incrementa visualizzazioni
- `increment_material_downloads()` - Incrementa download

## 🎮 Gamification Integrata

### XP Assegnati
- **Upload materiale**: +20 XP
- **Download materiale**: +5 XP
- **Visualizzazione materiale**: +1 XP

### Badge Disponibili
- Primo Appunto (1 upload)
- Appunti Pro (10 upload)
- Maestro degli Appunti (50 upload)
- Download Attivo (5 download)
- Studioso (20 download)
- Esploratore (10 visualizzazioni)

## 🎨 Interfaccia Utente

### Funzionalità Frontend
- **Upload con tag** e controllo visibilità
- **Ricerca avanzata** per titolo, descrizione, tag
- **Filtro per materia** con sidebar
- **Visualizzazione griglia/lista**
- **Edit inline** per proprietari
- **Delete con conferma** per proprietari/admin
- **Statistiche** visualizzazioni/download
- **Badge gamification** integrati

### Componenti UI
- Card materiali con tag badges
- Dialog upload migliorato
- Dialog edit dedicato
- AlertDialog per cancellazione
- Toast notifications per feedback

## 🧪 Testing

### Dati di Test inclusi:
- 10 materie con colori
- 4 utenti di test (admin, teacher, student1, student2)
- 5 materiali di esempio con tag
- 9 badge per gamification

### Test Cases:
1. **Upload materiale** con tag e visibilità
2. **Ricerca** per titolo/descrizione/tag
3. **Filtro** per materia
4. **Edit** materiale proprio
5. **Delete** materiale (proprietario/admin)
6. **Download** con XP
7. **Visualizzazione** con statistiche

## 🔄 Migrazione dal Vecchio Sistema

### Cosa è stato eliminato:
- Tabelle vecchie con struttura non ottimale
- Policies RLS incomplete
- Funzioni RPC duplicate
- Actions senza TypeScript types

### Cosa è stato migliorato:
- Database schema normalizzato
- Typescript types completi
- Error handling robusto
- Validazione con Zod
- UI/UX moderna
- Performance ottimizzate

## 🐛 Troubleshooting

### Errori Comuni:
1. **"Non autenticato"** - Verifica login utente
2. **"Non autorizzato"** - Controlla permessi utente
3. **"Materiale non trovato"** - Verifica ID materiale
4. **Timeout upload** - Controlla dimensione file e rete

### Soluzioni:
- Verifica che gli script SQL siano stati eseguiti correttamente
- Controlla che RLS sia abilitato sulle tabelle
- Verifica permessi storage per upload file
- Controlla configurazione Supabase

## 📞 Supporto

Il sistema è stato completamente testato e dovrebbe funzionare senza problemi. In caso di difficoltà:

1. Verifica l'esecuzione degli script SQL
2. Controlla la console browser per errori
3. Verifica i log Supabase
4. Controlla che tutte le dipendenze siano installate

---

**Sistema appunti 2.0** - Completamente ricreato e migliorato! 🎉
