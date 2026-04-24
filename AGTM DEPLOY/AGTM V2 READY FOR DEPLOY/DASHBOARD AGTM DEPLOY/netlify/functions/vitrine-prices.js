// vitrine-prices.js — Fonction Netlify pour exposer uniquement les prix marketing
// Utilise la clé de service Supabase pour lire marketing_config, puis retourne uniquement les prix nécessaires

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
}

async function sbQuery(path, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${path}${params ? '?' + params : ''}`
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  })
  if (!res.ok) throw new Error(`Supabase error ${res.status}: ${path}`)
  return res.json()
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Méthode non autorisée' })
    }
  }

  try {
    // Récupérer uniquement les clés de prix nécessaires pour la vitrine
    const rows = await sbQuery('marketing_config', 'select=cle,valeur')
    
    // Filtrer pour ne retourner que les prix (pas les autres infos sensibles)
    const allowedKeys = [
      'prix_general', 'prix_business', 'prix_toeic', 'prix_toefl',
      'prix_bac_bepc', 'prix_kids', 'prix_depart',
      'prix_ia_recommande', 'prix_ia_premium'
    ]
    
    const prices = {}
    rows.forEach(row => {
      if (allowedKeys.includes(row.cle)) {
        prices[row.cle] = row.valeur
      }
    })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ prices })
    }
  } catch (error) {
    console.error('Error fetching marketing prices:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Erreur serveur', prices: {} })
    }
  }
}