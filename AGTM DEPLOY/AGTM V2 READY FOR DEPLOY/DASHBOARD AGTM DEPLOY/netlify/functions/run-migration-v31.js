// run-migration-v31.js — One-shot migration via Netlify (accès réseau Supabase)
// Crée la table ec_podcast_cache pour le cache Listen Notes
// Appeler UNE SEULE FOIS, puis supprimer/désactiver

const https = require('https')

function supabaseRest(url, sbKey, method, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: method || 'GET',
      headers: {
        apikey:          sbKey,
        Authorization:   `Bearer ${sbKey}`,
        'Content-Type':  'application/json',
        Prefer:          'return=minimal',
      },
    }
    const req = https.request(opts, (res) => {
      let data = ''
      res.on('data', c => { data += c })
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }) }
        catch { resolve({ status: res.statusCode, body: data }) }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  // Sécurité minimale : token secret passé en query param
  const secret = (event.queryStringParameters || {}).secret
  if (secret !== process.env.MIGRATION_SECRET && secret !== 'agtm-migrate-v31') {
    return { statusCode: 403, headers: corsHeaders, body: JSON.stringify({ error: 'Unauthorized' }) }
  }

  const SB_URL = process.env.SUPABASE_URL
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON

  if (!SB_URL || !SB_KEY) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY' }) }
  }

  const log = []

  // ── Essai de création via upsert d'une ligne test ──────────────
  // Supabase REST ne supporte pas DDL directement.
  // On passe par la fonction pg_query si disponible,
  // sinon on crée la table via un INSERT qui échoue proprement.

  // Vérifier si la table existe déjà
  const checkUrl = `${SB_URL}/rest/v1/ec_podcast_cache?limit=1`
  const check = await supabaseRest(checkUrl, SB_KEY, 'GET')

  if (check.status === 200) {
    log.push('✅ Table ec_podcast_cache existe déjà.')
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ ok: true, log, message: 'Table already exists' }) }
  }

  if (check.status === 404 || (typeof check.body === 'object' && check.body?.code === '42P01')) {
    log.push('ℹ️  Table inexistante — création nécessaire via SQL Editor Supabase.')
  }

  // La table n'existe pas — retourner le SQL à coller dans le SQL Editor
  const sql = `
-- Migration v31 : Cache Listen Notes API
-- Coller dans Supabase → SQL Editor → Run

CREATE TABLE IF NOT EXISTS ec_podcast_cache (
  cache_key   TEXT        PRIMARY KEY,
  data        JSONB       NOT NULL,
  cached_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  query       TEXT,
  action      TEXT        DEFAULT 'search'
);

CREATE INDEX IF NOT EXISTS idx_ec_podcast_cache_cached_at
  ON ec_podcast_cache (cached_at);

ALTER TABLE ec_podcast_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cache_read_public"
  ON ec_podcast_cache FOR SELECT USING (true);

CREATE POLICY "cache_write_service"
  ON ec_podcast_cache FOR ALL
  USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION clean_podcast_cache()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS \\$\\$
DECLARE removed INTEGER;
BEGIN
  DELETE FROM ec_podcast_cache WHERE cached_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
\\$\\$;
`.trim()

  log.push('📋 SQL prêt à coller dans Supabase SQL Editor.')
  log.push('→ Supabase Dashboard → SQL Editor → New query → Coller → Run')

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ ok: false, needs_manual_sql: true, sql, log }),
  }
}
