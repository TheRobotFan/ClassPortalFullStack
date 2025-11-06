-- CACHE RESET SEMPLIFICATO - ESEGUI SUBITO IN SUPABASE

-- 1. Forza reload schema cache
NOTIFY pgrst, 'reload schema';

-- 2. Ricrea la vista materials per forzare refresh
DROP VIEW IF EXISTS materials_view;
CREATE VIEW materials_view AS 
SELECT * FROM materials;

-- 3. Resetta PostgREST cache se possibile
TRUNCATE TABLE IF EXISTS pgrst_schema_cache;

-- 4. Forza reload finale
NOTIFY pgrst, 'reload schema';

-- 5. Verifica finale
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'materials' 
AND column_name IN ('is_public', 'tags', 'status', 'updated_at', 'version')
ORDER BY column_name;

COMMIT;
