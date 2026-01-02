-- AUTOMATIC BADGE ASSIGNMENT SYSTEM
-- This creates a function that automatically checks and assigns badges to users who qualify
-- Can be called manually or set up as a scheduled job

-- Drop all related functions first
DROP FUNCTION IF EXISTS check_and_assign_all_badges();
DROP FUNCTION IF EXISTS check_and_assign_user_badge(uuid);
DROP FUNCTION IF EXISTS check_and_assign_user_badges(uuid);

-- Function to check and assign badges for users
CREATE OR REPLACE FUNCTION assign_badges_to_users(check_user_id UUID DEFAULT NULL)
RETURNS TABLE(
    checked_user_id UUID,
    badge_assigned VARCHAR(100),
    was_assigned BOOLEAN
) AS $$
DECLARE
    current_usr RECORD;
    current_bdg RECORD;
    user_stat_value INTEGER;
    requirement_met BOOLEAN;
BEGIN
    -- Create temporary table for results
    CREATE TEMP TABLE IF NOT EXISTS assignment_log (
        checked_user_id UUID,
        badge_assigned VARCHAR(100),
        was_assigned BOOLEAN DEFAULT FALSE
    );

    -- Process each user (or specific user)
    FOR current_usr IN
        SELECT
            usr.id,
            usr.xp_points,
            usr.level,
            usr.total_active_days,
            usr.consecutive_active_days,
            COALESCE(quiz_stats.quiz_count, 0) as total_quizzes,
            COALESCE(comment_stats.comment_count, 0) as total_comments,
            COALESCE(material_stats.material_count, 0) as total_materials,
            COALESCE(discussion_stats.discussion_count, 0) as total_discussions
        FROM users usr
        LEFT JOIN (SELECT user_id, COUNT(*) as quiz_count FROM quiz_attempts GROUP BY user_id) quiz_stats ON usr.id = quiz_stats.user_id
        LEFT JOIN (SELECT user_id, COUNT(*) as comment_count FROM exercise_comments GROUP BY user_id) comment_stats ON usr.id = comment_stats.user_id
        LEFT JOIN (SELECT uploaded_by, COUNT(*) as material_count FROM materials GROUP BY uploaded_by) material_stats ON usr.id = material_stats.uploaded_by
        LEFT JOIN (SELECT user_id, COUNT(*) as discussion_count FROM forum_discussions GROUP BY user_id) discussion_stats ON usr.id = discussion_stats.user_id
        WHERE (check_user_id IS NULL OR usr.id = check_user_id)
    LOOP
        -- Check each available badge
        FOR current_bdg IN SELECT * FROM badges LOOP
            -- Skip if user already has this badge
            IF EXISTS (
                SELECT 1 FROM user_badges ub
                WHERE ub.user_id = current_usr.id AND ub.badge_id = current_bdg.id
            ) THEN
                CONTINUE;
            END IF;

            requirement_met := FALSE;

            -- Evaluate badge requirements
            CASE current_bdg.requirement_type
                WHEN 'xp_earned' THEN
                    user_stat_value := current_usr.xp_points;
                    -- Exact matches for special XP values
                    IF current_bdg.requirement_value IN (666, 7777, 9999, 99999) THEN
                        requirement_met := user_stat_value = current_bdg.requirement_value;
                    ELSE
                        requirement_met := user_stat_value >= current_bdg.requirement_value;
                    END IF;

                WHEN 'level_reached' THEN
                    user_stat_value := current_usr.level;
                    requirement_met := user_stat_value = current_bdg.requirement_value;

                WHEN 'quizzes_completed' THEN
                    user_stat_value := current_usr.total_quizzes;
                    -- Exact matches for special quiz counts
                    IF current_bdg.requirement_value IN (101, 99) THEN
                        requirement_met := user_stat_value = current_bdg.requirement_value;
                    ELSE
                        requirement_met := user_stat_value >= current_bdg.requirement_value;
                    END IF;

                WHEN 'comments_posted' THEN
                    user_stat_value := current_usr.total_comments;
                    -- Exact match for 777 comments
                    IF current_bdg.requirement_value = 777 THEN
                        requirement_met := user_stat_value = current_bdg.requirement_value;
                    ELSE
                        requirement_met := user_stat_value >= current_bdg.requirement_value;
                    END IF;

                WHEN 'materials_uploaded' THEN
                    user_stat_value := current_usr.total_materials;
                    requirement_met := user_stat_value >= current_bdg.requirement_value;

                WHEN 'discussions_created' THEN
                    user_stat_value := current_usr.total_discussions;
                    -- Exact match for 42 discussions
                    IF current_bdg.requirement_value = 42 THEN
                        requirement_met := user_stat_value = current_bdg.requirement_value;
                    ELSE
                        requirement_met := user_stat_value >= current_bdg.requirement_value;
                    END IF;

                WHEN 'total_active_days' THEN
                    user_stat_value := current_usr.total_active_days;
                    requirement_met := user_stat_value >= current_bdg.requirement_value;

                WHEN 'consecutive_days' THEN
                    user_stat_value := current_usr.consecutive_active_days;
                    requirement_met := user_stat_value >= current_bdg.requirement_value;

                WHEN 'profile_completed' THEN
                    -- Always true for basic profile completion badges
                    requirement_met := TRUE;

                ELSE
                    requirement_met := FALSE;
            END CASE;

            -- Special handling for admin/hacker exclusive badges
            IF current_bdg.name IN ('Amministratore Supremo', 'Hacker Leggendario') THEN
                requirement_met := requirement_met AND EXISTS (
                    SELECT 1 FROM users WHERE id = current_usr.id AND role IN ('admin', 'hacker')
                );
            END IF;

            -- Assign badge if requirements are met
            IF requirement_met THEN
                INSERT INTO user_badges (user_id, badge_id) VALUES (current_usr.id, current_bdg.id);
                INSERT INTO assignment_log (checked_user_id, badge_assigned, was_assigned)
                VALUES (current_usr.id, current_bdg.name, TRUE);
            END IF;
        END LOOP;
    END LOOP;

    -- Return assignment results
    RETURN QUERY SELECT * FROM assignment_log;

    -- Clean up
    DROP TABLE IF EXISTS assignment_log;
END;
$$ LANGUAGE plpgsql;

-- Convenience function to check all users
CREATE OR REPLACE FUNCTION assign_badges_to_all_users()
RETURNS TABLE(
    checked_user_id UUID,
    badge_assigned VARCHAR(100),
    was_assigned BOOLEAN
) AS $$
BEGIN
    RETURN QUERY SELECT * FROM assign_badges_to_users(NULL);
END;
$$ LANGUAGE plpgsql;

-- Convenience function to check specific user
CREATE OR REPLACE FUNCTION assign_badges_to_user(target_user UUID)
RETURNS TABLE(
    checked_user_id UUID,
    badge_assigned VARCHAR(100),
    was_assigned BOOLEAN
) AS $$
BEGIN
    RETURN QUERY SELECT * FROM assign_badges_to_users(target_user);
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM assign_badges_to_all_users();  -- Check all users
-- SELECT * FROM assign_badges_to_user('user-uuid-here');  -- Check specific user

COMMIT;
