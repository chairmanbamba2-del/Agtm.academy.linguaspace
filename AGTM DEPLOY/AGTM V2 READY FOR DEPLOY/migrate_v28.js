// AGTM Academy — Migration v28 : Assistant IA
// Exécute supabase_MIGRATION_v28_ai.sql via connexion PostgreSQL directe

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const PROJECT_REF = 'fglzovvsyloprokmdadx'
const DB_PASSWORD = process.argv[2] || process.env.SUPABASE_DB_PASSWORD || ''

if (!DB_PASSWORD) {
  console.error('\n ERREUR : Mot de passe DB requis')
  console.error(' Usage : node migrate_v28.js "VotreMotDePasseDB"')
  console.error(' Ou    : set SUPABASE_DB_PASSWORD=xxx && node migrate_v28.js')
  process.exit(1)
}

const SQL_FILE = path.join(__dirname, 'supabase_MIGRATION_v28_ai.sql')
const sql = fs.readFileSync(SQL_FILE, 'utf8')

const configs = [
  {
    label: 'Direct (port 5432)',
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  },
  {
    label: 'Pooler Session (port 5432)',
    host: `aws-0-eu-west-1.pooler.supabase.com`,
    port: 5432,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  },
  {
    label: 'Pooler Transaction (port 6543)',
    host: `aws-0-eu-west-1.pooler.supabase.com`,
    port: 6543,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  },
]

function splitSQL(sql) {
  const results = []
  let current = ''
  let inDollarQuote = false
  let dollarTag = ''
  const lines = sql.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('--')) { current += '\n'; continue }
    const dollarMatches = line.match(/\$\w*\$/g) || []
    for (const match of dollarMatches) {
      if (!inDollarQuote) { inDollarQuote = true; dollarTag = match }
      else if (match === dollarTag) { inDollarQuote = false; dollarTag = '' }
    }
    current += line + '\n'
    if (!inDollarQuote && trimmed.endsWith(';')) {
      const stmt = current.trim()
      if (stmt.replace(/[\s\-]/g, '').length > 3) results.push(stmt)
      current = ''
    }
  }
  if (current.trim().replace(/[\s\-]/g, '').length > 3) results.push(current.trim())
  return results
}

async function main() {
  console.log('AGTM Academy -- Migration v28 Assistant IA')
  console.log('='.repeat(60))

  let client, connected = false

  for (const cfg of configs) {
    console.log(`\nTentative : ${cfg.label}`)
    client = new Client(cfg)
    try {
      await client.connect()
      const res = await client.query('SELECT version()')
      console.log(`Connecte ! ${res.rows[0].version.split(' ').slice(0,2).join(' ')}`)
      connected = true
      break
    } catch (err) {
      console.log(`Echec: ${err.message.substring(0, 80)}`)
      try { await client.end() } catch(_) {}
    }
  }

  if (!connected) {
    console.log('\nImpossible de se connecter. Verifiez le mot de passe DB.')
    process.exit(1)
  }

  const stmts = splitSQL(sql)
  console.log(`\n${stmts.length} statements SQL a executer\n`)

  let ok = 0, warn = 0, errors = 0

  for (let i = 0; i < stmts.length; i++) {
    const stmt = stmts[i]
    const preview = stmt.replace(/\s+/g, ' ').substring(0, 65)
    process.stdout.write(`[${String(i+1).padStart(2)}/${stmts.length}] ${preview}... `)
    try {
      await client.query(stmt)
      console.log('OK')
      ok++
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('does not exist')) {
        console.log(`SKIP: ${msg.substring(0, 60)}`)
        warn++
      } else {
        console.log(`ERR: ${msg.substring(0, 80)}`)
        errors++
      }
    }
  }

  // Verification finale
  console.log('\n' + '='.repeat(60))
  try {
    const r = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema='public'
        AND table_name IN ('ai_config','ai_knowledge','ai_conversations')
      ORDER BY table_name
    `)
    console.log(`Tables creees : ${r.rows.map(r=>r.table_name).join(', ')}`)

    const r2 = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='utilisateurs' AND column_name='ai_tier'
    `)
    console.log(`Colonne ai_tier sur utilisateurs : ${r2.rowCount > 0 ? 'OK' : 'MANQUANTE'}`)

    const r3 = await client.query(`SELECT COUNT(*) as n FROM ai_config`)
    console.log(`Entrees ai_config : ${r3.rows[0].n}`)

    const r4 = await client.query(`SELECT COUNT(*) as n FROM ai_knowledge`)
    console.log(`Entrees ai_knowledge : ${r4.rows[0].n}`)
  } catch(e) {
    console.log('Verification: ' + e.message)
  }

  console.log('\n' + '='.repeat(60))
  console.log(`RESULTAT : ${ok} OK  ${warn} ignores  ${errors} erreur(s)`)
  if (errors === 0) {
    console.log('Migration v28 reussie ! L assistant IA est pret.')
  } else {
    console.log(`${errors} erreur(s) -- verifiez les messages ci-dessus.`)
  }

  await client.end()
}

main().catch(e => {
  console.error('Erreur fatale:', e.message)
  process.exit(1)
})
