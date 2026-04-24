// AGTM Academy — Migration v35 : Contenu Pédagogique Enrichi (MASTER_INSTALL v2.0)
// 98 modules · 102 objectifs · 170 questions quiz · 60 questions éval · 40 questions placement
//
// Usage : node migrate_v35.js
//
// Conflit géré : la table 'evaluations' existe déjà → renommée 'learning_evaluations'
// Groupage currval() : les statements utilisant currval() sont regroupés avec leur
// INSERT parent dans un seul appel API (currval est session-scoped).

const https = require('https')
const fs    = require('fs')
const path  = require('path')

const PROJECT_REF = 'fglzovvsyloprokmdadx'
const PAT_TOKEN   = 'sbp_38a9c3c3ca8d33891e80c280d9b7dc2d7fc8c359'

// ── Supabase Management API ──────────────────────────────────────────────────
function sbQuery(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql })
    const req  = https.request({
      hostname: 'api.supabase.com',
      path:     `/v1/projects/${PROJECT_REF}/database/query`,
      method:   'POST',
      headers: {
        'Authorization': `Bearer ${PAT_TOKEN}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = ''
      res.on('data', c => { data += c })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (res.statusCode >= 400) reject(new Error(parsed.message || parsed.error || JSON.stringify(parsed)))
          else resolve(parsed)
        } catch {
          if (res.statusCode >= 400) reject(new Error(data))
          else resolve(data)
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ── Patch SQL : résoudre le conflit de nom ───────────────────────────────────
function patchSQL(sql) {
  return sql
    .replace(/^BEGIN;?\s*\n/m, '')
    .replace(/^COMMIT;?\s*$/m, '')
    .replace(/CREATE TABLE IF NOT EXISTS evaluations\b/g,
             'CREATE TABLE IF NOT EXISTS learning_evaluations')
    .replace(/evaluation_id(\s+)INT REFERENCES evaluations\(id\) ON DELETE CASCADE/g,
             'learning_eval_id$1INT REFERENCES learning_evaluations(id) ON DELETE CASCADE')
    .replace(/evaluation_id(\s+)INT REFERENCES evaluations\(id\)(?! ON DELETE)/g,
             'evaluation_id$1INT REFERENCES learning_evaluations(id)')
    .replace(/\bevaluation_id IS NOT NULL\b/g, 'learning_eval_id IS NOT NULL')
    .replace(/ON questions\(evaluation_id\)/g, 'ON questions(learning_eval_id)')
    .replace(/\bINSERT INTO evaluations\b/g, 'INSERT INTO learning_evaluations')
    .replace(/\bINSERT INTO questions \(evaluation_id,/g,
             'INSERT INTO questions (learning_eval_id,')
    .replace(/currval\('evaluations_id_seq'\)/g,
             "currval('learning_evaluations_id_seq')")
}

// ── Parser SQL (gère $$ dollar-quotes) ──────────────────────────────────────
function splitSQL(sql) {
  const results = []
  let current = '', inDollarQuote = false, dollarTag = ''
  for (const line of sql.split('\n')) {
    const trimmed = line.trim()
    if (!inDollarQuote && (trimmed.startsWith('--') || trimmed === '')) continue
    if (!inDollarQuote) {
      const m = trimmed.match(/(\$\w*\$)/)
      if (m) { inDollarQuote = true; dollarTag = m[1] }
    } else if (trimmed.includes(dollarTag)) {
      inDollarQuote = false
    }
    current += line + '\n'
    if (!inDollarQuote && trimmed.endsWith(';')) {
      const s = current.trim()
      if (s.length > 1) results.push(s)
      current = ''
    }
  }
  if (current.trim()) results.push(current.trim())
  return results
}

// ── Grouper les statements dépendants de currval() ───────────────────────────
// Règle : un statement qui utilise currval() DOIT être dans le même appel API
// que le statement parent qui a généré la valeur de séquence.
//
// Algorithme : les statements utilisant currval() sont ajoutés au buffer courant.
// Un statement sans currval() ferme le buffer précédent et démarre un nouveau buffer.
// → Chaque quiz/test complet (header + toutes questions + toutes options) devient 1 appel API.
function groupByCurrval(statements) {
  const groups = []
  let current = []

  for (const stmt of statements) {
    const hasCurrval = /currval\(/i.test(stmt)

    if (hasCurrval) {
      // Dépend d'une valeur générée dans la session courante → même groupe
      if (current.length === 0) current.push(stmt)  // orphan (ne devrait pas arriver)
      else current.push(stmt)
    } else {
      // Statement indépendant → fermer le groupe précédent et démarrer un nouveau
      if (current.length > 0) {
        groups.push(current.join('\n'))
        current = []
      }
      current.push(stmt)
    }
  }

  if (current.length > 0) groups.push(current.join('\n'))
  return groups
}

// ── Utilitaires ──────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function sbQueryWithRetry(sql, maxRetries = 5) {
  let delay = 2000
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await sbQuery(sql)
    } catch (err) {
      const msg = err.message || ''
      const isThrottle = msg.includes('ThrottlerException') || msg.includes('Too Many Requests') || msg.includes('rate limit')
      if (isThrottle && attempt < maxRetries) {
        process.stdout.write(`\n  ⏳ Rate limit — attente ${delay/1000}s (tentative ${attempt+1}/${maxRetries})...\n`)
        await sleep(delay)
        delay = Math.min(delay * 2, 30000)
      } else {
        throw err
      }
    }
  }
}

// ── Lire et patcher le SQL ───────────────────────────────────────────────────
const SQL_FILE = path.join(__dirname,
  'Ficher mise a jour du contenu de pedagogique agtm', 'MASTER_INSTALL.sql')

if (!fs.existsSync(SQL_FILE)) {
  console.error(`\n ERREUR : Fichier SQL introuvable :\n   ${SQL_FILE}\n`)
  process.exit(1)
}

const sql = patchSQL(fs.readFileSync(SQL_FILE, 'utf8'))

// ── Exécution ────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗')
  console.log('║  Migration v35 — Contenu Pédagogique Enrichi (MASTER_INSTALL)   ║')
  console.log('║  Via API Supabase Management · currval() groupé par session     ║')
  console.log('╚══════════════════════════════════════════════════════════════════╝\n')

  const statements = splitSQL(sql)
  const groups     = groupByCurrval(statements)

  console.log(`  Statements parsés : ${statements.length}`)
  console.log(`  Groupes API       : ${groups.length} (groupes currval fusionnés)`)
  console.log(`  Patch             : evaluations → learning_evaluations\n`)

  try {
    await sbQueryWithRetry('SELECT 1', 8)
    console.log('  ✅ API Supabase accessible\n')
  } catch (e) {
    console.error('  ❌ API inaccessible :', e.message); process.exit(1)
  }

  let ok = 0, skip = 0, fail = 0

  for (let i = 0; i < groups.length; i++) {
    const grp     = groups[i]
    const isMulti = grp.includes('\n') && grp.split(';').filter(s => s.trim()).length > 1
    const preview = grp.replace(/\s+/g, ' ').substring(0, 85)
    const pct     = Math.round((i + 1) / groups.length * 100)
    const tag     = isMulti
      ? `[GROUPE ${grp.split(';').filter(s=>s.trim()).length} stmts]`
      : ''

    // Pause entre groupes pour éviter le rate limiting (1s)
    if (i > 0) await sleep(1000)

    try {
      await sbQueryWithRetry(grp)
      ok++
      if (ok <= 25 || ok % 80 === 0 || i === groups.length - 1) {
        console.log(`  [${String(i+1).padStart(4)}/${groups.length}] ✅ (${pct}%) ${tag} ${preview}`)
      } else {
        process.stdout.write('·')
        if (ok % 60 === 0) process.stdout.write('\n')
      }
    } catch (err) {
      const msg = err.message || ''
      const isSkip =
        msg.includes('already exists') ||
        msg.includes('duplicate key') ||
        msg.includes('violates unique constraint') ||
        msg.includes('already a partition')

      if (isSkip) {
        skip++
        if (skip <= 10) {
          process.stdout.write('\n')
          console.log(`  [${String(i+1).padStart(4)}/${groups.length}] ⏭  SKIP ${tag} ${preview}`)
        }
      } else {
        fail++
        process.stdout.write('\n')
        console.error(`  [${String(i+1).padStart(4)}/${groups.length}] ❌ ${msg.split('\n')[0]}`)
        console.error(`     → ${preview}`)
      }
    }
  }

  console.log('\n\n╔══════════════════════════════════════════════════════════════════╗')
  console.log(`║  Résultat : ${String(ok).padEnd(5)} OK  ·  ${String(skip).padEnd(5)} ignorés  ·  ${String(fail).padEnd(5)} erreurs     ║`)
  console.log('╚══════════════════════════════════════════════════════════════════╝')

  if (fail === 0) {
    console.log('\n  ✅ Migration v35 réussie !\n')
    console.log('  Tables : programmes · categories · levels · modules · objectives')
    console.log('           quizzes · questions · answer_options · appreciation_grid')
    console.log('           learning_evaluations · placement_tests · level_tests')
    console.log('           quiz_results · evaluation_results · placement_results · level_test_results')
    console.log('  Fonctions : get_placement_level · get_appreciation\n')
  } else {
    console.log('\n  ⚠️  Vérifiez les erreurs ci-dessus.\n')
  }
}

run().catch(err => { console.error('\n  Erreur fatale :', err.message); process.exit(1) })
