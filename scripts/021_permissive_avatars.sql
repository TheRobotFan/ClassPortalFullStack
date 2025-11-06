-- Permissive avatars setup for testing

-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public avatar viewing" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar deletion" ON storage.objects;

-- Create a very permissive policy that allows any authenticated user to do anything
CREATE POLICY "Allow all avatar operations for authenticated users" ON storage.objects
FOR ALL USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Add avatar_url column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON users(avatar_url);
