-- Fix Materials RLS Policies - Complete Reset
-- This script drops ALL policies on materials and recreates them correctly

-- First, drop ALL existing policies on materials table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'materials'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON materials', policy_record.policyname);
    END LOOP;
END $$;

-- Now create the correct policies
CREATE POLICY "Everyone can view materials" ON materials
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload materials" ON materials
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update own materials" ON materials
  FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own materials" ON materials
  FOR DELETE USING (auth.uid() = uploaded_by);

CREATE POLICY "Teachers and admin can delete any materials" ON materials
  FOR DELETE USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin', 'staff')
  );

-- Ensure RLS is enabled
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

COMMIT;
