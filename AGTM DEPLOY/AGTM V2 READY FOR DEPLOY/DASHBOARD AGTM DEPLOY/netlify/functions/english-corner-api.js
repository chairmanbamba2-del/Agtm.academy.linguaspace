// english-corner-api.js — Netlify serverless function
// Proxies API calls for the English Corner
// API keys are read from environment variables (never exposed to the browser)
// Cache Supabase : TTL 24h (listenotes) pour économiser les quotas API

const https = require('https');

// ── Supabase REST helpers ─────────────────────────────────────────
const SB_URL   = process.env.SUPABASE_URL          || '';
// Service key pour écriture cache (upsert) — lecture aussi
const SB_KEY   = process.env.SUPABASE_SERVICE_KEY  || process.env.SUPABASE_ANON || '';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 heures

async function sbGet(table, filters) {
  if (!SB_URL || !SB_KEY) return null;
  let qs = Object.entries(filters).map(([k,v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');
  const url = `${SB_URL}/rest/v1/${table}?${qs}&limit=1`;
  try {
    const rows = await fetchJson(url, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' },
    });
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  } catch { return null; }
}

async function sbUpsert(table, row) {
  if (!SB_URL || !SB_KEY) return;
  const url = `${SB_URL}/rest/v1/${table}`;
  try {
    await fetchJson(url, {
      method: 'POST',
      headers: {
        apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(row),
    });
  } catch { /* cache write failure is non-fatal */ }
}

// Helper: emoji par catégorie
function getEmojiForCategory(category) {
  const emojiMap = {
    'Grammar': '📝',
    'Vocabulary': '📚',
    'Speaking': '🗣️',
    'Listening': '👂',
    'Writing': '✏️',
    'TOEIC': '🎯',
    'Business': '💼',
    'Pronunciation': '🔊',
    'Conversation': '💬',
    'Culture': '🌍',
    'Exam': '📋',
    'General': '🎬'
  };
  return emojiMap[category] || '🎬';
}

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };
    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve({ _raw: data }); }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

exports.handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const params = event.queryStringParameters || {};
  const service = params.service;

  try {
    // ── 1. YOUTUBE (avec cache Supabase + pagination) ─────────────
    if (service === 'youtube') {
      const key = process.env.YOUTUBE_API_KEY;
      if (!key) {
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'YOUTUBE_API_KEY not configured', videos: [], total: 0 }),
        };
      }
      
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 50;
      const offset = (page - 1) * limit;
      
      // 1. Vérifier cache Supabase d'abord
      const cacheKey = `youtube_videos_page_${page}_limit_${limit}`;
      const cached = await sbGet('api_cache', { key: cacheKey });
      
      if (cached && Date.now() - new Date(cached.updated_at).getTime() < CACHE_TTL_MS) {
        // Cache valide (moins de 24h)
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videos: cached.value.videos || [],
            total: cached.value.total || 0,
            page,
            limit,
            cached: true
          }),
        };
      }
      
      // 2. Récupérer playlists depuis Supabase (table corner_content)
      let playlists = [];
      try {
        const playlistsUrl = `${SB_URL}/rest/v1/corner_content?select=id,title,provider,level,topic,url&type=eq.playlist&active=eq.true&order=priority.desc`;
        const playlistsData = await fetchJson(playlistsUrl, {
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' },
        });
        playlists = Array.isArray(playlistsData) ? playlistsData : [];
        
        // Extraire playlist_id depuis l'URL YouTube
        playlists = playlists.map(playlist => {
          const url = playlist.url || '';
          const playlistIdMatch = url.match(/list=([^&]+)/);
          return {
            ...playlist,
            playlist_id: playlistIdMatch ? playlistIdMatch[1] : playlist.id,
            channel: playlist.provider || 'EIP English In Practice',
            category: playlist.topic || 'General'
          };
        }).filter(p => p.playlist_id);
        
        console.log(`Found ${playlists.length} playlists from corner_content`);
      } catch (err) {
        console.error('Error fetching playlists from corner_content:', err);
      }
      
      // 3. Si pas de playlists, utiliser recherche par défaut
      let allVideos = [];
      let totalVideos = 0;
      
      if (playlists.length > 0) {
        // Récupérer vidéos de chaque playlist (avec limite)
        for (const playlist of playlists.slice(0, 5)) { // Max 5 playlists pour éviter quota
          try {
            const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=${Math.min(limit, 50)}&playlistId=${playlist.playlist_id}&key=${key}`;
            const playlistData = await fetchJson(playlistUrl);
            
            if (playlistData.items && playlistData.items.length > 0) {
              const playlistVideos = playlistData.items.map(item => ({
                id: item.snippet.resourceId.videoId,
                title: item.snippet.title,
                channel: playlist.channel || item.snippet.channelTitle,
                level: playlist.level || 'A2',
                cat: playlist.category || 'Listening',
                duration: '--:--', // YouTube ne donne pas duration ici
                thumb: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
                emoji: getEmojiForCategory(playlist.category)
              }));
              
              allVideos = [...allVideos, ...playlistVideos];
              totalVideos += playlistData.pageInfo?.totalResults || playlistVideos.length;
            }
          } catch (err) {
            console.error(`Error fetching playlist ${playlist.playlist_id}:`, err);
          }
          
          // Limiter le nombre total de vidéos
          if (allVideos.length >= limit * 2) break;
        }
      } else {
        // Fallback: recherche YouTube
        const q = encodeURIComponent(params.q || 'BBC Learning English grammar');
        const maxResults = Math.min(limit, 50);
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${q}&maxResults=${maxResults}&key=${key}`;
        const data = await fetchJson(url);
        
        if (data.items) {
          allVideos = data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            level: 'B1',
            cat: 'General',
            duration: '--:--',
            thumb: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            emoji: '🎬'
          }));
          totalVideos = data.pageInfo?.totalResults || allVideos.length;
        }
      }
      
      // 4. Pagination locale (car YouTube API a sa propre pagination)
      const startIndex = offset % allVideos.length; // Pour simuler pagination infinie
      const paginatedVideos = allVideos.slice(startIndex, startIndex + limit);
      
      // 5. Mettre en cache dans Supabase
      if (paginatedVideos.length > 0) {
        await sbUpsert('api_cache', {
          key: cacheKey,
          value: { videos: paginatedVideos, total: totalVideos },
          updated_at: new Date().toISOString()
        });
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videos: paginatedVideos,
          total: totalVideos,
          page,
          limit,
          cached: false
        }),
      };
    }

    // ── 2. NEWS ─────────────────────────────────────────────────
    if (service === 'news') {
      const key = process.env.NEWS_API_KEY;
      if (!key) {
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'NEWS_API_KEY not configured', articles: [] }),
        };
      }
      const q = encodeURIComponent(params.q || 'English learning');
      const url = `https://newsapi.org/v2/everything?language=en&pageSize=6&q=${q}&apiKey=${key}`;
      const data = await fetchJson(url);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
    }

    // ── 3. MERRIAM-WEBSTER ──────────────────────────────────────
    if (service === 'merriam') {
      const key = process.env.MERRIAM_WEBSTER_KEY;
      if (!key) {
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'MERRIAM_WEBSTER_KEY not configured' }),
        };
      }
      const word = encodeURIComponent(params.word || 'resilient');
      const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${key}`;
      const data = await fetchJson(url);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
    }

    // ── 4. LISTEN NOTES (avec cache Supabase 24h) ───────────────
    if (service === 'listenotes') {
      const key = process.env.LISTEN_NOTES_KEY;
      if (!key) {
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'LISTEN_NOTES_KEY not configured', results: [] }),
        };
      }
      const lnHeaders = { 'X-ListenAPI-Key': key };
      const action   = params.action   || 'search';
      const pageSize = params.page_size || '12';
      const offset   = params.offset   || '0';
      const q        = params.q        || 'BBC Learning English';

      // Clé de cache : action + query + offset + pageSize
      const cacheKey = `ln:${action}:${q}:${offset}:${pageSize}`;

      // ── 1. Vérifier le cache Supabase ────────────────────────
      const cached = await sbGet('ec_api_cache', { cache_key: cacheKey });
      if (cached && cached.data && cached.cached_at) {
        const age = Date.now() - new Date(cached.cached_at).getTime();
        if (age < CACHE_TTL_MS) {
          return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
            body: JSON.stringify({ ...cached.data, _cached: true, _cached_at: cached.cached_at }),
          };
        }
      }

      // ── 2. Appel Listen Notes si cache absent/expiré ─────────
      let apiUrl;
      if (action === 'best_podcasts') {
        const genreId = params.genre_id || '68';
        apiUrl = `https://listen-api.listennotes.com/api/v2/best_podcasts?genre_id=${genreId}&page=1&region=us&safe_mode=0`;
      } else if (action === 'podcast_episodes') {
        const podId = params.podcast_id || '';
        if (!podId) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'podcast_id required' }) };
        apiUrl = `https://listen-api.listennotes.com/api/v2/podcasts/${encodeURIComponent(podId)}/episodes?page_size=${pageSize}&sort=recent_first`;
      } else {
        apiUrl = `https://listen-api.listennotes.com/api/v2/search?type=episode&language=English&page_size=${pageSize}&offset=${offset}&q=${encodeURIComponent(q)}`;
      }

      const data = await fetchJson(apiUrl, { headers: lnHeaders });

      // ── 3. Sauvegarder dans le cache Supabase ────────────────
      if (!data.error && !data._raw) {
        await sbUpsert('ec_api_cache', {
          cache_key:  cacheKey,
          data:       data,
          cached_at:  new Date().toISOString(),
          service:    'listenotes',
          query:      q,
          action:     action,
        });
      }

      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
        body: JSON.stringify(data),
      };
    }

    // ── 5. CLAUDE QUIZ ──────────────────────────────────────────
    if (service === 'claude-quiz') {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) {
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured', text: '' }),
        };
      }

      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch (e) {
        body = {};
      }

      const prompt = body.prompt || 'Generate 3 English comprehension questions.';

      const requestBody = JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      });

      const data = await fetchJson('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: requestBody,
      });

      const text = data.content && data.content[0] && data.content[0].text
        ? data.content[0].text
        : (data.error ? data.error.message : 'No response generated.');

      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      };
    }

    // ── 6. YOUTUBE PLAYLIST ─────────────────────────────────────
    if (service === 'youtube-playlist') {
      const key = process.env.YOUTUBE_API_KEY;
      if (!key) {
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'YOUTUBE_API_KEY not configured', items: [] }),
        };
      }
      const playlistId = params.playlistId || '';
      if (!playlistId) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'playlistId parameter required', items: [] }),
        };
      }
      const maxResults = Math.min(parseInt(params.maxResults || '50'), 50);
      const pageToken  = params.pageToken || '';
      
      // Clé de cache : service + playlistId + maxResults + pageToken
      const cacheKey = `ytpl:${playlistId}:${maxResults}:${pageToken || 'first'}`;
      
      // ── 1. Vérifier le cache Supabase (24h) ─────────────────────
      const cached = await sbGet('ec_api_cache', { cache_key: cacheKey });
      if (cached && cached.data && cached.cached_at) {
        const age = Date.now() - new Date(cached.cached_at).getTime();
        if (age < CACHE_TTL_MS) {
          return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
            body: JSON.stringify({ ...cached.data, _cached: true, _cached_at: cached.cached_at }),
          };
        }
      }
      
      // ── 2. Appel YouTube API si cache absent/expiré ─────────────
      const pageTokenParam = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '';
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(playlistId)}&maxResults=${maxResults}${pageTokenParam}&key=${key}`;
      const data = await fetchJson(url);
      
      // ── 3. Sauvegarder dans le cache Supabase ──────────────────
      if (!data.error && data.items) {
        await sbUpsert('ec_api_cache', {
          cache_key:  cacheKey,
          data:       data,
          cached_at:  new Date().toISOString(),
          service:    'youtube',
          query:      playlistId,
          action:     'playlist',
        });
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
        body: JSON.stringify(data),
      };
    }

    // ── Unknown service ─────────────────────────────────────────
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Unknown service: ${service}. Supported: youtube, youtube-playlist, news, merriam, listenotes, claude-quiz` }),
    };

  } catch (err) {
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Internal server error' }),
    };
  }
};
