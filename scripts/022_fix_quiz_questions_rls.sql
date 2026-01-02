-- Fix quiz questions RLS policies and permissions

-- Enable RLS on quiz_questions table
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users can view quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Admins can insert quiz questions" ON quiz_questions;

-- Create new simplified policies

-- Allow anyone to view quiz questions
CREATE POLICY "Anyone can view quiz questions"
  ON quiz_questions FOR SELECT
  USING (true);

-- Allow admins to insert quiz questions
CREATE POLICY "Admins can insert quiz questions"
  ON quiz_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow admins to update quiz questions
CREATE POLICY "Admins can update quiz questions"
  ON quiz_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow admins to delete quiz questions
CREATE POLICY "Admins can delete quiz questions"
  ON quiz_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Ensure the increment function exists and has proper permissions
CREATE OR REPLACE FUNCTION increment_quiz_questions(quiz_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE quizzes
  SET total_questions = total_questions + 1
  WHERE id = quiz_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION increment_quiz_questions TO authenticated;
GRANT EXECUTE ON FUNCTION increment_quiz_questions TO service_role;

-- Also ensure teachers can create quizzes (not just admins)
DROP POLICY IF EXISTS "Admins can create quizzes" ON quizzes;
DROP POLICY IF EXISTS "Teachers can create quizzes" ON quizzes;

CREATE POLICY "Teachers and admins can create quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'teacher')
    )
  );

-- Allow teachers and admins to manage quiz questions
DROP POLICY IF EXISTS "Admins can insert quiz questions" ON quiz_questions;

CREATE POLICY "Teachers and admins can insert quiz questions"
  ON quiz_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'teacher' OR users.role = 'hacker')
    )
  );
