-- Dati di default per il nuovo sistema appunti
-- Questo script inserisce i dati necessari per testare il sistema

-- Inserimento materie di default
INSERT INTO subjects (name, description, color) VALUES
('Matematica', 'Studio di numeri, strutture, spazio e cambiamento', '#3B82F6'),
('Italiano', 'Lingua e letteratura italiana', '#EF4444'),
('Storia', 'Eventi e sviluppi del passato umano', '#F59E0B'),
('Geografia', 'Studio della Terra e dei suoi abitanti', '#10B981'),
('Scienze', 'Studio del mondo naturale attraverso osservazione e sperimentazione', '#8B5CF6'),
('Inglese', 'Lingua e cultura inglese', '#EC4899'),
('Informatica', 'Scienza dell''informazione e tecnologia', '#6366F1'),
('Economia', 'Studio della produzione, distribuzione e consumo di beni e servizi', '#84CC16'),
('Filosofia', 'Studio delle questioni fondamentali sull''esistenza e la conoscenza', '#F97316'),
('Arte', 'Espressione creativa e bellezza', '#06B6D4');

-- Inserimento badges per il sistema di gamification
INSERT INTO badges (name, description, icon_url, requirement_type, requirement_value) VALUES
('Primo Appunto', 'Hai caricato il tuo primo appunto', '📝', 'upload_material', 1),
('Appunti Pro', 'Hai caricato 10 appunti', '📚', 'upload_material', 10),
('Maestro degli Appunti', 'Hai caricato 50 appunti', '🎓', 'upload_material', 50),
('Download Attivo', 'Hai scaricato 5 appunti', '⬇️', 'download_material', 5),
(' studioso', 'Hai scaricato 20 appunti', '📖', 'download_material', 20),
('Esploratore', 'Hai visualizzato 10 appunti', '👁️', 'view_material', 10),
('Contribuente Valido', 'Hai raggiunto 100 XP totali', '⭐', 'xp_threshold', 100),
('Studente Eccellente', 'Hai raggiunto 500 XP totali', '🏆', 'xp_threshold', 500),
('Leggenda della Classe', 'Hai raggiunto 1000 XP totali', '👑', 'xp_threshold', 1000);

-- Inserimento di alcuni utenti di test (se non esistono già)
INSERT INTO users (id, email, full_name, role, xp_points, level) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@scuola.it', 'Admin Scuola', 'admin', 1000, 5),
('550e8400-e29b-41d4-a716-446655440002', 'teacher@scuola.it', 'Prof. Rossi', 'teacher', 500, 3),
('550e8400-e29b-41d4-a716-446655440003', 'student1@scuola.it', 'Mario Bianchi', 'student', 100, 2),
('550e8400-e29b-41d4-a716-446655440004', 'student2@scuola.it', 'Giulia Verdi', 'student', 50, 1)
ON CONFLICT (id) DO NOTHING;

-- Inserimento di alcuni materiali di test
INSERT INTO materials (title, description, subject_id, uploaded_by, file_type, file_size, tags) VALUES
('Riassunto Analisi Matematica', 'Riassunto completo di analisi matematica con formule ed esempi', 
 (SELECT id FROM subjects WHERE name = 'Matematica'), 
 (SELECT id FROM users WHERE email = 'teacher@scuola.it'), 
 'application/pdf', 2048576, ARRAY['analisi', 'formule', 'esami']),
('Appunti di Letteratura Italiana', 'Panoramica della letteratura italiana dal ''200 ad oggi',
 (SELECT id FROM subjects WHERE name = 'Italiano'),
 (SELECT id FROM users WHERE email = 'student1@scuola.it'),
 'application/pdf', 1536000, ARRAY['letteratura', 'autori', 'storia']),
('Mappe di Storia Contemporanea', 'Mappe concettuali e timeline della storia contemporanea',
 (SELECT id FROM subjects WHERE name = 'Storia'),
 (SELECT id FROM users WHERE email = 'student2@scuola.it'),
 'application/pdf', 3072000, ARRAY['mappe', 'timeline', 'guerre']),
('Guida alla Chimica Organica', 'Appunti dettagliati con reazioni e meccanismi',
 (SELECT id FROM subjects WHERE name = 'Scienze'),
 (SELECT id FROM users WHERE email = 'teacher@scuola.it'),
 'application/pdf', 2560000, ARRAY['chimica', 'organica', 'reazioni']),
('Esercizi di Grammatica Inglese', 'Eserciziario completo con soluzioni',
 (SELECT id FROM subjects WHERE name = 'Inglese'),
 (SELECT id FROM users WHERE email = 'student1@scuola.it'),
 'application/pdf', 1024000, ARRAY['esercizi', 'grammatica', 'soluzioni']);

COMMIT;
