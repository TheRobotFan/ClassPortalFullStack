-- Fix RLS policies for project_members table

-- First, ensure RLS is enabled
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Users can insert project members" ON project_members;
DROP POLICY IF EXISTS "Users can update project members" ON project_members;
DROP POLICY IF EXISTS "Users can delete project members" ON project_members;

-- Create policies for project members

-- Policy to view project members (only if user is member of the project or admin/teacher)
CREATE POLICY "Users can view project members" ON project_members
FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT created_by FROM projects WHERE id = project_id
  ) OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'teacher')
  )
);

-- Policy to insert project members (only project creator or admin/teacher)
CREATE POLICY "Users can insert project members" ON project_members
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT created_by FROM projects WHERE id = project_id
  ) OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'teacher')
  )
);

-- Policy to update project members (only project creator or admin/teacher)
CREATE POLICY "Users can update project members" ON project_members
FOR UPDATE USING (
  auth.uid() IN (
    SELECT created_by FROM projects WHERE id = project_id
  ) OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'teacher')
  )
);

-- Policy to delete project members (only project creator or admin/teacher)
CREATE POLICY "Users can delete project members" ON project_members
FOR DELETE USING (
  auth.uid() IN (
    SELECT created_by FROM projects WHERE id = project_id
  ) OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'teacher')
  )
);

-- Also fix RLS for project_milestones if needed
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

-- Drop existing milestone policies
DROP POLICY IF EXISTS "Users can view project milestones" ON project_milestones;
DROP POLICY IF EXISTS "Users can insert project milestones" ON project_milestones;
DROP POLICY IF EXISTS "Users can update project milestones" ON project_milestones;
DROP POLICY IF EXISTS "Users can delete project milestones" ON project_milestones;

-- Create milestone policies
CREATE POLICY "Users can view project milestones" ON project_milestones
FOR SELECT USING (
  auth.uid() IN (
    SELECT created_by FROM projects WHERE id = project_id
  ) OR
  auth.uid() IN (
    SELECT user_id FROM project_members WHERE project_id = project_milestones.project_id
  ) OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'teacher')
  )
);

CREATE POLICY "Users can insert project milestones" ON project_milestones
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT created_by FROM projects WHERE id = project_id
  ) OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'teacher')
  )
);

CREATE POLICY "Users can update project milestones" ON project_milestones
FOR UPDATE USING (
  auth.uid() IN (
    SELECT created_by FROM projects WHERE id = project_id
  ) OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'teacher')
  )
);

CREATE POLICY "Users can delete project milestones" ON project_milestones
FOR DELETE USING (
  auth.uid() IN (
    SELECT created_by FROM projects WHERE id = project_id
  ) OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'teacher')
  )
);
