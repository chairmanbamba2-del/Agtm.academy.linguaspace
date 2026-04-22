-- ============================================================
-- RLS policies for lingua_modules
-- ============================================================

-- Enable RLS (should already be enabled)
ALTER TABLE lingua_modules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access" ON lingua_modules;
DROP POLICY IF EXISTS "Allow service role full access" ON lingua_modules;
DROP POLICY IF EXISTS "Allow authenticated insert" ON lingua_modules;

-- Policy 1: Allow anyone (including anon) to read modules
CREATE POLICY "Allow public read access" ON lingua_modules
  FOR SELECT USING (true);

-- Policy 2: Allow service role (admin) full access
CREATE POLICY "Allow service role full access" ON lingua_modules
  FOR ALL USING (auth.role() = 'service_role');

-- Policy 3: Allow authenticated users to insert modules (for admin UI)
CREATE POLICY "Allow authenticated insert" ON lingua_modules
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');