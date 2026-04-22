-- Describe lingua_modules table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'lingua_modules'
ORDER BY ordinal_position;