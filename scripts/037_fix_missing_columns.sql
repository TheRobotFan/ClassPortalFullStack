-- Script per aggiungere le colonne mancanti alla tabella materials
-- Esegui questo script se ricevi l'errore "Could not find the 'is_public' column"

-- Controlla se le colonne esistono e aggiungile se mancanti
DO $$
BEGIN
    -- Aggiungi colonna is_public se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE materials ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
    
    -- Aggiungi colonna tags se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' AND column_name = 'tags'
    ) THEN
        ALTER TABLE materials ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Aggiungi colonna status se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' AND column_name = 'status'
    ) THEN
        ALTER TABLE materials ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;
    
    -- Aggiungi colonna updated_at se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE materials ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Aggiungi colonna version se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' AND column_name = 'version'
    ) THEN
        ALTER TABLE materials ADD COLUMN version INTEGER DEFAULT 1;
    END IF;
END $$;

-- Ricrea le funzioni RPC se mancanti
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

-- Aggiorna le RLS policies per includere is_public
DROP POLICY IF EXISTS "Everyone can view active materials" ON materials;
CREATE POLICY "Everyone can view active materials" ON materials
  FOR SELECT USING (is_public = true AND status = 'active');

COMMIT;
