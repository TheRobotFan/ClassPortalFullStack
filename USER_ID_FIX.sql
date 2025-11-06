-- FIX PER CAMPO USER_ID - ESEGUI IN SUPABASE

-- 1. Verifica la struttura attuale della tabella
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'materials' 
ORDER BY column_name;

-- 2. Controlla se esiste user_id
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'materials' AND column_name = 'user_id';

-- 3. Se non esiste user_id, aggiungilo
ALTER TABLE materials ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 4. Aggiorna i record esistenti per usare user_id = uploaded_by
UPDATE materials SET user_id = uploaded_by WHERE user_id IS NULL AND uploaded_by IS NOT NULL;

-- 5. Ricrea policies per usare user_id
DROP POLICY IF EXISTS "Users can insert materials" ON materials;
CREATE POLICY "Users can insert materials" ON materials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own materials" ON materials;
CREATE POLICY "Users can update own materials" ON materials
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can delete materials" ON materials;
CREATE POLICY "Admins can delete materials" ON materials
  FOR DELETE USING (
    auth.uid() = user_id OR 
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'teacher')
  );

-- 6. Refresh schema
NOTIFY pgrst, 'reload schema';

COMMIT;
