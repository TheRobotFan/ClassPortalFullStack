-- Script di verifica per controllare che tutto sia configurato correttamente
-- Esegui questo script DOPO aver eseguito 038_create_materials_bucket.sql

-- 1. Verifica esistenza bucket materials
SELECT 
  id, 
  name, 
  public,
  file_size_limit,
  created_at
FROM storage.buckets 
WHERE id = 'materials';

-- 2. Verifica policies storage per bucket materials
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname ILIKE '%material%';

-- 3. Verifica struttura tabella materials
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'materials'
ORDER BY ordinal_position;

-- 4. Verifica policies RLS tabella materials
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'materials';

-- 5. Verifica indici su tabella materials
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'materials';

-- 6. Conta materiali esistenti
SELECT 
  status,
  is_public,
  COUNT(*) as count
FROM materials
GROUP BY status, is_public;

-- 7. Test query materiali (quella usata dall'app)
SELECT 
  m.id,
  m.title,
  m.status,
  m.is_public,
  m.tags,
  s.name as subject_name,
  u.full_name as uploader_name
FROM materials m
LEFT JOIN subjects s ON m.subject_id = s.id
LEFT JOIN users u ON m.uploaded_by = u.id
WHERE m.status = 'active' AND m.is_public = true
LIMIT 5;

-- 8. Verifica funzioni RPC per materials
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%material%'
  AND routine_schema = 'public';

-- Se tutto è OK, dovresti vedere:
-- ✅ 1 bucket 'materials' pubblico con limite 50MB
-- ✅ 5 policies storage (upload, update, read, delete user, delete admin)
-- ✅ Colonne tags (text[]), is_public (boolean), status (varchar) nella tabella
-- ✅ 2+ policies RLS sulla tabella materials
-- ✅ 3+ indici sulla tabella materials
-- ✅ Funzioni increment_material_views e increment_material_downloads
