-- Check all triggers in the database that might reference materials
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE action_statement LIKE '%user_id%'
   OR action_statement LIKE '%materials%';
