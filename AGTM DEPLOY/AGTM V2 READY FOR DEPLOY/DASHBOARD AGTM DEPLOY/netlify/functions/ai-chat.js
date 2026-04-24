// ============================================================
//  AGTM Digital Academy — Assistant IA v4
//  Netlify Function: ai-chat.js
//  Assistante administrative complète avec tool use
//  Outils : web, marketing, rapports, présences, devoirs,
//           messagerie, certificats (avec contrôles RBAC)
//  © 2026 AGTM Academy — Issa Bamba
// ============================================================

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const GROQ_API_URL      = 'https://api.groq.com/openai/v1/chat/completions'
const SUPABASE_URL      = process.env.SUPABASE_URL
const SUPABASE_SERVICE  = process.env.SUPABASE_SERVICE_KEY
const ANTHROPIC_KEY     = process.env.ANTHROPIC_API_KEY
const BRAVE_KEY         = process.env.BRAVE_SEARCH_API_KEY  || ''
const TAVILY_KEY        = process.env.TAVILY_API_KEY        || ''
const GROQ_KEY          = process.env.GROQ_API_KEY          || ''
const TWILIO_ACCOUNT_SID    = process.env.TWILIO_ACCOUNT_SID      || ''  // Twilio Account SID (ACxxx...)
const TWILIO_AUTH_TOKEN     = process.env.TWILIO_AUTH_TOKEN       || ''  // Twilio Auth Token
const TWILIO_WHATSAPP_FROM  = process.env.TWILIO_WHATSAPP_FROM    || ''  // numéro expéditeur ex: +14155238886 (sandbox ou numéro approuvé)
const TWILIO_TEMPLATE_ETUDIANT = process.env.TWILIO_TEMPLATE_ETUDIANT || ''  // Content SID template étudiant actuel   (HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
const TWILIO_TEMPLATE_NOUVEAU  = process.env.TWILIO_TEMPLATE_NOUVEAU  || ''  // Content SID template nouvel étudiant/prospect (HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)

// ── Helpers Supabase (service key) ──────────────────────────
async function sbQuery(path, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${path}${params ? '?' + params : ''}`
  const res = await fetch(url, {
    headers: {
      apikey:        SUPABASE_SERVICE,
      Authorization: `Bearer ${SUPABASE_SERVICE}`,
      'Content-Type': 'application/json'
    }
  })
  if (!res.ok) throw new Error(`Supabase error ${res.status}: ${path}`)
  return res.json()
}

async function sbInsert(path, body) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey:        SUPABASE_SERVICE,
      Authorization: `Bearer ${SUPABASE_SERVICE}`,
      'Content-Type': 'application/json',
      Prefer:        'return=representation'
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase insert error ${res.status}: ${text}`)
  }
  return res.json()
}

async function sbUpsert(path, body, onConflict) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey:        SUPABASE_SERVICE,
      Authorization: `Bearer ${SUPABASE_SERVICE}`,
      'Content-Type': 'application/json',
      Prefer:        `resolution=merge-duplicates,return=minimal`
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase upsert error ${res.status}: ${text}`)
  }
}

async function sbUpdate(path, filter, body) {
  const url = `${SUPABASE_URL}/rest/v1/${path}?${filter}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey:        SUPABASE_SERVICE,
      Authorization: `Bearer ${SUPABASE_SERVICE}`,
      'Content-Type': 'application/json',
      Prefer:        'return=representation'
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase update error ${res.status}: ${text}`)
  }
  return res.json()
}

// ── Vérification JWT ─────────────────────────────────────────
async function verifyJWT(token) {
  const url = `${SUPABASE_URL}/auth/v1/user`
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_SERVICE, Authorization: `Bearer ${token}` }
  })
  if (!res.ok) return null
  return res.json()
}

// ── Config IA ────────────────────────────────────────────────
async function loadAIConfig() {
  const rows = await sbQuery('ai_config', 'select=cle,valeur')
  const cfg = {}
  for (const r of rows) cfg[r.cle] = r.valeur
  return cfg
}

// ── Connaissances pédagogiques ───────────────────────────────
async function loadKnowledge(userNiveau) {
  const baseCategories = ['infos_ecole', 'pedagogie', 'faq', 'grammaire']
  const params = 'select=categorie,niveau,titre,contenu&actif=eq.true&order=priorite.asc&limit=20'
  const rows = await sbQuery('ai_knowledge', params)
  const relevant = rows.filter(r => {
    if (baseCategories.includes(r.categorie)) return true
    if (!userNiveau || !r.niveau) return r.categorie !== 'exercices'
    return r.niveau === userNiveau || r.niveau === null
  })
  return relevant.map(r => `### ${r.titre}\n${r.contenu}`).join('\n\n')
}

// ── Config marketing ─────────────────────────────────────────
async function loadMarketingConfig() {
  const rows = await sbQuery('marketing_config', 'select=cle,valeur')
  const cfg = {}
  for (const r of rows) cfg[r.cle] = r.valeur
  return cfg
}

// ── URLs dans les résultats de recherche ─────────────────────
function extractUrls(text) {
  const urlRegex = /🔗[^\s]*\s*(https?:\/\/[^\s\n]+)/g
  const urls = []
  let m
  while ((m = urlRegex.exec(text)) !== null) urls.push(m[1].trim())
  return urls
}

// ── Wikipedia ────────────────────────────────────────────────
async function searchWikipedia(query, lang = 'fr') {
  try {
    const ua = 'AGTMAcademy/2.0 (assistant administratif; contact@agtmacademy.ci)'
    const searchParams = new URLSearchParams({
      action: 'query', list: 'search', srsearch: query,
      format: 'json', utf8: '1', srlimit: '2', srnamespace: '0'
    })
    const searchRes = await fetch(
      `https://${lang}.wikipedia.org/w/api.php?${searchParams}`,
      { headers: { 'User-Agent': ua } }
    )
    if (!searchRes.ok) return null
    const searchData = await searchRes.json()
    const pages = searchData.query?.search || []
    if (!pages.length) return null

    const title = pages[0].title
    const extractParams = new URLSearchParams({
      action: 'query', prop: 'extracts',
      exintro: '1', explaintext: '1', exsentences: '6',
      titles: title, format: 'json', utf8: '1'
    })
    const extractRes = await fetch(
      `https://${lang}.wikipedia.org/w/api.php?${extractParams}`,
      { headers: { 'User-Agent': ua } }
    )
    if (!extractRes.ok) return null
    const extractData = await extractRes.json()
    const pagesData = extractData.query?.pages || {}
    const page = Object.values(pagesData)[0]
    if (!page?.extract) return null

    const snippet = page.extract.substring(0, 1400).trim()
    const wikiUrl = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title)}`
    return {
      text: `${page.title} (Wikipedia ${lang.toUpperCase()})\n\n${snippet}\n\n🔗 Source : ${wikiUrl}`,
      urls: [wikiUrl]
    }
  } catch (e) {
    console.error('Wikipedia error:', e.message)
    return null
  }
}

// ── Tavily Search (primaire — optimisé IA) ───────────────────
async function searchTavily(query) {
  if (!TAVILY_KEY) return null
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key:             TAVILY_KEY,
        query,
        search_depth:        'advanced',
        include_answer:      true,
        include_raw_content: false,
        max_results:         5
      })
    })
    if (!res.ok) return null
    const data = await res.json()
    let text = ''
    if (data.answer) text += `Réponse directe : ${data.answer}\n\n`
    const results = (data.results || []).slice(0, 4)
    if (results.length) {
      text += results.map(r => `${r.title}\n${(r.content || '').substring(0, 350)}\n🔗 ${r.url}`).join('\n\n')
    }
    if (!text.trim()) return null
    return { text, urls: results.map(r => r.url) }
  } catch (e) {
    console.error('Tavily search error:', e.message)
    return null
  }
}

// ── Brave Search (secondaire — fallback) ─────────────────────
async function searchBrave(query) {
  if (!BRAVE_KEY) return null
  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=3&search_lang=fr&country=CI&safesearch=moderate`
    const res = await fetch(url, {
      headers: {
        'Accept':               'application/json',
        'Accept-Encoding':      'gzip',
        'X-Subscription-Token': BRAVE_KEY
      }
    })
    if (!res.ok) return null
    const data = await res.json()
    const results = (data.web?.results || []).slice(0, 3)
    if (!results.length) return null
    return {
      text: results.map(r => `${r.title}\n${r.description || ''}\n🔗 ${r.url}`).join('\n\n'),
      urls: results.map(r => r.url)
    }
  } catch (e) {
    console.error('Brave search error:', e.message)
    return null
  }
}

// ────────────────────────────────────────────────────────────
//  OUTILS ADMINISTRATIFS (service key — RBAC enforced in code)
// ────────────────────────────────────────────────────────────

// Rôles administratifs complets
const ADMIN_ROLES = ['admin', 'secretaire']
const ADMIN_DIR   = ['admin', 'secretaire', 'directeur_pedagogique', 'sous_directeur_pedagogique']
const DIR_ROLES   = ['directeur_pedagogique', 'sous_directeur_pedagogique']

// Résoudre un utilisateur par nom (pour envoi de messages)
async function resolveUser(nameQuery, roleHint) {
  const nameParts = (nameQuery || '').trim().split(/\s+/)
  const lastName  = nameParts[nameParts.length - 1] || nameQuery

  // Chercher d'abord dans utilisateurs (staff)
  const staffRows = await sbQuery('utilisateurs',
    `select=id,nom,prenom,role,email&nom=ilike.%25${encodeURIComponent(lastName)}%25&limit=5`)
  if (staffRows.length) return { type: 'staff', rows: staffRows }

  // Chercher dans etudiants
  const etudRows = await sbQuery('etudiants',
    `select=id,nom,prenom,email&nom=ilike.%25${encodeURIComponent(lastName)}%25&limit=5`)
  if (etudRows.length) return { type: 'etudiant', rows: etudRows }

  // Chercher par rôle si fourni
  if (roleHint) {
    const byRole = await sbQuery('utilisateurs',
      `select=id,nom,prenom,role,email&role=eq.${encodeURIComponent(roleHint)}&limit=20`)
    if (byRole.length) return { type: 'staff_role', rows: byRole }
  }

  return null
}

// ── Outil : lire_rapports_seances ───────────────────────────
async function toolLireRapports(input, userId, role, userInfo) {
  try {
    let params = 'select=id,date_seance,formateur_nom,classe_nom,theme,nb_presents,nb_absents_non_justifies,nb_absents_justifies,observations,progression,created_at&order=date_seance.desc&limit=25'

    // Formateur : ses propres rapports uniquement
    if (role === 'formateur') {
      params += `&formateur_id=eq.${userId}`
    }

    // Filtre optionnel par classe
    if (input.classe_nom) {
      params += `&classe_nom=ilike.%25${encodeURIComponent(input.classe_nom)}%25`
    }
    // Filtre optionnel par formateur (admin/DP seulement)
    if (input.formateur_nom && ADMIN_DIR.includes(role)) {
      params += `&formateur_nom=ilike.%25${encodeURIComponent(input.formateur_nom)}%25`
    }
    // Filtre par période
    if (input.date_debut) params += `&date_seance=gte.${input.date_debut}`
    if (input.date_fin)   params += `&date_seance=lte.${input.date_fin}`

    const rapports = await sbQuery('rapports_seances', params)
    if (!rapports.length) return { text: 'Aucun rapport de séance trouvé pour ces critères.', urls: [] }

    const totalPresents = rapports.reduce((s, r) => s + (r.nb_presents || 0), 0)
    const totalAbsents  = rapports.reduce((s, r) => s + (r.nb_absents_non_justifies || 0) + (r.nb_absents_justifies || 0), 0)

    const lines = [
      `RAPPORTS DE SÉANCES — ${rapports.length} rapport(s) trouvé(s)`,
      `Total cumulé : ${totalPresents} présence(s), ${totalAbsents} absence(s)\n`
    ]

    rapports.forEach((r, i) => {
      const absNJ = r.nb_absents_non_justifies || 0
      const absJ  = r.nb_absents_justifies || 0
      lines.push(
        `${i+1}. ${r.date_seance || '—'} | ${r.classe_nom || '—'} | Formateur: ${r.formateur_nom || '—'}`,
        `   Thème: ${r.theme || '—'}`,
        `   Présents: ${r.nb_presents || 0} | Absents NJ: ${absNJ} | Absents J: ${absJ}`,
        `   Progression: ${r.progression || '—'}`,
        r.observations ? `   Observations: ${r.observations}` : '',
        ''
      )
    })

    return { text: lines.filter(Boolean).join('\n'), urls: [] }
  } catch (e) {
    return { text: `Erreur lecture rapports : ${e.message}`, urls: [] }
  }
}

// ── Outil : lire_presences_absences ─────────────────────────
async function toolLirePresences(input, userId, role) {
  try {
    let seanceIds = null

    // Formateur : récupérer ses classes d'abord
    if (role === 'formateur') {
      const classes = await sbQuery('classes', `select=id&formateur_id=eq.${userId}`)
      if (!classes.length) return { text: 'Aucune classe trouvée pour ce formateur.', urls: [] }
      const classIds = classes.map(c => c.id)

      // Récupérer les séances de ces classes
      let seanceParams = `select=id&classe_id=in.(${classIds.join(',')})&limit=100`
      if (input.date_debut) seanceParams += `&date_seance=gte.${input.date_debut}`
      if (input.date_fin)   seanceParams += `&date_seance=lte.${input.date_fin}`
      const seances = await sbQuery('seances', seanceParams)
      seanceIds = seances.map(s => s.id)
      if (!seanceIds.length) return { text: 'Aucune séance trouvée pour vos classes sur cette période.', urls: [] }
    }

    // Construire la requête présences
    let presParams = 'select=present,seance_id,etudiant_id,seances(date_seance,sujet,enseignant,classe_id,classes(nom)),etudiants(nom,prenom)&order=seance_id.desc&limit=200'
    if (seanceIds) presParams += `&seance_id=in.(${seanceIds.join(',')})`
    if (input.date_debut) presParams += `&seances.date_seance=gte.${input.date_debut}`

    const presences = await sbQuery('presences', presParams)
    if (!presences.length) return { text: 'Aucune présence enregistrée pour les critères donnés.', urls: [] }

    const presents = presences.filter(p => Number(p.present) === 1)
    const absents  = presences.filter(p => Number(p.present) === 0)
    const tauxGlobal = presences.length ? Math.round(presents.length / presences.length * 100) : 0

    // Regrouper par étudiant
    const byEtudiant = {}
    presences.forEach(p => {
      const nom = p.etudiants ? `${p.etudiants.prenom} ${p.etudiants.nom}` : `ID:${p.etudiant_id}`
      if (!byEtudiant[nom]) byEtudiant[nom] = { total: 0, presents: 0 }
      byEtudiant[nom].total++
      if (Number(p.present) === 1) byEtudiant[nom].presents++
    })

    // Étudiants avec taux d'absence élevé (> 30%)
    const alarmes = Object.entries(byEtudiant)
      .map(([nom, s]) => ({ nom, taux: Math.round(s.presents / s.total * 100), absences: s.total - s.presents, total: s.total }))
      .filter(e => e.taux < 70)
      .sort((a, b) => a.taux - b.taux)

    const lines = [
      `POINT DES PRÉSENCES / ABSENCES`,
      `Total enregistrements : ${presences.length} | Présents : ${presents.length} | Absents : ${absents.length}`,
      `Taux de présence global : ${tauxGlobal}%\n`
    ]

    if (alarmes.length) {
      lines.push(`ALERTES ABSENCES (taux < 70%) : ${alarmes.length} étudiant(s)`)
      alarmes.slice(0, 10).forEach(e => {
        lines.push(`  ⚠ ${e.nom} : ${e.taux}% de présence (${e.absences} absence(s) sur ${e.total} séances)`)
      })
      lines.push('')
    }

    // Stats par classe (si données disponibles)
    const byClasse = {}
    presences.forEach(p => {
      const cls = p.seances?.classes?.nom || `Classe #${p.seances?.classe_id || '?'}`
      if (!byClasse[cls]) byClasse[cls] = { total: 0, presents: 0 }
      byClasse[cls].total++
      if (Number(p.present) === 1) byClasse[cls].presents++
    })

    const classeLines = Object.entries(byClasse)
      .map(([cls, s]) => `  ${cls} : ${Math.round(s.presents/s.total*100)}% présence (${s.presents}/${s.total})`)
    if (classeLines.length) {
      lines.push('TAUX PAR CLASSE :')
      lines.push(...classeLines)
    }

    return { text: lines.join('\n'), urls: [] }
  } catch (e) {
    return { text: `Erreur lecture présences : ${e.message}`, urls: [] }
  }
}

// ── Outil : lire_devoirs_soumis ──────────────────────────────
async function toolLireDevoirs(input, userId, role, userInfo) {
  try {
    let params = 'select=id,etudiant_nom,classe_nom,formateur_nom,titre,statut,note,observations,created_at,date_rendu&order=created_at.desc&limit=30'

    // Filtre statut
    if (input.statut && ['Soumis','Corrigé','En attente','En retard'].includes(input.statut)) {
      params += `&statut=eq.${encodeURIComponent(input.statut)}`
    }
    // Formateur : filtrer par son nom (approximatif)
    if (role === 'formateur' && userInfo.nom) {
      params += `&formateur_nom=ilike.%25${encodeURIComponent(userInfo.nom)}%25`
    }
    // Filtre classe
    if (input.classe_nom) {
      params += `&classe_nom=ilike.%25${encodeURIComponent(input.classe_nom)}%25`
    }

    const devoirs = await sbQuery('devoirs', params)
    if (!devoirs.length) return { text: 'Aucun devoir trouvé pour ces critères.', urls: [] }

    const soumis   = devoirs.filter(d => d.statut === 'Soumis').length
    const corriges = devoirs.filter(d => d.statut === 'Corrigé').length
    const attente  = devoirs.filter(d => d.statut === 'En attente').length
    const retard   = devoirs.filter(d => d.statut === 'En retard').length

    const lines = [
      `DEVOIRS — ${devoirs.length} devoir(s) trouvé(s)`,
      `En attente : ${attente} | Soumis (à corriger) : ${soumis} | Corrigés : ${corriges} | En retard : ${retard}\n`
    ]

    devoirs.forEach((d, i) => {
      lines.push(
        `${i+1}. [${d.statut || '—'}] ${d.etudiant_nom || '—'} — ${d.titre || '—'}`,
        `   Classe: ${d.classe_nom || '—'} | Formateur: ${d.formateur_nom || '—'}`,
        d.note != null ? `   Note: ${d.note}/20` : '',
        d.observations ? `   Observations: ${d.observations}` : '',
        `   Soumis le: ${d.created_at ? d.created_at.substring(0,10) : '—'}`,
        ''
      )
    })

    return { text: lines.filter(l => l !== undefined).join('\n'), urls: [] }
  } catch (e) {
    return { text: `Erreur lecture devoirs : ${e.message}`, urls: [] }
  }
}

// ── Outil : lire_messages_recus ──────────────────────────────
async function toolLireMessages(input, userId, role, userInfo) {
  try {
    const limit = Math.min(input.limit || 10, 20)
    const nonLuFilter = input.non_lus_seulement ? '&lu=eq.false' : ''

    // Table principale messages (staff → staff ou admin → étudiant par UUID)
    const paramsNew = `select=id,expediteur_nom,expediteur_role,sujet,contenu,lu,created_at&destinataire_user_id=eq.${userId}&order=created_at.desc&limit=${limit}${nonLuFilter}`
    const messagesNew = await sbQuery('messages', paramsNew).catch(() => [])

    // Pour les étudiants : aussi lire messages_etudiants (admin → étudiant par etudiant_id)
    let messagesOld = []
    if (role === 'etudiant') {
      let etudiantId = userInfo?.etudiant_id || null

      // Si l'id n'est pas encore résolu (cas improbable), chercher par email puis par nom
      if (!etudiantId && userInfo?.email) {
        const rows = await sbQuery('etudiants', `select=id&email=ilike.${encodeURIComponent(userInfo.email)}&limit=1`).catch(() => [])
        if (rows[0]) etudiantId = rows[0].id
      }
      if (!etudiantId && userInfo?.prenom && userInfo?.nom) {
        const rows = await sbQuery('etudiants', `select=id&prenom=ilike.${encodeURIComponent(userInfo.prenom)}&nom=ilike.${encodeURIComponent(userInfo.nom)}&limit=1`).catch(() => [])
        if (rows[0]) etudiantId = rows[0].id
      }

      if (etudiantId) {
        const paramsOld = `select=id,expediteur_nom,expediteur_role,sujet,contenu,lu,created_at&etudiant_id=eq.${etudiantId}&order=created_at.desc&limit=${limit}${nonLuFilter}`
        messagesOld = await sbQuery('messages_etudiants', paramsOld).catch(() => [])
      }
    }

    // Fusionner et trier par date décroissante
    const all = [...messagesNew, ...messagesOld]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)

    if (!all.length) return { text: 'Aucun message reçu dans votre boîte de réception.', urls: [] }

    const nonLus = all.filter(m => !m.lu).length
    const lines = [
      `MESSAGERIE — ${all.length} message(s) | ${nonLus} non lu(s)\n`
    ]

    all.forEach((m, i) => {
      const date    = m.created_at ? m.created_at.substring(0, 10) : '—'
      const luMark  = m.lu ? '📭' : '📬'
      const contenu = (m.contenu || '').substring(0, 200)
      const suite   = (m.contenu || '').length > 200 ? '…' : ''
      lines.push(
        `${luMark} ${i+1}. De: ${m.expediteur_nom || '—'} (${m.expediteur_role || '—'}) — ${date}`,
        `   Sujet: ${m.sujet || '—'}`,
        `   "${contenu}${suite}"`,
        ''
      )
    })

    return { text: lines.join('\n'), urls: [] }
  } catch (e) {
    return { text: `Erreur lecture messages : ${e.message}`, urls: [] }
  }
}

