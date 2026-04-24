// ============================================================
//  AGTM Digital Academy — Proxy DeepSeek API
//  Netlify Function: deepseek-proxy.js
//  Proxy sécurisé pour l'API DeepSeek (compatible OpenAI)
//  © 2026 AGTM Academy — Issa Bamba
// ============================================================

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_KEY     = process.env.DEEPSEEK_API_KEY

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Gérer les pré‑requêtes CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  // Vérifier la méthode
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) }
  }

  // Vérifier la clé API
  if (!DEEPSEEK_KEY) {
    console.error('DeepSeek API key manquante dans les variables d\'environnement')
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Configuration serveur incomplète' })
    }
  }

  try {
    // Parser le corps de la requête
    const body = JSON.parse(event.body || '{}')
    
    // Valider les champs requis
    if (!body.messages || !Array.isArray(body.messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Le champ "messages" est requis et doit être un tableau' })
      }
    }

    // Préparer la requête pour DeepSeek (format OpenAI compatible)
    const deepseekBody = {
      model: body.model || 'deepseek-chat',
      messages: body.messages,
      max_tokens: body.max_tokens || 2000,
      temperature: body.temperature || 0.7,
      stream: false
    }

    // Appeler l'API DeepSeek
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_KEY}`
      },
      body: JSON.stringify(deepseekBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API error:', response.status, errorText)
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Erreur API DeepSeek (${response.status})`,
          details: errorText.substring(0, 500)
        })
      }
    }

    const data = await response.json()
    
    // Retourner la réponse au format standardisé
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: data.choices?.[0]?.message?.content || '',
        model: data.model,
        usage: data.usage,
        id: data.id
      })
    }

  } catch (error) {
    console.error('DeepSeek proxy error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erreur interne du proxy DeepSeek',
        message: error.message 
      })
    }
  }
}