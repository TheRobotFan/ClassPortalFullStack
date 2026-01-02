-- Populate subjects table with basic school subjects
-- Run this script in Supabase SQL Editor to fix missing subjects

-- Insert basic school subjects with colors
INSERT INTO subjects (name, description, color) VALUES
('Matematica', 'Materia di matematica, algebra e geometria', '#FF6B6B'),
('Italiano', 'Materia di lingua italiana, letteratura e grammatica', '#4ECDC4'),
('Storia', 'Materia di storia, civiltà e geografia', '#45B7D1'),
('Fisica', 'Materia di fisica, meccanica e scienze naturali', '#FFA07A'),
('Biologia', 'Materia di biologia, anatomia e scienze della vita', '#98D8C8'),
('Chimica', 'Materia di chimica e laboratorio', '#F7DC6F'),
('Geografia', 'Materia di geografia fisica e economica', '#BB8FCE'),
('Inglese', 'Materia di lingua inglese', '#85C1E9'),
('Latino', 'Materia di lingua latina e cultura classica', '#F8C471'),
('Filosofia', 'Materia di filosofia e pensiero critico', '#82E0AA'),
('Scienze Motorie', 'Materia di educazione fisica e sport', '#F1948A'),
('Arte', 'Materia di storia dell''arte e disegno', '#D7BDE2'),
('Musica', 'Materia di teoria musicale e canto', '#AED6F1'),
('Religione', 'Materia di religione cattolica', '#A9DFBF'),
('Tecnologia', 'Materia di informatica e tecnologia', '#FAD7A0');

-- Verify the insertion worked
SELECT COUNT(*) as total_subjects FROM subjects;
SELECT name, description FROM subjects ORDER BY name;
