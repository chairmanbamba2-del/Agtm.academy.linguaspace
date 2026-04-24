// AGTM Academy — Migration v34 : corner_content seed (podcasts / reading / writing)
//
// 1. Étend la contrainte CHECK level : ajoute A2-B2 et A2-C1
// 2. Supprime les entrées UUID générées par v33 pour les mêmes providers
//    (les remplaçants slug ont des données plus précises)
// 3. Upsert des 15 items depuis data/corner_content_seed.json
//
// Usage : node migrate_v34.js "VotreMotDePasseDB"

const { Client } = require('pg')
const path = require('path')
const seed = require('./data/corner_content_seed.json')

const PROJECT_REF = 'fglzovvsyloprokmdadx'
const DB_PASSWORD = process.argv[2] || process.env.SUPABASE_DB_PASSWORD || ''

if (!DB_PASSWORD) {
  console.error('\n ERREUR : Mot de passe DB requis')
  console.error(' Usage : node migrate_v34.js "VotreMotDePasseDB"')
  process.exit(1)
}

// ── Providers présents dans le seed → les entrées UUID de ces providers
// créées par v33 seront supprimées pour éviter les doublons
const SEED_PROVIDERS = [...new Set(seed.map(i => i.provider))]

// Regex UUID v4
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const configs = [
  { label: 'Pooler Session (5432)',     host: `aws-0-eu-west-1.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}` },
  { label: 'Pooler Transaction (6543)', host: `aws-0-eu-west-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}` },
  { label: 'Direct (5432)',             host: `db.${PROJECT_REF}.supabase.co`,        port: 5432, user: 'postgres' },
]

async function run() {
  console.log('\n=== Migration v34 — corner_content seed (podcasts/reading/writing) ===\n')
  let client = null
  for (const cfg of configs) {
    console.log(`Tentative : ${cfg.label}…`)
    const c = new Client({ ...cfg, database: 'postgres', password: DB_PASSWORD, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 })
    try { await c.connect(); client = c; console.log('✅ Connecté\n'); break }
    catch (e) { console.log(`   ✗ ${e.message}`); try { await c.end() } catch {} }
  }
  if (!client) { console.error('\n❌ Connexion impossible.'); process.exit(1) }

  // ── 1. Étendre la contrainte CHECK level ───────────────────────
  console.log('── Étape 1 : contrainte CHECK level ──')
  try {
    // Supprimer l'ancienne contrainte (nom auto-généré par Postgres)
    await client.query(`ALTER TABLE corner_content DROP CONSTRAINT IF EXISTS corner_content_level_check`)
    console.log('  ✅ Ancienne contrainte supprimée (ou absente)')

    await client.query(`
      ALTER TABLE corner_content
        ADD CONSTRAINT corner_content_level_check
          CHECK (level IN (
            'A1','A2','B1','B2','C1',
            'A1-A2','A2-B1','A2-B2','A2-C1',
            'B1-B2','B1-C1','B2-C1',
            'all'
          ))
    `)
    console.log('  ✅ Nouvelle contrainte ajoutée (+ A2-B2, A2-C1)\n')
  } catch (e) {
    // La contrainte peut déjà inclure les nouvelles valeurs — continuer
    if (e.message.includes('already exists')) {
      console.log('  ⏭  Contrainte déjà à jour\n')
    } else {
      console.error('  ✗  ' + e.message)
      await client.end(); process.exit(1)
    }
  }

  // ── 2. Supprimer les entrées UUID des mêmes providers (v33 placeholders) ──
  console.log('── Étape 2 : nettoyage entrées UUID v33 ──')
  try {
    const res = await client.query(
      `DELETE FROM corner_content
       WHERE provider = ANY($1::text[])
         AND section  != 'listening'
         AND id ~ $2
       RETURNING id`,
      [SEED_PROVIDERS, '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$']
    )
    console.log(`  ✅ ${res.rowCount} entrée(s) UUID supprimée(s)\n`)
  } catch (e) {
    console.warn('  ⚠️  Nettoyage ignoré :', e.message, '\n')
  }

  // ── 3. Upsert seed items ───────────────────────────────────────
  console.log(`── Étape 3 : upsert ${seed.length} items ──`)
  let ok = 0, fail = 0

  for (const item of seed) {
    try {
      await client.query(
        `INSERT INTO corner_content
           (id, title, provider, section, type, level, topic, tags,
            url, rss_url, image_url, description, priority, active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO UPDATE SET
           title       = EXCLUDED.title,
           provider    = EXCLUDED.provider,
           section     = EXCLUDED.section,
           type        = EXCLUDED.type,
           level       = EXCLUDED.level,
           topic       = EXCLUDED.topic,
           tags        = EXCLUDED.tags,
           url         = EXCLUDED.url,
           rss_url     = EXCLUDED.rss_url,
           image_url   = EXCLUDED.image_url,
           description = EXCLUDED.description,
           priority    = EXCLUDED.priority,
           active      = EXCLUDED.active`,
        [
          item.id,
          item.title,
          item.provider,
          item.section,
          item.type,
          item.level,
          item.topic,
          item.tags,                    // node-postgres serialises JS array → TEXT[]
          item.url,
          item.rssUrl    ?? null,
          item.imageUrl  ?? null,
          item.description ?? null,
          item.priority,
          item.active !== false,
        ]
      )
      console.log(`  ✅ [${item.section.padEnd(8)}] ${item.id}`)
      ok++
    } catch (e) {
      console.error(`  ✗  [${item.section}] ${item.id} → ${e.message}`)
      fail++
    }
  }

  await client.end()
  console.log(`\n=== Résultat : ${ok} OK, ${fail} erreurs ===`)
  if (fail === 0) console.log('✅ Migration v34 réussie.')
  else { console.error('⚠️  Certains items ont échoué.'); process.exit(1) }
}

run()
