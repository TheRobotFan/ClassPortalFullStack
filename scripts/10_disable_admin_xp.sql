-- Prevent admins from gaining XP via add_user_xp
CREATE OR REPLACE FUNCTION add_user_xp(user_id uuid, xp_amount integer)
RETURNS TABLE(leveled_up boolean, new_level integer, new_xp integer) AS $$
DECLARE
  current_xp integer;
  current_level integer;
  new_xp_total integer;
  new_level_calc integer;
  did_level_up boolean := false;
  user_role text;
BEGIN
  -- Get current XP, level and role
  SELECT xp_points, level, role
  INTO current_xp, current_level, user_role
  FROM users
  WHERE id = user_id;

  -- If the user is admin, do not change XP/level
  IF user_role = 'admin' THEN
    RETURN QUERY SELECT false, current_level, current_xp;
  END IF;

  -- Calculate new XP
  new_xp_total := current_xp + xp_amount;
  
  -- Calculate new level (every 500 XP = 1 level)
  new_level_calc := FLOOR(new_xp_total / 500) + 1;
  
  -- Check if leveled up
  IF new_level_calc > current_level THEN
    did_level_up := true;
  END IF;

  -- Update user
  UPDATE users
  SET xp_points = new_xp_total,
      level = new_level_calc,
      updated_at = NOW()
  WHERE id = user_id;

  RETURN QUERY SELECT did_level_up, new_level_calc, new_xp_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
