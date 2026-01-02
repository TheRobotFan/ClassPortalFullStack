-- Create materials bucket for file storage
-- Questo script crea il bucket per gli appunti e le relative policies di sicurezza

-- 1. Crea il bucket materials (pubblico per permettere download)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'materials', 
  'materials', 
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Elimina policies esistenti se presenti
DROP POLICY IF EXISTS "Authenticated users can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload materials to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own materials" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view materials" ON storage.objects;
DROP POLICY IF EXISTS "Public can read materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own materials" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any materials" ON storage.objects;

-- 3. Crea nuove policies per materials bucket

-- Policy per upload: solo utenti autenticati possono caricare nella loro cartella
CREATE POLICY "Users can upload materials to their folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'materials' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy per update: solo proprietario può aggiornare
CREATE POLICY "Users can update their own materials" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'materials' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy per lettura: tutti possono leggere (bucket pubblico)
CREATE POLICY "Public can read materials" ON storage.objects
FOR SELECT USING (
  bucket_id = 'materials'
);

-- Policy per delete: proprietario può eliminare i propri file
CREATE POLICY "Users can delete their own materials" ON storage.objects
FOR DELETE USING (
  bucket_id = 'materials' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy per delete admin: admin e teacher possono eliminare qualsiasi file
CREATE POLICY "Admins can delete any materials" ON storage.objects
FOR DELETE USING (
  bucket_id = 'materials' AND 
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR role = 'teacher')
  )
);

-- 4. Assicurati che la tabella materials abbia tutti i campi necessari
DO $$ 
BEGIN
  -- Aggiungi colonna tags se non esiste
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'materials' AND column_name = 'tags') THEN
    ALTER TABLE materials ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;

  -- Aggiungi colonna is_public se non esiste
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'materials' AND column_name = 'is_public') THEN
    ALTER TABLE materials ADD COLUMN is_public BOOLEAN DEFAULT true;
  END IF;

  -- Aggiungi colonna status se non esiste
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'materials' AND column_name = 'status') THEN
    ALTER TABLE materials ADD COLUMN status VARCHAR(20) DEFAULT 'active';
  END IF;

  -- Verifica che file_type possa contenere stringhe lunghe
  ALTER TABLE materials ALTER COLUMN file_type TYPE VARCHAR(100);
END $$;

-- 5. Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_materials_tags ON materials USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_materials_is_public ON materials(is_public);
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);

-- 6. Aggiorna le policies RLS della tabella materials per includere i nuovi campi
DROP POLICY IF EXISTS "Everyone can view active materials" ON materials;
CREATE POLICY "Everyone can view active public materials" ON materials
  FOR SELECT USING (
    is_public = true AND 
    status = 'active'
  );

-- Policy per permettere agli utenti di vedere i propri materiali anche se privati
DROP POLICY IF EXISTS "Users can view their own materials" ON materials;
CREATE POLICY "Users can view their own materials" ON materials
  FOR SELECT USING (
    auth.uid() = uploaded_by
  );

COMMIT;
