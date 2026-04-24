/**
 * Génère la présentation PPTX et le PDF de AGTM Digital Academy
 * 
 * Usage : node docs/presentation/generate.js
 * Prérequis : npm install puppeteer officegen
 */

const puppeteer = require('puppeteer')
const officegen = require('officegen')
const fs = require('fs')
const path = require('path')

const OUT_DIR = path.join(__dirname)
const HTML_FILE = path.join(OUT_DIR, 'index.html')
const PDF_FILE = path.join(OUT_DIR, 'AGTM_Presentation.pdf')
const PPTX_FILE = path.join(OUT_DIR, 'AGTM_Presentation.pptx')

async function generatePDF() {
  console.log('📄 Génération du PDF...')
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
  const page = await browser.newPage()
  
  // Lire le HTML et remplacer les URLs
  let html = fs.readFileSync(HTML_FILE, 'utf8')
  // Enlever les polices Google pour le PDF offline
  html = html.replace('@import url(https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap);', '')
  // Ajouter une police de secours
  html = html.replace('font-family:\'Inter\',sans-serif;', 'font-family:sans-serif;')

  await page.setContent(html, { waitUntil: 'networkidle0' })
  await page.pdf({
    path: PDF_FILE,
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    displayHeaderFooter: false,
  })
  await browser.close()
  console.log(`✅ PDF créé : ${PDF_FILE}`)
}

