-- REAL-TIME BADGE ASSIGNMENT TRIGGER
-- This creates a trigger that automatically checks for new badges when user stats change

-- Function to handle user badge checking on update
CREATE OR REPLACE FUNCTION trigger_check_user_badges()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check if relevant fields changed
    IF OLD.xp_points != NEW.xp_points OR
       OLD.level != NEW.level OR
       OLD.total_active_days != NEW.total_active_days OR
       OLD.consecutive_active_days != NEW.consecutive_active_days THEN

        -- Call the badge checking function for this user
        PERFORM assign_badges_to_user(NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on users table
DROP TRIGGER IF EXISTS trigger_user_badge_check ON users;
CREATE TRIGGER trigger_user_badge_check
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_check_user_badges();

-- Function for when activities are added
CREATE OR REPLACE FUNCTION trigger_check_badge_on_quiz()
RETURNS TRIGGER AS $$
BEGIN
    -- Check badges for the user who completed the quiz
    PERFORM assign_badges_to_user(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quiz completion
DROP TRIGGER IF EXISTS trigger_quiz_badge_check ON quiz_attempts;
CREATE TRIGGER trigger_quiz_badge_check
    AFTER INSERT ON quiz_attempts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_check_badge_on_quiz();

-- Similar triggers can be added for other activities
-- (comments, materials, discussions, etc.)

COMMIT;