// ── Outil : envoyer_message ──────────────────────────────────
async function toolEnvoyerMessage(input, userId, userInfo, adminActions, role) {
  try {
    const { destinataire, destinataire_role, sujet, contenu } = input
    if (!sujet || !contenu) return { text: 'Sujet et contenu du message sont requis.', urls: [] }

    const expedNom  = `${userInfo.prenom || ''} ${userInfo.nom || ''}`.trim() || 'AGTM'
    const expedRole = userInfo.role || role || 'etudiant'
    const now       = new Date().toISOString()
    const sent      = []

    // ── Restrictions par rôle ─────────────────────────────────
    // Formateur : peut écrire à admin, secrétaire, ses étudiants
    // Étudiant : peut écrire à admin et secrétaire uniquement
    const rolesAutorises = {
      formateur: ['admin', 'secretaire', 'etudiant'],
      etudiant:  ['admin', 'secretaire']
    }
    const roleCtrl = rolesAutorises[expedRole]

    if (roleCtrl) {
      const rolesCibles = destinataire_role
        ? [destinataire_role]
        : destinataire
          ? null  // on vérifie après résolution
          : []
      if (Array.isArray(rolesCibles) && rolesCibles.length && !rolesCibles.every(r => roleCtrl.includes(r))) {
        return { text: `En tant que ${expedRole}, vous pouvez uniquement écrire à : ${roleCtrl.join(', ')}.`, urls: [] }
      }
    }

    // Résoudre le destinataire
    let targets = []

    if (destinataire_role && !destinataire) {
      // Envoi à tous les membres d'un rôle
      const rows = await sbQuery('utilisateurs', `select=id,nom,prenom,role,email&role=eq.${encodeURIComponent(destinataire_role)}&limit=50`)
      // Vérification RBAC pour formateur/étudiant
      if (roleCtrl && !roleCtrl.includes(destinataire_role)) {
        return { text: `Vous n'êtes pas autorisé à écrire à un "${destinataire_role}".`, urls: [] }
      }
      targets = rows.map(r => ({ type: 'staff', ...r }))
    } else if (destinataire) {
      const resolved = await resolveUser(destinataire, destinataire_role)
      if (!resolved) return { text: `Destinataire "${destinataire}" introuvable.`, urls: [] }

      // Vérification RBAC
      if (roleCtrl) {
        const resolvedRole = resolved.rows[0]?.role || (resolved.type === 'etudiant' ? 'etudiant' : 'unknown')
        if (!roleCtrl.includes(resolvedRole) && !roleCtrl.includes(resolved.type)) {
          return { text: `En tant que ${expedRole}, vous n'êtes pas autorisé à envoyer un message à ce destinataire.`, urls: [] }
        }
      }

      if (resolved.type === 'etudiant') {
        for (const etud of resolved.rows) {
          await sbInsert('messages_etudiants', {
            etudiant_id:     etud.id,
            expediteur_role: expedRole,
            expediteur_nom:  expedNom,
            sujet,
            contenu,
            lu: false,
            created_at: now
          })
          sent.push(`${etud.prenom || ''} ${etud.nom || ''} (étudiant)`)
        }
        if (sent.length) {
          adminActions.push({ type: 'message_envoye', destinataires: sent, sujet })
          return { text: `Message envoyé à ${sent.join(', ')}.\nSujet : "${sujet}"`, urls: [] }
        }
      } else {
        targets = resolved.rows.map(r => ({ type: 'staff', ...r }))
      }
    } else {
      return { text: 'Précisez un destinataire (nom) ou un rôle de destination.', urls: [] }
    }

    // Envoyer aux membres du staff
    for (const t of targets) {
      if (t.id === userId) continue
      await sbInsert('messages', {
        expediteur_user_id:   userId,
        expediteur_nom:       expedNom,
        expediteur_role:      expedRole,
        destinataire_user_id: t.id,
        destinataire_nom:     `${t.prenom || ''} ${t.nom || ''}`.trim(),
        destinataire_role:    t.role || destinataire_role || '—',
        sujet,
        contenu,
        lu: false,
        created_at: now
      })
      sent.push(`${t.prenom || ''} ${t.nom || ''}`.trim() + (t.role ? ` (${t.role})` : ''))
    }

    if (!sent.length) return { text: 'Aucun destinataire valide trouvé. Message non envoyé.', urls: [] }

    adminActions.push({ type: 'message_envoye', destinataires: sent, sujet })
    return { text: `Message envoyé à ${sent.length} destinataire(s) :\n${sent.map(s => '- ' + s).join('\n')}\nSujet : "${sujet}"`, urls: [] }
  } catch (e) {
    return { text: `Erreur envoi message : ${e.message}`, urls: [] }
  }
}

// ── Outil : generer_certificat ───────────────────────────────
async function toolGenererCertificat(input, userId, userInfo, adminActions) {
  try {
    const { nom, prenom, niveau, score, email, telephone, etablissement } = input
    if (!nom || !prenom || !niveau) return { text: 'Nom, prénom et niveau sont requis pour générer un certificat.', urls: [] }

    const niveaux = ['A1','A2','B1','B2','C1','C2']
    if (!niveaux.includes(niveau)) return { text: `Niveau invalide. Valeurs acceptées : ${niveaux.join(', ')}`, urls: [] }

    const scoreNum = parseFloat(score) || 0
    if (scoreNum < 0 || scoreNum > 20) return { text: 'Le score doit être compris entre 0 et 20.', urls: [] }

    const code    = 'AGTM-' + Date.now().toString(36).toUpperCase().slice(-6)
    const dateStr = new Date().toISOString().split('T')[0]

    const rows = await sbInsert('certificats_niveau', {
      nom:            nom.toUpperCase(),
      prenom,
      email:          email || null,
      telephone:      telephone || null,
      etablissement:  etablissement || 'AGTM Digital Academy',
      niveau_obtenu:  niveau,
      score:          scoreNum,
      score_max:      20,
      nb_bonnes:      Math.round(scoreNum),
      nb_questions:   20,
      code_certificat: code,
      date_test:      dateStr,
    })

    adminActions.push({ type: 'certificat_genere', code, niveau, nom: `${prenom} ${nom}`, date: dateStr })
    return {
      text: `Certificat généré avec succès !\n\nNom : ${prenom} ${nom.toUpperCase()}\nNiveau : ${niveau}\nScore : ${scoreNum}/20\nCode : ${code}\nDate : ${dateStr}\n\nLe certificat est maintenant disponible dans la section "Certificats" du dashboard.`,
      urls: []
    }
  } catch (e) {
    return { text: `Erreur génération certificat : ${e.message}`, urls: [] }
  }
}

// ── Outil : lire_certificats ─────────────────────────────────
async function toolLireCertificats(input, userId, role) {
  try {
    let params = 'select=id,nom,prenom,niveau_obtenu,score,score_max,code_certificat,date_test,email,etablissement&order=date_test.desc&limit=25'

    if (input.niveau) params += `&niveau_obtenu=eq.${encodeURIComponent(input.niveau)}`
    if (input.nom)    params += `&nom=ilike.%25${encodeURIComponent(input.nom.toUpperCase())}%25`

    const certs = await sbQuery('certificats_niveau', params)
    if (!certs.length) return { text: 'Aucun certificat trouvé pour ces critères.', urls: [] }

    const byNiveau = {}
    certs.forEach(c => {
      const niv = c.niveau_obtenu || '?'
      byNiveau[niv] = (byNiveau[niv] || 0) + 1
    })
    const repartition = Object.entries(byNiveau).map(([n,v]) => `${n}: ${v}`).join(', ')

    const lines = [
      `CERTIFICATS — ${certs.length} certificat(s) trouvé(s)`,
      `Répartition niveaux : ${repartition}\n`
    ]

    certs.forEach((c, i) => {
      const pct = c.score_max ? Math.round(c.score / c.score_max * 100) : '—'
      lines.push(
        `${i+1}. ${c.prenom || '—'} ${c.nom || '—'} — Niveau ${c.niveau_obtenu || '—'}`,
        `   Score: ${c.score || '—'}/${c.score_max || 20} (${pct}%) | Date: ${c.date_test || '—'}`,
        `   Code: ${c.code_certificat || '—'} | Établissement: ${c.etablissement || '—'}`,
        ''
      )
    })

    return { text: lines.join('\n'), urls: [] }
  } catch (e) {
    return { text: `Erreur lecture certificats : ${e.message}`, urls: [] }
  }
}

// ── Recherche fiche étudiant (admin + secrétaire) ─────────────
async function toolRechercherEtudiant(input, userId, role) {
  if (!['admin', 'secretaire'].includes(role)) return { text: '⛔ Accès refusé — fiches étudiants réservées à l\'administration.', urls: [] }

  try {
    const { nom, prenom, telephone, numero_dossier } = input

    if (!nom && !prenom && !telephone && !numero_dossier) {
      return { text: 'Précisez au moins un critère de recherche : nom, prénom, téléphone ou numéro de dossier.', urls: [] }
    }

    let params = 'select=id,numero_dossier,nom,prenom,email,telephone,whatsapp,adresse,niveau,statut,mode_cours,mode_paiement,formations,created_at&limit=10'

    if (numero_dossier) {
      params += `&numero_dossier=ilike.%25${encodeURIComponent(numero_dossier)}%25`
    } else {
      if (nom)    params += `&nom=ilike.%25${encodeURIComponent(nom.toUpperCase())}%25`
      if (prenom) params += `&prenom=ilike.%25${encodeURIComponent(prenom)}%25`
      if (telephone) params += `&or=(telephone.ilike.%25${encodeURIComponent(telephone)}%25,whatsapp.ilike.%25${encodeURIComponent(telephone)}%25)`
    }

    params += '&order=nom.asc'

    const etudiants = await sbQuery('etudiants', params)

    if (!etudiants.length) return { text: `Aucun étudiant trouvé pour : ${[nom, prenom, telephone, numero_dossier].filter(Boolean).join(', ')}.`, urls: [] }

    const lines = [`${etudiants.length} étudiant(s) trouvé(s) :\n`]

    etudiants.forEach((e, i) => {
      lines.push(
        `${i+1}. ${e.prenom || '—'} ${e.nom || '—'} — Dossier : ${e.numero_dossier || '—'} | Statut : ${e.statut || '—'} | Niveau : ${e.niveau || '—'}`,
        `   Téléphone : ${e.telephone || '—'} | WhatsApp : ${e.whatsapp || e.telephone || '—'}`,
        `   Email : ${e.email || '—'}`,
        `   Adresse : ${e.adresse || '—'}`,
        `   Mode de cours : ${e.mode_cours || '—'} | Paiement : ${e.mode_paiement || '—'}`,
        `   Formation(s) : ${e.formations || '—'}`,
        ''
      )
    })

    return { text: lines.join('\n'), urls: [] }
  } catch (e) {
    return { text: `Erreur recherche étudiant : ${e.message}`, urls: [] }
  }
}

// ── Inscriptions étudiants (admin uniquement) ────────────────
async function toolLireInscriptions(input, userId, role) {
  if (role !== 'admin') return { text: '⛔ Accès refusé — données d\'inscriptions réservées à l\'administrateur.', urls: [] }

  try {
    const { filtre_statut, filtre_niveau, limit = 50 } = input

    let params = `select=id,nom,prenom,niveau,statut,mode_cours,mode_paiement,source,created_at&order=created_at.desc&limit=${Math.min(Number(limit) || 50, 100)}`
    if (filtre_statut) params += `&statut=eq.${encodeURIComponent(filtre_statut)}`
    if (filtre_niveau) params += `&niveau=eq.${encodeURIComponent(filtre_niveau)}`

    const [etudiants, actifs, inactifs, suspendus] = await Promise.all([
      sbQuery('etudiants', params),
      sbQuery('etudiants', 'select=id&statut=eq.Actif'),
      sbQuery('etudiants', 'select=id&statut=eq.Inactif'),
      sbQuery('etudiants', 'select=id&statut=eq.Suspendu'),
    ])

    const total = actifs.length + inactifs.length + suspendus.length

    // Répartition par niveau
    const parNiveau = {}
    etudiants.forEach(e => {
      const n = e.niveau || 'Non défini'
      parNiveau[n] = (parNiveau[n] || 0) + 1
    })
    const niveauxStr = Object.entries(parNiveau).sort().map(([n, v]) => `${n}: ${v}`).join(', ')

    // Répartition par source
    const parSource = {}
    etudiants.forEach(e => {
      const s = e.source || 'Non renseignée'
      parSource[s] = (parSource[s] || 0) + 1
    })
    const sourcesStr = Object.entries(parSource).map(([s, v]) => `${s}: ${v}`).join(', ')

    const lines = [
      `INSCRIPTIONS — BILAN GÉNÉRAL`,
      `Total étudiants : ${total} | Actifs : ${actifs.length} | Inactifs : ${inactifs.length} | Suspendus : ${suspendus.length}`,
      `Niveaux : ${niveauxStr || '—'}`,
      `Sources : ${sourcesStr || '—'}`,
      '',
      `LISTE (${etudiants.length} entrées${filtre_statut ? ` — statut : ${filtre_statut}` : ''}${filtre_niveau ? ` — niveau : ${filtre_niveau}` : ''}) :`,
    ]

    etudiants.forEach((e, i) => {
      const date = e.created_at ? e.created_at.slice(0, 10) : '—'
      lines.push(`${i+1}. ${e.prenom || '—'} ${e.nom || '—'} — Niveau ${e.niveau || '—'} | ${e.statut || '—'} | ${e.mode_cours || '—'} | Inscrit le ${date}`)
    })

    return { text: lines.join('\n'), urls: [] }
  } catch (e) {
    return { text: `Erreur lecture inscriptions : ${e.message}`, urls: [] }
  }
}

// ── Paiements / finances (admin UNIQUEMENT — accès financier strict) ──
async function toolLirePaiements(input, userId, role) {
  // BLOC FINANCIER — admin seul, aucune exception possible
  if (role !== 'admin') return { text: '⛔ Accès refusé — données financières strictement réservées à l\'administrateur.', urls: [] }

  try {
    const { periode, limit = 50 } = input
    const lim = Math.min(Number(limit) || 50, 100)

    // Filtre de période (ex : "2026-04" → mois en cours, "2026" → année)
    let dateFilter = ''
    if (periode) {
      if (/^\d{4}-\d{2}$/.test(periode)) {
        const debut = `${periode}-01`
        const [y, m] = periode.split('-').map(Number)
        const fin = new Date(y, m, 1).toISOString().slice(0, 10)
        dateFilter = `&date_paiement=gte.${debut}&date_paiement=lt.${fin}`
      } else if (/^\d{4}$/.test(periode)) {
        dateFilter = `&date_paiement=gte.${periode}-01-01&date_paiement=lt.${Number(periode)+1}-01-01`
      }
    }

    const [paiements, depenses] = await Promise.all([
      sbQuery('paiements', `select=id,montant,date_paiement,type_paiement,etudiant_nom,notes&order=date_paiement.desc&limit=${lim}${dateFilter}`),
      sbQuery('depenses', `select=id,montant,date_depense,categorie,description&order=date_depense.desc&limit=${lim}${dateFilter ? dateFilter.replace(/date_paiement/g,'date_depense') : ''}`).catch(() => []),
    ])

    const totalEncaisse = paiements.reduce((s, p) => s + (Number(p.montant) || 0), 0)
    const totalDepenses = depenses.reduce((s, d) => s + (Number(d.montant) || 0), 0)
    const solde         = totalEncaisse - totalDepenses
    const fmt           = n => Number(n).toLocaleString('fr-FR') + ' FCFA'

    const lines = [
      `FINANCES — BILAN${periode ? ` (${periode})` : ' (dernier historique)'}`,
      `Encaissements : ${fmt(totalEncaisse)} | Dépenses : ${fmt(totalDepenses)} | Solde : ${fmt(solde)}`,
      '',
      `PAIEMENTS REÇUS (${paiements.length}) :`,
    ]

    paiements.forEach((p, i) => {
      lines.push(`${i+1}. ${p.date_paiement || '—'} | ${p.etudiant_nom || (p.notes || '').split(' — ')[0] || '—'} | ${fmt(p.montant)} | ${p.type_paiement || '—'}`)
    })

    if (depenses.length) {
      lines.push('', `DÉPENSES (${depenses.length}) :`)
      depenses.forEach((d, i) => {
        lines.push(`${i+1}. ${d.date_depense || '—'} | ${d.description || d.categorie || '—'} | ${fmt(d.montant)} | ${d.categorie || '—'}`)
      })
    }

    return { text: lines.join('\n'), urls: [] }
  } catch (e) {
    return { text: `Erreur lecture paiements : ${e.message}`, urls: [] }
  }
}

// ── Enregistrer un prospect (nouveau client) ─────────────────
async function toolEnregistrerProspect(input, userId, userInfo, role, adminActions) {
  if (!ADMIN_ROLES.includes(role)) return { text: '⛔ Outil réservé à l\'administration.', urls: [] }
  const { nom, prenom, telephone, email, type_formation, niveau_actuel, message, source } = input
  if (!nom && !prenom && !telephone) return { text: 'Au minimum un nom ou un numéro de téléphone est requis.', urls: [] }
  try {
    const now = new Date().toISOString()
    const prospect = {
      nom:           nom || '',
      prenom:        prenom || '',
      telephone:     telephone || '',
      email:         email || '',
      interet:       type_formation || '',
      niveau:        niveau_actuel || '',
      message:       message || '',
      source:        source || 'accueil_assistant_ia',
      created_at:    now
    }
    await sbInsert('prospects', prospect).catch(() => {})

    // Notifier tous les admins par message interne
    const admins = await sbQuery('utilisateurs', 'select=id&role=eq.admin&limit=5').catch(() => [])
    const expedNom = `${userInfo.prenom || ''} ${userInfo.nom || ''}`.trim() || 'Assistant IA'
    const notifMsg = `NOUVEAU PROSPECT ENREGISTRÉ\n\nNom : ${prenom || ''} ${nom || ''}\nTéléphone : ${telephone || 'Non renseigné'}\nEmail : ${email || 'Non renseigné'}\nFormation visée : ${type_formation || 'Non précisé'}\nNiveau actuel : ${niveau_actuel || 'Non précisé'}\nMessage : ${message || '—'}\nSource : ${source || 'Accueil'}\nEnregistré par : ${expedNom}\nDate : ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}`

    for (const admin of admins) {
      await sbInsert('messages', {
        destinataire_user_id: admin.id,
        expediteur_nom:       expedNom,
        expediteur_role:      role,
        objet:                `Nouveau prospect : ${prenom || ''} ${nom || ''}`.trim(),
        sujet:                `Nouveau prospect : ${prenom || ''} ${nom || ''}`.trim(),
        corps:                notifMsg,
        contenu:              notifMsg,
        lu:                   false,
        created_at:           now
      }).catch(() => {})
    }

    adminActions.push({ type: 'prospect_enregistre', nom: `${prenom || ''} ${nom || ''}`.trim(), telephone, type_formation })

    const recap = [`Prospect enregistré avec succès.`, `Nom : ${prenom || ''} ${nom || ''}`.trim(), telephone ? `Téléphone : ${telephone}` : '', email ? `Email : ${email}` : '', type_formation ? `Formation visée : ${type_formation}` : '', `Une notification a été envoyée à l'administration.`].filter(Boolean).join('\n')
    return { text: recap, urls: [] }
  } catch(e) { return { text: `Erreur enregistrement prospect : ${e.message}`, urls: [] } }
}

