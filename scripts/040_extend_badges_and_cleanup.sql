-- Deduplica badge con lo stesso nome, aggiunge un vincolo UNIQUE sul nome
-- e inserisce un grande set di nuovi badge (almeno 50) per il sistema XP/Badge.

-- 1) Deduplica per nome: conserva un solo badge per nome e riallinea eventuali user_badges
-- Nota: utilizziamo array_agg per evitare l'uso di MIN(uuid) che potrebbe non essere disponibile
WITH canonical AS (
  SELECT (array_agg(id ORDER BY id))[1] AS keep_id, name
  FROM badges
  GROUP BY name
),
relinked AS (
  INSERT INTO user_badges (user_id, badge_id, earned_at)
  SELECT ub.user_id, c.keep_id, COALESCE(ub.earned_at, NOW())
  FROM user_badges ub
  JOIN badges b ON b.id = ub.badge_id
  JOIN canonical c ON c.name = b.name
  WHERE ub.badge_id <> c.keep_id
  ON CONFLICT (user_id, badge_id) DO NOTHING
  RETURNING 1
)
DELETE FROM user_badges
USING badges b, canonical c
WHERE user_badges.badge_id = b.id
  AND b.name = c.name
  AND b.id <> c.keep_id;

WITH canonical AS (
  SELECT (array_agg(id ORDER BY id))[1] AS keep_id, name
  FROM badges
  GROUP BY name
)
DELETE FROM badges
USING canonical c
WHERE badges.name = c.name
  AND badges.id <> c.keep_id;

-- 2) Aggiunge vincolo UNIQUE sul nome (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'badges_name_unique'
      AND conrelid = 'badges'::regclass
  ) THEN
    ALTER TABLE badges ADD CONSTRAINT badges_name_unique UNIQUE (name);
  END IF;
END $$;

-- 3) Inserisce una collezione ampia di badge. Usiamo requirement_type compatibili
-- con la funzione check_and_award_badges definita negli script più recenti
-- (materials_uploaded, discussions_created, comments_posted, quizzes_completed,
--  xp_earned, level_reached, consecutive_days, total_active_days, profile_completed).

