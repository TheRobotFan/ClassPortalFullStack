-- Fix visibilità dei badge da Supabase (ruoli anon / authenticated)
-- Esegui questo script nel progetto Supabase usato da .env.local

-- 1. Abilita RLS sulle tabelle badge e user_badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- 2. Ricrea le policy aperte per la lettura
DROP POLICY IF EXISTS "Everyone can view badges" ON badges;
CREATE POLICY "Everyone can view badges" ON badges
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Everyone can view earned badges" ON user_badges;
CREATE POLICY "Everyone can view earned badges" ON user_badges
  FOR SELECT
  USING (true);

-- 3. Garantisce i permessi di SELECT alle role usate da Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON badges TO anon, authenticated;
GRANT SELECT ON user_badges TO anon, authenticated;
