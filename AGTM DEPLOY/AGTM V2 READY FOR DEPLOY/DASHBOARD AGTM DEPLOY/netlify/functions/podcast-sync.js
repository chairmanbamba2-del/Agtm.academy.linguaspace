// podcast-sync.js — Scheduled RSS sync (every 6h via netlify.toml schedule)
// Also callable manually via HTTP GET/POST: /.netlify/functions/podcast-sync
// Fetches active podcast_sources, parses RSS feeds, upserts into podcast_episodes
// Deduplication : UNIQUE(source_id, guid) in Supabase

const https = require('https');
const http  = require('http');
const Parser = require('rss-parser');

const SB_URL  = process.env.SUPABASE_URL          || '';
const SB_KEY  = process.env.SUPABASE_SERVICE_KEY  || process.env.SUPABASE_ANON || '';
const MAX_EPS = 50;    // episodes stored per source per sync
const CONCURRENT = 3; // parallel RSS fetches

// ── HTTP helper (handles redirects, HTTP + HTTPS) ───────────────
function fetchText(rawUrl, redirects = 0) {
  if (redirects > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const mod = rawUrl.startsWith('https') ? https : http;
    const req = mod.get(rawUrl, {
      headers: { 'User-Agent': 'AGTM-Podcast-Sync/1.0 (+https://agtm.academy)' },
      timeout: 12000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location, redirects + 1).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Fetch timeout')); });
  });
}

// ── Supabase REST helpers ────────────────────────────────────────
function sbRequest(path, method, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    if (!SB_URL || !SB_KEY) return reject(new Error('Missing Supabase credentials'));
    const u   = new URL(SB_URL + path);
    const req = https.request({
      hostname: u.hostname,
      path:     u.pathname + u.search,
      method:   method || 'GET',
      headers: {
        apikey:           SB_KEY,
        Authorization:    `Bearer ${SB_KEY}`,
        'Content-Type':   'application/json',
        ...extraHeaders,
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
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function sbGetSources() {
  const r = await sbRequest('/rest/v1/podcast_sources?active=eq.true&select=id,provider,title,rss_url,level,topic', 'GET');
  return Array.isArray(r.body) ? r.body : [];
}

async function sbUpsertEpisodes(episodes) {
  if (!episodes.length) return 0;
  const r = await sbRequest('/rest/v1/podcast_episodes', 'POST', episodes, {
    Prefer: 'resolution=merge-duplicates,return=minimal',
  });
  return r.status < 300 ? episodes.length : 0;
}

// ── Normalize audio URL to HTTPS ────────────────────────────────
// BBC RSS enclosures use http://open.live.bbc.co.uk/...proto/http/...
// Browsers block HTTP audio on HTTPS pages (Mixed Content).
// Replace proto/http with proto/https so the BBC mediaselector returns
// an HTTPS redirect (bbc.pdn.tritondigital.com serves both HTTP and HTTPS).
function normalizeAudioUrl(url) {
  if (!url) return null;
  return url
    .replace(/^http:\/\/open\.live\.bbc\.co\.uk/, 'https://open.live.bbc.co.uk')
    .replace(/\/proto\/http\//g, '/proto/https/');
}

// ── Duration parser : "HH:MM:SS" | "MM:SS" | "NNN" (seconds) ────
function parseDuration(str) {
  if (!str) return null;
  const n = Number(str);
  if (!isNaN(n) && n > 0) return Math.round(n);
  const parts = String(str).split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

// ── RSS parser instance ──────────────────────────────────────────
// NOTE: do NOT put 'enclosure' in customFields.item — rss-parser already
// parses <enclosure> natively as { url, length, type }. Adding it to
// customFields would override that and store the raw xml2js object
// { '$': { url, ... } }, making item.enclosure.url === undefined.
const rssParser = new Parser({
  timeout: 12000,
  headers: { 'User-Agent': 'AGTM-Podcast-Sync/1.0' },
  customFields: {
    feed: [['image', 'feedImage'], ['itunes:image', 'itunesImage']],
    item: [
      ['media:content', 'media:content'],
      ['itunes:image', 'itunesImage'],
      ['itunes:duration', 'itunesDuration'],
    ],
  },
});

// ── Sync one source → returns count of upserted episodes ─────────
async function syncSource(source) {
  let xmlText;
  try {
    xmlText = await fetchText(source.rss_url);
  } catch (e) {
    console.warn(`  [${source.title}] fetch error: ${e.message}`);
    return 0;
  }

  let feed;
  try {
    feed = await rssParser.parseString(xmlText);
  } catch (e) {
    console.warn(`  [${source.title}] parse error: ${e.message}`);
    return 0;
  }

  const feedImage = feed.feedImage?.url
    || feed.itunesImage?.['$']?.href
    || feed.image?.url
    || null;

  const items = (feed.items || []).slice(0, MAX_EPS);
  const episodes = items.map(item => {
    // GUID: prefer item.guid, fallback to link
    const guid = (item.guid || item.id || item.link || '').trim();
    if (!guid) return null;

    // Audio URL: rss-parser gives item.enclosure = { url, length, type }
    // Belt-and-suspenders: also check ['$'].url in case of xml2js raw format
    // normalizeAudioUrl converts BBC http://proto/http to https://proto/https
    const audio_url = normalizeAudioUrl(
      item.enclosure?.url || item.enclosure?.['$']?.url || null
    );

    const image_url = item.itunes?.image
      || item.itunesImage?.['$']?.href
      || (item['media:content']?.['$']?.url || null)
      || feedImage;

    const duration = parseDuration(item.itunes?.duration || item.itunesDuration);

    let published_at = null;
    if (item.pubDate) {
      const d = new Date(item.pubDate);
      if (!isNaN(d)) published_at = d.toISOString();
    }

    return {
      source_id:    source.id,
      guid,
      title:        (item.title || '').trim() || 'Untitled',
      description:  (item.contentSnippet || item.content || item.summary || '').substring(0, 2000),
      audio_url,
      image_url:    image_url || null,
      published_at,
      duration,
      episode_url:  item.link || null,
    };
  }).filter(Boolean);

  const count = await sbUpsertEpisodes(episodes);
  console.log(`  ✅ [${source.title}] ${count}/${items.length} épisodes upsertés`);
  return count;
}

// ── Main handler (called by Netlify scheduler every 6h) ──────────
exports.handler = async (event) => {
  console.log('[podcast-sync] démarrage', new Date().toISOString());

  if (!SB_URL || !SB_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing Supabase env vars' }) };
  }

  let sources;
  try {
    sources = await sbGetSources();
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: `Supabase error: ${e.message}` }) };
  }

  if (!sources.length) {
    return { statusCode: 200, body: JSON.stringify({ ok: true, message: 'No active sources', synced: 0 }) };
  }

  console.log(`  ${sources.length} sources actives`);

  let total = 0;
  // Process CONCURRENT sources at a time to stay within timeout
  for (let i = 0; i < sources.length; i += CONCURRENT) {
    const batch = sources.slice(i, i + CONCURRENT);
    const results = await Promise.allSettled(batch.map(syncSource));
    for (const r of results) {
      if (r.status === 'fulfilled') total += r.value;
      else console.warn('  sync error:', r.reason?.message);
    }
  }

  console.log(`[podcast-sync] terminé — ${total} épisodes traités`);
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, sources: sources.length, episodes_synced: total, ts: new Date().toISOString() }),
  };
};
