-- ============================================
-- CLEAN DATABASE AND ADD SUBJECTS
-- ============================================

-- Keep only the real user (delete any test data)
DELETE FROM user_badges WHERE user_id NOT IN (
  SELECT id FROM users WHERE email = '${ADMIN_EMAIL}'
);

DELETE FROM quiz_attempts WHERE user_id NOT IN (
  SELECT id FROM users WHERE email = '${ADMIN_EMAIL}'
);

DELETE FROM exercise_comments WHERE user_id NOT IN (
  SELECT id FROM users WHERE email = '${ADMIN_EMAIL}'
);

DELETE FROM forum_comments WHERE user_id NOT IN (
  SELECT id FROM users WHERE email = '${ADMIN_EMAIL}'
);

DELETE FROM material_comments WHERE user_id NOT IN (
  SELECT id FROM users WHERE email = '${ADMIN_EMAIL}'
);

DELETE FROM forum_discussions WHERE user_id NOT IN (
  SELECT id FROM users WHERE email = '${ADMIN_EMAIL}'
);

DELETE FROM materials WHERE uploaded_by NOT IN (
  SELECT id FROM users WHERE email = '${ADMIN_EMAIL}'
);

DELETE FROM quiz_questions;
DELETE FROM quizzes;
DELETE FROM exercises;
DELETE FROM project_discussions;
DELETE FROM project_members;
DELETE FROM projects;
DELETE FROM featured_contributors;

-- Delete fake users (keep only the real one)
DELETE FROM users WHERE email != '${ADMIN_EMAIL}';

-- Clear subjects and re-insert them
DELETE FROM subjects;

-- Insert 10 subjects for the class
INSERT INTO subjects (name, description, color) VALUES
('Matematica', 'Materia di matematica e algebra', '#FF6B6B'),
('Fisica', 'Materia di fisica e meccanica', '#4ECDC4'),
('Chimica', 'Materia di chimica', '#95E1D3'),
('Biologia', 'Materia di biologia e scienze naturali', '#45B7D1'),
('Storia', 'Materia di storia e civiltà', '#FFA07A'),
('Geografia', 'Materia di geografia', '#F38181'),
('Italiano', 'Materia di lingua italiana', '#98D8C8'),
('Inglese', 'Materia di lingua inglese', '#AA96DA'),
('Arte', 'Materia di arte e disegno', '#FCBAD3'),
('Educazione Fisica', 'Materia di educazione fisica', '#A8D8EA');

-- Verify subjects were created
SELECT * FROM subjects ORDER BY name;
