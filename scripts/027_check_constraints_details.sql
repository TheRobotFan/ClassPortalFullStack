-- Check detailed constraints on materials table
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause,
    ccu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'materials'
AND tc.constraint_type = 'CHECK';
