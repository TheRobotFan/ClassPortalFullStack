-- Fix avatars bucket RLS policies

-- First, ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public avatar viewing" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar deletion" ON storage.objects;
DROP POLICY IF EXISTS "Allow all avatar operations" ON storage.objects;

-- Create simplified policies for direct file naming (userID.ext)

-- Allow authenticated users to upload avatars (with filename check)
CREATE POLICY "Allow avatar uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (name = auth.uid()::text || '.jpg' OR
   name = auth.uid()::text || '.jpeg' OR
   name = auth.uid()::text || '.png' OR
   name = auth.uid()::text || '.gif' OR
   name = auth.uid()::text || '.webp')
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Allow avatar updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (name = auth.uid()::text || '.jpg' OR
   name = auth.uid()::text || '.jpeg' OR
   name = auth.uid()::text || '.png' OR
   name = auth.uid()::text || '.gif' OR
   name = auth.uid()::text || '.webp')
);

-- Allow anyone to view avatars (public read access)
CREATE POLICY "Allow public avatar viewing" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars'
);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Allow avatar deletion" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (name = auth.uid()::text || '.jpg' OR
   name = auth.uid()::text || '.jpeg' OR
   name = auth.uid()::text || '.png' OR
   name = auth.uid()::text || '.gif' OR
   name = auth.uid()::text || '.webp')
);

-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Grant necessary permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- Add avatar_url column if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON users(avatar_url);
