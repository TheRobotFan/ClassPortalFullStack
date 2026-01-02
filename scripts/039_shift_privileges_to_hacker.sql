-- Shift authoring/moderation privileges from admin to hacker (and keep teachers where appropriate)
-- Esegui questo script nel progetto Supabase collegato all'app (stesso URL/chiave di .env.local)

-- 1) Exercises: solo teacher / hacker / staff possono creare esercizi (non più gli admin di default)
DROP POLICY IF EXISTS "Teachers and admin can create exercises" ON exercises;
CREATE POLICY "Teachers and hackers can create exercises" ON exercises
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'hacker', 'staff')
  );

-- 2) Projects: creazione progetti per teacher / hacker / staff
DROP POLICY IF EXISTS "Teachers and admin can create projects" ON projects;
CREATE POLICY "Teachers and hackers can create projects" ON projects
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'hacker', 'staff')
  );

-- 3) Materials: solo teacher / hacker possono cancellare qualsiasi materiale
DROP POLICY IF EXISTS "Teachers and admin can delete any materials" ON materials;
CREATE POLICY "Teachers and hackers can delete any materials" ON materials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (role = 'hacker' OR role = 'teacher')
    )
  );

-- 4) Project members & milestones: sostituisci admin con hacker
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Users can insert project members" ON project_members;
DROP POLICY IF EXISTS "Users can update project members" ON project_members;
DROP POLICY IF EXISTS "Users can delete project members" ON project_members;

CREATE POLICY "Users can view project members" ON project_members
FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT created_by FROM projects WHERE id = project_id
  ) OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('hacker', 'teacher')
  )
);

CREATE POLICY "Users can insert project members" ON project_members
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT created_by FROM projects WHERE id = project_id
  ) OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('hacker', 'teacher')
  )
);

CREATE POLICY "Users can update project members" ON project_members
FOR UPDATE USING (
  auth.uid() IN (
    SELECT created_by FROM projects WHERE id = project_id
  ) OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('hacker', 'teacher')
  )
);

CREATE POLICY "Users can delete project members" ON project_members
FOR DELETE USING (
  auth.uid() IN (
    SELECT created_by FROM projects WHERE id = project_id
  ) OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('hacker', 'teacher')
  )
);

DO $$
BEGIN
  IF to_regclass('public.project_milestones') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users can view project milestones" ON project_milestones;
    DROP POLICY IF EXISTS "Users can insert project milestones" ON project_milestones;
    DROP POLICY IF EXISTS "Users can update project milestones" ON project_milestones;
    DROP POLICY IF EXISTS "Users can delete project milestones" ON project_milestones;

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
        WHERE id = auth.uid() AND role IN ('hacker', 'teacher')
      )
    );

    CREATE POLICY "Users can insert project milestones" ON project_milestones
    FOR INSERT WITH CHECK (
      auth.uid() IN (
        SELECT created_by FROM projects WHERE id = project_id
      ) OR
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role IN ('hacker', 'teacher')
      )
    );

    CREATE POLICY "Users can update project milestones" ON project_milestones
    FOR UPDATE USING (
      auth.uid() IN (
        SELECT created_by FROM projects WHERE id = project_id
      ) OR
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role IN ('hacker', 'teacher')
      )
    );

    CREATE POLICY "Users can delete project milestones" ON project_milestones
    FOR DELETE USING (
      auth.uid() IN (
        SELECT created_by FROM projects WHERE id = project_id
      ) OR
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role IN ('hacker', 'teacher')
      )
    );
  END IF;
END $$;

-- 5) Quizzes & quiz_questions: creazione/gestione spostata su hacker + teacher
DROP POLICY IF EXISTS "Teachers and admins can create quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins can create quizzes" ON quizzes;

CREATE POLICY "Hackers and teachers can create quizzes" ON quizzes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'hacker' OR users.role = 'teacher')
    )
  );

DROP POLICY IF EXISTS "Teachers and admins can insert quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Admins can insert quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Admins can update quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Admins can delete quiz questions" ON quiz_questions;

CREATE POLICY "Hackers and teachers can insert quiz questions" ON quiz_questions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'hacker' OR users.role = 'teacher')
    )
  );

CREATE POLICY "Hackers and teachers can update quiz questions" ON quiz_questions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'hacker' OR users.role = 'teacher')
    )
  );

CREATE POLICY "Hackers and teachers can delete quiz questions" ON quiz_questions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'hacker' OR users.role = 'teacher')
    )
  );

-- 6) Storage bucket "materials": upload/delete da parte di hacker (e teacher)
DROP POLICY IF EXISTS "Admins can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete materials" ON storage.objects;

CREATE POLICY "Hackers can upload materials" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'materials' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'hacker' OR users.role = 'teacher')
    )
  );

CREATE POLICY "Hackers can delete materials" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'materials' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'hacker' OR users.role = 'teacher')
    )
  );

COMMIT;