// ── Lire les prospects récents ────────────────────────────────
async function toolLireProspects(input, userId, role) {
  if (!ADMIN_ROLES.includes(role)) return { text: '⛔ Outil réservé à l\'administration.', urls: [] }
  try {
    const { limit = 20, source, type_formation } = input
    let params = `select=id,nom,prenom,telephone,email,interet,niveau,message,source,created_at&order=created_at.desc&limit=${Math.min(Number(limit) || 20, 50)}`
    if (source)         params += `&source=ilike.%25${encodeURIComponent(source)}%25`
    if (type_formation) params += `&interet=ilike.%25${encodeURIComponent(type_formation)}%25`

    const prospects = await sbQuery('prospects', params)
    if (!prospects.length) return { text: 'Aucun prospect enregistré pour ces critères.', urls: [] }

    const lines = [`PROSPECTS — ${prospects.length} entrée(s)\n`]
    prospects.forEach((p, i) => {
      const date = p.created_at ? p.created_at.slice(0, 10) : '—'
      lines.push(
        `${i+1}. ${p.prenom || ''} ${p.nom || ''} — Tél : ${p.telephone || '—'} | Email : ${p.email || '—'}`,
        `   Intérêt : ${p.interet || '—'} | Niveau : ${p.niveau || '—'} | Source : ${p.source || '—'}`,
        p.message ? `   Message : ${p.message.substring(0, 100)}` : '',
        `   Enregistré le : ${date}`,
        ''
      )
    })
    return { text: lines.filter(l => l !== undefined).join('\n'), urls: [] }
  } catch(e) { return { text: `Erreur lecture prospects : ${e.message}`, urls: [] } }
}

// ── Lire les séances à venir ──────────────────────────────────
async function toolLireSeancesAvenir(input, userId, role, userInfo) {
  try {
    const { classe_nom, date_debut, date_fin, limit = 20 } = input
    const today = new Date().toISOString().slice(0, 10)
    const debut = date_debut || today

    let params = `select=id,date,heure,titre,classe_nom,enseignant_nom,salle,statut,duree_minutes,notes&statut=neq.Annulée&date=gte.${debut}&order=date.asc,heure.asc&limit=${Math.min(Number(limit) || 20, 50)}`

    if (date_fin)   params += `&date=lte.${date_fin}`
    if (classe_nom) params += `&classe_nom=ilike.%25${encodeURIComponent(classe_nom)}%25`

    // Formateur : filtrer par son nom
    if (role === 'formateur' && userInfo?.nom) {
      params += `&enseignant_nom=ilike.%25${encodeURIComponent(userInfo.nom)}%25`
    }

    const seances = await sbQuery('seances', params)
    if (!seances.length) return { text: `Aucune séance planifiée à partir du ${debut}.`, urls: [] }

    const lines = [`SÉANCES À VENIR — ${seances.length} séance(s)\n`]
    seances.forEach((s, i) => {
      lines.push(
        `${i+1}. ${s.date} à ${s.heure || '—'} — ${s.titre || '—'}`,
        `   Classe : ${s.classe_nom || '—'} | Formateur : ${s.enseignant_nom || '—'}${s.salle ? ' | Salle : ' + s.salle : ''}`,
        `   Durée : ${s.duree_minutes || 90} min | Statut : ${s.statut || 'Planifiée'}`,
        s.notes ? `   Notes : ${s.notes}` : '',
        ''
      )
    })
    return { text: lines.filter(l => l !== undefined).join('\n'), urls: [] }
  } catch(e) { return { text: `Erreur lecture séances : ${e.message}`, urls: [] } }
}

// ════════════════════════════════════════════════════════════
//  OUTILS RH — RESSOURCES HUMAINES (admin uniquement sauf mention)
// ════════════════════════════════════════════════════════════

const RH_ROLES = ['admin', 'secretaire']
const fmt_fcfa = n => Number(n || 0).toLocaleString('fr-FR') + ' FCFA'

// ── Lire la liste du personnel / dossier formateurs ──────────
async function toolLirePersonnel(input, userId, role, userInfo) {
  if (!RH_ROLES.includes(role)) return { text: '⛔ Accès réservé à l\'administration.', urls: [] }
  try {
    const { poste, statut, limit = 30 } = input
    let params = `select=id,nom,prenom,poste,type_contrat,date_embauche,date_fin_contrat,telephone,email,statut,taux_seance,notes&order=nom.asc&limit=${Math.min(Number(limit)||30,100)}`
    if (poste)  params += `&poste=ilike.%25${encodeURIComponent(poste)}%25`
    if (statut) params += `&statut=eq.${encodeURIComponent(statut)}`

    const [personnel, tous] = await Promise.all([
      sbQuery('personnel', params),
      sbQuery('personnel', 'select=id,statut,poste')
    ])

    const total   = tous.length
    const actifs  = tous.filter(p => p.statut === 'Actif').length
    const conges  = tous.filter(p => p.statut === 'En congé').length
    const inactifs= tous.filter(p => p.statut === 'Inactif').length
    const formateurs = tous.filter(p => (p.poste||'').toLowerCase().includes('formateur')).length

    const lines = [
      `PERSONNEL RH — ${total} employé(s) | Actifs: ${actifs} | En congé: ${conges} | Inactifs: ${inactifs}`,
      `Formateurs: ${formateurs}\n`
    ]
    personnel.forEach((p, i) => {
      lines.push(
        `${i+1}. ${p.prenom || ''} ${p.nom || ''} — ${p.poste || '—'} | ${p.statut || '—'} | ${p.type_contrat || '—'}`,
        `   Tél: ${p.telephone || '—'} | Email: ${p.email || '—'}`,
        `   Embauché: ${p.date_embauche || '—'}${p.date_fin_contrat ? ' | Fin contrat: '+p.date_fin_contrat : ''}`,
        p.taux_seance ? `   Taux/séance: ${fmt_fcfa(p.taux_seance)}` : '',
        p.notes ? `   Notes: ${p.notes.substring(0,100)}` : '',
        ''
      )
    })
    return { text: lines.filter(l=>l!==undefined).join('\n'), urls: [] }
  } catch(e) { return { text: `Erreur lecture personnel : ${e.message}`, urls: [] } }
}

// ── Rechercher un formateur précis ────────────────────────────
async function toolRechercherFormateur(input, userId, role, userInfo) {
  if (!RH_ROLES.includes(role) && role !== 'directeur_pedagogique' && role !== 'sous_directeur_pedagogique') {
    return { text: '⛔ Accès réservé à l\'administration et à la direction pédagogique.', urls: [] }
  }
  try {
    const { nom, prenom, email, telephone } = input
    if (!nom && !prenom && !email && !telephone) return { text: 'Précisez au moins un critère de recherche.', urls: [] }

    let params = 'select=id,nom,prenom,poste,type_contrat,date_embauche,telephone,email,statut,taux_seance,notes&limit=5'
    if (nom)       params += `&nom=ilike.%25${encodeURIComponent(nom.toUpperCase())}%25`
    if (prenom)    params += `&prenom=ilike.%25${encodeURIComponent(prenom)}%25`
    if (email)     params += `&email=ilike.%25${encodeURIComponent(email)}%25`
    if (telephone) params += `&telephone=ilike.%25${encodeURIComponent(telephone)}%25`

    const pers = await sbQuery('personnel', params)
    if (!pers.length) return { text: `Aucun formateur trouvé pour : ${[nom,prenom,email,telephone].filter(Boolean).join(', ')}.`, urls: [] }

    // Récupérer aussi le compte utilisateur associé
    const lines = [`${pers.length} formateur(s) trouvé(s) :\n`]
    for (const p of pers) {
      // Chercher dans utilisateurs par email
      let compte = null
      if (p.email) {
        const comptes = await sbQuery('utilisateurs', `select=id,role,email,ai_tier&email=ilike.${encodeURIComponent(p.email)}&limit=1`).catch(()=>[])
        compte = comptes[0] || null
      }
      lines.push(
        `Nom : ${p.prenom||''} ${p.nom||''} | Poste : ${p.poste||'—'} | Statut : ${p.statut||'—'}`,
        `Contrat : ${p.type_contrat||'—'} | Embauché le : ${p.date_embauche||'—'}`,
        `Téléphone : ${p.telephone||'—'} | Email : ${p.email||'—'}`,
        p.taux_seance ? `Taux/séance : ${fmt_fcfa(p.taux_seance)}` : '',
        compte ? `Compte dashboard : rôle ${compte.role} | ID: ${compte.id}` : 'Pas de compte dashboard lié',
        p.notes ? `Notes : ${p.notes.substring(0,150)}` : '',
        ''
      )
    }
    return { text: lines.filter(l=>l!==undefined).join('\n'), urls: [] }
  } catch(e) { return { text: `Erreur recherche formateur : ${e.message}`, urls: [] } }
}

// ── Ajouter un membre du personnel ───────────────────────────
async function toolAjouterPersonnel(input, userId, role, adminActions) {
  if (role !== 'admin') return { text: '⛔ Outil réservé à l\'administrateur.', urls: [] }
  const { nom, prenom, poste, type_contrat, date_embauche, telephone, email, salaire_base, taux_seance, notes } = input
  if (!nom || !prenom || !poste) return { text: 'Nom, prénom et poste sont requis.', urls: [] }
  try {
    const row = {
      nom: nom.toUpperCase(), prenom, poste,
      type_contrat:   type_contrat  || 'CDI',
      date_embauche:  date_embauche || new Date().toISOString().slice(0,10),
      telephone:      telephone     || '',
      email:          email         || '',
      salaire_base:   salaire_base  ? Number(salaire_base) : null,
      taux_seance:    taux_seance   ? Number(taux_seance)  : null,
      statut:         'Actif',
      notes:          notes         || '',
      created_at:     new Date().toISOString()
    }
    await sbInsert('personnel', row)
    adminActions.push({ type: 'personnel_ajoute', nom: `${prenom} ${nom}`, poste })
    return { text: `Personnel ajouté : ${prenom} ${nom.toUpperCase()} — ${poste} (${row.type_contrat}).\n${salaire_base ? 'Salaire base : '+fmt_fcfa(salaire_base) : ''}\n${taux_seance ? 'Taux/séance : '+fmt_fcfa(taux_seance) : ''}`.trim(), urls: [] }
  } catch(e) { return { text: `Erreur ajout personnel : ${e.message}`, urls: [] } }
}

// ── Modifier la fiche RH d'un membre du personnel ─────────────
async function toolModifierPersonnel(input, userId, role, adminActions) {
  if (role !== 'admin') return { text: '⛔ Outil réservé à l\'administrateur.', urls: [] }
  const { id, nom, prenom, telephone, email, statut, type_contrat, salaire_base, taux_seance, date_fin_contrat, notes } = input
  if (!id && !nom && !prenom) return { text: 'ID ou nom du membre du personnel requis.', urls: [] }
  try {
    let pid = id
    if (!pid) {
      const rows = await sbQuery('personnel', `select=id&nom=ilike.%25${encodeURIComponent((nom||'').toUpperCase())}%25${prenom?'&prenom=ilike.%25'+encodeURIComponent(prenom)+'%25':''}&limit=1`)
      if (!rows.length) return { text: `Personnel introuvable : ${prenom||''} ${nom||''}.`, urls: [] }
      pid = rows[0].id
    }
    const patch = {}
    if (telephone       !== undefined) patch.telephone       = telephone
    if (email           !== undefined) patch.email           = email
    if (statut          !== undefined) patch.statut          = statut
    if (type_contrat    !== undefined) patch.type_contrat    = type_contrat
    if (salaire_base    !== undefined) patch.salaire_base    = Number(salaire_base)
    if (taux_seance     !== undefined) patch.taux_seance     = Number(taux_seance)
    if (date_fin_contrat!== undefined) patch.date_fin_contrat= date_fin_contrat
    if (notes           !== undefined) patch.notes           = notes
    if (!Object.keys(patch).length) return { text: 'Aucune modification spécifiée.', urls: [] }
    await sbUpdate('personnel', `id=eq.${pid}`, patch)
    adminActions.push({ type: 'personnel_modifie', personnel_id: pid, modifications: patch })
    const champs = Object.entries(patch).map(([k,v])=>`${k} → "${v}"`).join(', ')
    return { text: `Fiche RH mise à jour (id: ${pid}) : ${champs}.`, urls: [] }
  } catch(e) { return { text: `Erreur modification personnel : ${e.message}`, urls: [] } }
}

// ── Lire les congés ───────────────────────────────────────────
async function toolLireConges(input, userId, role, userInfo) {
  if (!RH_ROLES.includes(role)) return { text: '⛔ Accès réservé à l\'administration.', urls: [] }
  try {
    const { statut, personnel_nom, limit = 20 } = input
    let params = `select=id,personnel_id,nom_employe,poste,type_conge,date_debut,date_fin,nb_jours,motif,statut,created_at&order=created_at.desc&limit=${Math.min(Number(limit)||20,50)}`
    if (statut)        params += `&statut=eq.${encodeURIComponent(statut)}`
    if (personnel_nom) params += `&nom_employe=ilike.%25${encodeURIComponent(personnel_nom)}%25`

    const conges = await sbQuery('conges', params)
    if (!conges.length) return { text: 'Aucun congé enregistré pour ces critères.', urls: [] }

    const attente  = conges.filter(c=>c.statut==='En attente').length
    const approuves= conges.filter(c=>c.statut==='Approuvé').length
    const refuses  = conges.filter(c=>c.statut==='Refusé').length

    const lines = [
      `CONGÉS — ${conges.length} demande(s) | En attente: ${attente} | Approuvés: ${approuves} | Refusés: ${refuses}\n`
    ]
    conges.forEach((c, i) => {
      lines.push(
        `${i+1}. ${c.nom_employe||'—'} (${c.poste||'—'}) — ${c.type_conge||'Congé'}`,
        `   Du ${c.date_debut||'—'} au ${c.date_fin||'—'} (${c.nb_jours||'?'} j) | Statut: ${c.statut||'—'}`,
        c.motif ? `   Motif: ${c.motif}` : '',
        `   Demandé le: ${c.created_at?c.created_at.slice(0,10):'—'}`,
        ''
      )
    })
    return { text: lines.filter(l=>l!==undefined).join('\n'), urls: [] }
  } catch(e) { return { text: `Erreur lecture congés : ${e.message}`, urls: [] } }
}

// ── Approuver / refuser / enregistrer un congé ────────────────
async function toolGererConge(input, userId, role, userInfo, adminActions) {
  if (role !== 'admin') return { text: '⛔ Outil réservé à l\'administrateur.', urls: [] }
  const { action, conge_id, personnel_nom, personnel_id, type_conge, date_debut, date_fin, nb_jours, motif } = input
  try {
    // ── Créer un nouveau congé ───────────────────────────────
    if (action === 'creer') {
      if (!personnel_nom && !personnel_id) return { text: 'Nom du membre du personnel requis.', urls: [] }
      if (!date_debut || !date_fin) return { text: 'Dates de début et fin requises.', urls: [] }
      let pid = personnel_id
      let nomEmploye = personnel_nom || ''
      let posteEmploye = ''
      if (!pid && personnel_nom) {
        const rows = await sbQuery('personnel', `select=id,nom,prenom,poste&nom=ilike.%25${encodeURIComponent(personnel_nom.toUpperCase())}%25&limit=1`)
        if (rows[0]) { pid = rows[0].id; nomEmploye = `${rows[0].prenom||''} ${rows[0].nom||''}`; posteEmploye = rows[0].poste||'' }
      }
      await sbInsert('conges', {
        personnel_id: pid || null, nom_employe: nomEmploye, poste: posteEmploye,
        type_conge: type_conge||'Congé annuel', date_debut, date_fin,
        nb_jours: nb_jours || null, motif: motif||'', statut: 'En attente',
        created_at: new Date().toISOString()
      })
      adminActions.push({ type: 'conge_cree', employe: nomEmploye, date_debut, date_fin })
      return { text: `Demande de congé enregistrée pour ${nomEmploye} du ${date_debut} au ${date_fin} (${type_conge||'Congé annuel'}).`, urls: [] }
    }

    // ── Approuver ou refuser ─────────────────────────────────
    if (action === 'approuver' || action === 'refuser') {
      if (!conge_id) return { text: 'ID du congé requis pour approuver/refuser.', urls: [] }
      const newStatut = action === 'approuver' ? 'Approuvé' : 'Refusé'
      await sbUpdate('conges', `id=eq.${conge_id}`, { statut: newStatut })
      adminActions.push({ type: 'conge_'+action, conge_id, statut: newStatut })
      return { text: `Congé ${conge_id} : statut mis à "${newStatut}".`, urls: [] }
    }

    return { text: 'Action non reconnue. Valeurs: creer, approuver, refuser.', urls: [] }
  } catch(e) { return { text: `Erreur gestion congé : ${e.message}`, urls: [] } }
}

// ── Lire les fiches de paie ───────────────────────────────────
async function toolLireFichesPaie(input, userId, role) {
  if (role !== 'admin') return { text: '⛔ Données salariales strictement réservées à l\'administrateur.', urls: [] }
  try {
    const { personnel_nom, periode, statut, limit = 20 } = input
    let params = `select=id,personnel_id,nom_employe,poste,periode,mois_label,salaire_base,primes,retenues,avances,net_a_payer,statut,date_paiement,nb_seances,salaire_seances&order=periode.desc&limit=${Math.min(Number(limit)||20,50)}`
    if (personnel_nom) params += `&nom_employe=ilike.%25${encodeURIComponent(personnel_nom)}%25`
    if (statut)        params += `&statut=eq.${encodeURIComponent(statut)}`
    if (periode)       params += `&mois_label=ilike.%25${encodeURIComponent(periode)}%25`

    const fiches = await sbQuery('fiches_paie', params)
    if (!fiches.length) return { text: 'Aucune fiche de paie pour ces critères.', urls: [] }

    const totalNet   = fiches.reduce((s,f)=>s+(Number(f.net_a_payer)||0),0)
    const totalPaye  = fiches.filter(f=>f.statut==='Payé').reduce((s,f)=>s+(Number(f.net_a_payer)||0),0)
    const enAttente  = fiches.filter(f=>f.statut!=='Payé').length

    const lines = [
      `FICHES DE PAIE — ${fiches.length} fiche(s)`,
      `Masse totale : ${fmt_fcfa(totalNet)} | Déjà payé : ${fmt_fcfa(totalPaye)} | En attente : ${enAttente}\n`
    ]
    fiches.forEach((f, i) => {
      lines.push(
        `${i+1}. ${f.nom_employe||'—'} (${f.poste||'—'}) — ${f.mois_label||f.periode||'—'}`,
        `   Base: ${fmt_fcfa(f.salaire_base)}${f.salaire_seances ? ' + Séances: '+fmt_fcfa(f.salaire_seances) : ''} | Net: ${fmt_fcfa(f.net_a_payer)} | ${f.statut||'—'}`,
        f.primes ? `   Primes: ${fmt_fcfa(f.primes)}` : '',
        f.retenues || f.avances ? `   Retenues: ${fmt_fcfa(f.retenues)} | Avances: ${fmt_fcfa(f.avances)}` : '',
        f.date_paiement ? `   Payé le: ${f.date_paiement}` : '',
        ''
      )
    })
    return { text: lines.filter(l=>l!==undefined).join('\n'), urls: [] }
  } catch(e) { return { text: `Erreur lecture fiches de paie : ${e.message}`, urls: [] } }
}

