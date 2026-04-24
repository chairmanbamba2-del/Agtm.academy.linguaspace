// lib/content-utils.js — Display + sort helpers for CornerContentItem
// Works with both camelCase (CornerContentItem) and snake_case (DB rows).
// Mirrors the TypeScript exports for use in Node.js and browser contexts.

'use strict';

// ── getDisplayBadge ───────────────────────────────────────────────
/**
 * Returns a short UI badge label for a content item.
 *
 * Logic (matches TypeScript export exactly):
 *   podcasts + rssUrl  → "Audio RSS"
 *   podcasts           → "Podcast"
 *   reading            → "Reading"
 *   writing            → "Writing"
 *   *                  → "Content"
 *
 * Accepts both camelCase (rssUrl) and snake_case (rss_url) field names.
 *
 * @param {object} item — CornerContentItem or DB row
 * @returns {string}
 */
function getDisplayBadge(item) {
  const rssUrl = item.rssUrl || item.rss_url || null;
  if (item.section === 'podcasts' && rssUrl) return 'Audio RSS';
  if (item.section === 'podcasts')           return 'Podcast';
  if (item.section === 'reading')            return 'Reading';
  if (item.section === 'writing')            return 'Writing';
  return 'Content';
}

// ── sortContent ───────────────────────────────────────────────────
/**
 * Comparator for Array.prototype.sort().
 * Primary  : priority descending  (higher score first)
 * Secondary: title ascending       (alphabetical tiebreak)
 *
 * Usage:
 *   items.sort(sortContent)
 *
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
function sortContent(a, b) {
  return (b.priority - a.priority) || a.title.localeCompare(b.title);
}

module.exports = { getDisplayBadge, sortContent };
