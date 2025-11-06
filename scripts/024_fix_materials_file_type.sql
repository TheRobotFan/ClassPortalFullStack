-- Fix Materials file_type field length
-- This script increases the file_type field from VARCHAR(50) to VARCHAR(255)

ALTER TABLE materials 
ALTER COLUMN file_type TYPE VARCHAR(255);

COMMIT;
