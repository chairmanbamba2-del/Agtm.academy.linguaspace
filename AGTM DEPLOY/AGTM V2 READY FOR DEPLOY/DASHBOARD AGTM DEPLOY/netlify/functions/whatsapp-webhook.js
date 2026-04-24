// ============================================================
//  AGTM Digital Academy — Webhook WhatsApp entrant (Twilio)
//  Netlify Function: whatsapp-webhook.js
//  Reçoit les messages WhatsApp entrants et les sauvegarde
//  © 2026 AGTM Academy — Issa Bamba
// ============================================================

const SUPABASE_URL     = process.env.SUPABASE_URL
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY

// Réponse TwiML vide (Twilio attend toujours une réponse XML)
const TWIML_EMPTY = '<Response/>'

exports.handler = async (event) => {
  // Toujours répondre 200 à Twilio, même en cas d'erreur interne
  const ok = (body = TWIML_EMPTY) => ({
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    body
  })

  if (event.httpMethod !== 'POST') return ok()

  try {
    // Parser le corps form-encodé envoyé par Twilio
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : (event.body || '')

    const p = new URLSearchParams(raw)

    const messageSid  = p.get('MessageSid')  || ''
    const fromRaw     = p.get('From')         || ''
    const toRaw       = p.get('To')           || ''
    const body        = p.get('Body')         || ''
    const profileName = p.get('ProfileName')  || ''   // Nom WhatsApp de l'expéditeur (si disponible)
    const numMedia    = parseInt(p.get('NumMedia') || '0', 10)
    const mediaUrl    = numMedia > 0 ? (p.get('MediaUrl0') || null) : null
    const mediaType   = numMedia > 0 ? (p.get('MediaContentType0') || null) : null

    // Nettoyer les numéros (enlever le préfixe "whatsapp:")
    const fromNumber = fromRaw.replace(/^whatsapp:/, '')
    const toNumber   = toRaw.replace(/^whatsapp:/, '')

    if (!messageSid || !fromNumber) return ok()

    // Sauvegarder dans Supabase (ignorer les doublons sur message_sid)
    await fetch(`${SUPABASE_URL}/rest/v1/messages_whatsapp`, {
      method: 'POST',
      headers: {
        apikey:        SUPABASE_SERVICE,
        Authorization: `Bearer ${SUPABASE_SERVICE}`,
        'Content-Type': 'application/json',
        Prefer:        'resolution=ignore-duplicates,return=minimal'
      },
      body: JSON.stringify({
        message_sid:   messageSid,
        from_number:   fromNumber,
        to_number:     toNumber,
        from_name:     profileName || null,
        body:          body,
        num_media:     numMedia,
        media_url:     mediaUrl,
        media_type:    mediaType,
        lu:            false
      })
    })

    return ok()
  } catch (e) {
    console.error('[whatsapp-webhook] Erreur:', e?.message || e)
    return ok()   // toujours 200 pour éviter les retentatives Twilio
  }
}
