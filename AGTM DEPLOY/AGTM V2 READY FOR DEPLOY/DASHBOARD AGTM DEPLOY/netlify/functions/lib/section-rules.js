// lib/section-rules.js — Section classification for CornerContentItem
// Shared by: corner-content-api.js, podcast-sync.js, migrate_v33.js
//
// A source name can appear in multiple sections (e.g. "6 Minute English"
// is both 'listening' AND 'podcasts'). getSections() returns all matches;
// getPrimarySection() resolves ties using item.type.

'use strict';

// ── Rules (source of truth, mirrors the TypeScript export) ───────
const SECTION_RULES = {
  listening: [
    '6 Minute English',
    'Learning Easy English',
    'VOA Learning English Podcast',
    'English Listening Lessons',
  ],
  podcasts: [
    '6 Minute English',
    'VOA Learning English Podcast',
    'British Council LearnEnglish Podcasts',
    'All Ears English Podcast',
    "Luke's English Podcast",
    'American English Podcast',
    'ESLPod',
  ],
  reading: [
    'British Council Reading',
    'Story Zone',
    'Reading Zone',
    'Cambridge Reading',
    'Oxford Graded Readers',
  ],
  writing: [
    'British Council Writing',
    'Oxford Online English Writing',
    'UEfAP Writing',
    'Academic Writing Playlist',
    'Writing in English at University',
  ],
};

// ── Inverted index: normalised name → [section, …] ───────────────
// Built once at module load; O(1) to check a given source name.
const _index = new Map(); // key: lowercase source name → sections[]
for (const [section, sources] of Object.entries(SECTION_RULES)) {
  for (const src of sources) {
    const key = src.toLowerCase().trim();
    if (!_index.has(key)) _index.set(key, []);
    _index.get(key).push(section);
  }
}

// When multiple sections match, this order decides the tiebreak
// (higher number = preferred when type gives no guidance)
const SECTION_RANK = { podcasts: 4, listening: 3, reading: 2, writing: 1 };

// ── getSections ───────────────────────────────────────────────────
/**
 * Returns every section whose SECTION_RULES list contains a name that
 * is a substring of the item's title, provider, or topic (case-insensitive).
 *
 * @param {object} item - CornerContentItem or DB row (title/provider/topic)
 * @returns {string[]}  - e.g. ['listening','podcasts']
 */
function getSections(item) {
  const haystack = [item.title, item.provider, item.topic]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const matched = new Set();
  for (const [key, sections] of _index) {
    if (haystack.includes(key)) {
      sections.forEach(s => matched.add(s));
    }
  }
  return [...matched];
}

// ── getPrimarySection ─────────────────────────────────────────────
/**
 * Returns the single best section for an item.
 *
 * Tie-breaking rules (in order):
 *   1. type === 'playlist'          → prefer 'listening'
 *   2. type === 'podcast' | 'rss'  → prefer 'podcasts'
 *   3. type === 'website' | 'page' → prefer 'reading' or 'writing'
 *   4. Fall back to highest SECTION_RANK value
 *
 * Returns null when no SECTION_RULES match is found.
 *
 * @param {object} item
 * @returns {string|null}
 */
function getPrimarySection(item) {
  const sections = getSections(item);
  if (!sections.length) return null;
  if (sections.length === 1) return sections[0];

  const type = (item.type || '').toLowerCase();

  if (type === 'playlist') {
    if (sections.includes('listening')) return 'listening';
  }
  if (type === 'podcast' || type === 'rss') {
    if (sections.includes('podcasts')) return 'podcasts';
  }
  if (type === 'website' || type === 'page') {
    if (sections.includes('reading'))  return 'reading';
    if (sections.includes('writing'))  return 'writing';
  }

  // Default: highest rank
  return sections.slice().sort(
    (a, b) => (SECTION_RANK[b] || 0) - (SECTION_RANK[a] || 0)
  )[0];
}

// ── validateSection ───────────────────────────────────────────────
/**
 * Returns true if the given section is among the item's matched sections,
 * OR if the item has no matches (i.e. the stored section is accepted as-is).
 *
 * @param {object} item
 * @param {string} section
 * @returns {boolean}
 */
function validateSection(item, section) {
  const sections = getSections(item);
  return sections.length === 0 || sections.includes(section);
}

// ── sourcesForSection ─────────────────────────────────────────────
/**
 * Returns the canonical source list for a section.
 * Useful for UI chips / filter labels.
 *
 * @param {string} section
 * @returns {string[]}
 */
function sourcesForSection(section) {
  return SECTION_RULES[section] || [];
}

module.exports = {
  SECTION_RULES,
  getSections,
  getPrimarySection,
  validateSection,
  sourcesForSection,
};
