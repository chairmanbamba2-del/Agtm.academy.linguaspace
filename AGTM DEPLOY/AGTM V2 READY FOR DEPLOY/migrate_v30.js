// AGTM Academy — Migration v30 : ai_chat_sessions
// Usage : node migrate_v30.js "VotreMotDePasseDB"

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const PROJECT_REF = 'fglzovvsyloprokmdadx'
const DB_PASSWORD = process.argv[2] || process.env.SUPABASE_DB_PASSWORD || ''

if (!DB_PASSWORD) {
  console.error('\n ERREUR : Mot de passe DB requis')
  console.error(' Usage : node migrate_v30.js "VotreMotDePasseDB"')
  process.exit(1)
}

const SQL_FILE = path.join(__dirname, 'supabase_MIGRATION_v30_ai_history.sql')
const sql = fs.readFileSync(SQL_FILE, 'utf8')

const configs = [
  { label: 'Direct (5432)',           host: `db.${PROJECT_REF}.supabase.co`, port: 5432, database: 'postgres', user: 'postgres', password: DB_PASSWORD, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 },
  { label: 'Pooler Session (5432)',   host: `aws-0-eu-west-1.pooler.supabase.com`, port: 5432, database: 'postgres', user: `postgres.${PROJECT_REF}`, password: DB_PASSWORD, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 },
  { label: 'Pooler Transaction (6543)',host: `aws-0-eu-west-1.pooler.supabase.com`, port: 6543, database: 'postgres', user: `postgres.${PROJECT_REF}`, password: DB_PASSWORD, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 },
]

function splitSQL(sql) {
  const results = []; let current = '', inDollarQuote = false, dollarTag = ''
  for (const line of sql.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('--') || trimmed === '') continue
    if (!inDollarQuote) { const m = trimmed.match(/\$\w*\$/); if (m) { inDollarQuote = true; dollarTag = m[0] } }
    else if (trimmed.includes(dollarTag)) inDollarQuote = false
    current += line + '\n'
    if (!inDollarQuote && trimmed.endsWith(';')) { const s = current.trim(); if (s.length > 1) results.push(s); current = '' }
  }
  if (current.trim()) results.push(current.trim())
  return results
}

async function run() {
  console.log('\n=== Migration v30 — ai_chat_sessions ===\n')
  const statements = splitSQL(sql)
  console.log(`Statements : ${statements.length}\n`)

  let client = null
  for (const cfg of configs) {
    console.log(`Tentative : ${cfg.label}...`)
    const c = new Client(cfg)
    try { await c.connect(); client = c; console.log(`✅ Connecté\n`); break }
    catch (err) { console.log(`   ✗ ${err.message}`); try { await c.end() } catch {} }
  }
  if (!client) { console.error('\n❌ Connexion impossible.'); process.exit(1) }

  let ok = 0, skip = 0, fail = 0
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    const preview = stmt.replace(/\s+/g, ' ').substring(0, 80)
    try {
      await client.query(stmt); ok++
      console.log(`  [${i+1}/${statements.length}] ✅ ${preview}...`)
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate key')) {
        skip++; console.log(`  [${i+1}/${statements.length}] ⏭  SKIP : ${preview}...`)
      } else {
        fail++; console.error(`  [${i+1}/${statements.length}] ❌ ${err.message.split('\n')[0]}`)
      }
    }
  }
  await client.end()
  console.log(`\n=== Résultat : ${ok} OK · ${skip} ignorés · ${fail} erreurs ===`)
  if (fail === 0) console.log('✅ Migration v30 réussie !\n')
  else console.log('⚠️  Vérifiez les erreurs ci-dessus.\n')
}
run().catch(err => { console.error('Erreur fatale:', err.message); process.exit(1) })
