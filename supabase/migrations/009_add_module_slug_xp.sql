-- ============================================================
-- Add slug and xp_reward columns to lingua_modules
-- For unique identification and XP calculations
-- ============================================================

-- Add slug column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lingua_modules' AND column_name = 'slug'
  ) THEN
    ALTER TABLE lingua_modules ADD COLUMN slug TEXT;
    
    -- Create unique index on language + slug (allows nulls for now)
    CREATE UNIQUE INDEX IF NOT EXISTS idx_modules_language_slug 
      ON lingua_modules(language, slug) WHERE slug IS NOT NULL;
  END IF;
END $$;

-- Add xp_reward column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lingua_modules' AND column_name = 'xp_reward'
  ) THEN
    ALTER TABLE lingua_modules ADD COLUMN xp_reward INTEGER DEFAULT 100;
  END IF;
END $$;

-- Update existing modules with generated slugs
UPDATE lingua_modules 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
) || '-' || LOWER(level)
WHERE slug IS NULL;

-- Set xp_reward based on duration_min
UPDATE lingua_modules 
SET xp_reward = 100 + COALESCE(duration_min, 15) * 5
WHERE xp_reward IS NULL OR xp_reward = 100;