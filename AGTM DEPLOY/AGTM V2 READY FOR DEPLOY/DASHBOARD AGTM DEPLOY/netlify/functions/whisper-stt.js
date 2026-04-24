// ═══════════════════════════════════════════════════════════════════
// whisper-stt.js — Transcription audio via OpenAI Whisper
// Reçoit : { audio_base64, language, mime }
// Retourne : { text }
// Conception & Propriété : ISSA BAMBA | © 2026 AGTM Academy
// ═══════════════════════════════════════════════════════════════════

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'OPENAI_API_KEY non configuré' }) }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) }
  }

  const { audio_base64, language = 'en', mime = 'audio/webm' } = body
  if (!audio_base64) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'audio_base64 requis' }) }
  }

  // Convertir base64 → Buffer
  const audioBuffer = Buffer.from(audio_base64, 'base64')

  // Extension depuis le mime type (audio/webm → webm, audio/mp4 → mp4, etc.)
  const ext = mime.split('/')[1]?.split(';')[0] || 'webm'
  const filename = `voice.${ext}`

  try {
    // Construire le multipart/form-data manuellement (pas de FormData en Node.js natif)
    const boundary = `----WhisperBoundary${Date.now()}`
    const CRLF = '\r\n'

    const parts = []

    // Champ model
    parts.push(
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="model"${CRLF}${CRLF}` +
      `whisper-1`
    )

    // Champ language
    const lang2 = (language || 'en').slice(0, 2)
    parts.push(
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="language"${CRLF}${CRLF}` +
      lang2
    )

    // Champ response_format
    parts.push(
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="response_format"${CRLF}${CRLF}` +
      `json`
    )

    // Construction du body complet
    const preFile = parts.join(CRLF) + CRLF
    const fileHeader = (
      `${CRLF}--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"${CRLF}` +
      `Content-Type: ${mime}${CRLF}${CRLF}`
    )
    const fileFooter = `${CRLF}--${boundary}--${CRLF}`

    const bodyBuf = Buffer.concat([
      Buffer.from(preFile, 'utf8'),
      Buffer.from(fileHeader, 'utf8'),
      audioBuffer,
      Buffer.from(fileFooter, 'utf8'),
    ])

    // Appel OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': String(bodyBuf.length),
      },
      body: bodyBuf,
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Whisper error:', response.status, errText)
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Whisper API error', detail: errText }) }
    }

    const result = await response.json()
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: result.text || '' }),
    }

  } catch (err) {
    console.error('whisper-stt error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Erreur interne' }),
    }
  }
}
