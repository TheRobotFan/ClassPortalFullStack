-- RESET COMPLETO CACHE SUPABASE - ESEGUI SUBITO

-- 1. Forza reload schema cache
NOTIFY pgrst, 'reload schema';

-- 2. Resetta tutte le connessioni
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = current_database() AND pid <> pg_backend_pid();

-- 3. Ricrea la vista materials per forzare refresh
DROP VIEW IF EXISTS materials_view;
CREATE VIEW materials_view AS 
SELECT * FROM materials;

-- 4. Resetta PostgREST cache completamente
TRUNCATE TABLE pgrst_schema_cache;

-- 5. Forza reload finale
NOTIFY pgrst, 'reload schema';

-- 6. Verifica finale
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'materials' 
AND column_name IN ('is_public', 'tags', 'status', 'updated_at', 'version')
ORDER BY column_name;

COMMIT;
