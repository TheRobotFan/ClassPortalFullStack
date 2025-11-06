-- Script completo per eliminare e ricreare il sistema degli appunti
-- Questo script elimina tutte le tabelle esistenti e le ricrea da zero

-- 1. Eliminazione delle tabelle esistenti in ordine corretto (prima le dipendenze)
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS project_discussions CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS forum_comments CASCADE;
DROP TABLE IF EXISTS forum_discussions CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS exercise_comments CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Creazione delle tabelle pulite

-- Users table with role-based access
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'student', -- student, teacher, staff, admin
  bio TEXT,
  class_id UUID,
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Subjects/Materie table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Materials/Notes table (sistema appunti migliorato)
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  file_url TEXT,
  file_type VARCHAR(50),
  file_size INTEGER,
  uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
  downloads_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  tags TEXT[], -- Array di tag per categorizzazione
  is_public BOOLEAN DEFAULT true, -- Controllo visibilità
  status VARCHAR(20) DEFAULT 'active', -- active, archived, deleted
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Badges/Achievement System
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  requirement_type VARCHAR(50), -- xp_threshold, activity_count, etc
  requirement_value INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Badges (earned)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, badge_id)
);

-- Exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  difficulty VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  hint TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercise Comments
CREATE TABLE exercise_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  difficulty VARCHAR(20) DEFAULT 'medium',
  time_limit INTEGER, -- in seconds
  passing_score INTEGER DEFAULT 70,
  total_questions INTEGER,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Questions
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer VARCHAR(1) NOT NULL,
  explanation TEXT,
  order_index INTEGER
);

-- Quiz Attempts/Results
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER,
  percentage NUMERIC(5,2),
  answers JSONB, -- stores selected answers
  completed_at TIMESTAMP,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forum Discussions
CREATE TABLE forum_discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  category VARCHAR(100),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  views_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forum Comments/Replies
CREATE TABLE forum_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID REFERENCES forum_discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'planning', -- planning, in_progress, completed
  start_date DATE,
  end_date DATE,
  budget NUMERIC(10, 2),
  spent NUMERIC(10, 2) DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Team Members
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- leader, member
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Discussions
CREATE TABLE project_discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50), -- comment, reply, achievement, mention
  related_id UUID, -- ID of related object
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Creazione degli indici per performance ottimale
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_subjects_name ON subjects(name);
CREATE INDEX idx_materials_subject ON materials(subject_id);
CREATE INDEX idx_materials_uploaded_by ON materials(uploaded_by);
CREATE INDEX idx_materials_status ON materials(status);
CREATE INDEX idx_materials_created_at ON materials(created_at);
CREATE INDEX idx_exercises_subject ON exercises(subject_id);
CREATE INDEX idx_exercises_created_by ON exercises(created_by);
CREATE INDEX idx_quiz_subject ON quizzes(subject_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_forum_discussions_subject ON forum_discussions(subject_id);
CREATE INDEX idx_forum_comments_discussion ON forum_comments(discussion_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- 4. Abilitazione Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 5. Creazione delle RLS Policies per Materials (appunti)
-- Elimina policy esistenti
DROP POLICY IF EXISTS "Everyone can view materials" ON materials;
DROP POLICY IF EXISTS "Authenticated users can upload materials" ON materials;
DROP POLICY IF EXISTS "Users can update own materials" ON materials;
DROP POLICY IF EXISTS "Teachers and admin can delete any materials" ON materials;
DROP POLICY IF EXISTS "Users can delete own materials" ON materials;

-- Crea nuove policy per materials
CREATE POLICY "Everyone can view active materials" ON materials
  FOR SELECT USING (is_public = true AND status = 'active');

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

-- 6. Creazione delle RLS Policies per Users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 7. Creazione delle funzioni RPC per materials
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

-- 8. Permessi per le tabelle
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON materials TO authenticated;
GRANT SELECT ON materials TO anon;
GRANT ALL ON subjects TO authenticated;
GRANT SELECT ON subjects TO anon;
GRANT ALL ON users TO authenticated;
GRANT SELECT ON users TO anon;

COMMIT;