// ── Lire les honoraires des formateurs ────────────────────────
async function toolLireHonoraires(input, userId, role, userInfo) {
  // Admin voit tout, formateur voit les siens uniquement
  const isAdmin = role === 'admin'
  const isFmt   = role === 'formateur'
  if (!isAdmin && !isFmt && !RH_ROLES.includes(role)) return { text: '⛔ Accès refusé.', urls: [] }
  try {
    const { formateur_nom, statut, periode, limit = 30 } = input
    let params = `select=id,formateur_nom,classe_nom,date_seance,tarif_type,tarif_unitaire,nb_presents,montant_total,statut,valide_par,valide_at&order=date_seance.desc&limit=${Math.min(Number(limit)||30,100)}`
    if (statut)    params += `&statut=eq.${encodeURIComponent(statut)}`
    if (periode) {
      if (/^\d{4}-\d{2}$/.test(periode)) {
        params += `&date_seance=gte.${periode}-01&date_seance=lt.${periode.slice(0,4)}-${String(Number(periode.slice(5))+1).padStart(2,'0')}-01`
      }
    }
    // Formateur : filtrer sur son propre userId
    if (isFmt) {
      params += `&formateur_id=eq.${userId}`
    } else if (formateur_nom) {
      params += `&formateur_nom=ilike.%25${encodeURIComponent(formateur_nom)}%25`
    }

    const honos = await sbQuery('honoraires_formateurs', params)
    if (!honos.length) return { text: 'Aucun honoraire trouvé pour ces critères.', urls: [] }

    const totalMontant = honos.reduce((s,h)=>s+(Number(h.montant_total)||0),0)
    const enAttente = honos.filter(h=>h.statut==='en_attente').length
    const valides   = honos.filter(h=>h.statut==='valide').length
    const payes     = honos.filter(h=>h.statut==='paye').length

    const lines = [
      `HONORAIRES FORMATEURS — ${honos.length} ligne(s) | Total: ${fmt_fcfa(totalMontant)}`,
      `En attente: ${enAttente} | Validés: ${valides} | Payés: ${payes}\n`
    ]
    honos.forEach((h, i) => {
      lines.push(
        `${i+1}. ${h.formateur_nom||'—'} — ${h.date_seance||'—'} | ${h.classe_nom||'—'}`,
        `   Tarif: ${h.tarif_type||'—'} × ${h.nb_presents||0} présents | Montant: ${fmt_fcfa(h.montant_total)} | ${h.statut||'—'}`,
        h.valide_par ? `   Validé par: ${h.valide_par}` : '',
        ''
      )
    })
    return { text: lines.filter(l=>l!==undefined).join('\n'), urls: [] }
  } catch(e) { return { text: `Erreur lecture honoraires : ${e.message}`, urls: [] } }
}

// ── Valider / marquer payé les honoraires ─────────────────────
async function toolValiderHonoraires(input, userId, role, userInfo, adminActions) {
  if (role !== 'admin') return { text: '⛔ Outil réservé à l\'administrateur.', urls: [] }
  const { honoraire_id, action, formateur_nom, periode } = input
  // action : 'valider' | 'marquer_paye' | 'valider_tous' | 'marquer_paye_tous'
  try {
    const expedNom = `${userInfo.prenom||''} ${userInfo.nom||''}`.trim()
    const now = new Date().toISOString()

    if (honoraire_id) {
      const newStatut = action === 'marquer_paye' ? 'paye' : 'valide'
      const patch = { statut: newStatut }
      if (newStatut === 'valide') { patch.valide_par = expedNom; patch.valide_at = now }
      await sbUpdate('honoraires_formateurs', `id=eq.${honoraire_id}`, patch)
      adminActions.push({ type: 'honoraire_'+action, honoraire_id })
      return { text: `Honoraire ${honoraire_id} : statut "${newStatut}" enregistré.`, urls: [] }
    }

    // Opération en lot
    if ((action === 'valider_tous' || action === 'marquer_paye_tous') && (formateur_nom || periode)) {
      let filter = action === 'valider_tous' ? 'statut=eq.en_attente' : 'statut=eq.valide'
      if (formateur_nom) filter += `&formateur_nom=ilike.%25${encodeURIComponent(formateur_nom)}%25`
      if (periode && /^\d{4}-\d{2}$/.test(periode)) {
        filter += `&date_seance=gte.${periode}-01&date_seance=lt.${periode.slice(0,4)}-${String(Number(periode.slice(5))+1).padStart(2,'0')}-01`
      }
      const newStatut = action === 'valider_tous' ? 'valide' : 'paye'
      const patch = { statut: newStatut }
      if (newStatut === 'valide') { patch.valide_par = expedNom; patch.valide_at = now }
      await sbUpdate('honoraires_formateurs', filter, patch)
      adminActions.push({ type: 'honoraires_lot_'+action, formateur_nom, periode })
      return { text: `Honoraires mis à "${newStatut}" en lot${formateur_nom?' pour '+formateur_nom:''}${periode?' ('+periode+')':''}.`, urls: [] }
    }

    return { text: 'Précisez un honoraire_id ou une combinaison formateur_nom+periode avec action valider_tous ou marquer_paye_tous.', urls: [] }
  } catch(e) { return { text: `Erreur validation honoraires : ${e.message}`, urls: [] } }
}

// ── Lire les candidatures de recrutement ──────────────────────
async function toolLireCandidatures(input, userId, role) {
  if (role !== 'admin') return { text: '⛔ Données de recrutement réservées à l\'administrateur.', urls: [] }
  try {
    const { statut, poste, limit = 20 } = input
    let params = `select=id,nom,prenom,email,telephone,poste,niveau_etudes,experience_annees,matieres,disponibilites,statut,created_at&order=created_at.desc&limit=${Math.min(Number(limit)||20,50)}`
    if (statut) params += `&statut=eq.${encodeURIComponent(statut)}`
    if (poste)  params += `&poste=ilike.%25${encodeURIComponent(poste)}%25`

    const cands = await sbQuery('candidatures', params)
    if (!cands.length) return { text: 'Aucune candidature pour ces critères.', urls: [] }

    const nouveau  = cands.filter(c=>c.statut==='Nouveau').length
    const enEtude  = cands.filter(c=>c.statut==='En étude').length
    const retenu   = cands.filter(c=>c.statut==='Retenu').length
    const refuse   = cands.filter(c=>c.statut==='Refusé').length

    const lines = [
      `CANDIDATURES — ${cands.length} dossier(s) | Nouveau: ${nouveau} | En étude: ${enEtude} | Retenus: ${retenu} | Refusés: ${refuse}\n`
    ]
    cands.forEach((c, i) => {
      lines.push(
        `${i+1}. ${c.prenom||''} ${c.nom||''} — Poste: ${c.poste||'—'} | Statut: ${c.statut||'—'}`,
        `   Tél: ${c.telephone||'—'} | Email: ${c.email||'—'}`,
        `   Études: ${c.niveau_etudes||'—'} | Exp: ${c.experience_annees||'0'} an(s) | Matières: ${c.matieres||'—'}`,
        c.disponibilites ? `   Disponibilités: ${c.disponibilites}` : '',
        `   Candidature du: ${c.created_at?c.created_at.slice(0,10):'—'}`,
        ''
      )
    })
    return { text: lines.filter(l=>l!==undefined).join('\n'), urls: [] }
  } catch(e) { return { text: `Erreur lecture candidatures : ${e.message}`, urls: [] } }
}

// ── Mettre à jour le statut d'une candidature ────────────────
async function toolModifierCandidature(input, userId, role, adminActions) {
  if (role !== 'admin') return { text: '⛔ Outil réservé à l\'administrateur.', urls: [] }
  const { candidature_id, statut, notes } = input
  if (!candidature_id) return { text: 'ID de la candidature requis.', urls: [] }
  if (!statut) return { text: 'Nouveau statut requis (Nouveau, En étude, Retenu, Refusé).', urls: [] }
  try {
    const patch = { statut }
    if (notes !== undefined) patch.notes = notes
    await sbUpdate('candidatures', `id=eq.${candidature_id}`, patch)
    adminActions.push({ type: 'candidature_modifiee', candidature_id, statut })
    return { text: `Candidature ${candidature_id} : statut mis à "${statut}".${notes ? ' Notes enregistrées.' : ''}`, urls: [] }
  } catch(e) { return { text: `Erreur modification candidature : ${e.message}`, urls: [] } }
}

// ── Notifier une classe entière par WhatsApp ─────────────────
async function toolNotifierClasseWhatsapp(input, userId, role, userInfo, adminActions) {
  if (!ADMIN_ROLES.includes(role)) return { text: '⛔ Outil réservé à l\'administration.', urls: [] }
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    return { text: '⚠️ WhatsApp non configuré — variables Twilio manquantes.', urls: [] }
  }
  const { classe_nom, titre_seance, date_seance, heure_seance, message_libre, template } = input
  if (!classe_nom) return { text: 'Nom de la classe requis.', urls: [] }

  try {
    // 1. Trouver la classe
    const classes = await sbQuery('classes', `select=id,nom,niveau&nom=ilike.%25${encodeURIComponent(classe_nom)}%25&limit=1`)
    if (!classes.length) return { text: `Classe "${classe_nom}" introuvable dans la base.`, urls: [] }
    const classe = classes[0]

    // 2. Récupérer les étudiants inscrits avec leurs numéros
    const inscriptions = await sbQuery('inscriptions_classes',
      `select=etudiants(id,nom,prenom,whatsapp,telephone)&classe_id=eq.${classe.id}`)
    const etudiants = inscriptions.map(i => i.etudiants).filter(Boolean)
    const avecNumero = etudiants.filter(e => e.whatsapp || e.telephone)
    const sansNumero = etudiants.filter(e => !e.whatsapp && !e.telephone)

    if (!avecNumero.length) {
      return { text: `Aucun étudiant avec numéro trouvé dans la classe "${classe.nom}" (${etudiants.length} inscrit(s) total).`, urls: [] }
    }

    // 3. Envoi en lot
    const success = [], failed = []
    const useTemplate = template === 'etudiant' && TWILIO_TEMPLATE_ETUDIANT

    for (const etud of avecNumero) {
      const phone = etud.whatsapp || etud.telephone
      try {
        let templateOptions = null
        if (useTemplate) {
          templateOptions = {
            contentSid: TWILIO_TEMPLATE_ETUDIANT,
            contentVariables: {
              "1": `${etud.prenom || ''} ${etud.nom || ''}`.trim(),
              "2": titre_seance || classe.nom,
              "3": `${date_seance || '—'} à ${heure_seance || '—'}`
            }
          }
        }
        const result = await sendWhatsApp(phone, message_libre || '', templateOptions)
        if (result.status === 'failed' || result.status === 'undelivered') {
          failed.push(`${etud.prenom||''} ${etud.nom||''} (${result.errorCode || result.status})`)
        } else {
          success.push(`${etud.prenom||''} ${etud.nom||''}`)
        }
      } catch(e) {
        failed.push(`${etud.prenom||''} ${etud.nom||''} (${e.message.substring(0,40)})`)
      }
    }

    adminActions.push({ type: 'notif_classe_whatsapp', classe: classe.nom, envoyes: success.length, echecs: failed.length })

    const lines = [
      `Notifications WhatsApp — Classe : ${classe.nom}`,
      `Envoyés : ${success.length} / ${avecNumero.length} | Échecs : ${failed.length}${sansNumero.length ? ' | Sans numéro : '+sansNumero.length : ''}`,
    ]
    if (success.length) lines.push(`\nRemis : ${success.join(', ')}`)
    if (failed.length)  lines.push(`\nÉchecs : ${failed.join(', ')}`)
    if (sansNumero.length) lines.push(`\nSans numéro : ${sansNumero.map(e=>`${e.prenom||''} ${e.nom||''}`).join(', ')}`)
    return { text: lines.join('\n'), urls: [] }
  } catch(e) { return { text: `Erreur notification classe : ${e.message}`, urls: [] } }
}

// ── Créer une séance ET notifier la classe (workflow combiné) ─
async function toolPlanifierEtNotifier(input, userId, role, userInfo, adminActions) {
  if (!ADMIN_ROLES.includes(role)) return { text: '⛔ Outil réservé à l\'administration.', urls: [] }
  const { date, heure, titre, classe_nom, enseignant_nom, salle, duree_minutes, notes, notifier_whatsapp } = input
  if (!date || !titre || !classe_nom) return { text: 'Date, titre et nom de classe requis.', urls: [] }

  const results = []

  // ── 1. Créer la séance ─────────────────────────────────────
  try {
    const seanceRow = {
      date, heure: heure || '09:00', titre, classe_nom,
      enseignant_nom: enseignant_nom || '', salle: salle || '',
      duree_minutes: duree_minutes || 90, statut: 'Planifiée',
      notes: notes || '', created_by: userId, created_at: new Date().toISOString()
    }
    await sbInsert('seances', seanceRow)
    adminActions.push({ type: 'seance_planifiee', date, titre, classe_nom })
    results.push(`Séance créée : "${titre}" — ${classe_nom} le ${date} à ${seanceRow.heure}.`)
  } catch(e) {
    return { text: `Erreur création séance : ${e.message}`, urls: [] }
  }

  // ── 2. Envoyer les notifications WhatsApp si demandé ───────
  if (notifier_whatsapp && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM) {
    const notifResult = await toolNotifierClasseWhatsapp(
      { classe_nom, titre_seance: titre, date_seance: date, heure_seance: heure || '09:00', template: 'etudiant' },
      userId, role, userInfo, adminActions
    )
    results.push('\n' + notifResult.text)
  } else if (notifier_whatsapp) {
    results.push('\n⚠️ WhatsApp non configuré — notifications non envoyées.')
  }

  return { text: results.join('\n'), urls: [] }
}

// ── [ADMIN] Modifier fiche étudiant ──────────────────────────
async function toolModifierEtudiant(input, userId, role, adminActions) {
  if (role !== 'admin') return { text: '⛔ Outil réservé à l\'administrateur.', urls: [] }
  const { id, nom, prenom, telephone, whatsapp, email, niveau, statut, mode_cours, notes } = input
  if (!id && !nom && !prenom) return { text: 'Identifiant ou nom de l\'étudiant requis.', urls: [] }
  try {
    // Si on a un id, patch direct ; sinon recherche d'abord
    let etudiantId = id
    if (!etudiantId) {
      const rows = await sbQuery('etudiants', `select=id,prenom,nom&nom=ilike.*${nom || ''}*${prenom ? `&prenom=ilike.*${prenom}*` : ''}&limit=1`)
      if (!rows.length) return { text: `Étudiant introuvable : ${prenom || ''} ${nom || ''}.`, urls: [] }
      etudiantId = rows[0].id
    }
    const patch = {}
    if (telephone  !== undefined) patch.telephone   = telephone
    if (whatsapp   !== undefined) patch.whatsapp    = whatsapp
    if (email      !== undefined) patch.email       = email
    if (niveau     !== undefined) patch.niveau      = niveau
    if (statut     !== undefined) patch.statut      = statut
    if (mode_cours !== undefined) patch.mode_cours  = mode_cours
    if (notes      !== undefined) patch.notes       = notes
    if (!Object.keys(patch).length) return { text: 'Aucune modification spécifiée.', urls: [] }
    patch.updated_at = new Date().toISOString()
    await sbUpdate('etudiants', `id=eq.${etudiantId}`, patch)
    adminActions.push({ type: 'etudiant_modifie', etudiant_id: etudiantId, modifications: patch })
    const champs = Object.entries(patch).filter(([k]) => k !== 'updated_at').map(([k,v]) => `${k} → "${v}"`).join(', ')
    return { text: `Fiche étudiant mise à jour (id: ${etudiantId}) : ${champs}.`, urls: [] }
  } catch(e) { return { text: `Erreur modification étudiant : ${e.message}`, urls: [] } }
}

// ── [ADMIN] Planifier une séance ──────────────────────────────
async function toolPlanifierSeance(input, userId, role, adminActions) {
  if (role !== 'admin') return { text: '⛔ Outil réservé à l\'administrateur.', urls: [] }
  const { date, heure, titre, classe_nom, enseignant_nom, salle, duree_minutes, notes } = input
  if (!date || !titre || !classe_nom) return { text: 'Date, titre et nom de classe requis.', urls: [] }
  try {
    const row = {
      date,
      heure:          heure || '09:00',
      titre,
      classe_nom,
      enseignant_nom: enseignant_nom || '',
      salle:          salle || '',
      duree_minutes:  duree_minutes || 90,
      statut:         'Planifiée',
      notes:          notes || '',
      created_by:     userId,
      created_at:     new Date().toISOString()
    }
    await sbInsert('seances', row)
    adminActions.push({ type: 'seance_planifiee', date, titre, classe_nom })
    return { text: `Séance planifiée : "${titre}" pour la classe ${classe_nom} le ${date} à ${row.heure}${salle ? ' en ' + salle : ''}.`, urls: [] }
  } catch(e) { return { text: `Erreur planification séance : ${e.message}`, urls: [] } }
}

// ── [ADMIN] Modifier / annuler une séance ────────────────────
async function toolModifierSeance(input, userId, role, adminActions) {
  if (role !== 'admin') return { text: '⛔ Outil réservé à l\'administrateur.', urls: [] }
  const { seance_id, statut, date, heure, salle, motif_annulation, notes } = input
  if (!seance_id) return { text: 'ID de la séance requis.', urls: [] }
  try {
    const patch = {}
    if (statut           !== undefined) patch.statut           = statut
    if (date             !== undefined) patch.date             = date
    if (heure            !== undefined) patch.heure            = heure
    if (salle            !== undefined) patch.salle            = salle
    if (motif_annulation !== undefined) patch.motif_annulation = motif_annulation
    if (notes            !== undefined) patch.notes            = notes
    if (!Object.keys(patch).length) return { text: 'Aucune modification spécifiée.', urls: [] }
    patch.updated_at = new Date().toISOString()
    await sbUpdate('seances', `id=eq.${seance_id}`, patch)
    adminActions.push({ type: 'seance_modifiee', seance_id, modifications: patch })
    const champs = Object.entries(patch).filter(([k]) => k !== 'updated_at').map(([k,v]) => `${k} → "${v}"`).join(', ')
    return { text: `Séance ${seance_id} mise à jour : ${champs}.`, urls: [] }
  } catch(e) { return { text: `Erreur modification séance : ${e.message}`, urls: [] } }
}

// ── [ADMIN] Enregistrer les présences ────────────────────────
async function toolEnregistrerPresences(input, userId, role, adminActions) {
  if (role !== 'admin') return { text: '⛔ Outil réservé à l\'administrateur.', urls: [] }
  const { seance_id, presences } = input
  if (!seance_id || !Array.isArray(presences) || !presences.length) {
    return { text: 'seance_id et tableau presences requis.', urls: [] }
  }
  try {
    const rows = presences.map(p => ({
      seance_id,
      etudiant_nom: p.etudiant_nom || p.etudiant || '',
      present:      p.present !== false,
      motif_absence: p.motif_absence || '',
      created_at:   new Date().toISOString()
    }))
    // Upsert sur (seance_id, etudiant_nom)
    await sbUpsert('presences', rows, 'seance_id,etudiant_nom')
    const presents = rows.filter(r => r.present).length
    const absents  = rows.length - presents
    adminActions.push({ type: 'presences_enregistrees', seance_id, total: rows.length, presents, absents })
    return { text: `Présences enregistrées pour la séance ${seance_id} : ${presents} présent(s), ${absents} absent(s) sur ${rows.length} étudiant(s).`, urls: [] }
  } catch(e) { return { text: `Erreur enregistrement présences : ${e.message}`, urls: [] } }
}

// ── [ADMIN] Enregistrer un paiement ──────────────────────────
async function toolEnregistrerPaiement(input, userId, role, adminActions) {
  if (role !== 'admin') return { text: '⛔ Outil réservé à l\'administrateur.', urls: [] }
  const { montant, type_paiement, etudiant_nom, date_paiement, notes, mode_paiement } = input
  if (!montant || !etudiant_nom) return { text: 'Montant et nom de l\'étudiant requis.', urls: [] }
  if (isNaN(Number(montant)) || Number(montant) <= 0) return { text: 'Montant invalide.', urls: [] }
  try {
    const row = {
      montant:       Number(montant),
      type_paiement: type_paiement || 'Mensualité',
      etudiant_nom,
      date_paiement: date_paiement || new Date().toISOString().slice(0, 10),
      notes:         notes || '',
      mode_paiement: mode_paiement || 'Espèces',
      created_by:    userId,
      created_at:    new Date().toISOString()
    }
    await sbInsert('paiements', row)
    adminActions.push({ type: 'paiement_enregistre', montant: row.montant, etudiant_nom, date: row.date_paiement })
    const fmt = n => Number(n).toLocaleString('fr-FR') + ' FCFA'
    return { text: `Paiement enregistré : ${fmt(row.montant)} pour ${etudiant_nom} — ${row.type_paiement} du ${row.date_paiement} (${row.mode_paiement}).`, urls: [] }
  } catch(e) { return { text: `Erreur enregistrement paiement : ${e.message}`, urls: [] } }
}

