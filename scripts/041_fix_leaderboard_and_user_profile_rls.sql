-- Rende la classifica visibile a tutti gli utenti autenticati
-- e permette al portale di leggere i profili completi per la leaderboard e le pagine utente.

-- 1) Assicura che tutti possano selezionare dalla tabella users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT
  USING (true);

-- Mantieni le policy di update esistenti (es. "Users can update own profile") invariate.

COMMIT;
