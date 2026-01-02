-- Grant "superuser"-like content permissions to users with role = 'hacker'
-- without affecting the existing permissions for other roles.

-- Materials
DO $$
BEGIN
  IF to_regclass('public.materials') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Hackers full access materials" ON materials;
    CREATE POLICY "Hackers full access materials" ON materials
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      );
  END IF;
END $$;

-- Exercises
DO $$
BEGIN
  IF to_regclass('public.exercises') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Hackers full access exercises" ON exercises;
    CREATE POLICY "Hackers full access exercises" ON exercises
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      );
  END IF;
END $$;

-- Exercise comments
DO $$
BEGIN
  IF to_regclass('public.exercise_comments') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Hackers full access exercise comments" ON exercise_comments;
    CREATE POLICY "Hackers full access exercise comments" ON exercise_comments
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      );
  END IF;
END $$;

-- Quizzes
DO $$
BEGIN
  IF to_regclass('public.quizzes') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Hackers full access quizzes" ON quizzes;
    CREATE POLICY "Hackers full access quizzes" ON quizzes
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      );
  END IF;
END $$;

-- Quiz questions
DO $$
BEGIN
  IF to_regclass('public.quiz_questions') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Hackers full access quiz questions" ON quiz_questions;
    CREATE POLICY "Hackers full access quiz questions" ON quiz_questions
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      );
  END IF;
END $$;

-- Quiz attempts
DO $$
BEGIN
  IF to_regclass('public.quiz_attempts') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Hackers full access quiz attempts" ON quiz_attempts;
    CREATE POLICY "Hackers full access quiz attempts" ON quiz_attempts
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      );
  END IF;
END $$;

-- Forum discussions
DO $$
BEGIN
  IF to_regclass('public.forum_discussions') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Hackers full access forum discussions" ON forum_discussions;
    CREATE POLICY "Hackers full access forum discussions" ON forum_discussions
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      );
  END IF;
END $$;

-- Forum comments
DO $$
BEGIN
  IF to_regclass('public.forum_comments') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Hackers full access forum comments" ON forum_comments;
    CREATE POLICY "Hackers full access forum comments" ON forum_comments
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      );
  END IF;
END $$;

-- Projects
DO $$
BEGIN
  IF to_regclass('public.projects') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Hackers full access projects" ON projects;
    CREATE POLICY "Hackers full access projects" ON projects
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      );
  END IF;
END $$;

-- Project members
DO $$
BEGIN
  IF to_regclass('public.project_members') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Hackers full access project members" ON project_members;
    CREATE POLICY "Hackers full access project members" ON project_members
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      );
  END IF;
END $$;

-- Project discussions
DO $$
BEGIN
  IF to_regclass('public.project_discussions') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Hackers full access project discussions" ON project_discussions;
    CREATE POLICY "Hackers full access project discussions" ON project_discussions
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      );
  END IF;
END $$;

-- Material comments (if you use that table from older scripts)
DO $$
BEGIN
  IF to_regclass('public.material_comments') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Hackers full access material comments" ON material_comments;
    CREATE POLICY "Hackers full access material comments" ON material_comments
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'hacker')
      );
  END IF;
END $$;

COMMIT;