// ── [ADMIN] Modifier compte utilisateur ──────────────────────
async function toolModifierCompteUtilisateur(input, userId, role, adminActions) {
  if (role !== 'admin') return { text: '⛔ Outil réservé à l\'administrateur.', urls: [] }
  const { utilisateur_id, utilisateur_nom, nouveau_role, ai_tier, actif } = input
  if (!utilisateur_id && !utilisateur_nom) return { text: 'ID ou nom de l\'utilisateur requis.', urls: [] }
  try {
    let uid = utilisateur_id
    if (!uid) {
      const rows = await sbQuery('utilisateurs', `select=id,prenom,nom&nom=ilike.*${utilisateur_nom}*&limit=1`)
      if (!rows.length) return { text: `Utilisateur introuvable : ${utilisateur_nom}.`, urls: [] }
      uid = rows[0].id
    }
    // Empêcher auto-modification de son propre rôle
    if (uid === userId && nouveau_role && nouveau_role !== 'admin') {
      return { text: 'Vous ne pouvez pas modifier votre propre rôle.', urls: [] }
    }
    const patch = {}
    if (nouveau_role !== undefined) patch.role    = nouveau_role
    if (actif        !== undefined) patch.actif   = actif
    if (!Object.keys(patch).length && !ai_tier) return { text: 'Aucune modification spécifiée.', urls: [] }
    if (Object.keys(patch).length) {
      patch.updated_at = new Date().toISOString()
      await sbUpdate('utilisateurs', `id=eq.${uid}`, patch)
    }
    // ai_tier dans ai_config (clé user_{id}_tier)
    if (ai_tier !== undefined) {
      await sbUpsert('ai_config', [{ cle: `user_${uid}_tier`, valeur: ai_tier, updated_by: userId, updated_at: new Date().toISOString() }], 'cle')
    }
    adminActions.push({ type: 'compte_modifie', utilisateur_id: uid, modifications: { ...patch, ai_tier } })
    const champs = [...Object.entries(patch).filter(([k]) => k !== 'updated_at'), ...(ai_tier ? [['ai_tier', ai_tier]] : [])].map(([k,v]) => `${k} → "${v}"`).join(', ')
    return { text: `Compte utilisateur (id: ${uid}) mis à jour : ${champs}.`, urls: [] }
  } catch(e) { return { text: `Erreur modification compte : ${e.message}`, urls: [] } }
}

// ── Paramètres IA par utilisateur ────────────────────────────
async function loadUserOverrides(userId) {
  try {
    const rows = await sbQuery('ai_config', `select=cle,valeur&cle=like.user_${userId}_%25`)
    const out = {}
    for (const r of rows) {
      const key = r.cle.replace(`user_${userId}_`, '')
      out[key] = r.valeur
    }
    return out
  } catch(e) { return {} }
}