async function generatePPTX() {
  console.log('📊 Génération du PPTX...')
  const pptx = officegen('pptx')
  pptx.setTitle('AGTM Digital Academy — Présentation Investisseurs')
  pptx.setSubject('Plateforme EdTech Africaine')
  pptx.setAuthor('AGTM Digital Academy')

  // Styles
  const gold = 'D4A017'
  const dark = '060E1A'
  const text = 'D4C8A0'
  const light = '8AAAC0'

  function addSlide(title, contentLines, opts = {}) {
    const slide = pptx.makeNewSlide()
    if (opts.hero) {
      // Slide hero
      slide.addText(title, { x: '5%', y: '15%', w: '90%', h: '20%', font_size: 36, font_face: 'Arial', color: gold, bold: true, align: 'center' })
      contentLines.forEach((line, i) => {
        slide.addText(line, { x: '10%', y: 38 + i * 8 + '%', w: '80%', h: '7%', font_size: 16, font_face: 'Arial', color: light, align: 'center' })
      })
    } else {
      // Slide standard
      slide.addText(title, { x: '5%', y: '5%', w: '90%', h: '12%', font_size: 26, font_face: 'Arial', color: gold, bold: true })
      contentLines.forEach((line, i) => {
        const isHeader = line.startsWith('##')
        slide.addText(isHeader ? line.replace('##','').trim() : line, {
          x: '5%', y: 18 + i * 7 + '%', w: '90%', h: '6%',
          font_size: isHeader ? 18 : 14, font_face: 'Arial',
          color: isHeader ? 'E8B84B' : light, bold: isHeader,
          bullet: !isHeader
        })
      })
    }
  }

  // Slide 1 — Hero
  addSlide('AGTM DIGITAL ACADEMY', [
    "L'Anglais pour Tous les Africains",
    'Plateforme EdTech panafricaine • IA • WhatsApp • Certifiante',
    '',
    'Prêt au lancement — En recherche de partenaires',
  ], { hero: true })

  // Slide 2 — Problème & Solution
  addSlide('Le Problème & Notre Solution', [
    '## LE PROBLÈME',
    '95% des francophones africains sans accès à une formation d\'anglais de qualité',
    'Écoles rares, chères, inexistantes hors des capitales',
    'Plateformes existantes pas adaptées au contexte africain (mobile, WhatsApp, bande passante)',
    '',
    '## NOTRE SOLUTION',
    'Plateforme complète avec IA multi-modèles, WhatsApp comme canal principal',
    'Préparation TOEIC, TOEFL, BAC, BEPC — examens locaux ET internationaux',
    'Interface mobile-first, PWA, fonctionnement hors-ligne partiel',
  ])

  // Slide 3 — Chiffres Clés
  addSlide('La Plateforme en Chiffres', [
    '📚 300+ modules pédagogiques (Grammaire, Vocabulaire, Business, Examens)',
    '🌍 6 niveaux CECRL (A1 → C2)',
    '🎯 20 modules TOEIC + 10 modules TOEFL',
    '🏆 9 modules BAC + 9 modules BEPC',
    '🤖 4 modèles IA (Claude, DeepSeek, Groq, Mixtral)',
    '💬 8 templates WhatsApp Meta approuvés',
    '📱 Application PWA installable sur mobile',
    '🔐 5 rôles utilisateur (Admin, Formateur, Secrétaire, etc.)',
  ])

  // Slide 4 — Fonctionnalités IA
  addSlide('Intelligence Artificielle', [
    '🧠 Génération automatique de quiz (Cliquez "Générer TOEIC/TOEFL")',
    '💬 Assistant pédagogique multi-modèles avec recherche web',
    '📝 Correction automatique des évaluations',
    '🔐 Permissions IA configurables par utilisateur et par plan',
    '🎯 Quiz adaptés au niveau CECRL de l\'apprenant',
    '📊 Limites de tokens quotidiennes gérables',
  ])

  // Slide 5 — WhatsApp Academy
  addSlide('WhatsApp Academy', [
    '📱 8 templates Meta Business approuvés avec variables dynamiques',
    '🔄 Webhook Twilio entrant → traitement IA → réponse automatique',
    '👥 Sélecteur de contacts intelligent selon le template',
    '📬 Messages traçables dans le dashboard admin',
    '🎯 Templates : Étudiant, Nouveau, Paiement, Devoir, Promo, Certificat, Abonnement, Note',
  ])

  // Slide 6 — Marché
  addSlide('Opportunité de Marché', [
    '🌍 350M+ francophones en Afrique — marché en croissance',
    '📈 EdTech africaine : +35% de croissance annuelle',
    '🎓 L\'anglais = clé de l\'employabilité et des études à l\'étranger',
    '📱 WhatsApp : 95% de pénétration mobile en Afrique',
    '🏗️ Aucun leader panafricain de l\'anglais n\'a encore émergé',
    '💡 L\'IA réduit le coût de production de contenu éducatif de 80%',
  ])

  // Slide 7 — Stack Technique
  addSlide('Stack Technique', [
    'Frontend : React 18 + Vite + Tailwind CSS + PWA',
    'Backend : Supabase + PostgreSQL (Row Level Security)',
    'Hosting : Netlify (Functions + Edge Functions)',
    'IA : Anthropic Claude, DeepSeek, Groq (Llama, Mixtral, Gemma)',
    'Recherche : Tavily + Brave Search API',
    'Messagerie : Twilio WhatsApp + Meta Cloud API',
    'Contenu : YouTube API + Podcasts',
  ])

  // Slide 8 — Modèle Économique
  addSlide('Modèle Économique', [
    '🎓 Abonnement UNI : accès illimité à tous les modules + IA',
    '🏆 Formations certifiantes : TOEIC, TOEFL, BAC, BEPC',
    '💼 Business English : formules entreprises (B2B)',
    '📹 Sessions live : cours en visioconférence avec formateurs',
    '📊 Rapports financiers automatisés dans le dashboard admin',
  ])

  // Slide 9 — Contact
  addSlide('Nous Contacter', [
    'AGTM Digital Academy',
    '',
    '📧 contact@agtm.ci',
    '📱 +225 07 09 26 98 80',
    '',
    'Prêt à scaler — Partenaire recherché',
    '',
    'Document généré le 24 avril 2026',
  ], { hero: true })

  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(PPTX_FILE)
    stream.on('close', resolve)
    stream.on('error', reject)
    pptx.generate(stream)
  })
  console.log(`✅ PPTX créé : ${PPTX_FILE}`)
}

async function main() {
  const args = process.argv.slice(2)
  const doPDF = args.includes('--pdf') || args.length === 0
  const doPPTX = args.includes('--pptx') || args.length === 0

  if (doPPTX) {
    try {
      await generatePPTX()
    } catch(e) {
      console.error('❌ Erreur PPTX:', e.message)
    }
  }
  if (doPDF) {
    try {
      await generatePDF()
    } catch(e) {
      console.error('❌ Erreur PDF:', e.message)
    }
  }

  console.log('\n✅ Génération terminée !')
  console.log(`   📄 HTML:  ${HTML_FILE}`)
  if (doPPTX) console.log(`   📊 PPTX:  ${PPTX_FILE}`)
  if (doPDF) console.log(`   📕 PDF:   ${PDF_FILE}`)
}

main()
