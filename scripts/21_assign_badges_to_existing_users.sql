-- ASSIGN BADGES TO ALL EXISTING USERS
-- This script evaluates all existing users and assigns badges they qualify for
-- Run this after creating the complete badge system

-- SIMPLIFIED BADGE ASSIGNMENT SCRIPT
-- Only assigns badges based on data that definitely exists in your database

-- Create temporary table with user stats
CREATE TEMP TABLE user_stats AS
SELECT
  u.id as user_id,
  u.xp_points,
  u.level,
  u.total_active_days,
  u.consecutive_active_days,
  -- Count existing activities
  COALESCE(quiz_count.total_quizzes, 0) as quizzes_completed,
  COALESCE(comment_count.total_comments, 0) as comments_posted,
  COALESCE(material_count.total_materials, 0) as materials_uploaded,
  COALESCE(discussion_count.total_discussions, 0) as discussions_created
FROM users u
LEFT JOIN (
  SELECT user_id, COUNT(*) as total_quizzes FROM quiz_attempts GROUP BY user_id
) quiz_count ON u.id = quiz_count.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as total_comments FROM exercise_comments GROUP BY user_id
) comment_count ON u.id = comment_count.user_id
LEFT JOIN (
  SELECT uploaded_by as user_id, COUNT(*) as total_materials FROM materials GROUP BY uploaded_by
) material_count ON u.id = material_count.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as total_discussions FROM forum_discussions GROUP BY user_id
) discussion_count ON u.id = discussion_count.user_id;

-- Assign basic badges to everyone
INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Benvenuto' LIMIT 1) b
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Assign badges based on activity levels
INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Partecipante' LIMIT 1) b
WHERE us.quizzes_completed >= 1
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Collaboratore' LIMIT 1) b
WHERE us.comments_posted >= 1
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Studioso' LIMIT 1) b
WHERE us.materials_uploaded >= 1
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Social' LIMIT 1) b
WHERE us.discussions_created >= 1
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Activity-based badges
INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Costante' LIMIT 1) b
WHERE us.total_active_days >= 50
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Dedito allo Studio' LIMIT 1) b
WHERE us.total_active_days >= 100
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Content creation badges
INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Scrittore' LIMIT 1) b
WHERE us.materials_uploaded >= 25
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Pubblicista' LIMIT 1) b
WHERE us.materials_uploaded >= 50
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Educatore' LIMIT 1) b
WHERE us.discussions_created >= 25
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Quiz achievement badges
INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Campione dei Quiz' LIMIT 1) b
WHERE us.quizzes_completed >= 25
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Maestro dei Test' LIMIT 1) b
WHERE us.quizzes_completed >= 50
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Level-based badges
INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Mago' LIMIT 1) b
WHERE us.level = 13
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Drago' LIMIT 1) b
WHERE us.level = 21
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Fenice' LIMIT 1) b
WHERE us.level = 33
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Titan' LIMIT 1) b
WHERE us.level = 50
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Guardiano delle Stelle' LIMIT 1) b
WHERE us.level = 88
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Dio' LIMIT 1) b
WHERE us.level = 100
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- XP-based legendary badges
INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Mago Oscuro' LIMIT 1) b
WHERE us.xp_points = 666
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Saggio' LIMIT 1) b
WHERE us.comments_posted = 777
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Palindromo' LIMIT 1) b
WHERE us.quizzes_completed = 101
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Visionario' LIMIT 1) b
WHERE us.discussions_created = 42
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT us.user_id, b.id
FROM user_stats us
CROSS JOIN (SELECT id FROM badges WHERE name = 'Cavaliere' LIMIT 1) b
WHERE us.quizzes_completed >= 99
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Clean up
DROP TABLE user_stats;

COMMIT;