// ── Génération d'image (Pollinations.ai — gratuit, sans clé) ─
async function generateImage(prompt) {
  const seed    = Math.floor(Math.random() * 99999)
  const encoded = encodeURIComponent((prompt || '').substring(0, 300))
  const url     = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=500&nologo=true&seed=${seed}&model=flux`
  return { text: `[IMAGE:${url}|${prompt}]`, imageUrl: url, urls: [] }
}

// ── Envoi WhatsApp (Twilio API — texte libre ou Content Template) ──
// templateOptions : { contentSid: 'HXxxx', contentVariables: { "1": "Jean", "2": "TOEIC B2" } }
async function sendWhatsApp(telephone, message, templateOptions = null) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    throw new Error('WhatsApp non configuré — variables manquantes : TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM')
  }

  // Normaliser le numéro — E.164, Côte d'Ivoire +225
  // Depuis 2021 : numéros ivoiriens = 10 chiffres (07XXXXXXXX), le 0 est conservé
  let phone = telephone.replace(/[\s\-().+]/g, '')
  if (phone.startsWith('00225'))  phone = phone.slice(2)          // 00225XXXXXXXXXX → 225XXXXXXXXXX
  else if (phone.startsWith('225') && phone.length >= 11) {/* déjà ok sans + */}
  else if (phone.startsWith('0') && phone.length === 10) phone = '225' + phone  // 0XXXXXXXXX → 2250XXXXXXXXX
  else if (phone.length === 9)    phone = '2250' + phone          // 7XXXXXXXX → 22507XXXXXXXX (ancien format)
  phone = '+' + phone.replace(/^\+/, '')

  const from = TWILIO_WHATSAPP_FROM.replace(/\s/g, '').replace(/^whatsapp:/, '')

  const params = new URLSearchParams({
    From: `whatsapp:${from}`,
    To:   `whatsapp:${phone}`,
  })

  if (templateOptions?.contentSid) {
    // ── Mode Content Template (pré-approuvé Meta) ──────────────
    params.append('ContentSid', templateOptions.contentSid)
    if (templateOptions.contentVariables && Object.keys(templateOptions.contentVariables).length > 0) {
      params.append('ContentVariables', JSON.stringify(templateOptions.contentVariables))
    }
  } else {
    // ── Mode texte libre ───────────────────────────────────────
    params.append('Body', message || '')
  }

  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization:  `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    }
  )

  const data = await res.json()
  if (!res.ok) {
    const errMsg = data?.message || data?.detail || JSON.stringify(data)
    throw new Error(`Twilio WhatsApp : ${errMsg}`)
  }

  // Attendre 3 s puis vérifier le statut réel (détecte sandbox rejeté, template refusé, etc.)
  let finalStatus  = data.status        || 'queued'
  let errorCode    = data.error_code    || null
  let errorMessage = data.error_message || null
  try {
    await new Promise(r => setTimeout(r, 3000))
    const chk = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages/${data.sid}.json`,
      { headers: { Authorization: `Basic ${credentials}` } }
    )
    if (chk.ok) {
      const chkData = await chk.json()
      finalStatus  = chkData.status        || finalStatus
      errorCode    = chkData.error_code    || null
      errorMessage = chkData.error_message || null
    }
  } catch { /* fallback : conserver data.status */ }

  return { messageId: data.sid, phone, status: finalStatus, errorCode, errorMessage }
}

// ── Définition des outils selon le rôle ──────────────────────
function buildTools(role, externalEnabled, imageEnabled) {
  const tools = []

  // ── Recherche web (tous les rôles) ──────────────────────────
  if (externalEnabled) {
    tools.push({
      name: 'recherche_web',
      description: `Recherche des informations actuelles sur internet. Utilise cet outil pour des faits récents, règles de grammaire anglaise, définitions, actualités pédagogiques, procédures administratives, etc.`,
      input_schema: {
        type: 'object',
        properties: {
          query:  { type: 'string', description: 'Requête de recherche précise' },
          langue: { type: 'string', enum: ['fr','en'], description: 'Langue Wikipedia' }
        },
        required: ['query']
      }
    })
  }

  // ── Génération d'image (tous les rôles si activé) ────────────
  if (imageEnabled) {
    tools.push({
      name: 'generer_image',
      description: `Génère une image via IA (Pollinations/Flux) à partir d'une description. Utilise cet outil quand l'utilisateur demande une image, une illustration, un visuel ou une infographie. Écris le prompt en anglais pour de meilleurs résultats.`,
      input_schema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Description détaillée en anglais de l\'image à créer' }
        },
        required: ['prompt']
      }
    })
  }

  // ── Outils marketing (admin + secrétaire) ───────────────────
  if (ADMIN_ROLES.includes(role)) {
    tools.push({
      name: 'lire_config_marketing',
      description: `Lis la configuration marketing actuelle de l'école (prix, descriptions, offres spéciales, statistiques vitrine).`,
      input_schema: { type: 'object', properties: {}, required: [] }
    })
    tools.push({
      name: 'modifier_config_marketing',
      description: `Modifie la configuration marketing : prix, titres, messages de promotion, statistiques affichées.
Clés : prix_general, prix_business, prix_toeic, prix_toefl, prix_bac_bepc, prix_kids, prix_depart, titre_hero, sous_titre_hero, message_cta, stats_apprenants, stats_formations, stats_satisfaction, offre_speciale, periode_inscription, prochaine_rentree, inscription_ouverte, contact_inscription, message_whatsapp_prospection.`,
      input_schema: {
        type: 'object',
        properties: {
          modifications: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                cle:    { type: 'string' },
                valeur: { type: 'string' },
                raison: { type: 'string' }
              },
              required: ['cle','valeur']
            }
          }
        },
        required: ['modifications']
      }
    })
  }

  // ── Rapports de séances (admin, secrétaire, DP, formateur) ──
  if (ADMIN_DIR.includes(role) || role === 'formateur') {
    tools.push({
      name: 'lire_rapports_seances',
      description: `Lis les rapports de séances soumis par les formateurs. ${role === 'formateur' ? 'Tu ne peux voir que tes propres rapports.' : 'Tu peux voir tous les rapports de tous les formateurs.'}
Permet de : voir les thèmes traités, les présences/absences, les observations pédagogiques, la progression.`,
      input_schema: {
        type: 'object',
        properties: {
          classe_nom:    { type: 'string', description: 'Filtrer par nom de classe (optionnel)' },
          formateur_nom: { type: 'string', description: 'Filtrer par formateur (admin/DP seulement)' },
          date_debut:    { type: 'string', description: 'Date de début YYYY-MM-DD' },
          date_fin:      { type: 'string', description: 'Date de fin YYYY-MM-DD' }
        },
        required: []
      }
    })
  }

  // ── Présences / absences (admin, secrétaire, DP, formateur) ─
  if (ADMIN_DIR.includes(role) || role === 'formateur') {
    tools.push({
      name: 'lire_presences_absences',
      description: `Consulte le registre des présences et absences. ${role === 'formateur' ? 'Filtré sur tes classes.' : 'Accès complet à toutes les classes.'}
Fournit : taux global, alertes absences répétées, stats par classe, liste des étudiants en difficulté.`,
      input_schema: {
        type: 'object',
        properties: {
          date_debut: { type: 'string', description: 'Période de début YYYY-MM-DD' },
          date_fin:   { type: 'string', description: 'Période de fin YYYY-MM-DD' }
        },
        required: []
      }
    })
  }

  // ── Devoirs soumis (admin, secrétaire, DP, formateur) ───────
  if (ADMIN_DIR.includes(role) || role === 'formateur') {
    tools.push({
      name: 'lire_devoirs_soumis',
      description: `Consulte les devoirs soumis par les étudiants. ${role === 'formateur' ? 'Filtré sur tes classes.' : 'Accès complet.'}
Permet de savoir : quels devoirs attendent correction, notes attribuées, retards.`,
      input_schema: {
        type: 'object',
        properties: {
          statut:     { type: 'string', enum: ['Soumis','Corrigé','En attente','En retard'], description: 'Filtrer par statut' },
          classe_nom: { type: 'string', description: 'Filtrer par classe' }
        },
        required: []
      }
    })
  }

  // ── Messages reçus (tous les rôles sauf étudiant anonyme) ───
  if (['admin','secretaire','directeur_pedagogique','sous_directeur_pedagogique','formateur','etudiant'].includes(role)) {
    tools.push({
      name: 'lire_messages_recus',
      description: `Lis les messages reçus dans ta boîte de messagerie. Affiche les ${role === 'etudiant' ? 'messages de l\'administration' : 'derniers messages reçus'} avec expéditeur, sujet et contenu.`,
      input_schema: {
        type: 'object',
        properties: {
          limit:              { type: 'number', description: 'Nombre de messages à afficher (max 20)' },
          non_lus_seulement:  { type: 'boolean', description: 'Afficher uniquement les messages non lus' }
        },
        required: []
      }
    })
  }

  // ── Envoi de messages (tous les rôles — portée selon le rôle) ─
  {
    const msgDesc = role === 'etudiant'
      ? `Envoie un message à l'administration (admin ou secrétaire) depuis ta messagerie. Utilise cet outil pour poser une question à l'administration, signaler un problème, ou transmettre une information.`
      : role === 'formateur'
      ? `Envoie un message à l'administration (admin, secrétaire) ou à tes étudiants. Utilise cet outil pour contacter l'administration ou envoyer une notification à tes apprenants.`
      : `Envoie un message à un utilisateur (formateur, étudiant, DP, admin) ou à tous les membres d'un rôle. Utilise cet outil quand on demande d'envoyer/transmettre un message, une notification, un rappel, une convocation. IMPORTANT : Confirme toujours le contenu et le destinataire avant d'envoyer.`

    const destRoleEnum = role === 'etudiant'
      ? { type: 'string', enum: ['admin', 'secretaire'], description: 'Rôle du destinataire' }
      : role === 'formateur'
      ? { type: 'string', enum: ['admin', 'secretaire', 'etudiant'], description: 'Rôle du destinataire' }
      : { type: 'string', description: 'Rôle du destinataire pour envoi groupé (ex: "formateur", "etudiant")' }

    tools.push({
      name: 'envoyer_message',
      description: msgDesc,
      input_schema: {
        type: 'object',
        properties: {
          destinataire:      { type: 'string', description: 'Nom du destinataire (ex: "Koné", "Marie Dupont")' },
          destinataire_role: destRoleEnum,
          sujet:             { type: 'string', description: 'Sujet du message' },
          contenu:           { type: 'string', description: 'Corps du message complet' }
        },
        required: ['sujet', 'contenu']
      }
    })
  }

  // ── Séances à venir (tous les rôles) ────────────────────────
  {
    const seanceDesc = role === 'formateur'
      ? `Consulte les prochaines séances de tes classes. Utilise cet outil pour voir ton planning, les cours à venir, les créneaux prévus.`
      : role === 'etudiant'
      ? `Consulte les prochaines séances de cours planifiées pour toi. Utilise cet outil pour voir le planning, les horaires, les prochains cours.`
      : `Consulte le calendrier des séances à venir pour toutes les classes ou une classe spécifique.`
    tools.push({
      name: 'lire_seances_a_venir',
      description: seanceDesc,
      input_schema: {
        type: 'object',
        properties: {
          classe_nom:  { type: 'string',  description: 'Filtrer par classe (optionnel)' },
          date_debut:  { type: 'string',  description: 'Date de début YYYY-MM-DD (défaut : aujourd\'hui)' },
          date_fin:    { type: 'string',  description: 'Date de fin YYYY-MM-DD (optionnel)' },
          limit:       { type: 'number',  description: 'Nombre de séances à afficher (défaut : 20)' }
        },
        required: []
      }
    })
  }

  // ── Enregistrer un prospect / nouveau client (admin + secrétaire) ─
  if (ADMIN_ROLES.includes(role)) {
    tools.push({
      name: 'enregistrer_prospect',
      description: `Enregistre les informations d'un nouveau client ou prospect qui se présente à l'accueil, appelle, ou envoie un message.
Utilise cet outil quand un visiteur donne ses coordonnées ou exprime un intérêt pour les formations. Les informations sont automatiquement transmises à l'administration.
Capture : nom, prénom, téléphone, email, type de formation souhaité, niveau actuel.
IMPORTANT : Confirme le résumé des informations avec le client avant d'enregistrer.`,
      input_schema: {
        type: 'object',
        properties: {
          nom:            { type: 'string', description: 'Nom de famille du prospect' },
          prenom:         { type: 'string', description: 'Prénom du prospect' },
          telephone:      { type: 'string', description: 'Numéro de téléphone (principal)' },
          email:          { type: 'string', description: 'Adresse email (optionnel)' },
          type_formation: { type: 'string', description: 'Formation qui intéresse le prospect (ex: "Business English", "TOEIC", "Général A1")' },
          niveau_actuel:  { type: 'string', description: 'Niveau d\'anglais actuel auto-évalué (ex: "Débutant", "Intermédiaire", "A2")' },
          message:        { type: 'string', description: 'Remarques ou préoccupations particulières exprimées par le prospect' },
          source:         { type: 'string', description: 'Comment le prospect nous a trouvés (ex: "bouche à oreille", "réseaux sociaux", "accueil physique")' }
        },
        required: []
      }
    })

    tools.push({
      name: 'lire_prospects',
      description: `Consulte la liste des prospects et nouveaux clients enregistrés. Permet de suivre les leads, voir les demandes en attente de rappel, analyser les sources d'acquisition.`,
      input_schema: {
        type: 'object',
        properties: {
          limit:          { type: 'number', description: 'Nombre de prospects à afficher (défaut : 20, max : 50)' },
          source:         { type: 'string', description: 'Filtrer par source (ex: "vitrine", "accueil")' },
          type_formation: { type: 'string', description: 'Filtrer par formation souhaitée' }
        },
        required: []
      }
    })
  }

  // ── Génération de certificat (admin + secrétaire) ────────────
  if (ADMIN_ROLES.includes(role)) {
    tools.push({
      name: 'generer_certificat',
      description: `Génère et enregistre un certificat de niveau CECRL pour un étudiant.
Utilise cet outil après un test de placement ou sur demande d'émission de certificat.
Le certificat apparaîtra immédiatement dans la section Certificats du dashboard.`,
      input_schema: {
        type: 'object',
        properties: {
          prenom:        { type: 'string', description: 'Prénom de l\'étudiant' },
          nom:           { type: 'string', description: 'Nom de famille (en majuscules)' },
          niveau:        { type: 'string', enum: ['A1','A2','B1','B2','C1','C2'], description: 'Niveau CECRL obtenu' },
          score:         { type: 'number', description: 'Score obtenu sur 20' },
          email:         { type: 'string', description: 'Email de l\'étudiant (optionnel)' },
          telephone:     { type: 'string', description: 'Téléphone (optionnel)' },
          etablissement: { type: 'string', description: 'Établissement d\'origine (optionnel)' }
        },
        required: ['prenom', 'nom', 'niveau']
      }
    })
  }

  // ── WhatsApp (admin + secrétaire — si configuré) ─────────────
  if (ADMIN_ROLES.includes(role) && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM) {
    tools.push({
      name: 'envoyer_whatsapp',
      description: `Envoie un message WhatsApp à un étudiant, un parent ou un prospect via le numéro Business de l'école.

DEUX MODES DISPONIBLES :

• MODE LIBRE (template: "libre") : rédige un texte personnalisé dans le champ "message". Utilisé pour des messages ponctuels hors template.

• MODE TEMPLATE (template: "etudiant" ou "nouveau") : utilise un template officiel pré-approuvé Meta.

  ── Template "etudiant" ──────────────────────────────────────────
  Texte : "Bonjour {{1}}, votre séance de {{2}} est prévue le {{3}}. Merci de confirmer votre présence. — AGTM Digital Academy"
  Variables OBLIGATOIRES :
    "1" → prénom et nom de l'étudiant   ex: "Jean Koné"
    "2" → nom du cours / formation      ex: "TOEIC B2"
    "3" → date et heure de la séance    ex: "lundi 14 avril à 09h00"
  ⚠️ Les 3 variables sont requises pour ce template.

  ── Template "nouveau" ──────────────────────────────────────────
  Texte : "Bonjour {{1}}, bienvenue à l'AGTM Digital Academy ! Votre inscription en {{2}} est confirmée. Connectez-vous sur : {{3}} — Nous sommes ravis de vous accompagner vers la réussite. 🎓"
  Variables OBLIGATOIRES :
    "1" → prénom et nom du nouvel étudiant   ex: "Marie Koffi"
    "2" → nom de la formation               ex: "TOEIC Préparation"
    "3" → lien d'accès à la plateforme      ex: "africaglobaltraining.com"
  ⚠️ Les 3 variables sont requises pour ce template.

RÈGLE CRITIQUE : Utilise TOUJOURS un template ("etudiant" ou "nouveau") pour tout envoi sortant. Le mode "libre" ne fonctionne QUE si le destinataire a lui-même écrit au numéro de l'école dans les dernières 24h. Pour tous les rappels, convocations, confirmations d'inscription → utilise obligatoirement un template approuvé.

RÈGLE : Demande toujours confirmation avant d'envoyer. Résume le destinataire, le mode et le contenu prévu.`,
      input_schema: {
        type: 'object',
        properties: {
          telephone: {
            type: 'string',
            description: 'Numéro de téléphone du destinataire (ex: 07 XX XX XX XX ou +225 07 XX XX XX XX)'
          },
          message: {
            type: 'string',
            description: 'Texte libre du message — requis si template = "libre" ou absent. Max 4096 caractères, professionnel, en français.'
          },
          template: {
            type: 'string',
            enum: ['libre', 'etudiant', 'nouveau'],
            description: 'Mode d\'envoi : "libre" = texte personnalisé | "etudiant" = template avec variables first_name/discount_code/discount_percentage | "nouveau" = message de bienvenue fixe sans variables. Par défaut : "libre".'
          },
          variables: {
            type: 'object',
            description: 'Variables des templates. Clés numériques dans l\'ordre d\'apparition. Template "etudiant" : {"1": "prénom étudiant", "2": "nom du cours", "3": "date et heure"}. Template "nouveau" : {"1": "prénom étudiant", "2": "nom de la formation", "3": "africaglobaltraining.com"}. Requis pour les deux templates.',
            additionalProperties: { type: 'string' }
          },
          destinataire_nom: {
            type: 'string',
            description: 'Nom complet du destinataire — pour la confirmation dans le résumé'
          }
        },
        required: ['telephone']
      }
    })
  }

  // ── Recherche fiche étudiant (admin + secrétaire) ────────────
  if (ADMIN_ROLES.includes(role)) {
    tools.push({
      name: 'rechercher_etudiant',
      description: `Recherche la fiche complète d'un ou plusieurs étudiants dans la base de données de l'école. Retourne les coordonnées de contact : téléphone, WhatsApp, email, adresse, ainsi que le niveau, statut, mode de cours et formations.
Utilise cet outil SYSTÉMATIQUEMENT quand tu as besoin du numéro de téléphone ou WhatsApp d'un étudiant pour lui envoyer un message, ou pour retrouver ses informations de contact.
Exemples : "Quel est le téléphone de Jean Koné ?", "Je veux contacter Marie Diallo", "Envoie un WhatsApp à Cyrille Bema".`,
      input_schema: {
        type: 'object',
        properties: {
          nom:             { type: 'string', description: 'Nom de famille (partiel accepté, insensible à la casse)' },
          prenom:          { type: 'string', description: 'Prénom (partiel accepté)' },
          telephone:       { type: 'string', description: 'Numéro de téléphone ou WhatsApp à rechercher' },
          numero_dossier:  { type: 'string', description: 'Numéro de dossier (ex: EIP-2026-0007)' }
        },
        required: []
      }
    })
  }

  // ── Inscriptions étudiants (admin uniquement) ────────────────
  if (role === 'admin') {
    tools.push({
      name: 'lire_inscriptions',
      description: `Consulte la liste et les statistiques des étudiants inscrits à l'école. Permet de faire le point des inscriptions : total, répartition par statut (Actif/Inactif/Suspendu), par niveau (A1→C2), par mode de cours, par source d'acquisition. Utilise cet outil quand l'administrateur demande un bilan des inscriptions, la liste des étudiants actifs, ou des statistiques d'effectifs.`,
      input_schema: {
        type: 'object',
        properties: {
          filtre_statut: { type: 'string', enum: ['Actif','Inactif','Suspendu'], description: 'Filtrer par statut (optionnel)' },
          filtre_niveau: { type: 'string', enum: ['A1','A2','B1','B2','C1','C2'],  description: 'Filtrer par niveau (optionnel)' },
          limit:         { type: 'number', description: 'Nombre maximum de résultats (défaut : 50, max : 100)' }
        },
        required: []
      }
    })
  }

  // ── Paiements / finances (admin UNIQUEMENT — données financières) ─
  if (role === 'admin') {
    tools.push({
      name: 'lire_paiements',
      description: `Consulte les données financières de l'école : paiements encaissés, dépenses, solde. OUTIL STRICTEMENT RÉSERVÉ À L'ADMINISTRATEUR. N'utilise jamais cet outil pour un autre rôle. Permet de faire le point des paiements reçus, voir les encaissements du mois, calculer le solde financier, lister les dépenses.`,
      input_schema: {
        type: 'object',
        properties: {
          periode: { type: 'string', description: 'Période à analyser. Format : "AAAA-MM" (ex: "2026-04") pour un mois, "AAAA" (ex: "2026") pour une année. Laisser vide pour les 50 derniers mouvements.' },
          limit:   { type: 'number', description: 'Nombre maximum de lignes (défaut : 50, max : 100)' }
        },
        required: []
      }
    })
  }

  // ── Liste des certificats (admin, secrétaire, DP) ────────────
  if (ADMIN_DIR.includes(role)) {
    tools.push({
      name: 'lire_certificats',
      description: `Consulte la liste des certificats de niveau émis par l'école. Permet de vérifier un code certificat, de trouver le niveau d'un étudiant, ou de voir les statistiques d'émission.`,
      input_schema: {
        type: 'object',
        properties: {
          nom:    { type: 'string', description: 'Filtrer par nom de l\'étudiant' },
          niveau: { type: 'string', enum: ['A1','A2','B1','B2','C1','C2'], description: 'Filtrer par niveau' }
        },
        required: []
      }
    })
  }

  // ── Ressources Humaines — admin + secrétaire (lecture) ───────
  if (RH_ROLES.includes(role) || ADMIN_DIR.includes(role)) {
    tools.push({
      name: 'lire_personnel_rh',
      description: `Consulte la liste complète du personnel et des formateurs : coordonnées, poste, type de contrat, date d'embauche, statut (Actif/En congé/Inactif), taux de rémunération par séance. Utilise cet outil pour faire le point des effectifs, chercher un employé, voir les contrats en cours.`,
      input_schema: {
        type: 'object',
        properties: {
          poste:  { type: 'string', description: 'Filtrer par poste (ex: "Formateur", "Directeur")' },
          statut: { type: 'string', enum: ['Actif','En congé','Inactif'], description: 'Filtrer par statut' },
          limit:  { type: 'number', description: 'Nombre de résultats (défaut: 30)' }
        },
        required: []
      }
    })

    tools.push({
      name: 'rechercher_formateur',
      description: `Recherche la fiche complète d'un formateur ou membre du personnel : contact, contrat, compte dashboard. Utilise cet outil pour retrouver les informations d'un formateur spécifique.`,
      input_schema: {
        type: 'object',
        properties: {
          nom:       { type: 'string', description: 'Nom de famille' },
          prenom:    { type: 'string', description: 'Prénom' },
          email:     { type: 'string', description: 'Email' },
          telephone: { type: 'string', description: 'Numéro de téléphone' }
        },
        required: []
      }
    })

    tools.push({
      name: 'lire_conges',
      description: `Consulte les demandes de congé du personnel : statut (En attente/Approuvé/Refusé), dates, durée, motif. Permet de suivre les absences planifiées et les congés en cours.`,
      input_schema: {
        type: 'object',
        properties: {
          statut:        { type: 'string', enum: ['En attente','Approuvé','Refusé'], description: 'Filtrer par statut' },
          personnel_nom: { type: 'string', description: 'Filtrer par nom d\'employé' },
          limit:         { type: 'number', description: 'Nombre de résultats (défaut: 20)' }
        },
        required: []
      }
    })
  }

  // ── RH — formateur : ses propres honoraires ────────────────
  if (role === 'formateur') {
    tools.push({
      name: 'lire_honoraires_formateurs',
      description: `Consulte tes honoraires par séance : montants calculés, statut de validation et de paiement. Utilise cet outil pour voir ce qui t'est dû et ce qui a été payé.`,
      input_schema: {
        type: 'object',
        properties: {
          statut:  { type: 'string', enum: ['en_attente','valide','paye'], description: 'Filtrer par statut' },
          periode: { type: 'string', description: 'Mois YYYY-MM (ex: "2026-04")' },
          limit:   { type: 'number', description: 'Nombre de résultats (défaut: 30)' }
        },
        required: []
      }
    })
  }

  // ── RH écriture + finances RH — ADMIN UNIQUEMENT ──────────
  if (role === 'admin') {
    tools.push({
      name: 'ajouter_personnel',
      description: `Ajoute un nouveau membre du personnel (formateur, secrétaire, etc.) dans la base RH. Capture : nom, prénom, poste, type de contrat, date d'embauche, contacts, salaire/taux. IMPORTANT : Confirme les informations avant d'enregistrer.`,
      input_schema: {
        type: 'object',
        properties: {
          nom:           { type: 'string', description: 'Nom de famille (en majuscules)' },
          prenom:        { type: 'string', description: 'Prénom' },
          poste:         { type: 'string', description: 'Poste (ex: "Formateur", "Secrétaire", "Directeur")' },
          type_contrat:  { type: 'string', enum: ['CDI','CDD','Stage','Freelance','Vacation'], description: 'Type de contrat' },
          date_embauche: { type: 'string', description: 'Date d\'embauche YYYY-MM-DD' },
          telephone:     { type: 'string', description: 'Numéro de téléphone' },
          email:         { type: 'string', description: 'Adresse email' },
          salaire_base:  { type: 'number', description: 'Salaire fixe mensuel en FCFA (optionnel)' },
          taux_seance:   { type: 'number', description: 'Rémunération variable par séance en FCFA (optionnel)' },
          notes:         { type: 'string', description: 'Notes libres' }
        },
        required: ['nom','prenom','poste']
      }
    })

    tools.push({
      name: 'modifier_personnel_rh',
      description: `Modifie la fiche RH d'un membre du personnel : coordonnées, statut (Actif/En congé/Inactif), type de contrat, salaire, taux séance, date de fin de contrat. IMPORTANT : Demande confirmation avant d'exécuter.`,
      input_schema: {
        type: 'object',
        properties: {
          id:              { type: 'string', description: 'ID du membre du personnel (si connu)' },
          nom:             { type: 'string', description: 'Nom pour recherche (si id absent)' },
          prenom:          { type: 'string', description: 'Prénom pour affiner la recherche' },
          telephone:       { type: 'string', description: 'Nouveau téléphone' },
          email:           { type: 'string', description: 'Nouvel email' },
          statut:          { type: 'string', enum: ['Actif','En congé','Inactif'], description: 'Nouveau statut' },
          type_contrat:    { type: 'string', enum: ['CDI','CDD','Stage','Freelance','Vacation'], description: 'Nouveau type de contrat' },
          salaire_base:    { type: 'number', description: 'Nouveau salaire de base en FCFA' },
          taux_seance:     { type: 'number', description: 'Nouveau taux par séance en FCFA' },
          date_fin_contrat:{ type: 'string', description: 'Date de fin de contrat YYYY-MM-DD' },
          notes:           { type: 'string', description: 'Notes libres' }
        },
        required: []
      }
    })

    tools.push({
      name: 'gerer_conge',
      description: `Gère les congés du personnel : créer une demande, approuver ou refuser une demande existante. IMPORTANT : Pour approuver ou refuser, confirme avec l'utilisateur avant d'exécuter.`,
      input_schema: {
        type: 'object',
        properties: {
          action:        { type: 'string', enum: ['creer','approuver','refuser'], description: 'Action à exécuter' },
          conge_id:      { type: 'number', description: 'ID du congé (requis pour approuver/refuser)' },
          personnel_nom: { type: 'string', description: 'Nom du membre du personnel (pour créer)' },
          type_conge:    { type: 'string', description: 'Type de congé (ex: "Congé annuel", "Congé maladie")' },
          date_debut:    { type: 'string', description: 'Date de début YYYY-MM-DD' },
          date_fin:      { type: 'string', description: 'Date de fin YYYY-MM-DD' },
          nb_jours:      { type: 'number', description: 'Nombre de jours' },
          motif:         { type: 'string', description: 'Motif de la demande' }
        },
        required: ['action']
      }
    })

    tools.push({
      name: 'lire_fiches_paie',
      description: `Consulte les fiches de paie mensuelles du personnel : salaires, primes, retenues, net à payer, statut de paiement. DONNÉES STRICTEMENT CONFIDENTIELLES — réservé à l'administrateur.`,
      input_schema: {
        type: 'object',
        properties: {
          personnel_nom: { type: 'string', description: 'Filtrer par nom d\'employé' },
          periode:       { type: 'string', description: 'Filtrer par période (ex: "Avril 2026")' },
          statut:        { type: 'string', enum: ['En attente','Payé'], description: 'Filtrer par statut de paiement' },
          limit:         { type: 'number', description: 'Nombre de fiches (défaut: 20)' }
        },
        required: []
      }
    })

    tools.push({
      name: 'lire_honoraires_formateurs',
      description: `Consulte les honoraires de tous les formateurs par séance : montants calculés selon les présences, statut (en_attente/valide/paye). Permet de valider et suivre la rémunération variable des formateurs.`,
      input_schema: {
        type: 'object',
        properties: {
          formateur_nom: { type: 'string', description: 'Filtrer par formateur' },
          statut:        { type: 'string', enum: ['en_attente','valide','paye'], description: 'Filtrer par statut' },
          periode:       { type: 'string', description: 'Mois YYYY-MM (ex: "2026-04")' },
          limit:         { type: 'number', description: 'Nombre de résultats (défaut: 30)' }
        },
        required: []
      }
    })

    tools.push({
      name: 'valider_honoraires',
      description: `Valide ou marque comme payés les honoraires des formateurs. Peut agir sur un honoraire individuel (par ID) ou sur tous les honoraires d'un formateur pour un mois. IMPORTANT : Confirme avant de valider en lot.`,
      input_schema: {
        type: 'object',
        properties: {
          action:        { type: 'string', enum: ['valider','marquer_paye','valider_tous','marquer_paye_tous'], description: 'Action à exécuter' },
          honoraire_id:  { type: 'number', description: 'ID de l\'honoraire individuel' },
          formateur_nom: { type: 'string', description: 'Nom du formateur (pour opérations en lot)' },
          periode:       { type: 'string', description: 'Mois YYYY-MM (pour opérations en lot)' }
        },
        required: ['action']
      }
    })

    tools.push({
      name: 'lire_candidatures_rh',
      description: `Consulte les dossiers de candidature pour le recrutement de formateurs : profil, expérience, matières, disponibilités, statut (Nouveau/En étude/Retenu/Refusé).`,
      input_schema: {
        type: 'object',
        properties: {
          statut: { type: 'string', enum: ['Nouveau','En étude','Retenu','Refusé'], description: 'Filtrer par statut' },
          poste:  { type: 'string', description: 'Filtrer par poste recherché' },
          limit:  { type: 'number', description: 'Nombre de résultats (défaut: 20)' }
        },
        required: []
      }
    })

    tools.push({
      name: 'modifier_statut_candidature',
      description: `Met à jour le statut d'un dossier de candidature (Nouveau → En étude → Retenu/Refusé). Utilise cet outil après examen d'un CV ou suite à un entretien. IMPORTANT : Confirme avant de passer à "Retenu" ou "Refusé".`,
      input_schema: {
        type: 'object',
        properties: {
          candidature_id: { type: 'number', description: 'ID de la candidature' },
          statut: { type: 'string', enum: ['Nouveau','En étude','Retenu','Refusé'], description: 'Nouveau statut' },
          notes:  { type: 'string', description: 'Notes ou commentaires sur la décision' }
        },
        required: ['candidature_id','statut']
      }
    })
  }

  // ── Outils d'écriture — ADMIN UNIQUEMENT ─────────────────────
  if (role === 'admin') {
    tools.push({
      name: 'modifier_etudiant',
      description: `Modifie la fiche d'un étudiant existant : téléphone, WhatsApp, email, niveau, statut (Actif/Inactif/Suspendu), mode de cours (Présentiel/En ligne/Hybride), notes.
Utilise cet outil quand l'admin demande de mettre à jour les infos d'un étudiant, changer son niveau, activer ou suspendre son compte.
IMPORTANT : Demande toujours confirmation avant d'exécuter.`,
      input_schema: {
        type: 'object',
        properties: {
          id:          { type: 'string',  description: 'UUID de l\'étudiant (si connu)' },
          nom:         { type: 'string',  description: 'Nom de famille pour recherche (si id absent)' },
          prenom:      { type: 'string',  description: 'Prénom pour affiner la recherche' },
          telephone:   { type: 'string',  description: 'Nouveau numéro de téléphone' },
          whatsapp:    { type: 'string',  description: 'Nouveau numéro WhatsApp' },
          email:       { type: 'string',  description: 'Nouvel email' },
          niveau:      { type: 'string',  enum: ['A1','A2','B1','B2','C1','C2'], description: 'Nouveau niveau CECRL' },
          statut:      { type: 'string',  enum: ['Actif','Inactif','Suspendu'], description: 'Nouveau statut' },
          mode_cours:  { type: 'string',  enum: ['Présentiel','En ligne','Hybride'], description: 'Nouveau mode de cours' },
          notes:       { type: 'string',  description: 'Notes libres sur l\'étudiant' }
        },
        required: []
      }
    })

    tools.push({
      name: 'planifier_seance',
      description: `Planifie une nouvelle séance de cours dans le calendrier de l'école.
Utilise cet outil quand l'admin veut créer une séance, ajouter un cours au planning, programmer une session.
IMPORTANT : Confirme les détails (date, heure, classe, formateur) avant de créer.`,
      input_schema: {
        type: 'object',
        properties: {
          date:          { type: 'string', description: 'Date de la séance YYYY-MM-DD' },
          heure:         { type: 'string', description: 'Heure de début HH:MM (défaut : 09:00)' },
          titre:         { type: 'string', description: 'Titre / sujet de la séance (ex: "Speaking B2 — Negotiations")' },
          classe_nom:    { type: 'string', description: 'Nom de la classe concernée' },
          enseignant_nom:{ type: 'string', description: 'Nom du formateur/enseignant' },
          salle:         { type: 'string', description: 'Salle ou lieu (optionnel)' },
          duree_minutes: { type: 'number', description: 'Durée en minutes (défaut : 90)' },
          notes:         { type: 'string', description: 'Notes supplémentaires' }
        },
        required: ['date', 'titre', 'classe_nom']
      }
    })

    tools.push({
      name: 'planifier_et_notifier',
      description: `Crée une séance de cours ET envoie immédiatement une notification WhatsApp à tous les étudiants inscrits dans la classe.
Utilise cet outil quand l'admin veut planifier un cours et prévenir les étudiants en une seule action.
Le message WhatsApp utilise le template officiel : "Bonjour {prénom}, votre séance de {titre} est prévue le {date} à {heure}."
IMPORTANT : Confirme la date, l'heure, la classe et le nombre d'étudiants avant d'envoyer.`,
      input_schema: {
        type: 'object',
        properties: {
          date:             { type: 'string', description: 'Date de la séance YYYY-MM-DD' },
          heure:            { type: 'string', description: 'Heure de début HH:MM (défaut : 09:00)' },
          titre:            { type: 'string', description: 'Titre ou sujet de la séance' },
          classe_nom:       { type: 'string', description: 'Nom exact de la classe' },
          enseignant_nom:   { type: 'string', description: 'Nom du formateur (optionnel)' },
          salle:            { type: 'string', description: 'Salle ou lieu (optionnel)' },
          duree_minutes:    { type: 'number', description: 'Durée en minutes (défaut : 90)' },
          notes:            { type: 'string', description: 'Notes supplémentaires' },
          notifier_whatsapp:{ type: 'boolean', description: 'Envoyer les notifications WhatsApp aux étudiants (défaut : true)' }
        },
        required: ['date', 'titre', 'classe_nom']
      }
    })

    tools.push({
      name: 'notifier_classe_whatsapp',
      description: `Envoie une notification WhatsApp à TOUS les étudiants inscrits dans une classe donnée.
Utilise cet outil pour rappeler une séance, envoyer une information urgente, ou notifier un groupe d'étudiants sans avoir à les contacter un par un.
Modes : template officiel "etudiant" (avec prénom, titre séance, date/heure) ou message libre.
IMPORTANT : Confirme la classe et le nombre d'étudiants concernés avant d'envoyer.`,
      input_schema: {
        type: 'object',
        properties: {
          classe_nom:    { type: 'string',  description: 'Nom de la classe à notifier' },
          template:      { type: 'string',  enum: ['etudiant','libre'], description: '"etudiant" = template pré-approuvé Meta | "libre" = message personnalisé (24h window seulement)' },
          titre_seance:  { type: 'string',  description: 'Titre de la séance (variable 2 du template etudiant)' },
          date_seance:   { type: 'string',  description: 'Date de la séance (ex: "lundi 21 avril")' },
          heure_seance:  { type: 'string',  description: 'Heure de la séance (ex: "09h00")' },
          message_libre: { type: 'string',  description: 'Texte libre (si template = "libre"). Max 1600 caractères.' }
        },
        required: ['classe_nom', 'template']
      }
    })

    tools.push({
      name: 'modifier_seance',
      description: `Modifie ou annule une séance existante : changer la date, l'heure, la salle, ou passer le statut à "Annulée" avec un motif.
Utilise cet outil quand l'admin veut reporter, déplacer ou annuler une séance planifiée.
IMPORTANT : Demande confirmation avant d'annuler une séance.`,
      input_schema: {
        type: 'object',
        properties: {
          seance_id:       { type: 'string', description: 'ID (UUID) de la séance à modifier' },
          statut:          { type: 'string', enum: ['Planifiée','En cours','Terminée','Annulée'], description: 'Nouveau statut' },
          date:            { type: 'string', description: 'Nouvelle date YYYY-MM-DD' },
          heure:           { type: 'string', description: 'Nouvelle heure HH:MM' },
          salle:           { type: 'string', description: 'Nouvelle salle' },
          motif_annulation:{ type: 'string', description: 'Raison de l\'annulation (si statut = Annulée)' },
          notes:           { type: 'string', description: 'Notes supplémentaires' }
        },
        required: ['seance_id']
      }
    })

    tools.push({
      name: 'enregistrer_presences',
      description: `Enregistre les présences et absences pour une séance donnée.
Utilise cet outil quand l'admin veut saisir les présences, noter des absences, ou valider une feuille de présence.
Fournis la liste complète des étudiants avec leur statut de présence.`,
      input_schema: {
        type: 'object',
        properties: {
          seance_id: { type: 'string', description: 'ID de la séance' },
          presences: {
            type: 'array',
            description: 'Liste des étudiants avec leur présence',
            items: {
              type: 'object',
              properties: {
                etudiant_nom:   { type: 'string',  description: 'Nom complet de l\'étudiant' },
                present:        { type: 'boolean', description: 'true = présent, false = absent' },
                motif_absence:  { type: 'string',  description: 'Motif si absent (optionnel)' }
              },
              required: ['etudiant_nom', 'present']
            }
          }
        },
        required: ['seance_id', 'presences']
      }
    })

    tools.push({
      name: 'enregistrer_paiement',
      description: `Enregistre un paiement reçu d'un étudiant dans la comptabilité de l'école.
Utilise cet outil pour saisir une mensualité, un frais d'inscription, ou tout autre paiement.
IMPORTANT : Confirme le montant et l'étudiant avant d'enregistrer — cette action est financière.`,
      input_schema: {
        type: 'object',
        properties: {
          montant:       { type: 'number', description: 'Montant en FCFA (ex: 35000)' },
          etudiant_nom:  { type: 'string', description: 'Nom complet de l\'étudiant payeur' },
          type_paiement: { type: 'string', enum: ['Mensualité','Inscription','TOEIC','TOEFL','Autre'], description: 'Type de paiement' },
          date_paiement: { type: 'string', description: 'Date du paiement YYYY-MM-DD (défaut : aujourd\'hui)' },
          mode_paiement: { type: 'string', enum: ['Espèces','Virement','Mobile Money','Chèque','Autre'], description: 'Mode de règlement' },
          notes:         { type: 'string', description: 'Notes libres (ex: numéro de reçu, remarque)' }
        },
        required: ['montant', 'etudiant_nom']
      }
    })

    tools.push({
      name: 'modifier_compte_utilisateur',
      description: `Modifie le compte d'un utilisateur du système : changer son rôle (formateur, secrétaire, DP…), son niveau d'accès IA (ai_tier : essentiel/recommande/premium), ou activer/désactiver son compte.
Utilise cet outil pour promouvoir un utilisateur, changer ses droits ou ajuster son accès à l'IA.
IMPORTANT : Action sensible — demande confirmation avant d'exécuter.`,
      input_schema: {
        type: 'object',
        properties: {
          utilisateur_id:  { type: 'string', description: 'UUID de l\'utilisateur (si connu)' },
          utilisateur_nom: { type: 'string', description: 'Nom pour recherche (si id absent)' },
          nouveau_role:    { type: 'string', enum: ['admin','secretaire','directeur_pedagogique','sous_directeur_pedagogique','formateur','etudiant'], description: 'Nouveau rôle' },
          ai_tier:         { type: 'string', enum: ['essentiel','recommande','premium'], description: 'Niveau d\'accès IA' },
          actif:           { type: 'boolean', description: 'true = activer le compte, false = désactiver' }
        },
        required: []
      }
    })
  }

  return tools
}

