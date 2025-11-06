-- Alternative fix for avatar access - Using Supabase Dashboard approach
-- This script works with standard user permissions

-- First, let's check what buckets exist
SELECT name, public, created_at FROM storage.buckets;

-- If avatars bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Create simplified RLS policies for avatars
-- Allow public read access to avatars
DROP POLICY IF EXISTS "Public read access to avatars" ON storage.objects;
CREATE POLICY "Public read access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to manage their own avatars
DROP POLICY IF EXISTS "Authenticated users can manage avatars" ON storage.objects;
CREATE POLICY "Authenticated users can manage avatars" ON storage.objects
FOR ALL USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Enable RLS if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON storage.objects TO anon;
GRANT ALL ON storage.objects TO authenticated;

-- Verify the setup
SELECT 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'avatars';