INSERT INTO badges (name, description, icon_url, requirement_type, requirement_value, rarity, admin_only)
VALUES
  -- Profilo e onboarding
  ('Nuovo Arrivato', 'Hai completato il tuo profilo sul portale.', '✨', 'profile_completed', 1, 'common', FALSE),
  ('Profilo Curato', 'Hai aggiunto bio e dettagli completi al tuo profilo.', '🧑‍🎓', 'profile_completed', 1, 'uncommon', FALSE),

  -- Giorni totali attivi
  ('Esploratore', 'Accedi al portale per 3 giorni diversi.', '🧭', 'total_active_days', 3, 'common', FALSE),
  ('Compagno di Banco', 'Accedi al portale per 10 giorni totali.', '🪑', 'total_active_days', 10, 'common', FALSE),
  ('Presenza Fissa', 'Accedi al portale per 30 giorni totali.', '📅', 'total_active_days', 30, 'uncommon', FALSE),
  ('Pilastri della Classe', 'Accedi per 60 giorni totali.', '🏛️', 'total_active_days', 60, 'rare', FALSE),
  ('Sempre Online', 'Accedi per 120 giorni totali.', '🌐', 'total_active_days', 120, 'epic', FALSE),

  -- Giorni consecutivi
  ('Ritorno a Scuola', 'Accedi 3 giorni consecutivi.', '📆', 'consecutive_days', 3, 'common', FALSE),
  ('Settimana Perfetta', 'Accedi 7 giorni consecutivi.', '📈', 'consecutive_days', 7, 'uncommon', FALSE),
  ('Routine da Pro', 'Accedi 14 giorni consecutivi.', '🧠', 'consecutive_days', 14, 'rare', FALSE),

  -- XP totali
  ('In Partenza', 'Raggiungi 200 XP totali.', '🚀', 'xp_earned', 200, 'common', FALSE),
  ('Studente Costante', 'Raggiungi 400 XP totali.', '📘', 'xp_earned', 400, 'common', FALSE),
  ('Grinder', 'Raggiungi 800 XP totali.', '🎮', 'xp_earned', 800, 'uncommon', FALSE),
  ('Macchina da XP', 'Raggiungi 1500 XP totali.', '⚙️', 'xp_earned', 1500, 'rare', FALSE),
  ('Mostro di XP', 'Raggiungi 3000 XP totali.', '👾', 'xp_earned', 3000, 'epic', FALSE),

  -- Livelli
  ('Livello 3', 'Raggiungi il livello 3.', '3️⃣', 'level_reached', 3, 'common', FALSE),
  ('Livello 7', 'Raggiungi il livello 7.', '7️⃣', 'level_reached', 7, 'uncommon', FALSE),
  ('Livello 12', 'Raggiungi il livello 12.', '1️⃣2️⃣', 'level_reached', 12, 'rare', FALSE),
  ('Livello 20', 'Raggiungi il livello 20.', '2️⃣0️⃣', 'level_reached', 20, 'epic', FALSE),

  -- Materiali caricati
  ('Primo Appunto', 'Carica il tuo primo materiale.', '📄', 'materials_uploaded', 1, 'common', FALSE),
  ('Zaino Pieno', 'Carica 5 materiali.', '🎒', 'materials_uploaded', 5, 'common', FALSE),
  ('Biblioteca Vivente', 'Carica 15 materiali.', '📚', 'materials_uploaded', 15, 'uncommon', FALSE),
  ('Archivista', 'Carica 30 materiali.', '🗄️', 'materials_uploaded', 30, 'rare', FALSE),
  ('Tesoro della Classe', 'Carica 60 materiali.', '💎', 'materials_uploaded', 60, 'epic', FALSE),

  -- Discussioni forum
  ('Prima Discussione', 'Crea la tua prima discussione nel forum.', '💬', 'discussions_created', 1, 'common', FALSE),
  ('Animatore di Classe', 'Crea 5 discussioni.', '🎤', 'discussions_created', 5, 'uncommon', FALSE),
  ('Moderatore Naturale', 'Crea 15 discussioni.', '🛡️', 'discussions_created', 15, 'rare', FALSE),
  ('Filo del Discorso', 'Crea 30 discussioni.', '🧵', 'discussions_created', 30, 'epic', FALSE),

  -- Commenti
  ('Primo Commento', 'Scrivi il tuo primo commento.', '✍️', 'comments_posted', 1, 'common', FALSE),
  ('Sempre Presente', 'Scrivi 10 commenti.', '📢', 'comments_posted', 10, 'common', FALSE),
  ('Conversatore', 'Scrivi 25 commenti.', '🗣️', 'comments_posted', 25, 'uncommon', FALSE),
  ('Voce della Classe', 'Scrivi 50 commenti.', '📣', 'comments_posted', 50, 'rare', FALSE),
  ('Wall of Text', 'Scrivi 100 commenti.', '🧱', 'comments_posted', 100, 'epic', FALSE),

  -- Quiz completati
  ('Prima Verifica', 'Completa il tuo primo quiz.', '📝', 'quizzes_completed', 1, 'common', FALSE),
  ('Allenamento Costante', 'Completa 5 quiz.', '🏋️‍♂️', 'quizzes_completed', 5, 'common', FALSE),
  ('Esaminato', 'Completa 15 quiz.', '📊', 'quizzes_completed', 15, 'uncommon', FALSE),
  ('Cacciatore di Punti', 'Completa 30 quiz.', '🎯', 'quizzes_completed', 30, 'rare', FALSE),
  ('Maratoneta dei Quiz', 'Completa 60 quiz.', '🏃‍♂️', 'quizzes_completed', 60, 'epic', FALSE),

  -- Mix di attività
  ('Tutore della Classe', 'Carica 10 materiali e crea 10 discussioni.', '🤝', 'materials_uploaded', 10, 'rare', FALSE),
  ('Supporto Costante', 'Scrivi 50 commenti e completa 10 quiz.', '🧩', 'comments_posted', 50, 'rare', FALSE),
  ('Tempesta di Contenuti', 'Carica 25 materiali e crea 20 discussioni.', '🌪️', 'materials_uploaded', 25, 'epic', FALSE),

  -- Speciali di rarità alta (non admin_only)
  ('Cuore della Classe', 'Contribuisci in modo costante con contenuti e discussioni.', '❤️', 'total_active_days', 90, 'legendary', FALSE),
  ('Legend of 1R', 'Raggiungi una combinazione di XP e attività da vero riferimento di classe.', '🏅', 'xp_earned', 4000, 'legendary', FALSE),
  ('Supremo della Classe', 'Mantieni una presenza costante e aiuta gli altri per lungo tempo.', '🦾', 'total_active_days', 180, 'supreme', FALSE)
ON CONFLICT (name) DO NOTHING;

COMMIT;