// ── Exécuter un outil ────────────────────────────────────────
async function executeTool(toolName, toolInput, userId, role, userInfo, adminActions, searchMode) {
  const sm = searchMode || 'all'

  if (toolName === 'recherche_web') {
    if (sm === 'none') return { text: 'La recherche web est désactivée pour votre compte.', urls: [], engine: null }
    const lang = toolInput.langue || 'fr'
    let result = null
    let engine = null
    if (['all','tavily'].includes(sm))            { result = await searchTavily(toolInput.query);           if (result) engine = 'tavily' }
    if (!result && ['all','brave'].includes(sm))  { result = await searchBrave(toolInput.query);            if (result) engine = 'brave'  }
    if (!result && sm !== 'none')                 { result = await searchWikipedia(toolInput.query, lang);  if (result) engine = 'wiki'   }
    if (!result && lang === 'fr' && sm !== 'none'){ result = await searchWikipedia(toolInput.query, 'en');  if (result) engine = 'wiki'   }
    const out = result || { text: `Aucun résultat pour : "${toolInput.query}". Réponds avec tes connaissances générales.`, urls: [] }
    out.engine = engine
    return out
  }

  if (toolName === 'generer_image') {
    return generateImage(toolInput.prompt || toolInput.description || 'illustration')
  }

  if (toolName === 'lire_config_marketing') {
    try {
      const cfg = await loadMarketingConfig()
      return { text: `Configuration marketing :\n${Object.entries(cfg).map(([k,v])=>`${k}: ${v}`).join('\n')}`, urls: [] }
    } catch (e) {
      return { text: 'Erreur lecture configuration marketing.', urls: [] }
    }
  }

  if (toolName === 'modifier_config_marketing') {
    const mods = toolInput.modifications || []
    if (!mods.length) return { text: 'Aucune modification spécifiée.', urls: [] }
    try {
      const now = new Date().toISOString()
      const rows = mods.map(m => ({ cle: m.cle, valeur: m.valeur, updated_by: userId, updated_at: now }))
      await sbUpsert('marketing_config', rows, 'cle')
      adminActions.push({ type: 'marketing_modifie', modifications: mods })
      return { text: `Modifications appliquées :\n${mods.map(m=>`- ${m.cle} = "${m.valeur}"`).join('\n')}`, urls: [] }
    } catch (e) {
      return { text: `Erreur marketing : ${e.message}`, urls: [] }
    }
  }

  if (toolName === 'lire_rapports_seances')  return toolLireRapports(toolInput, userId, role, userInfo)
  if (toolName === 'lire_presences_absences') return toolLirePresences(toolInput, userId, role)
  if (toolName === 'lire_devoirs_soumis')     return toolLireDevoirs(toolInput, userId, role, userInfo)
  if (toolName === 'lire_messages_recus')     return toolLireMessages(toolInput, userId, role, userInfo)
  if (toolName === 'envoyer_message')         return toolEnvoyerMessage(toolInput, userId, userInfo, adminActions, role)
  if (toolName === 'generer_certificat')      return toolGenererCertificat(toolInput, userId, userInfo, adminActions)

  if (toolName === 'envoyer_whatsapp') {
    const { telephone, message, template, variables, destinataire_nom } = toolInput
    if (!telephone) return { text: 'Numéro de téléphone requis.', urls: [] }

    const useTemplate = template && template !== 'libre'

    // Validation selon le mode
    if (useTemplate) {
      const sid = template === 'etudiant' ? TWILIO_TEMPLATE_ETUDIANT : TWILIO_TEMPLATE_NOUVEAU
      if (!sid) return {
        text: `❌ Template "${template}" non configuré — ajoutez la variable TWILIO_TEMPLATE_${template.toUpperCase()} dans Netlify.`,
        urls: []
      }
    } else {
      if (!message) return { text: 'Message requis pour le mode texte libre.', urls: [] }
    }

    try {
      let templateOptions = null
      if (useTemplate) {
        const contentSid = template === 'etudiant' ? TWILIO_TEMPLATE_ETUDIANT : TWILIO_TEMPLATE_NOUVEAU
        templateOptions = { contentSid, contentVariables: variables || {} }
      }

      const result = await sendWhatsApp(telephone, message, templateOptions)

      const modeLabel  = useTemplate ? `template "${template}"` : 'texte libre'
      const contenuLog = useTemplate
        ? `[Template:${template}] ${JSON.stringify(variables || {})}`
        : (message || '').substring(0, 80) + ((message || '').length > 80 ? '…' : '')

      // Statut non livré — afficher diagnostic précis
      if (result.status === 'failed' || result.status === 'undelivered') {
        let diagMsg = `❌ Message WhatsApp non livré à ${destinataire_nom || result.phone} (${result.phone}).`
        // Diagnostic par code d'erreur
        if (result.errorCode == 63024 || result.errorCode === '63024') {
          diagMsg += `\n\nCause : Le destinataire n'a pas WhatsApp installé sur son téléphone. Il est impossible de lui envoyer un message WhatsApp. Contactez-le par appel ou SMS à la place.`
        } else if (result.errorCode == 63007 || result.errorCode === '63007') {
          diagMsg += `\n\nCause : Le numéro ${result.phone} n'est pas enregistré sur WhatsApp. Vérifiez le numéro ou contactez par appel.`
        } else if (result.errorCode == 63016 || result.errorCode === '63016') {
          diagMsg += `\n\nCause : Template WhatsApp non encore approuvé par Meta. Attendez l'approbation dans la console Twilio.`
        } else {
          if (result.errorCode)    diagMsg += `\nCode Twilio : ${result.errorCode}`
          if (result.errorMessage) diagMsg += `\nDétail : ${result.errorMessage}`
          diagMsg += `\n\nSi le problème persiste, vérifiez que le destinataire a WhatsApp installé et que le numéro est correct.`
        }
        adminActions.push({ type: 'whatsapp_echec', telephone: result.phone, destinataire: destinataire_nom || telephone, message_id: result.messageId, error_code: result.errorCode })
        return { text: diagMsg, urls: [] }
      }

      const STATUTS = { queued: 'en file d\'attente', accepted: 'accepté', sending: 'en cours', sent: 'envoyé', delivered: 'livré ✓' }
      const statusLabel = STATUTS[result.status] || result.status || 'inconnu'

      adminActions.push({
        type:             'whatsapp_envoye',
        telephone:        result.phone,
        destinataire:     destinataire_nom || telephone,
        template_utilise: useTemplate ? template : 'libre',
        message_extrait:  contenuLog,
        message_id:       result.messageId
      })
      return {
        text: `✅ WhatsApp envoyé à ${destinataire_nom || result.phone} (${result.phone}).\nMode : ${modeLabel}\nStatut : ${statusLabel}\nID : ${result.messageId}`,
        urls: []
      }
    } catch(e) {
      return { text: `❌ Échec envoi WhatsApp : ${e.message}`, urls: [] }
    }
  }
  if (toolName === 'rechercher_etudiant')  return toolRechercherEtudiant(toolInput, userId, role)

  if (toolName === 'lire_inscriptions') {
    if (role !== 'admin') return { text: '⛔ Accès refusé — données d\'inscriptions réservées à l\'administrateur.', urls: [] }
    return toolLireInscriptions(toolInput, userId, role)
  }
  if (toolName === 'lire_paiements') {
    // BLOC FINANCIER — admin seul, aucune exception
    if (role !== 'admin') return { text: '⛔ Accès refusé — données financières strictement réservées à l\'administrateur.', urls: [] }
    return toolLirePaiements(toolInput, userId, role)
  }
  if (toolName === 'lire_certificats')        return toolLireCertificats(toolInput, userId, role)

  if (toolName === 'modifier_etudiant')           return toolModifierEtudiant(toolInput, userId, role, adminActions)
  if (toolName === 'planifier_seance')            return toolPlanifierSeance(toolInput, userId, role, adminActions)
  if (toolName === 'modifier_seance')             return toolModifierSeance(toolInput, userId, role, adminActions)
  if (toolName === 'enregistrer_presences')       return toolEnregistrerPresences(toolInput, userId, role, adminActions)
  if (toolName === 'enregistrer_paiement')        return toolEnregistrerPaiement(toolInput, userId, role, adminActions)
  if (toolName === 'modifier_compte_utilisateur') return toolModifierCompteUtilisateur(toolInput, userId, role, adminActions)
  if (toolName === 'notifier_classe_whatsapp')    return toolNotifierClasseWhatsapp(toolInput, userId, role, userInfo, adminActions)
  if (toolName === 'planifier_et_notifier')       return toolPlanifierEtNotifier(toolInput, userId, role, userInfo, adminActions)
  if (toolName === 'enregistrer_prospect')        return toolEnregistrerProspect(toolInput, userId, userInfo, role, adminActions)
  if (toolName === 'lire_prospects')              return toolLireProspects(toolInput, userId, role)
  if (toolName === 'lire_seances_a_venir')        return toolLireSeancesAvenir(toolInput, userId, role, userInfo)

  // ── Outils RH ─────────────────────────────────────────────
  if (toolName === 'lire_personnel_rh')           return toolLirePersonnel(toolInput, userId, role, userInfo)
  if (toolName === 'rechercher_formateur')        return toolRechercherFormateur(toolInput, userId, role, userInfo)
  if (toolName === 'ajouter_personnel')           return toolAjouterPersonnel(toolInput, userId, role, adminActions)
  if (toolName === 'modifier_personnel_rh')       return toolModifierPersonnel(toolInput, userId, role, adminActions)
  if (toolName === 'lire_conges')                 return toolLireConges(toolInput, userId, role, userInfo)
  if (toolName === 'gerer_conge')                 return toolGererConge(toolInput, userId, role, userInfo, adminActions)
  if (toolName === 'lire_fiches_paie')            return toolLireFichesPaie(toolInput, userId, role)
  if (toolName === 'lire_honoraires_formateurs')  return toolLireHonoraires(toolInput, userId, role, userInfo)
  if (toolName === 'valider_honoraires')          return toolValiderHonoraires(toolInput, userId, role, userInfo, adminActions)
  if (toolName === 'lire_candidatures_rh')        return toolLireCandidatures(toolInput, userId, role)
  if (toolName === 'modifier_statut_candidature') return toolModifierCandidature(toolInput, userId, role, adminActions)

  return { text: 'Outil inconnu.', urls: [] }
}

// ── Prompt système selon le rôle ─────────────────────────────
function buildSystemPrompt(role, userInfo, knowledge, instructionsAdmin, cfg, externalEnabled, schoolContext, imageEnabled, isGroqMode) {
  const ecole = `Tu es l'assistante administrative et pédagogique officielle de l'AGTM Digital Academy, une école d'anglais basée en Côte d'Ivoire (Abidjan). Tu t'appelles "AGTM AI".`

  const langueInstruction = `RÈGLE DE LANGUE ABSOLUE : Réponds EXACTEMENT dans la langue du message reçu. Si le message est en anglais → réponds en anglais. Si en français → réponds en français. Si en wolof ou autre langue → réponds dans cette langue. Ne change jamais de langue spontanément. Si le message est mixte, utilise la langue dominante. Cette règle s'applique à chaque message indépendamment.

CONCISION ABSOLUE : Réponds en 1 à 3 phrases maximum. Va droit au but. Ne répète jamais la question. Pas d'introduction ("Bien sûr !", "Avec plaisir !", "Bonne question !"). Commence directement par la réponse. Si une explication détaillée est explicitement demandée ("explique en détail", "donne-moi tout sur…"), alors développe — sinon, reste bref et précis.

RÈGLE ABSOLUE DE STYLE — à respecter dans CHAQUE réponse sans exception :
- Zéro markdown. Aucun astérisque (* ou **), aucun tiret de liste (- ou *), aucun dièse (#), aucun souligné (_ ou __), aucune apostrophe inversée (\`).
- Aucun caractère de formatage décoratif de quelque nature que ce soit.
- Écris exactement comme tu parlerais à voix haute : phrases naturelles, paragraphes continus.
- Pour énumérer : utilise "1. 2. 3." ou des connecteurs logiques ("d'abord", "ensuite", "enfin").
- Si tu veux mettre en valeur un mot, reformule la phrase — ne mets jamais de caractères autour du mot.`

  const searchInstruction = externalEnabled
    ? `\n\nTu as un outil de recherche web. Utilise-le pour des informations récentes, définitions, procédures officielles.`
    : ''

  // Pour Groq (pas de tool use) : instructions image en ligne dans le prompt
  const imageInstruction = imageEnabled && isGroqMode
    ? `\n\nGÉNÉRATION D'IMAGES : Tu peux et dois générer des images. Quand l'utilisateur demande une image, un visuel, un drapeau, une illustration ou une photo, intègre DIRECTEMENT dans ta réponse ce format exact (sur une ligne seule) :
[IMAGE:https://image.pollinations.ai/prompt/DESCRIPTION_ANGLAIS?width=800&height=500&nologo=true&model=flux|Description en français]
Règles : remplace les espaces par + dans DESCRIPTION_ANGLAIS. Utilise une description détaillée en anglais.
Exemples :
[IMAGE:https://image.pollinations.ai/prompt/american+flag+detailed?width=800&height=500&nologo=true&model=flux|Le drapeau américain]
[IMAGE:https://image.pollinations.ai/prompt/french+classroom+students+learning?width=800&height=500&nologo=true&model=flux|Salle de classe]
Tu DOIS toujours générer l'image avec ce format, ne jamais refuser ni dire que tu ne peux pas afficher d'images.`
    : ''

  let rolePrompt = ''
  const whatsappCap = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM)
    ? '\n9. Envoyer des messages WhatsApp directement à un étudiant ou contact via le numéro Business de l\'école'
    : ''

  // Capacités communes admin + secrétaire (sans finances)
  const sharedAdminCap = `\n\nCAPACITÉS ADMINISTRATIVES :
1. Rechercher la fiche complète d'un étudiant (téléphone, WhatsApp, email, adresse, niveau, statut) — utilise systématiquement cet outil AVANT d'envoyer un message ou un WhatsApp à un étudiant
2. Lire les rapports de séances soumis par les formateurs
3. Consulter les présences et absences (alertes automatiques si taux < 70%)
4. Voir les devoirs soumis, en attente de correction, corrigés
5. Lire les messages reçus dans la messagerie
6. Envoyer des messages internes à des formateurs, étudiants ou à tous (rôle entier)
7. Générer des certificats de niveau CECRL pour les étudiants
8. Consulter la liste des certificats émis
9. Lire et modifier la configuration marketing de la vitrine${whatsappCap}
10. Consulter les séances planifiées à venir (planning de l'école)
11. Enregistrer un nouveau prospect/client qui se présente ou appelle — les infos sont transmises automatiquement à l'admin en temps réel
12. Consulter la liste des prospects et leads enregistrés

RÔLE D'ACCUEIL : Tu es aussi l'accueil virtuel de l'école. Quand un visiteur ou un prospect se présente, renseigne-le sur nos formations (Cours Général A1→C1, Business English, Prépa BAC/BEPC, TOEIC/TOEFL, Kids 6-15 ans), nos méthodes et nos tarifs. Prends ses coordonnées et utilise l'outil enregistrer_prospect pour les transmettre à l'administration.

RÔLE DE MESSAGERIE : Tu es le canal de communication entre l'administration, les formateurs et les étudiants. Si un message doit être transmis à quelqu'un, utilise l'outil envoyer_message. Si une information urgente doit parvenir à un étudiant par WhatsApp, utilise l'outil envoyer_whatsapp.

RÈGLE ESSENTIELLE : Avant d'exécuter une action irréversible (envoyer un message, générer un certificat, envoyer un WhatsApp, enregistrer un prospect), résume ce que tu vas faire et demande confirmation. Pour les lectures, exécute directement.`

  // Capacités financières, inscriptions, RH et écriture — ADMIN SEUL
  const adminOnlyCap = `
10. Consulter la liste des étudiants inscrits et les statistiques d'effectifs (outil lire_inscriptions)
11. Consulter les données financières : paiements encaissés, dépenses, solde (outil lire_paiements)
12. Modifier la fiche d'un étudiant : téléphone, niveau, statut, mode de cours (outil modifier_etudiant)
13. Planifier une nouvelle séance ET envoyer automatiquement les notifications WhatsApp à toute la classe (outil planifier_et_notifier — workflow recommandé)
14. Planifier une séance seule sans notifications (outil planifier_seance)
15. Envoyer une notification WhatsApp à tous les étudiants d'une classe (outil notifier_classe_whatsapp) — rappels, urgences, informations importantes
16. Modifier ou annuler une séance existante (outil modifier_seance)
17. Enregistrer les présences/absences d'une séance (outil enregistrer_presences)
18. Enregistrer un paiement reçu d'un étudiant (outil enregistrer_paiement)
19. Modifier le rôle, l'accès IA ou le statut d'un compte utilisateur (outil modifier_compte_utilisateur)
20. Ajouter un nouveau membre du personnel dans la base RH (outil ajouter_personnel)
21. Modifier la fiche RH d'un employé : contrat, statut, salaire, taux séance (outil modifier_personnel_rh)
22. Approuver ou refuser des demandes de congé (outil gerer_conge)
23. Consulter les fiches de paie mensuelles du personnel (outil lire_fiches_paie) — CONFIDENTIEL
24. Valider et marquer comme payés les honoraires des formateurs (outil valider_honoraires)
25. Consulter et gérer les dossiers de recrutement / candidatures (outils lire_candidatures_rh, modifier_statut_candidature)

CAPACITÉS RH PARTAGÉES (admin + secrétaire) :
- Consulter la liste complète du personnel et des formateurs (outil lire_personnel_rh)
- Rechercher la fiche d'un formateur (outil rechercher_formateur)
- Consulter les congés du personnel (outil lire_conges)
- Consulter les honoraires des formateurs (outil lire_honoraires_formateurs)
- Consulter les candidatures de recrutement (outil lire_candidatures_rh)

RÈGLE FINANCIÈRE ABSOLUE : lire_paiements, enregistrer_paiement, lire_fiches_paie et valider_honoraires sont EXCLUSIVEMENT réservés à l'administrateur. Ne fournis JAMAIS de données salariales ou comptables à un autre rôle.

RÈGLE ACTIONS IRRÉVERSIBLES : Pour toute action d'écriture (modifier, ajouter, valider, approuver, refuser, planifier) — résume TOUJOURS l'action prévue et demande confirmation avant d'exécuter.`

  const adminCapabilities    = sharedAdminCap + adminOnlyCap
  const secretaireCapabilities = sharedAdminCap + `
13. Consulter et rechercher les fiches du personnel et des formateurs (outils lire_personnel_rh, rechercher_formateur)
14. Consulter les congés du personnel (outil lire_conges)
15. Consulter les honoraires des formateurs (outil lire_honoraires_formateurs)
16. Consulter les candidatures de recrutement (outil lire_candidatures_rh)

INTERDIT ABSOLU : Tu n'as PAS accès aux données financières, salariales ni aux statistiques d'inscriptions. Si un utilisateur te demande des informations financières (paiements, montants, soldes, dépenses, salaires, comptabilité), réponds clairement que ces données sont strictement réservées à l'administrateur.`

  const dirCapabilities = `\n\nCAPACITÉS PÉDAGOGIQUES : Tu peux consulter les rapports de séances de tous les formateurs, les présences et absences de toutes les classes, les devoirs soumis, les certificats émis, les séances planifiées, la liste du personnel RH, les fiches des formateurs, les congés du personnel, les honoraires des formateurs (lecture), les candidatures de recrutement, et tes messages reçus. Tu ne peux PAS envoyer de messages ni générer de certificats (réservé à l'administration). Tu n'as PAS accès aux données financières ni aux salaires.`

  const fmtCapabilities = `\n\nCAPACITÉS : Tu peux consulter tes propres rapports de séances, les présences et absences de tes classes, les devoirs de tes apprenants, tes messages reçus, ton planning des séances à venir, tes honoraires par séance (montants et statut de paiement). Tu peux envoyer des messages à l'administration (admin, secrétaire) ou à tes étudiants. Tu n'as PAS accès aux données financières de l'école ni aux dossiers des autres formateurs.`

  const etudiantCapabilities = `\n\nCAPACITÉS : Tu peux consulter tes messages reçus de l'administration et voir les séances à venir pour ta classe. Tu peux envoyer un message à l'administration (admin ou secrétaire) pour poser une question ou signaler une situation.`

  switch (role) {
    case 'admin':
      rolePrompt = `Tu assistes l'administrateur ${userInfo.prenom} ${userInfo.nom}.${adminCapabilities}`
      break
    case 'secretaire':
      rolePrompt = `Tu assistes la secrétaire ${userInfo.prenom} ${userInfo.nom}. Tu gères les tâches administratives courantes : courriers, messagerie, certificats, suivi pédagogique.${secretaireCapabilities}`
      break
    case 'directeur_pedagogique':
    case 'sous_directeur_pedagogique':
      rolePrompt = `Tu assistes le responsable pédagogique ${userInfo.prenom} ${userInfo.nom}. Tu analyses la qualité pédagogique, suis les rapports de formation et les résultats des apprenants.${dirCapabilities}`
      break
    case 'formateur':
    case 'enseignant':
      rolePrompt = `Tu assistes le formateur ${userInfo.prenom} ${userInfo.nom}. Tu aides à préparer des cours, rédiger des rapports, et suivre tes apprenants.${fmtCapabilities}`
      break
    case 'etudiant':
      rolePrompt = `Tu assistes l'étudiant ${userInfo.prenom} ${userInfo.nom}, niveau ${userInfo.niveau || 'non défini'}. Sois encourageant, adapte ton niveau, propose des exercices d'anglais adaptés. Tu peux lire les messages reçus de l'administration et envoyer des messages à l'admin ou à la secrétaire. NE divulgue PAS de données confidentielles sur d'autres étudiants.${etudiantCapabilities}`
      break
    default:
      rolePrompt = `Tu assistes un utilisateur de l'AGTM Digital Academy.`
  }

  const knowledgeSection  = knowledge ? `\n\n## BASE DE CONNAISSANCES AGTM\n${knowledge}` : ''
  const adminInstructions = instructionsAdmin ? `\n\n## INSTRUCTIONS ADMINISTRATION\n${instructionsAdmin}` : ''
  const schoolSection     = schoolContext ? `\n\n## DONNÉES EN TEMPS RÉEL DE L'ÉCOLE\n${schoolContext}` : ''

  return `${ecole}\n\n${langueInstruction}${searchInstruction}${imageInstruction}\n${rolePrompt}${knowledgeSection}${adminInstructions}${schoolSection}`
}

