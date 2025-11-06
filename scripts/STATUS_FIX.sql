-- FIX IMMEDIATO - ESEGUI SUBITO IN SUPABASE

-- 1. Aggiungi solo la colonna status se mancante
ALTER TABLE materials ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 2. Forza refresh schema cache
NOTIFY pgrst, 'reload schema';

-- 3. Verifica che esista
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'materials' AND column_name = 'status';

COMMIT;
