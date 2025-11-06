-- Drop all policies and create only essential ones for upload
DROP POLICY IF EXISTS "Everyone can view materials" ON materials;
DROP POLICY IF EXISTS "Authenticated users can upload materials" ON materials;
DROP POLICY IF EXISTS "Teachers and admin can delete any materials" ON materials;
DROP POLICY IF EXISTS "Users can delete own materials" ON materials;

-- Create only essential policies
CREATE POLICY "Everyone can view materials" ON materials
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload materials" ON materials
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Keep RLS enabled but with minimal policies
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

COMMIT;
