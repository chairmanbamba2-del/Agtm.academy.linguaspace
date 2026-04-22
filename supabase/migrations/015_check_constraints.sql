-- Check constraints (not indexes)
SELECT 
  c.conname AS constraint_name,
  c.contype AS constraint_type,
  CASE c.contype 
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'c' THEN 'CHECK'
    ELSE c.contype
  END AS constraint_type_desc,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
WHERE c.conrelid = 'lingua_modules'::regclass
  AND c.contype IN ('p', 'u')
ORDER BY c.contype DESC;