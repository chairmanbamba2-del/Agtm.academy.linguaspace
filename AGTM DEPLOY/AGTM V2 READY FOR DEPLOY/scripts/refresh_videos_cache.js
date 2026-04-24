#!/usr/bin/env node
/**
 * refresh_videos_cache.js
 * Récupère les vidéos depuis des playlists YouTube et/ou des recherches,
 * puis sauvegarde le résultat dans data/videos_cache.json.
 * Les visiteurs ne consomment aucun quota — le cache est servi statiquement.
 *
 * Usage :
 *   node scripts/refresh_videos_cache.js
 *
 * La clé API est lue depuis la variable d'environnement YOUTUBE_API_KEY
 * ou depuis le fichier .env à la racine du projet.
 *
 * Quota YouTube :
 *   - Playlist  : 1 unité  par appel (50 vidéos max par page)
 *   - Recherche : 100 unités par appel
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Charger .env si présent ──────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length && !process.env[k.trim()])
      process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  });
}

const API_KEY = process.env.YOUTUBE_API_KEY;
if (!API_KEY) {
  console.error('❌  YOUTUBE_API_KEY introuvable.\n   Définissez-la dans .env ou via la variable d\'environnement.');
  process.exit(1);
}

// ════════════════════════════════════════════════════════════════════════════
//  CONFIGURATION — Ajoute tes playlists et recherches ici
// ════════════════════════════════════════════════════════════════════════════

// Playlists YouTube (1 unité chacune, jusqu'à 50 vidéos par playlist)
// Format : { id: 'PLAYLIST_ID', label: 'Description', level: 'B1', cat: 'Grammar' }
// level et cat par défaut pour toutes les vidéos de cette playlist
// (si le titre contient un mot-clé reconnu, il prend priorité)
const PLAYLISTS = [
  { id: 'PL5bLw9Uguvv3XwnldAykX_WOM7T0Mcbp9',  label: 'Playlist EIP',        level: 'B1', cat: 'Listening',   maxResults: 50 },
  { id: 'PLsRNoUx8w3rMyjdlw6lm3gcPJJ1-yLf_G',  label: 'AGTM English',        level: 'B1', cat: 'Listening',   maxResults: 50 },
  { id: 'PLv4XgHS4V3TJsIpVSOwhfJ3uexzSCf7QA',  label: 'English Course 1',    level: 'B1', cat: 'Listening',   maxResults: 50 },
  { id: 'PLNcfxD6u-vxJ7tijMS9Zx5FLLl-MKbsYB',  label: 'English Course 2',    level: 'A2', cat: 'Listening',   maxResults: 50 },
  { id: 'PLd9hCvj34W5it4a-RMzhlwNJ-edf5HU3Q',  label: 'English Course 3',    level: 'B1', cat: 'Listening',   maxResults: 50 },
  { id: 'PLNcfxD6u-vxJByvHDMIGoIRHJHDQVcOpf',  label: 'English Course 4',    level: 'B2', cat: 'Listening',   maxResults: 50 },
  { id: 'PLv4XgHS4V3TKcZ9BOyapPYBJdSWOWOX9s',  label: 'English Course 5',    level: 'B1', cat: 'Speaking',    maxResults: 50 },
  { id: 'PLv4XgHS4V3TL5_bbcuV0tUp5jnoDMW-TE',  label: 'English Course 6',    level: 'B2', cat: 'Speaking',    maxResults: 50 },
  { id: 'PLZbwPn7vIwQy0MruruAZV-z5zCw7YraSS',  label: 'English Course 7',    level: 'A2', cat: 'Grammar',     maxResults: 50 },
  { id: 'PLZbwPn7vIwQxxm4-uwam9CIJilyU7nwns',  label: 'English Course 8',    level: 'B1', cat: 'Grammar',     maxResults: 50 },
  { id: 'PLbI-JpcNtWkVogeo5qq58GeHDLF0szLgP',  label: 'English Course 9',    level: 'B1', cat: 'Vocabulary',  maxResults: 50 },
  { id: 'PLRgsws9rC3IW72BgJVfxU2j1cVTgTW2JM',  label: 'English Course 10',   level: 'B2', cat: 'Vocabulary',  maxResults: 50 },
  { id: 'PLU_eVIGNvkSVt4h2PSiK_rLlkW0zuAMGf',  label: 'English Course 11',   level: 'B1', cat: 'Listening',   maxResults: 50 },
  { id: 'PL2RW--lGzUm7hvH3t4B8uGdJM0UelpI2D',  label: 'English Course 12',   level: 'A2', cat: 'Listening',   maxResults: 50 },
  { id: 'PL-aB-_5YI8jgisawtCemAfyS55ZOG54gS',  label: 'English Course 13',   level: 'B1', cat: 'Speaking',    maxResults: 50 },
  { id: 'PLd9hCvj34W5hIJ855osxqJ-fjgsmNB69n',  label: 'English Course 14',   level: 'B2', cat: 'Listening',   maxResults: 50 },
  { id: 'PL5bLw9Uguvv3kSpd1tM79vb0DGAG67dab',  label: 'English Course 15',   level: 'B1', cat: 'Grammar',     maxResults: 50 },
  { id: 'PLD6t6ckHsrubLp8Ia8duzu5fN4riM2-Bl',  label: 'English Course 16',   level: 'B2', cat: 'Grammar',     maxResults: 50 },
  { id: 'PLcetZ6gSk96-FECmH9l7Vlx5VDigvgZpt',  label: 'English Course 17',   level: 'C1', cat: 'Listening',   maxResults: 50 },
  { id: 'PLKWcPfZiScgApTbS43FUY2Bl7Vatt1-r-',  label: 'English Course 18',   level: 'B1', cat: 'Vocabulary',  maxResults: 50 },
  { id: 'PLD6t6ckHsrubRV7Wb42ggOhVNrBRAte13',  label: 'English Course 19',   level: 'B2', cat: 'Vocabulary',  maxResults: 50 },
  { id: 'PLD6t6ckHsruZjc3Zm_XOz59FsOTuU1wPd',  label: 'English Course 20',   level: 'C1', cat: 'Grammar',     maxResults: 50 },
  { id: 'PL5TC7-t9pIZlN_H08qcTXqZTz8XF5-00K',  label: 'English Course 21',   level: 'B1', cat: 'Listening',   maxResults: 50 },
];

// Recherches par mots-clés (100 unités chacune)
const QUERIES = [
  { q: 'BBC Learning English grammar lesson',         maxResults: 6 },
  { q: 'TED-Ed English vocabulary learning',          maxResults: 6 },
  { q: 'BEPC English Côte Ivoire exercice',           maxResults: 6 },
  { q: 'Business English professional communication', maxResults: 6 },
  { q: 'English speaking practice conversation',      maxResults: 6 },
  { q: 'BAC anglais Côte Ivoire préparation',         maxResults: 6 },
  { q: 'English listening comprehension exercise',    maxResults: 6 },
  { q: 'Learn English pronunciation beginner',        maxResults: 6 },
];

// ════════════════════════════════════════════════════════════════════════════

// ── Détection niveau / catégorie ────────────────────────────────────────────
function gLvl(t, defaultLvl) {
  t = t.toLowerCase();
  if (t.includes('beginner') || t.includes('a1'))                          return 'A1';
  if (t.includes('a2')       || t.includes('elementary'))                  return 'A2';
  if (t.includes('intermediate') || t.includes('b1') || t.includes('bepc')) return 'B1';
  if (t.includes('upper')    || t.includes('b2')    || t.includes('bac'))  return 'B2';
  if (t.includes('advanced') || t.includes('c1'))                          return 'C1';
  return defaultLvl || ['A2','B1','B1','B2'][Math.floor(Math.random()*4)];
}

function gCat(t, defaultCat) {
  t = t.toLowerCase();
  if (t.includes('grammar'))                                             return 'Grammar';
  if (t.includes('speak') || t.includes('conversation'))                return 'Speaking';
  if (t.includes('toeic'))                                               return 'TOEIC';
  if (t.includes('vocab'))                                               return 'Vocabulary';
  if (t.includes('pronunc'))                                             return 'Speaking';
  if (t.includes('writing') || t.includes('essay') || t.includes('letter')) return 'Grammar';
  return defaultCat || 'Listening';
}

function gEmoji(cat) {
  return { Grammar:'📝', Speaking:'🗣️', Listening:'👂', Vocabulary:'📚', TOEIC:'🎯' }[cat] || '▶️';
}

// ── Fetch JSON ───────────────────────────────────────────────────────────────
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + data.slice(0, 200))); }
      });
    }).on('error', reject);
  });
}

// ── Charger une playlist (paginée) ──────────────────────────────────────────
async function fetchPlaylist({ id, label, level: defaultLvl, cat: defaultCat, maxResults = 50 }) {
  const videos   = [];
  let pageToken  = '';
  let apiCost    = 0;
  const limit    = Math.min(maxResults, 200); // max 200 vidéos par playlist

  console.log(`  📋  Playlist "${label}" (${id})…`);

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems`
      + `?part=snippet&playlistId=${id}&maxResults=50`
      + (pageToken ? `&pageToken=${pageToken}` : '')
      + `&key=${API_KEY}`;

    const data = await fetchJson(url);
    apiCost += 1;

    if (data.error) {
      console.error(`    ❌  ${data.error.message}`);
      break;
    }

    (data.items || []).forEach(item => {
      if (videos.length >= limit) return;
      const vid   = item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title || '';
      if (!vid || title === 'Private video' || title === 'Deleted video') return;

      const thumb = item.snippet?.thumbnails?.high?.url
                 || item.snippet?.thumbnails?.medium?.url
                 || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
      const cat   = gCat(title, defaultCat);
      const level = gLvl(title, defaultLvl);

      videos.push({ id: vid, title, channel: item.snippet?.channelTitle || '', thumb, level, cat, duration: '', emoji: gEmoji(cat) });
    });

    pageToken = data.nextPageToken || '';
  } while (pageToken && videos.length < limit);

  console.log(`    ✅  ${videos.length} vidéo(s) — ${apiCost} unité(s) quota`);
  return { videos, apiCost };
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('🚀  Mise à jour du cache vidéos YouTube…\n');

  const seen     = new Set();
  const all      = [];
  let   apiCost  = 0;

  // 1. Playlists (très économique en quota)
  if (PLAYLISTS.length) {
    console.log(`📋  ${PLAYLISTS.length} playlist(s) à charger :\n`);
    for (const pl of PLAYLISTS) {
      try {
        const { videos, apiCost: cost } = await fetchPlaylist(pl);
        apiCost += cost;
        videos.forEach(v => {
          if (!seen.has(v.id)) { seen.add(v.id); all.push(v); }
        });
      } catch (err) {
        console.error(`  ❌  Playlist ${pl.id}: ${err.message}`);
      }
    }
  }

  // 2. Recherches par mots-clés
  if (QUERIES.length) {
    console.log(`\n🔍  ${QUERIES.length} recherche(s) par mots-clés :\n`);
    for (const { q, maxResults } of QUERIES) {
      const url = `https://www.googleapis.com/youtube/v3/search`
        + `?part=snippet&type=video&q=${encodeURIComponent(q)}`
        + `&maxResults=${maxResults}&key=${API_KEY}`;
      try {
        const data = await fetchJson(url);
        apiCost += 100;
        if (data.error) { console.error(`  ❌  "${q}": ${data.error.message}`); continue; }

        let added = 0;
        (data.items || []).forEach(item => {
          const id = item.id?.videoId;
          if (!id || seen.has(id)) return;
          seen.add(id);
          const title   = item.snippet?.title || '';
          const channel = item.snippet?.channelTitle || '';
          const thumb   = item.snippet?.thumbnails?.high?.url
                       || item.snippet?.thumbnails?.medium?.url
                       || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
          const cat   = gCat(title);
          const level = gLvl(title);
          all.push({ id, title, channel, thumb, level, cat, duration: '', emoji: gEmoji(cat) });
          added++;
        });
        console.log(`  ✅  "${q}" → ${added} vidéo(s)`);
      } catch (err) {
        console.error(`  ❌  "${q}": ${err.message}`);
      }
    }
  }

  console.log(`\n📊  Total : ${all.length} vidéos uniques | Quota consommé : ${apiCost} unités`);

  if (!all.length) {
    console.error('❌  Aucune vidéo récupérée — cache non mis à jour.');
    process.exit(1);
  }

  // ── Écriture ─────────────────────────────────────────────────────────────
  const outPath = path.join(__dirname, '..', 'data', 'videos_cache.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({
    _generated: new Date().toISOString(),
    _info: "Static cache — run 'node scripts/refresh_videos_cache.js' to update",
    videos: all,
  }, null, 2), 'utf8');

  console.log(`\n✅  Cache sauvegardé → ${outPath}`);
  console.log('   Redéploie sur Netlify pour publier les nouvelles vidéos.\n');
})();
