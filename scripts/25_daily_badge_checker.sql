-- AUTOMATIC BADGE CHECKER SCRIPT
-- This script can be run periodically (e.g., daily) to automatically assign badges
-- Can be set up as a cron job or scheduled task

-- Run the automatic badge assignment for all users
SELECT
    u.email,
    bar.badge_assigned,
    bar.was_assigned,
    NOW() as checked_at
FROM users u
CROSS JOIN assign_badges_to_all_users() bar
WHERE bar.checked_user_id = u.id
ORDER BY u.email, bar.badge_assigned;

-- Log the completion (optional - comment out if system_logs table doesn't exist)
-- INSERT INTO system_logs (event_type, message, created_at)
-- VALUES ('badge_check', 'Completed automatic badge check for all users', NOW())
-- ON CONFLICT DO NOTHING;

COMMIT;
