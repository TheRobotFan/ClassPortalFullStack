-- Fix appunti upload issues
-- This script fixes the column name mismatch and ensures proper RLS policies

-- Fix column name mismatch in materials table
DO $$
BEGIN
    -- Check if uploaded_by column exists, if not rename from user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' AND column_name = 'user_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' AND column_name = 'uploaded_by'
    ) THEN
        ALTER TABLE materials RENAME COLUMN user_id TO uploaded_by;
    END IF;
    
    -- Check if views_count column exists, if not rename from views
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' AND column_name = 'views'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' AND column_name = 'views_count'
    ) THEN
        ALTER TABLE materials RENAME COLUMN views TO views_count;
    END IF;
    
    -- Check if downloads_count column exists, if not rename from downloads
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' AND column_name = 'downloads'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' AND column_name = 'downloads_count'
    ) THEN
        ALTER TABLE materials RENAME COLUMN downloads TO downloads_count;
    END IF;
END $$;

-- Create or replace RPC functions for materials
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

-- Fix RLS policies for materials
DROP POLICY IF EXISTS "Everyone can view materials" ON materials;
DROP POLICY IF EXISTS "Authenticated users can upload materials" ON materials;
DROP POLICY IF EXISTS "Teachers and admin can delete any materials" ON materials;
DROP POLICY IF EXISTS "Users can delete own materials" ON materials;

-- Create proper policies
CREATE POLICY "Everyone can view materials" ON materials
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload materials" ON materials
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update own materials" ON materials
  FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Teachers and admin can delete any materials" ON materials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'teacher')
    )
  );

CREATE POLICY "Users can delete own materials" ON materials
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Ensure RLS is enabled
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON materials TO authenticated;
GRANT SELECT ON materials TO anon;

COMMIT;
