-- ============================================================
-- Add unique constraint on language + title for fallback upsert
-- ============================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'lingua_modules_language_title_key'
  ) THEN
    ALTER TABLE lingua_modules 
    ADD CONSTRAINT lingua_modules_language_title_key 
    UNIQUE (language, title);
  END IF;
END $$;