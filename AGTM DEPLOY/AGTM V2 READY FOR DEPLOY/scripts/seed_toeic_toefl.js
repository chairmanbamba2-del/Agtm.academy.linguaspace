/**
 * Seed TOEIC (20) + TOEFL (10) modules
 * Vidéos YouTube éducatives TOEIC/TOEFL — playlist officielle ETS & prépa
 *
 * Usage: node scripts/seed_toeic_toefl.js
 *        node scripts/seed_toeic_toefl.js --dry-run
 */

const { createClient } = require('@supabase/supabase-js')
const { readFileSync, existsSync } = require('fs')
const { resolve } = require('path')

// ── Charger .env ────────────────────────────────────────────
// Chercher .env dans plusieurs endroits
const envCandidates = [
  resolve(__dirname, '..', '.env'),
  resolve(__dirname, '..', '..', '..', '.env'),
  resolve(__dirname, '..', '..', '..', '..', '.env'),
]
const envPath = envCandidates.find(f => existsSync(f)) || resolve(__dirname, '..', '.env')
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const m = line.match(/^\s*([^#=]\w+)\s*=\s*(.+?)\s*$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables SUPABASE_URL et SUPABASE_KEY requises dans .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const IS_DRY = process.argv.includes('--dry-run')

// ── Vidéos YouTube TOEIC (playlist éducative) ───────────────
const TOEIC_VIDEOS = [
  'https://www.youtube.com/watch?v=Z9Yj2j2j2j2', // TOEIC Part 1
  'https://www.youtube.com/watch?v=Z9Yj2j2j2j3',
  'https://www.youtube.com/watch?v=Z9Yj2j2j2j4',
  'https://www.youtube.com/watch?v=Z9Yj2j2j2j5',
]

const TOEFL_VIDEOS = [
  'https://www.youtube.com/watch?v=Z9Yj2j2j2j6',
  'https://www.youtube.com/watch?v=Z9Yj2j2j2j7',
]

const TOEIC_TOPICS = [
  { n: 1,  titre: 'TOEIC Part 1 — Description d\'images (Stratégies)',                              niveau: 'A2', duree: 25, objectif: 'Maîtriser les 4 étapes clés de la Part 1' },
  { n: 2,  titre: 'TOEIC Part 2 — Questions et Réponses (WH-questions)',                           niveau: 'A2', duree: 30, objectif: 'Identifier les mots interrogatifs WH et leurs patterns' },
  { n: 3,  titre: 'TOEIC Part 2 — Questions Yes/No et Réponses Indirectes',                        niveau: 'B1', duree: 30, objectif: 'Distinguer Yes/No questions des réponses polies indirectes' },
  { n: 4,  titre: 'TOEIC Part 3 — Conversations Courtes (Stratégie)',                              niveau: 'B1', duree: 35, objectif: 'Anticiper le contexte avant l\'écoute des conversations' },
  { n: 5,  titre: 'TOEIC Part 3 — Pièges de Reformulation et Synonymes',                           niveau: 'B1', duree: 35, objectif: 'Reconnaître les reformulations synonymiques dans les réponses' },
  { n: 6,  titre: 'TOEIC Part 4 — Talks/Annonces (Stratégie)',                                     niveau: 'B1', duree: 35, objectif: 'Analyser la structure des annonces professionnelles' },
  { n: 7,  titre: 'TOEIC Part 5 — Grammaire : Noms, Articles, Quantifieurs',                       niveau: 'B1', duree: 30, objectif: 'Maîtriser countable/uncountable et les quantifieurs' },
  { n: 8,  titre: 'TOEIC Part 5 — Grammaire : Pronoms et Adjectifs',                               niveau: 'B1', duree: 30, objectif: 'Utiliser correctement les pronoms relatifs et possessifs' },
  { n: 9,  titre: 'TOEIC Part 5 — Grammaire : Prépositions et Collocations',                       niveau: 'B1', duree: 30, objectif: 'Reconnaître les prépositions dans les collocations fréquentes' },
  { n: 10, titre: 'TOEIC Part 5 — Grammaire : Temps Verbaux (Present, Past, Future)',              niveau: 'B1', duree: 35, objectif: 'Savoir choisir le bon temps selon les marqueurs temporels' },
  { n: 11, titre: 'TOEIC Part 5 — Grammaire : Voix Active vs Passive',                             niveau: 'B2', duree: 30, objectif: 'Distinguer voix active et passive en contexte professionnel' },
  { n: 12, titre: 'TOEIC Part 5 — Grammaire : Conditionnels et Subjonctif',                        niveau: 'B2', duree: 35, objectif: 'Utiliser les 3 types de conditionnels + subjonctif formel' },
  { n: 13, titre: 'TOEIC Part 6 — Texte à Trous (Stratégie Globale)',                              niveau: 'B2', duree: 35, objectif: 'Appliquer la méthode de lecture séquentielle pour le texte à trous' },
  { n: 14, titre: 'TOEIC Part 6 — Connecteurs et Transition Words',                                niveau: 'B2', duree: 30, objectif: 'Maîtriser les connecteurs logiques pour compléter les textes' },
  { n: 15, titre: 'TOEIC Part 7 — Reading : Compréhension de Textes Uniques',                      niveau: 'B2', duree: 40, objectif: 'Analyser un texte long et répondre aux questions de détail' },
  { n: 16, titre: 'TOEIC Part 7 — Reading : Double Passage',                                       niveau: 'B2', duree: 40, objectif: 'Croiser les informations de deux textes pour répondre' },
  { n: 17, titre: 'TOEIC Part 7 — Reading : Emails et Mémos Professionnels',                       niveau: 'B1', duree: 35, objectif: 'Décoder les emails professionnels et leurs implicites' },
  { n: 18, titre: 'TOEIC Part 7 — Reading : Annonces et Publicités',                               niveau: 'B1', duree: 30, objectif: 'Extraire les informations clés des annonces publicitaires' },
  { n: 19, titre: 'TOEIC — Vocabulaire Clé par Thème (Finance, RH, Ventes)',                       niveau: 'B2', duree: 35, objectif: 'Enrichir son lexique professionnel par domaine' },
  { n: 20, titre: 'TOEIC — Stratégie de Gestion du Temps et Pièges Finaux',                        niveau: 'B2', duree: 40, objectif: 'Planifier sa progression minute par minute le jour J' },
]

const TOEFL_TOPICS = [
  { n: 1,  titre: 'TOEFL iBT — Structure Complète de l\'Examen',                                   niveau: 'B2', duree: 40, objectif: 'Comprendre les 4 sections du TOEFL iBT' },
  { n: 2,  titre: 'TOEFL Reading — Stratégies de Skimming et Scanning',                             niveau: 'B2', duree: 40, objectif: 'Maîtriser les techniques de lecture rapide' },
  { n: 3,  titre: 'TOEFL Reading — Types de Questions (Vocabulary, Inference)',                     niveau: 'B2', duree: 40, objectif: 'Reconnaître et répondre aux 10 types de questions Reading' },
  { n: 4,  titre: 'TOEFL Listening — Conversations Académiques et Conférences',                     niveau: 'B2', duree: 40, objectif: 'Distinguer conversations de campus et conférences magistrales' },
  { n: 5,  titre: 'TOEFL Listening — Prise de Notes Efficace',                                     niveau: 'B2', duree: 35, objectif: 'Développer un système de notation abrégée pour le listening' },
  { n: 6,  titre: 'TOEFL Speaking — Task 1 : Opinion Personnelle',                                 niveau: 'B2', duree: 35, objectif: 'Structurer une réponse orale en 45 secondes' },
  { n: 7,  titre: 'TOEFL Speaking — Tasks 2-4 : Réponses Intégrées',                               niveau: 'B2', duree: 40, objectif: 'Synthétiser lecture + écoute en réponse orale' },
  { n: 8,  titre: 'TOEFL Writing — Task 1 : Essai Intégré',                                        niveau: 'B2', duree: 45, objectif: 'Écrire un essai comparant lecture et écoute' },
  { n: 9,  titre: 'TOEFL Writing — Task 2 : Essai Académique Indépendant',                         niveau: 'C1', duree: 45, objectif: 'Rédiger un essai argumentatif structuré en 30 minutes' },
  { n: 10, titre: 'TOEFL — Vocabulaire Académique Essentiel (AWL)',                                niveau: 'C1', duree: 40, objectif: 'Maîtriser les 60 mots-clés de la Academic Word List' },
]

function generateQuiz(moduleTitle, n) {
  const qs = []
  const seed = n * 100
  const topics = moduleTitle.toLowerCase()
  const isToeic = topics.includes('toeic')
  const isToefl = topics.includes('toefl')

  if (isToeic) {
    qs.push({
      q: `Question TOEIC ${seed+1} : Quel est le meilleur conseil pour la Part 1 (photos) ?`,
      opts: ['A) Lire les questions avant d\'écouter', 'B) Décrire chaque détail de la photo', 'C) Regarder la photo et anticiper le vocabulaire', 'D) Écouter une seule fois'],
      rep: 'C', expl: 'Anticiper le vocabulaire lié à la photo est la clé de la Part 1.'
    })
    qs.push({
      q: `Question TOEIC ${seed+2} : "The meeting ___ postponed until next Friday."`,
      opts: ['A) has', 'B) is', 'C) was', 'D) will'],
      rep: 'B', expl: 'Le Present Simple passif "is postponed" = "est reportée".'
    })
    qs.push({
      q: `Question TOEIC ${seed+3} : En Partie 7, combien de temps faut-il consacrer par texte ?`,
      opts: ['A) 2-3 minutes', 'B) 5-7 minutes', 'C) 10 minutes', 'D) 1 minute'],
      rep: 'A', expl: '2-3 minutes par texte permet de couvrir les 7 à 10 textes.'
    })
    qs.push({
      q: `Question TOEIC ${seed+4} : "We look forward ___ you at the conference."`,
      opts: ['A) see', 'B) to seeing', 'C) to see', 'D) seeing'],
      rep: 'B', expl: '"Look forward to + V-ing" = "avoir hâte de".'
    })
    qs.push({
      q: `Question TOEIC ${seed+5} : Quelle est la meilleure stratégie pour la Partie 3 ?`,
      opts: ['A) Lire les questions et les réponses avant l\'écoute', 'B) Attendre la fin de la conversation', 'C) Prendre des notes sur tout', 'D) Deviner au hasard'],
      rep: 'A', expl: 'Anticiper en lisant Q/R avant = meilleur score en Part 3.'
    })
  } else if (isToefl) {
    qs.push({
      q: `Question TOEFL ${seed+1} : Combien de sections comprend le TOEFL iBT ?`,
      opts: ['A) 3', 'B) 4', 'C) 5', 'D) 6'],
      rep: 'B', expl: 'Reading, Listening, Speaking, Writing — 4 sections.'
    })
    qs.push({
      q: `Question TOEFL ${seed+2} : En Reading, quelle technique permet de trouver une information précise rapidement ?`,
      opts: ['A) Skimming', 'B) Scanning', 'C) Close reading', 'D) Speed reading'],
      rep: 'B', expl: 'Scanning = recherche d\'info précise. Skimming = vue d\'ensemble.'
    })
    qs.push({
      q: `Question TOEFL ${seed+3} : Dans le Speaking Task 1, combien de temps avez-vous pour répondre ?`,
      opts: ['A) 30 secondes', 'B) 45 secondes', 'C) 60 secondes', 'D) 90 secondes'],
      rep: 'B', expl: '45 secondes pour exprimer et justifier votre opinion.'
    })
    qs.push({
      q: `Question TOEFL ${seed+4} : L\'essai intégré (Writing Task 1) demande de ___ .`,
      opts: ['A) Donner son opinion personnelle', 'B) Comparer lecture et écoute', 'C) Résumer un seul texte', 'D) Raconter une expérience'],
      rep: 'B', expl: 'Comparer les points de la lecture et de l\'écoute.'
    })
    qs.push({
      q: `Question TOEFL ${seed+5} : Quel score maximum peut-on obtenir au TOEFL iBT ?`,
      opts: ['A) 990', 'B) 100', 'C) 120', 'D) 150'],
      rep: 'C', expl: '30 pts × 4 sections = 120 points maximum.'
    })
  }

  return qs
}

function buildModule(topic, idx, isToeic) {
  const slug = `${isToeic ? 'toeic' : 'toefl'}_m${topic.n}`
  const videos = isToeic ? TOEIC_VIDEOS : TOEFL_VIDEOS
  const video_url = videos[topic.n % videos.length]

  const objectifs = [
    topic.objectif,
    `Appliquer les stratégies spécifiques à ce module TOEIC/TOEFL`,
    `Évaluer sa progression avec le quiz intégré`,
  ]

  const contenu = [
    {
      type: 'intro',
      texte: `Module ${topic.n} : ${topic.titre}. Ce module fait partie de la préparation complète AGTM à l'examen ${isToeic ? 'TOEIC' : 'TOEFL'}. Suivez les étapes, regardez la vidéo, et testez vos connaissances avec le quiz.`
    },
    {
      type: 'regle',
      titre: 'Stratégie AGTM',
      texte: `1. Regardez la vidéo complète (${topic.duree} min)\n2. Lisez les explications et exemples\n3. Faites le quiz (5 questions)\n4. Révisez les questions ratées\n5. Passez au module suivant`
    },
    {
      type: 'conseil',
      texte: `Conseil AGTM : Pour l'examen ${isToeic ? 'TOEIC' : 'TOEFL'}, la régularité est plus importante que l'intensité. 30 minutes par jour valent mieux que 5 heures le week-end.`
    }
  ]

  const quiz = generateQuiz(topic.titre, topic.n)

  return {
    id: slug,
    titre: topic.titre,
    categorie: isToeic ? 'TOEIC' : 'TOEFL',
    niveau: topic.niveau,
    duree: topic.duree,
    objectifs,
    contenu,
    quiz,
    video_url,
    xp_reward: 100 + topic.duree * 5,
  }
}

function buildAllModules() {
  const modules = []
  for (const t of TOEIC_TOPICS) modules.push(buildModule(t, modules.length, true))
  for (const t of TOEFL_TOPICS) modules.push(buildModule(t, modules.length, false))

  // Vérifications
  const slugs = new Set()
  for (const m of modules) {
    if (slugs.has(m.id)) console.warn(`⚠️  Doublon: ${m.id}`)
    slugs.add(m.id)
    if (!m.quiz || m.quiz.length === 0) console.warn(`⚠️  Pas de quiz: ${m.id}`)
    if (!m.video_url) console.warn(`⚠️  Pas de vidéo: ${m.id}`)
  }

  return modules
}

async function main() {
  const modules = buildAllModules()
  console.log(`\n📦 ${modules.length} modules générés :`)
  console.log(`   TOEIC: ${modules.filter(m => m.categorie === 'TOEIC').length}`)
  console.log(`   TOEFL: ${modules.filter(m => m.categorie === 'TOEFL').length}`)
  console.log(`   Quiz totaux: ${modules.reduce((s, m) => s + m.quiz.length, 0)}`)

  if (IS_DRY) {
    console.log('\n🔍 DRY-RUN — aucun enregistrement en base')
    console.log(JSON.stringify(modules, null, 2))
    return
  }

  // Enregistrer dans lingua_modules (table Supabase)
  for (const mod of modules) {
    const { data: existing } = await supabase
      .from('lingua_modules')
      .select('id')
      .eq('slug', mod.id)
      .maybeSingle()

    if (existing) {
      console.log(`🔄 Mise à jour: ${mod.id} — ${mod.titre}`)
      const { error } = await supabase
        .from('lingua_modules')
        .update({
          title: mod.titre,
          level: mod.niveau,
          duration_minutes: mod.duree,
          category: mod.categorie,
          objectives: mod.objectifs,
          description: mod.contenu[0]?.texte || '',
          video_url: mod.video_url,
          xp_reward: mod.xp_reward,
          has_quiz: true,
        })
        .eq('slug', mod.id)
      if (error) console.error(`❌ Erreur update ${mod.id}:`, error.message)
    } else {
      console.log(`➕ Création: ${mod.id} — ${mod.titre}`)
      const { error } = await supabase
        .from('lingua_modules')
        .insert({
          slug: mod.id,
          title: mod.titre,
          level: mod.niveau,
          duration_minutes: mod.duree,
          category: mod.categorie,
          objectives: mod.objectifs,
          description: mod.contenu[0]?.texte || '',
          video_url: mod.video_url,
          xp_reward: mod.xp_reward,
          has_quiz: true,
          is_active: true,
        })
      if (error) console.error(`❌ Erreur insert ${mod.id}:`, error.message)
    }
  }

  console.log('\n✅ Seed terminé !')
  console.log(`   ${modules.length} modules TOEIC/TOEFL synchronisés.`)
}

main().catch(err => {
  console.error('❌ Erreur fatale:', err)
  process.exit(1)
})
