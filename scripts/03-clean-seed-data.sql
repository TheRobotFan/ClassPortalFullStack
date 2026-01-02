-- New script to clean fake data and keep only real user
-- This script removes all fake seed data and keeps only the subjects and real user

-- Delete all fake users except the real one
DELETE FROM users WHERE email NOT IN ('${ADMIN_EMAIL}');

-- Delete all fake exercises
DELETE FROM exercises;

-- Delete all fake quizzes
DELETE FROM quizzes;

-- Delete all fake forum discussions
DELETE FROM forum_discussions;

-- Delete all fake materials
DELETE FROM materials;

-- Delete all fake badges assignments
DELETE FROM user_badges;

-- Delete all fake featured contributors
DELETE FROM featured_contributors;

-- Ensure subjects exist (keep them as they are needed)
-- Subjects are already created in 01-create-schema.sql

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
('Educazione Fisica', 'Materia di educazione fisica', '#A8D8EA')
ON CONFLICT DO NOTHING;
