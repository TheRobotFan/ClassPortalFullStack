-- ============================================================================
-- FIX USER REGISTRATION ISSUES
-- This script resolves database errors when saving new users
-- ============================================================================

-- Step 1: Drop all conflicting triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Step 2: Create the definitive handle_new_user function with all required fields
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    full_name,
    first_name,
    last_name,
    date_of_birth,
    city,
    phone,
    bio,
    role, 
    xp_points, 
    level,
    profile_completed,
    is_active,
    consecutive_active_days,
    total_active_days,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, NULL),
    COALESCE(NEW.raw_user_meta_data->>'city', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'bio', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    0, -- Always start with 0 XP
    1, -- Always start at level 1
    false, -- Profile not completed by default
    true, -- User is active by default
    0, -- consecutive_active_days
    0, -- total_active_days
    NOW(), -- created_at
    NOW()  -- updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    date_of_birth = EXCLUDED.date_of_birth,
    city = EXCLUDED.city,
    phone = EXCLUDED.phone,
    bio = EXCLUDED.bio,
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Step 4: Ensure all required columns exist (add any missing ones)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS consecutive_active_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_active_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- Step 5: Update any existing users with NULL defaults
UPDATE users
SET xp_points = COALESCE(xp_points, 0),
    level = COALESCE(level, 1),
    profile_completed = COALESCE(profile_completed, false),
    is_active = COALESCE(is_active, true),
    consecutive_active_days = COALESCE(consecutive_active_days, 0),
    total_active_days = COALESCE(total_active_days, 0)
WHERE xp_points IS NULL 
   OR level IS NULL 
   OR profile_completed IS NULL 
   OR is_active IS NULL 
   OR consecutive_active_days IS NULL 
   OR total_active_days IS NULL;

-- Step 6: Verify the trigger works by checking function exists
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- Done!
SELECT 'User registration fix completed successfully!' as status;
