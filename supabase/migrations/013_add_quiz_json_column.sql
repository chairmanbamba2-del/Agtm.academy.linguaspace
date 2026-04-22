-- ============================================================
-- Add quiz_json column to lingua_modules
-- For storing pre-generated quiz questions
-- ============================================================

-- Add quiz_json column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lingua_modules' AND column_name = 'quiz_json'
  ) THEN
    ALTER TABLE lingua_modules ADD COLUMN quiz_json JSONB DEFAULT NULL;
    
    -- Add comment to document column usage
    COMMENT ON COLUMN lingua_modules.quiz_json IS 'Pre-generated quiz questions in JSON format for direct use in Module.jsx without Edge Function calls';
  END IF;
END $$;

-- Optional: Create GIN index for JSONB queries if needed
-- CREATE INDEX IF NOT EXISTS idx_modules_quiz_json ON lingua_modules USING GIN(quiz_json);

-- Update any existing modules to have empty quiz_json (null is fine)
-- This is just to ensure consistency
UPDATE lingua_modules 
SET quiz_json = NULL 
WHERE quiz_json IS NOT NULL; -- No-op, but ensures any future default logic