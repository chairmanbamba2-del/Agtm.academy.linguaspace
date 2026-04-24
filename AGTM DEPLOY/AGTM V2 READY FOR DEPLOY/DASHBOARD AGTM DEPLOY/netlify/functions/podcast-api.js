// podcast-api.js — REST API for English Corner podcast data
//
// Routes (via netlify.toml redirects):
//   GET /api/podcasts                         → list active sources
//   GET /api/podcasts/:id/episodes            → episodes for a source
//   GET /api/podcasts/:id/episodes?limit=&offset=   → paginated
//
// The function reads action + source_id from query params set by the redirects.

const https = require('https');

const SB_URL = process.env.SUPABASE_URL          || '';
const SB_KEY = process.env.SUPABASE_SERVICE_KEY  || process.env.SUPABASE_ANON || '';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type':                 'application/json',
  'Cache-Control':                'no-store',   // never cache API responses in browser or CDN
};

// ── Supabase REST GET ────────────────────────────────────────────
function sbGet(table, qs) {
  return new Promise((resolve, reject) => {
    if (!SB_URL || !SB_KEY) return reject(new Error('Missing Supabase env vars'));
    const u   = new URL(`${SB_URL}/rest/v1/${table}?${qs}`);
    const req = https.request({
      hostname: u.hostname,
      path:     u.pathname + u.search,
      method:   'GET',
      headers: {
        apikey:         SB_KEY,
        Authorization:  `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer:         'count=exact',
      },
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const body = JSON.parse(data);
          resolve({ status: res.statusCode, body, total: res.headers['content-range'] || null });
        } catch {
          resolve({ status: res.statusCode, body: data, total: null });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ── JSON response helper ─────────────────────────────────────────
function json(statusCode, payload, extra = {}) {
  return { statusCode, headers: { ...CORS, ...extra }, body: JSON.stringify(payload) };
}

// ── Handler ──────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'GET')     return json(405, { error: 'Method Not Allowed' });

  const p = { ...(event.queryStringParameters || {}) };

  // Netlify rewrites do NOT forward query params from the `to` field to the function.
  // The function always receives the ORIGINAL request path in event.rawUrl / event.path.
  // So we parse path-based routing here for:
  //   /api/podcasts/:id/episodes  →  action=episodes, source_id=:id
  const rawPath = (() => {
    try { return new URL(event.rawUrl || '').pathname; } catch { return event.path || ''; }
  })();
  const epsMatch = rawPath.match(/\/api\/podcasts\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/episodes/i);
  if (epsMatch) {
    p.action    = p.action    || 'episodes';
    p.source_id = p.source_id || epsMatch[1];
  }

  const action = p.action || 'sources';

  try {

    // ── GET /api/podcasts ──────────────────────────────────────
    if (action === 'sources') {
      const topic = p.topic ? `&topic=eq.${encodeURIComponent(p.topic)}` : '';
      const level = p.level ? `&level=eq.${encodeURIComponent(p.level)}` : '';
      const qs    = `active=eq.true&order=title.asc&select=id,provider,title,rss_url,site_url,level,topic${topic}${level}`;
      const r     = await sbGet('podcast_sources', qs);
      if (r.status >= 400) return json(r.status, { error: 'Supabase error', detail: r.body });
      return json(200, Array.isArray(r.body) ? r.body : []);
    }

    // ── GET /api/podcasts/:id/episodes ─────────────────────────
    if (action === 'episodes') {
      const source_id = p.source_id;
      if (!source_id) return json(400, { error: 'source_id required' });

      // Validate UUID format
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(source_id)) {
        return json(400, { error: 'Invalid source_id format' });
      }

      const limit  = Math.min(parseInt(p.limit  || '50'),  100);
      const offset = Math.max(parseInt(p.offset || '0'),   0);
      const qs = `source_id=eq.${source_id}&order=published_at.desc&limit=${limit}&offset=${offset}`
               + `&select=id,guid,title,description,audio_url,image_url,published_at,duration,episode_url`;

      const r = await sbGet('podcast_episodes', qs);
      if (r.status >= 400) return json(r.status, { error: 'Supabase error', detail: r.body });

      const episodes = Array.isArray(r.body) ? r.body : [];
      return json(200, { source_id, limit, offset, count: episodes.length, episodes });
    }

    return json(400, { error: `Unknown action: ${action}. Use: sources | episodes` });

  } catch (err) {
    console.error('[podcast-api] error:', err.message);
    return json(500, { error: err.message });
  }
};
