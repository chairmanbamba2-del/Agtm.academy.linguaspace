// AGTM Academy — Migration directe PostgreSQL via pg (node-postgres)
// Supabase expose PostgreSQL en accès direct sur le port 5432 (connexion directe)
// et port 6543 (connection pooler)

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const PROJECT_REF = 'fglzovvsyloprokmdadx'
const TMPDIR = 'C:\\Users\\ibrah\\AppData\\Local\\Temp'

// Connexion Supabase directe (mode Transaction pooler)
// L'utilisateur est postgres.[project_ref] pour le pooler
// Le mot de passe est le "Database Password" du projet Supabase
// On va tenter avec les configurations connues

const configs = [
  // Direct connection (port 5432)
  {
    label: 'Direct Connection (port 5432)',
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD || '',
    ssl: { rejectUnauthorized: false }
  },
  // Transaction Pooler (port 6543)
  {
    label: 'Transaction Pooler (port 6543)',
    host: `aws-0-eu-central-1.pooler.supabase.com`,
    port: 6543,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: process.env.SUPABASE_DB_PASSWORD || '',
    ssl: { rejectUnauthorized: false }
  },
]

const SQL_QUOTA = fs.readFileSync(path.join(TMPDIR, 'agtm_migration_quota.sql'), 'utf8')
const SQL_RLS   = fs.readFileSync(path.join(TMPDIR, 'agtm_rls.sql'), 'utf8')

function splitSQL(sql) {
  // Smart split: respect $$ function bodies and multi-line statements
  const results = []
  let current = ''
  let inDollarQuote = false
  let dollarTag = ''

  const lines = sql.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('--')) continue

    // Check for dollar-quoted strings (e.g. $$ ... $$)
    const dollarMatches = line.match(/\$\w*\$/g) || []
    for (const match of dollarMatches) {
      if (!inDollarQuote) { inDollarQuote = true; dollarTag = match }
      else if (match === dollarTag) { inDollarQuote = false; dollarTag = '' }
    }

    current += line + '\n'

    if (!inDollarQuote && trimmed.endsWith(';')) {
      const stmt = current.trim()
      if (stmt.replace(/\s+/g, '').length > 3) results.push(stmt)
      current = ''
    }
  }
  if (current.trim().replace(/\s+/g, '').length > 3) results.push(current.trim())
  return results
}

async function runMigration(client, sql, label) {
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`📋 ${label}`)
  console.log('═'.repeat(60))

  const stmts = splitSQL(sql)
  console.log(`   ${stmts.length} requêtes SQL`)

  let ok = 0, skipped = 0, errors = 0

  for (let i = 0; i < stmts.length; i++) {
    const stmt = stmts[i]
    const preview = stmt.replace(/\s+/g, ' ').substring(0, 70)
    process.stdout.write(`   [${String(i+1).padStart(2)}/${stmts.length}] ${preview}… `)

    try {
      await client.query(stmt)
      console.log('✅')
      ok++
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('already exists') || msg.includes('duplicate key') || msg.includes('does not exist')) {
        console.log(`⚠️  ${msg.substring(0, 60)}`)
        skipped++
      } else {
        console.log(`❌ ${msg.substring(0, 80)}`)
        errors++
      }
    }
  }

  return { ok, skipped, errors, total: stmts.length }
}

async function main() {
  console.log('🚀 AGTM Academy — Migration PostgreSQL directe')
  console.log('═'.repeat(60))

  // Password from env or empty (will fail at connect if wrong — user will be prompted)

  let connected = false
  let client

  for (const cfg of configs) {
    console.log(`\n🔌 Tentative : ${cfg.label}`)
    client = new Client(cfg)
    try {
      await client.connect()
      const res = await client.query('SELECT version()')
      console.log(`✅ Connecté ! PostgreSQL: ${res.rows[0].version.split(' ').slice(0,2).join(' ')}`)
      connected = true
      break
    } catch (err) {
      console.log(`❌ Échec: ${err.message.substring(0, 80)}`)
      try { await client.end() } catch(_) {}
    }
  }

  if (!connected) {
    console.log('\n❌ Impossible de se connecter à la base de données.')
    console.log('   Vérifiez le mot de passe et réessayez.')
    process.exit(1)
  }

  try {
    const r1 = await runMigration(client, SQL_QUOTA, 'migration_quota.sql')
    const r2 = await runMigration(client, SQL_RLS,   'supabase_RLS_security.sql')

    // Verify
    console.log('\n🔍 Vérification des colonnes...')
    const checkQuery = `
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('etudiants','presences','seances','classes')
        AND column_name IN ('quota_seances','frequence_semaine','date_debut_contrat','date_fin_contrat','motif_absence','justifie','salle')
      ORDER BY table_name, column_name`
    const colRes = await client.query(checkQuery)
    colRes.rows.forEach(r => console.log(`   ✅ ${r.table_name}.${r.column_name} (${r.data_type})`))

    // Check RLS
    console.log('\n🔐 Vérification RLS...')
    const rlsQuery = `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename IN ('etudiants','seances','presences','evaluations','paiements') ORDER BY tablename`
    const rlsRes = await client.query(rlsQuery)
    rlsRes.rows.forEach(r => console.log(`   ${r.rowsecurity ? '✅' : '❌'} ${r.tablename}: RLS ${r.rowsecurity ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`))

    // Count policies
    const polQuery = `SELECT COUNT(*) as total FROM pg_policies WHERE schemaname = 'public'`
    const polRes = await client.query(polQuery)
    console.log(`   📋 ${polRes.rows[0].total} politique(s) RLS actives`)

    console.log('\n' + '═'.repeat(60))
    console.log('📊 RÉSUMÉ FINAL')
    console.log('═'.repeat(60))
    console.log(`   migration_quota.sql  : ${r1.ok} OK, ${r1.skipped} ignorés, ${r1.errors} erreur(s)`)
    console.log(`   supabase_RLS_security.sql : ${r2.ok} OK, ${r2.skipped} ignorés, ${r2.errors} erreur(s)`)
    console.log(`   Colonnes vérifiées : ${colRes.rowCount}`)
    console.log(`   Tables RLS activé  : ${rlsRes.rows.filter(r=>r.rowsecurity).length}/${rlsRes.rowCount}`)
    if (r1.errors === 0 && r2.errors === 0) {
      console.log('\n   🎉 Migration réussie ! Base de données à jour.')
    } else {
      console.log(`\n   ⚠️  ${r1.errors + r2.errors} erreur(s) — Vérifiez les messages ci-dessus.`)
    }

  } finally {
    await client.end()
  }
}

main().catch(e => {
  console.error('\n❌ Erreur fatale:', e.message)
  process.exit(1)
})
