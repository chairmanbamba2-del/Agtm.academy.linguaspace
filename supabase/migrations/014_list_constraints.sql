-- List constraints and unique indexes on lingua_modules
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
WHERE conrelid = 'lingua_modules'::regclass
  AND contype IN ('p', 'u')  -- primary key, unique constraint
ORDER BY contype DESC;

-- List unique indexes (including partial)
SELECT 
  i.indexname AS index_name,
  tablename AS table_name,
  indexdef AS index_definition
FROM pg_indexes i
WHERE tablename = 'lingua_modules'
  AND indexdef LIKE '%UNIQUE%'
ORDER BY indexname;