// ── Modèle selon le tier ─────────────────────────────────────
function getModel(tier, cfg) {
  return {
    essentiel:  cfg.modele_essentiel  || 'claude-haiku-4-5-20251001',
    recommande: cfg.modele_recommande || 'claude-sonnet-4-6',
    premium:    cfg.modele_premium    || 'claude-opus-4-6',
    groq:       cfg.modele_essentiel  || 'claude-haiku-4-5-20251001'  // Claude haiku pour les outils quand moteur=groq
  }[tier] || cfg.modele_essentiel || 'claude-haiku-4-5-20251001'
}

// ── Sauvegarder la conversation ──────────────────────────────
async function saveConversation(userId, sessionId, messages, assistantReply, model) {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
  if (lastUserMsg) await sbInsert('ai_conversations', { user_id: userId, session_id: sessionId, role: 'user', content: lastUserMsg.content, model_used: model }).catch(() => {})
  if (assistantReply) await sbInsert('ai_conversations', { user_id: userId, session_id: sessionId, role: 'assistant', content: assistantReply, model_used: model }).catch(() => {})
}

// ── Normaliser les messages (alternance user/assistant) ───────
function normalizeMessages(messages) {
  const MAX_CONTENT = 6000
  const valid = messages
    .filter(m =>
      m && typeof m.role === 'string' && typeof m.content === 'string' &&
      ['user', 'assistant'].includes(m.role) &&
      m.content.trim().length > 0
    )
    .map(m => m.content.length > MAX_CONTENT
      ? { ...m, content: m.content.substring(0, MAX_CONTENT) + '…' }
      : m
    )
  if (valid.length === 0) return []
  const alternated = []
  for (const msg of valid) {
    if (!alternated.length) { alternated.push(msg) }
    else if (msg.role !== alternated[alternated.length - 1].role) { alternated.push(msg) }
    // Si même rôle consécutif, on remplace par le plus récent (garde le dernier)
    else { alternated[alternated.length - 1] = msg }
  }
  while (alternated.length > 0 && alternated[0].role !== 'user') alternated.shift()
  return alternated
}

// ── Appel API Groq (rapide, OpenAI-compatible) ───────────────
async function callGroq(messages, systemPrompt, maxTok = 1200) {
  if (!GROQ_KEY) throw new Error('GROQ_KEY absent')
  const body = {
    model:       'llama-3.3-70b-versatile',
    max_tokens:  maxTok,
    temperature: 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : (m.content?.find?.(c => c.type === 'text')?.text || '') }))
    ]
  }
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error('Groq API error: ' + res.status)
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''
  if (!text) throw new Error('Groq: réponse vide')
  return text
}

// ── Appel API Anthropic ──────────────────────────────────────
async function callClaude(model, maxTok, systemPrompt, messages, tools) {
  const body = { model, max_tokens: maxTok, system: systemPrompt, messages }
  if (tools && tools.length) body.tools = tools

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key':         ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json'
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const errText = await res.text()
    console.error('Anthropic API error:', res.status, errText)
    let detail = ''
    try { detail = JSON.parse(errText)?.error?.message || errText } catch { detail = errText }
    throw new Error(`API ${res.status}: ${detail.substring(0, 200)}`)
  }
  return res.json()
}

// ── Exécuter un round de tool use ────────────────────────────
async function executeToolRound(response, tools, userId, role, userInfo, adminActions, sources, searchQueries, searchEngines, searchMode) {
  const toolUses = (response.content || []).filter(c => c.type === 'tool_use')
  const toolResults = await Promise.all(toolUses.map(async tu => {
    if (tu.name === 'recherche_web') searchQueries.push(tu.input?.query || '')
    const result = await executeTool(tu.name, tu.input || {}, userId, role, userInfo, adminActions, searchMode)
    if (result.urls?.length) sources.push(...result.urls)
    if (result.imageUrl) sources.push(`__image__${result.imageUrl}`)
    if (result.engine) searchEngines.push(result.engine)
    return { type: 'tool_result', tool_use_id: tu.id, content: result.text }
  }))
  return toolResults
}

// ── Handler principal ────────────────────────────────────────
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) }

  if (!SUPABASE_URL || !SUPABASE_SERVICE || !ANTHROPIC_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Configuration serveur incomplète' }) }
  }

  // ── Auth JWT ─────────────────────────────────────────────
  const authHeader = event.headers?.authorization || event.headers?.Authorization || ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Token manquant' }) }

  const authUser = await verifyJWT(token)
  if (!authUser?.id) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Token invalide ou expiré' }) }

  // ── Parse body ───────────────────────────────────────────
  let body
  try { body = JSON.parse(event.body || '{}') }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) } }

  // ── Action : récupérer le tier effectif de l'utilisateur ─
  if (body.action === 'get_tier') {
    try {
      const [utilisateur, overrides, cfg] = await Promise.all([
        sbQuery('utilisateurs', `select=ai_tier,role&id=eq.${authUser.id}`).then(r => r[0] || {}),
        loadUserOverrides(authUser.id),
        loadAIConfig()
      ])
      const tier = overrides.tier || cfg.tier_defaut || utilisateur.ai_tier || 'essentiel'
      const searchMode = overrides.search || 'all'
      const imageEnabled = overrides.images !== 'false' && cfg.images_actif !== 'false'
      return { statusCode: 200, headers, body: JSON.stringify({ tier, search_mode: searchMode, images: imageEnabled, role: utilisateur.role }) }
    } catch(e) {
      return { statusCode: 200, headers, body: JSON.stringify({ tier: 'essentiel' }) }
    }
  }

  const { messages, session_id, user_profile, school_context, force_provider } = body
  // force_provider: 'groq' | 'claude' | 'turbo' — surcharge le tier utilisateur côté moteur
  if (!messages || !Array.isArray(messages) || !messages.length) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Messages requis' }) }
  }

  const validMessages = normalizeMessages(messages.slice(-20))
  if (!validMessages.length) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Messages invalides' }) }

  try {
    // ── Config + profil utilisateur ──────────────────────
    const [cfg, utilisateur] = await Promise.all([
      loadAIConfig(),
      sbQuery('utilisateurs', `select=role,ai_tier,prenom,nom&id=eq.${authUser.id}`).then(r => r[0] || {})
    ])

    if (cfg.ai_actif === 'false') {
      return { statusCode: 503, headers, body: JSON.stringify({ error: 'Le service IA est temporairement désactivé.' }) }
    }

    const role    = utilisateur.role || user_profile?.role || 'etudiant'

    // Paramètres par utilisateur (priorité sur config globale)
    const overrides       = await loadUserOverrides(authUser.id)
    const aiTier          = overrides.tier || cfg.tier_defaut || utilisateur.ai_tier || 'essentiel'
    const searchMode      = overrides.search || 'all'   // all|tavily|brave|wiki|none
    const imageEnabled    = overrides.images !== 'false' && cfg.images_actif !== 'false'
    const maxMsgOverride  = overrides.max_msg ? parseInt(overrides.max_msg, 10) : null

    const model   = getModel(aiTier, cfg)
    const maxTok  = parseInt(cfg.max_tokens || '1800', 10)

    const externalEnabled = searchMode !== 'none' && cfg.external_search_actif !== 'false'
    const tools = buildTools(role, externalEnabled, imageEnabled)

    // ── Profil utilisateur complet ────────────────────────
    let userInfo = {
      prenom: utilisateur.prenom || user_profile?.prenom || '',
      nom:    utilisateur.nom    || user_profile?.nom    || '',
      niveau: user_profile?.niveau || null,
      role,
      email:  authUser.email || ''
    }
    if (role === 'etudiant') {
      // Chercher le profil étudiant par email (l'id etudiants != auth UUID)
      let etudRow = null
      if (authUser.email) {
        const byEmail = await sbQuery('etudiants', `select=id,nom,prenom,niveau&email=ilike.${encodeURIComponent(authUser.email)}&limit=1`)
        if (byEmail[0]) etudRow = byEmail[0]
      }
      if (!etudRow && userInfo.prenom && userInfo.nom) {
        const byName = await sbQuery('etudiants', `select=id,nom,prenom,niveau&prenom=ilike.${encodeURIComponent(userInfo.prenom)}&nom=ilike.${encodeURIComponent(userInfo.nom)}&limit=1`)
        if (byName[0]) etudRow = byName[0]
      }
      if (etudRow) userInfo = { ...userInfo, ...etudRow, etudiant_id: etudRow.id }
    }

    // ── Détecter le mode moteur ───────────────────────────
    const TOOL_HINTS = ['message', 'devoir', 'certificat', 'présence', 'absence', 'rapport', 'séance']
    const lastMsg    = (validMessages[validMessages.length - 1]?.content || '').toLowerCase()
    const needsTool  = TOOL_HINTS.some(k => lastMsg.includes(k))

    // force_provider surcharge le tier : 'groq' = toujours Groq, 'claude' = toujours Claude
    // 'turbo' = Claude pour les outils + Groq pour la synthèse finale (déjà géré dans round 3)
    const fp = force_provider || ''
    const useGroq = GROQ_KEY && !needsTool && (
      fp === 'groq' ||
      (!fp && (aiTier === 'groq' || role === 'etudiant'))
    )
    const forceClaude = fp === 'claude' || fp === 'turbo'
    // En mode turbo, Groq synthétise le round final (géré dans les rounds 2/3 ci-dessous)
    const useGroqFinalSynth = GROQ_KEY && (fp === 'turbo' || (!fp && GROQ_KEY && aiTier !== 'groq'))

    // ── Prompt système ────────────────────────────────────
    const knowledge    = await loadKnowledge(userInfo.niveau)
    const systemPrompt = buildSystemPrompt(
      role, userInfo, knowledge,
      cfg.instructions_admin || '', cfg,
      externalEnabled,
      (school_context || '').substring(0, 6000),
      imageEnabled,
      useGroq   // Groq n'a pas d'outils → instructions images en ligne
    )

    // ── Collectors ────────────────────────────────────────
    let replyText    = ''
    let usedSearch   = false
    let searchQueries  = []
    let searchEngines  = []
    let sources      = []
    let adminActions = []

    // ── Chemin rapide : Groq seul ─────────────────────────
    if (useGroq) {
      try {
        replyText = await callGroq(validMessages, systemPrompt, maxTok)
        if (replyText) {
          const sessionId = session_id || `sess_${authUser.id}_${Date.now()}`
          saveConversation(authUser.id, sessionId, validMessages, replyText, 'groq-llama-3.3-70b').catch(() => {})
          return {
            statusCode: 200, headers,
            body: JSON.stringify({
              reply: replyText, tier: aiTier, sources: [], admin_actions: [],
              search_queries: [], search_engines: [], model_used: 'groq-llama-3.3-70b'
            })
          }
        }
      } catch(groqErr) {
        console.error('Groq fast-path failed, falling back to Claude:', groqErr.message)
      }
    }

    // ── Chemin Claude (avec outils) ───────────────────────
    let resp1
    try { resp1 = await callClaude(model, maxTok, systemPrompt, validMessages, tools) }
    catch (e) { return { statusCode: 502, headers, body: JSON.stringify({ error: `Erreur service IA : ${e.message}` }) } }

    if (resp1.stop_reason === 'tool_use' && tools.length) {
      const tr1 = await executeToolRound(resp1, tools, authUser.id, role, userInfo, adminActions, sources, searchQueries, searchEngines, searchMode)
      usedSearch = searchQueries.length > 0

      const msgs2 = [...validMessages, { role: 'assistant', content: resp1.content }, { role: 'user', content: tr1 }]

      let resp2
      try { resp2 = await callClaude(model, maxTok, systemPrompt, msgs2, tools) }
      catch (e) { return { statusCode: 502, headers, body: JSON.stringify({ error: 'Erreur service IA (round 2).' }) } }

      if (resp2.stop_reason === 'tool_use') {
        const tr2 = await executeToolRound(resp2, tools, authUser.id, role, userInfo, adminActions, sources, searchQueries, searchEngines, searchMode)
        const msgs3 = [...msgs2, { role: 'assistant', content: resp2.content }, { role: 'user', content: tr2 }]
        // Round final — Groq synthétise pour la vitesse (turbo/groq disponible)
        try {
          if (useGroqFinalSynth) {
            const toolSummary = tr2.map(t => t.content || '').join('\n')
            replyText = await callGroq(
              [...msgs3.slice(-4), { role: 'user', content: `Données récupérées :\n${toolSummary}\n\nRéponds maintenant à la question initiale de l'utilisateur.` }],
              systemPrompt, maxTok
            )
          }
          if (!replyText) {
            const resp3 = await callClaude(model, maxTok, systemPrompt, msgs3, [])
            replyText = resp3.content?.find(c => c.type === 'text')?.text || ''
          }
        } catch(e) {
          replyText = resp2.content?.find(c => c.type === 'text')?.text || ''
        }
      } else {
        // Round 2 terminé sans outil — Groq peut synthétiser en mode turbo
        const rawReply = resp2.content?.find(c => c.type === 'text')?.text || ''
        if (useGroqFinalSynth && rawReply && fp === 'turbo') {
          try {
            const toolSummary = tr1.map(t => t.content || '').join('\n')
            replyText = await callGroq(
              [...msgs2.slice(-4), { role: 'user', content: `Données récupérées :\n${toolSummary}\n\nRéponds maintenant à la question initiale de l'utilisateur.` }],
              systemPrompt, maxTok
            )
          } catch(_) { replyText = rawReply }
        } else {
          replyText = rawReply
        }
      }
    } else {
      replyText = resp1.content?.find(c => c.type === 'text')?.text || ''
    }

    if (!replyText) replyText = 'Je n\'ai pas pu générer une réponse. Veuillez réessayer.'

    // Déterminer le modèle effectivement utilisé pour les badges frontend
    const modelUsed = (useGroqFinalSynth && fp === 'turbo') ? 'turbo-claude+groq' : model
    const sessionId = session_id || `sess_${authUser.id}_${Date.now()}`
    saveConversation(authUser.id, sessionId, validMessages, replyText, modelUsed).catch(() => {})

    // Séparer les actions marketing des autres actions admin
    const marketingActions = adminActions.filter(a => a.type === 'marketing_modifie').flatMap(a => a.modifications || [])

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply:             replyText,
        model,
        model_used:        modelUsed,
        tier:              aiTier,
        session_id:        sessionId,
        used_search:       usedSearch,
        search_queries:    searchQueries,
        search_engines:    [...new Set(searchEngines)],
        sources:           [...new Set(sources)],
        marketing_actions: marketingActions,
        admin_actions:     adminActions,
        external_enabled:  externalEnabled,
        usage:             resp1.usage
      })
    }

  } catch (err) {
    console.error('AI Chat error:', err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erreur interne. Veuillez réessayer.' }) }
  }
}
