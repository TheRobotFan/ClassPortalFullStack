-- Temporarily disable RLS on materials table
-- Use this only as a temporary fix until proper policies are applied

ALTER TABLE materials DISABLE ROW LEVEL SECURITY;

COMMIT;
