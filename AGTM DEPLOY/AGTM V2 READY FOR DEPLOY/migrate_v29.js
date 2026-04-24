// AGTM Academy — Migration v29 : marketing_config
// Exécute supabase_MIGRATION_v29_marketing.sql via connexion PostgreSQL directe
// Usage : node migrate_v29.js "VotreMotDePasseDB"

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const PROJECT_REF = 'fglzovvsyloprokmdadx'
const DB_PASSWORD = process.argv[2] || process.env.SUPABASE_DB_PASSWORD || ''

if (!DB_PASSWORD) {
  console.error('\n ERREUR : Mot de passe DB requis')
  console.error(' Usage : node migrate_v29.js "VotreMotDePasseDB"')
  console.error(' Ou    : set SUPABASE_DB_PASSWORD=xxx && node migrate_v29.js')
  process.exit(1)
}

const SQL_FILE = path.join(__dirname, 'supabase_MIGRATION_v29_marketing.sql')
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
    if (trimmed.startsWith('--') || trimmed === '') {
      continue
    }
    if (!inDollarQuote) {
      const dollarMatch = trimmed.match(/\$\w*\$/)
      if (dollarMatch) {
        inDollarQuote = true
        dollarTag = dollarMatch[0]
      }
    } else if (trimmed.includes(dollarTag)) {
      inDollarQuote = false
    }
    current += line + '\n'
    if (!inDollarQuote && trimmed.endsWith(';')) {
      const stmt = current.trim()
      if (stmt.length > 1) results.push(stmt)
      current = ''
    }
  }
  if (current.trim()) results.push(current.trim())
  return results
}

async function tryConnect(cfg) {
  const client = new Client(cfg)
  try {
    await client.connect()
    return client
  } catch (err) {
    try { await client.end() } catch {}
    throw err
  }
}

async function run() {
  console.log('\n=== Migration v29 — marketing_config ===\n')

  const statements = splitSQL(sql)
  console.log(`Fichier SQL chargé : ${SQL_FILE}`)
  console.log(`Nombre de statements : ${statements.length}\n`)

  let client = null
  for (const cfg of configs) {
    console.log(`Tentative de connexion : ${cfg.label} (${cfg.host}:${cfg.port})...`)
    try {
      client = await tryConnect(cfg)
      console.log(`✅ Connecté via ${cfg.label}\n`)
      break
    } catch (err) {
      console.log(`   ✗ Échec : ${err.message}`)
    }
  }

  if (!client) {
    console.error('\n❌ Connexion impossible. Vérifiez le mot de passe DB et la connexion réseau.')
    console.error('   Supabase → Project Settings → Database → Database Password')
    process.exit(1)
  }

  let ok = 0, skip = 0, fail = 0
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    const preview = stmt.replace(/\s+/g, ' ').substring(0, 80)
    try {
      await client.query(stmt)
      ok++
      console.log(`  [${i+1}/${statements.length}] ✅ ${preview}...`)
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate key')) {
        skip++
        console.log(`  [${i+1}/${statements.length}] ⏭  SKIP (existe déjà) : ${preview}...`)
      } else {
        fail++
        console.error(`  [${i+1}/${statements.length}] ❌ ERREUR : ${err.message.split('\n')[0]}`)
        console.error(`     SQL : ${preview}`)
      }
    }
  }

  await client.end()

  console.log(`\n=== Résultat : ${ok} OK · ${skip} ignorés · ${fail} erreurs ===`)
  if (fail === 0) {
    console.log('✅ Migration v29 réussie !\n')
  } else {
    console.log('⚠️  Migration partiellement réussie — vérifiez les erreurs ci-dessus.\n')
  }
}

run().catch(err => {
  console.error('Erreur fatale:', err.message)
  process.exit(1)
})
