-- AUTOMATICALLY ASSIGN ALL EXISTING BADGES TO QUALIFIED USERS
-- This script evaluates ALL badges in the system and assigns them to users who qualify

-- CONSERVATIVE BADGE ASSIGNMENT - Only assigns safe, essential badges
-- This version avoids controversial assignments and focuses on objective achievements

-- Create basic user stats table (only essential data)
CREATE TEMP TABLE safe_user_stats AS
SELECT
  u.id as user_id,
  u.xp_points,
  u.level,
  u.role,
  -- Only count real activities (exclude potential test data)
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

-- ONLY assign the most essential and uncontroversial badges

-- 1. Welcome badge to everyone
INSERT INTO user_badges (user_id, badge_id)
SELECT sus.user_id, b.id
FROM safe_user_stats sus
CROSS JOIN (SELECT id FROM badges WHERE name = 'Benvenuto' LIMIT 1) b
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- 2. Basic activity badges (only if user has meaningful activity)
INSERT INTO user_badges (user_id, badge_id)
SELECT sus.user_id, b.id
FROM safe_user_stats sus
CROSS JOIN (SELECT id FROM badges WHERE name = 'Partecipante' LIMIT 1) b
WHERE sus.quizzes_completed >= 3  -- At least 3 quizzes to be meaningful
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT sus.user_id, b.id
FROM safe_user_stats sus
CROSS JOIN (SELECT id FROM badges WHERE name = 'Collaboratore' LIMIT 1) b
WHERE sus.comments_posted >= 5  -- At least 5 comments to be meaningful
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT sus.user_id, b.id
FROM safe_user_stats sus
CROSS JOIN (SELECT id FROM badges WHERE name = 'Studioso' LIMIT 1) b
WHERE sus.materials_uploaded >= 2  -- At least 2 materials to be meaningful
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- 3. High-level achievement badges (very selective)
INSERT INTO user_badges (user_id, badge_id)
SELECT sus.user_id, b.id
FROM safe_user_stats sus
CROSS JOIN (SELECT id FROM badges WHERE name = 'Mago Oscuro' LIMIT 1) b
WHERE sus.xp_points = 666  -- Exact match only
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT sus.user_id, b.id
FROM safe_user_stats sus
CROSS JOIN (SELECT id FROM badges WHERE name = 'Saggio' LIMIT 1) b
WHERE sus.comments_posted = 777  -- Exact match only
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT sus.user_id, b.id
FROM safe_user_stats sus
CROSS JOIN (SELECT id FROM badges WHERE name = 'Palindromo' LIMIT 1) b
WHERE sus.quizzes_completed = 101  -- Exact match only
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- 4. Special level badges (objective)
INSERT INTO user_badges (user_id, badge_id)
SELECT sus.user_id, b.id
FROM safe_user_stats sus
CROSS JOIN (SELECT id FROM badges WHERE name = 'Mago' LIMIT 1) b
WHERE sus.level = 13
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT sus.user_id, b.id
FROM safe_user_stats sus
CROSS JOIN (SELECT id FROM badges WHERE name = 'Drago' LIMIT 1) b
WHERE sus.level = 21
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT sus.user_id, b.id
FROM safe_user_stats sus
CROSS JOIN (SELECT id FROM badges WHERE name = 'Dio' LIMIT 1) b
WHERE sus.level = 100
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- 5. Admin/Hacker exclusive badges (only for staff)
INSERT INTO user_badges (user_id, badge_id)
SELECT sus.user_id, b.id
FROM safe_user_stats sus
CROSS JOIN (SELECT id FROM badges WHERE name = 'Amministratore Supremo' LIMIT 1) b
WHERE sus.role = 'admin'
ON CONFLICT (user_id, badge_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT sus.user_id, b.id
FROM safe_user_stats sus
CROSS JOIN (SELECT id FROM badges WHERE name = 'Hacker Leggendario' LIMIT 1) b
WHERE sus.role = 'hacker'
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Clean up
DROP TABLE safe_user_stats;

COMMIT;
