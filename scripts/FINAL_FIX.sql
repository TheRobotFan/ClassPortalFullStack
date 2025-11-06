-- Script per refresh schema cache e verifica colonne
-- ESEGUI IN SUPABASE SQL EDITOR

-- 1. Verifica che le colonne esistano davvero
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'materials' 
AND column_name IN ('is_public', 'tags', 'status', 'updated_at', 'version')
ORDER BY column_name;

-- 2. Forza refresh dello schema
NOTIFY pgrst, 'reload schema';

-- 3. Ricrea la tabella materials completamente se necessario
DROP TABLE IF EXISTS materials CASCADE;

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
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Ricrea indici
CREATE INDEX idx_materials_subject ON materials(subject_id);
CREATE INDEX idx_materials_uploaded_by ON materials(uploaded_by);
CREATE INDEX idx_materials_status ON materials(status);
CREATE INDEX idx_materials_is_public ON materials(is_public);

-- 5. Ricrea funzioni RPC
CREATE OR REPLACE FUNCTION increment_material_views(material_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE materials 
    SET views_count = COALESCE(views_count, 0) + 1 
    WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_material_downloads(material_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE materials 
    SET downloads_count = COALESCE(downloads_count, 0) + 1 
    WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Ricrea policies
DROP POLICY IF EXISTS "Everyone can view active materials" ON materials;
CREATE POLICY "Everyone can view active materials" ON materials
  FOR SELECT USING (is_public = true AND status = 'active');

DROP POLICY IF EXISTS "Users can insert materials" ON materials;
CREATE POLICY "Users can insert materials" ON materials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own materials" ON materials;
CREATE POLICY "Users can update own materials" ON materials
  FOR UPDATE USING (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Admins can delete materials" ON materials;
CREATE POLICY "Admins can delete materials" ON materials
  FOR DELETE USING (
    auth.uid() = uploaded_by OR 
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'teacher')
  );

-- 7. Grant permessi
GRANT ALL ON materials TO authenticated;
GRANT SELECT ON materials TO anon;
GRANT EXECUTE ON FUNCTION increment_material_views TO authenticated;
GRANT EXECUTE ON FUNCTION increment_material_downloads TO authenticated;

-- 8. Refresh finale
NOTIFY pgrst, 'reload schema';

COMMIT;
