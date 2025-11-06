-- Script completo per fix database - ESEGUI SUBITO IN SUPABASE

-- Aggiungi colonne mancanti alla tabella materials
ALTER TABLE materials ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE materials ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE materials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Ricrea funzioni RPC
DROP FUNCTION IF EXISTS increment_material_views(UUID);
CREATE OR REPLACE FUNCTION increment_material_views(material_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE materials 
    SET views_count = COALESCE(views_count, 0) + 1 
    WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS increment_material_downloads(UUID);
CREATE OR REPLACE FUNCTION increment_material_downloads(material_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE materials 
    SET downloads_count = COALESCE(downloads_count, 0) + 1 
    WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aggiorna policies
DROP POLICY IF EXISTS "Everyone can view active materials" ON materials;
CREATE POLICY "Everyone can view active materials" ON materials
  FOR SELECT USING (is_public = true AND status = 'active');

-- Grant permessi
GRANT ALL ON materials TO authenticated;
GRANT SELECT ON materials TO anon;

COMMIT;
