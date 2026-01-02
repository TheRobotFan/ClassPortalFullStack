-- Fix RLS for inserting new users rows created by getCurrentUser()
-- so that authenticated users can create their own profile row.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can create profile" ON users;

CREATE POLICY "Authenticated users can create profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

COMMIT;
