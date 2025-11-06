-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Users: Everyone can read, users can update own profile
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Exercises: Everyone can read, teachers/admin can create
CREATE POLICY "Everyone can view exercises" ON exercises
  FOR SELECT USING (true);

CREATE POLICY "Teachers and admin can create exercises" ON exercises
  FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin', 'staff')
  );

-- Exercise Comments: Everyone can read, authenticated can comment
CREATE POLICY "Everyone can view comments" ON exercise_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON exercise_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON exercise_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Quizzes: Everyone can read, teachers/admin can create
CREATE POLICY "Everyone can view quizzes" ON quizzes
  FOR SELECT USING (true);

CREATE POLICY "Teachers and admin can create quizzes" ON quizzes
  FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin', 'staff')
  );

-- Quiz Questions: Only visible when taking quiz
CREATE POLICY "Authorized users can view questions" ON quiz_questions
  FOR SELECT USING (true);

-- Quiz Attempts: Users can read own, everyone can create
CREATE POLICY "Users can view own attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'staff'));

CREATE POLICY "Authenticated users can create attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Forum: Everyone can read, authenticated can create
CREATE POLICY "Everyone can view discussions" ON forum_discussions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create discussions" ON forum_discussions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Forum Comments
CREATE POLICY "Everyone can view forum comments" ON forum_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON forum_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Projects
CREATE POLICY "Everyone can view projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Teachers and admin can create projects" ON projects
  FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin', 'staff')
  );

-- Notifications: Users can only view own
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Materials
CREATE POLICY "Everyone can view materials" ON materials
  FOR SELECT USING (true);

CREATE POLICY "Teachers and admin can upload materials" ON materials
  FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin', 'staff')
  );

CREATE POLICY "Users can update own materials" ON materials
  FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Teachers and admin can delete materials" ON materials
  FOR DELETE USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin', 'staff') OR 
    auth.uid() = uploaded_by
  );

-- Badges
CREATE POLICY "Everyone can view badges" ON badges
  FOR SELECT USING (true);

CREATE POLICY "Everyone can view earned badges" ON user_badges
  FOR SELECT USING (true);
