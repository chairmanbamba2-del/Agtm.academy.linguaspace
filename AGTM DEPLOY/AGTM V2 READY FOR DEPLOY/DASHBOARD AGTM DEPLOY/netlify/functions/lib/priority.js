// lib/priority.js — Scoring rules for CornerContentItem.priority
// Shared by: migrate_v33.js, corner-content-api.js
// Works with both camelCase (CornerContentItem) and snake_case (DB rows)

'use strict';

// ── Rules (source of truth, mirrors the TypeScript export) ───────
const PRIORITY_RULES = {
  official_source_bonus:    30,
  has_rss_bonus:            20,
  has_cefr_bonus:           15,
  pedagogical_bonus:        15,
  youtube_playlist_bonus:   10,
  generic_source_penalty:  -10,
};

// ── Condition sets ────────────────────────────────────────────────

/** Authoritative external publishers with editorial standards */
const OFFICIAL_SOURCES = new Set([
  'BBC', 'VOA', 'TED', 'NPR', 'PBS', 'Reuters', 'AP',
  'CNN', 'Guardian', 'Cambridge', 'Oxford', 'British Council',
  'Pearson', 'Macmillan', 'Longman', 'Collins',
]);

/** Providers whose content is explicitly pedagogical */
const PEDAGOGICAL_PROVIDERS = new Set([
  'BBC', 'British Council', 'Cambridge', 'Oxford', 'Pearson',
  'Macmillan', 'Longman', 'Collins', 'AGTM', 'ESL',
  'Duolingo', 'VOA', 'EnglishClass101',
]);

/** Topics that signal deliberate learning design */
const PEDAGOGICAL_TOPICS = new Set([
  'grammar', 'vocabulary', 'pronunciation', 'business',
  'toeic', 'ielts', 'toefl', 'esl', 'reading', 'writing',
  'speaking', 'listening', 'idioms', 'phrasal_verbs',
]);

/** Providers that indicate missing or low-quality metadata */
const GENERIC_SOURCES = new Set(['', 'unknown', 'generic', 'n/a']);

// ── computePriority ───────────────────────────────────────────────
/**
 * Compute a priority score for a CornerContentItem (camelCase) or
 * a DB row (snake_case). Higher score = displayed first.
 *
 * @param {object}  item  - CornerContentItem or DB row
 * @param {object}  rules - optional rule overrides (defaults to PRIORITY_RULES)
 * @returns {number}
 */
function computePriority(item, rules) {
  const r = rules || PRIORITY_RULES;
  let score = 0;

  // Normalise both camelCase and snake_case field names
  const provider = (item.provider || '').trim();
  const topic    = (item.topic    || '').toLowerCase().trim();
  const level    = (item.level    || 'all').trim();
  const type     = (item.type     || '').trim();
  const title    = (item.title    || '').trim();
  const rssUrl   = item.rssUrl || item.rss_url || null;

  // +30 : official external source
  if (OFFICIAL_SOURCES.has(provider)) {
    score += r.official_source_bonus;
  }

  // +20 : has a machine-readable RSS feed
  if (rssUrl) {
    score += r.has_rss_bonus;
  }

  // +15 : specific CEFR level (not 'all')
  if (level && level !== 'all') {
    score += r.has_cefr_bonus;
  }

  // +15 : pedagogically oriented provider or topic
  if (PEDAGOGICAL_PROVIDERS.has(provider) || PEDAGOGICAL_TOPICS.has(topic)) {
    score += r.pedagogical_bonus;
  }

  // +10 : YouTube playlist (curated video series)
  if (type === 'playlist') {
    score += r.youtube_playlist_bonus;
  }

  // -10 : generic / unidentifiable source or completely empty metadata
  if (GENERIC_SOURCES.has(provider) || (!provider && !title)) {
    score += r.generic_source_penalty;
  }

  return score;
}

// ── Batch re-score an array of items ────────────────────────────
/**
 * Returns the same items with `.priority` replaced by computed value.
 * Non-destructive: returns new objects.
 */
function applyPriorities(items, rules) {
  return items.map(item => ({ ...item, priority: computePriority(item, rules) }));
}

module.exports = { PRIORITY_RULES, OFFICIAL_SOURCES, PEDAGOGICAL_PROVIDERS, PEDAGOGICAL_TOPICS, computePriority, applyPriorities };
