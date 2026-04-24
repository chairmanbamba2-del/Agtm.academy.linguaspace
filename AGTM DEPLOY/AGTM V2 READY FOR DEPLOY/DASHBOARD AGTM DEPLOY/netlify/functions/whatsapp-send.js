// ============================================================
//  AGTM Digital Academy — Envoi WhatsApp direct (dashboard)
//  Netlify Function: whatsapp-send.js
//  Supporte texte libre + templates Content API Twilio
//  © 2026 AGTM Academy — Issa Bamba
// ============================================================

const SUPABASE_URL           = process.env.SUPABASE_URL
const SUPABASE_SERVICE       = process.env.SUPABASE_SERVICE_KEY
const TWILIO_ACCOUNT_SID     = process.env.TWILIO_ACCOUNT_SID          || ''
const TWILIO_AUTH_TOKEN      = process.env.TWILIO_AUTH_TOKEN           || ''
const TWILIO_WHATSAPP_FROM   = process.env.TWILIO_WHATSAPP_FROM        || ''
const TWILIO_TEMPLATE_ETUDIANT = process.env.TWILIO_TEMPLATE_ETUDIANT  || ''
const TWILIO_TEMPLATE_NOUVEAU  = process.env.TWILIO_TEMPLATE_NOUVEAU   || ''
const TWILIO_TEMPLATE_RAPPEL_PAIEMENT  = process.env.TWILIO_TEMPLATE_RAPPEL_PAIEMENT  || ''
const TWILIO_TEMPLATE_DEVOIR_PUBLIE    = process.env.TWILIO_TEMPLATE_DEVOIR_PUBLIE    || ''
const TWILIO_TEMPLATE_PROMO_MARKETING  = process.env.TWILIO_TEMPLATE_PROMO_MARKETING  || ''
const TWILIO_TEMPLATE_CERTIFICAT_DISPONIBLE = process.env.TWILIO_TEMPLATE_CERTIFICAT_DISPONIBLE || ''
const TWILIO_TEMPLATE_RAPPEL_ABONNEMENT = process.env.TWILIO_TEMPLATE_RAPPEL_ABONNEMENT || ''

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

async function verifyJWT(token) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_SERVICE, Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Token invalide')
  return res.json()
}

async function getProfile(userId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/utilisateurs?id=eq.${userId}&select=role,nom,prenom&limit=1`,
    { headers: { apikey: SUPABASE_SERVICE, Authorization: `Bearer ${SUPABASE_SERVICE}` } }
  )
  const data = await res.json()
  return data?.[0] || null
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Méthode non autorisée' }) }

  try {
    // ── Authentification ──────────────────────────────────────
    const token = (event.headers.authorization || event.headers.Authorization || '').replace(/^Bearer\s+/i, '')
    if (!token) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Non authentifié' }) }

    const user    = await verifyJWT(token)
    const profile = await getProfile(user.id)
    if (!['admin', 'secretaire'].includes(profile?.role)) {
      return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'Accès refusé — admin ou secrétaire uniquement' }) }
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'WhatsApp non configuré sur le serveur' }) }
    }

    // ── Paramètres ────────────────────────────────────────────
    const { telephone, message, template, variables } = JSON.parse(event.body || '{}')
    if (!telephone?.trim()) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Numéro de téléphone requis' }) }

    const useTemplate = template && template !== 'libre'
    if (!useTemplate && !message?.trim()) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Message requis (mode texte libre)' }) }
    }
    const VALID_TEMPLATES = ['etudiant','nouveau','rappel_paiement','devoir_publie','promo_marketing','certificat_disponible','rappel_abonnement','note_etudiant']
    if (useTemplate && !VALID_TEMPLATES.includes(template)) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: `Template "${template}" invalide` }) }
    }

    // ── Normaliser le numéro (Côte d'Ivoire +225) ─────────────
    let phone = telephone.replace(/[\s\-().+]/g, '')
    if (phone.startsWith('00225'))                          phone = phone.slice(2)
    else if (phone.startsWith('225') && phone.length >= 11) { /* déjà ok */ }
    else if (phone.startsWith('0') && phone.length === 10)  phone = '225' + phone
    else if (phone.length === 9)                            phone = '2250' + phone
    phone = '+' + phone.replace(/^\+/, '')

    const from        = TWILIO_WHATSAPP_FROM.replace(/\s/g, '').replace(/^whatsapp:/, '')
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')

    // ── Construire la requête Twilio ──────────────────────────
    const params = new URLSearchParams({
      From: `whatsapp:${from}`,
      To:   `whatsapp:${phone}`
    })

    if (useTemplate) {
      const SID_MAP = {
        etudiant:        TWILIO_TEMPLATE_ETUDIANT,
        nouveau:         TWILIO_TEMPLATE_NOUVEAU,
        rappel_paiement: TWILIO_TEMPLATE_RAPPEL_PAIEMENT,
        devoir_publie:   TWILIO_TEMPLATE_DEVOIR_PUBLIE,
        promo_marketing: TWILIO_TEMPLATE_PROMO_MARKETING,
        certificat_disponible: TWILIO_TEMPLATE_CERTIFICAT_DISPONIBLE,
        rappel_abonnement: TWILIO_TEMPLATE_RAPPEL_ABONNEMENT
      }
      const contentSid = SID_MAP[template] || ''
      if (!contentSid) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: `Template "${template}" non configuré — ajoutez TWILIO_TEMPLATE_${template.toUpperCase()} dans Netlify` }) }
      params.append('ContentSid', contentSid)
      if (variables && Object.keys(variables).length > 0) {
        params.append('ContentVariables', JSON.stringify(variables))
      }
    } else {
      params.append('Body', message.trim())
    }

    // ── Envoi Twilio ──────────────────────────────────────────
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      }
    )

    const data = await res.json()
    if (!res.ok) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: data?.message || 'Erreur Twilio' }) }
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, sid: data.sid, status: data.status }) }
  } catch (e) {
    console.error('[whatsapp-send]', e?.message)
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) }
  }
}
