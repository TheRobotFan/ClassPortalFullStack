-- DELETE ALL EXISTING BADGES
-- This script removes all badges from the database
-- WARNING: This will permanently delete all badge data!

DELETE FROM user_badges;

-- Reset sequences if needed
-- ALTER SEQUENCE badges_id_seq RESTART WITH 1;

COMMIT;
