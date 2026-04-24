// corner-content-api.js — REST API for CornerContentItem (unified English Corner registry)
//
// Routes (via netlify.toml redirects):
//   GET /api/corner-content                   → list (filterable)
//   GET /api/corner-content/:id               → single item
//
// Query filters for listing:
//   section   (listening | podcasts | reading | writing)
//   type      (playlist | podcast | rss | website | page)
//   level     (A1 | A2 | B1 | B2 | C1 | A1-A2 | A2-B1 | B1-B2 | B1-C1 | B2-C1 | all)
//   topic     (general | grammar | vocabulary | business | news | …)
//   active    (true | false, default: true)
//   limit     (1–200, default: 100)
//   offset    (default: 0)

const https = require('https');
const { PRIORITY_RULES, computePriority, applyPriorities } = require('./lib/priority');
const { SECTION_RULES, getSections, getPrimarySection, sourcesForSection } = require('./lib/section-rules');
const { getDisplayBadge, sortContent } = require('./lib/content-utils');

const SB_URL = process.env.SUPABASE_URL         || '';
const SB_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON || '';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type':                 'application/json',
};

const VALID_SECTIONS = new Set(['listening','podcasts','reading','writing']);
const VALID_TYPES    = new Set(['playlist','podcast','rss','website','page']);
const VALID_LEVELS   = new Set(['A1','A2','B1','B2','C1','A1-A2','A2-B1','A2-B2','A2-C1','B1-B2','B1-C1','B2-C1','all']);

// ── Supabase REST GET ────────────────────────────────────────────
function sbSelect(table, qs) {
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
      },
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ── Map DB row → CornerContentItem ───────────────────────────────
function toItem(row) {
  return {
    id:          row.id,
    title:       row.title       || '',
    provider:    row.provider    || '',
    section:     row.section,
    type:        row.type,
    level:       row.level       || 'all',
    topic:       row.topic       || 'general',
    tags:        Array.isArray(row.tags) ? row.tags : [],
    url:         row.url         || '',
    rssUrl:      row.rss_url     ?? null,
    imageUrl:    row.image_url   ?? null,
    description: row.description ?? null,
    priority:    row.priority    ?? 0,
    active:      row.active      ?? true,
  };
}

function json(code, payload) {
  return { statusCode: code, headers: CORS, body: JSON.stringify(payload) };
}

// ── Handler ──────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'GET')     return json(405, { error: 'Method Not Allowed' });

  const p      = event.queryStringParameters || {};
  const action = p.action || 'list';

  try {
    // ── GET /api/corner-content?action=rules ──────────────────
    if (action === 'rules') {
      return json(200, { priority: PRIORITY_RULES, sections: SECTION_RULES });
    }

    // ── GET /api/corner-content?action=classify ────────────────
    // Classify an item without persisting it.
    // Body (GET query): title=...&provider=...&type=...&topic=...
    if (action === 'classify') {
      const item = { title: p.title || '', provider: p.provider || '', type: p.type || '', topic: p.topic || '' };
      return json(200, {
        sections:        getSections(item),
        primary_section: getPrimarySection(item),
        priority:        computePriority(item),
      });
    }

    // ── GET /api/corner-content/:id ────────────────────────────
    if (action === 'item') {
      const id = p.id || '';
      if (!id) return json(400, { error: 'id required' });

      const r = await sbSelect('corner_content', `id=eq.${encodeURIComponent(id)}&limit=1`);
      if (r.status >= 400) return json(r.status, { error: 'Supabase error', detail: r.body });

      const rows = Array.isArray(r.body) ? r.body : [];
      if (!rows.length) return json(404, { error: 'Not found' });
      return json(200, toItem(rows[0]));
    }

    // ── GET /api/corner-content ────────────────────────────────
    if (action === 'list') {
      const filters = [];

      // active (default true)
      const activeParam = p.active !== undefined ? p.active : 'true';
      filters.push(`active=eq.${activeParam === 'false' ? 'false' : 'true'}`);

      // section filter
      if (p.section && VALID_SECTIONS.has(p.section)) {
        filters.push(`section=eq.${encodeURIComponent(p.section)}`);
      }

      // type filter
      if (p.type && VALID_TYPES.has(p.type)) {
        filters.push(`type=eq.${encodeURIComponent(p.type)}`);
      }

      // level filter
      if (p.level && VALID_LEVELS.has(p.level)) {
        filters.push(`level=eq.${encodeURIComponent(p.level)}`);
      }

      // topic filter
      if (p.topic) {
        filters.push(`topic=eq.${encodeURIComponent(p.topic)}`);
      }

      // pagination
      const limit  = Math.min(Math.max(parseInt(p.limit  || '100'), 1), 200);
      const offset = Math.max(parseInt(p.offset || '0'), 0);

      const qs = [
        ...filters,
        `order=priority.desc,title.asc`,
        `limit=${limit}`,
        `offset=${offset}`,
      ].join('&');

      const r = await sbSelect('corner_content', qs);
      if (r.status >= 400) return json(r.status, { error: 'Supabase error', detail: r.body });

      const rows  = Array.isArray(r.body) ? r.body : [];
      // recompute=true → overwrite stored priority with live-computed score
      // annotate=true  → add _sections[] (all matching SECTION_RULES sections)
      let items = rows.map(toItem);
      // recompute=true → recalculate priority live then re-sort (DB order may be stale)
      if (p.recompute === 'true') items = applyPriorities(items).sort(sortContent);
      // annotate=true  → add _sections[] and _badge per item
      if (p.annotate  === 'true') {
        items = items.map(it => ({ ...it, _sections: getSections(it), _badge: getDisplayBadge(it) }));
      }

      return json(200, { count: items.length, limit, offset, rules: PRIORITY_RULES, items });
    }

    return json(400, { error: `Unknown action: ${action}. Use: list | item` });

  } catch (err) {
    console.error('[corner-content-api] error:', err.message);
    return json(500, { error: err.message });
  }
};
