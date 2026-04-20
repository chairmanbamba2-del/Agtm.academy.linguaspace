// ════════════════════════════════════════════════════════════
// EDGE FUNCTION : payment-init
// Initialise un paiement CinetPay et retourne l'URL de paiement
// ════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SERVICE_ROLE_KEY')!
)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      }
    })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { userId, planType, selectedLanguage, paymentMethod } = await req.json()

    // Récupérer les infos utilisateur
    const { data: linguaUser } = await supabase
      .from('lingua_users')
      .select('full_name, email, phone')
      .eq('id', userId)
      .single()

    if (!linguaUser) return new Response('User not found', { status: 404 })

    const amount        = planType === 'uni' ? 10000 : 15000
    const transactionId = `LINGUA_${planType}_${userId}_${Date.now()}`
    const appUrl        = Deno.env.get('APP_URL') || 'https://lingua.africaglobaltraining.com'

    // Construire la description
    const planLabels: Record<string, string> = {
      uni:        'LINGUA SPACE — Forfait UNI (1 langue)',
      all_access: 'LINGUA SPACE — Forfait ALL ACCESS (4 langues)',
    }

    const payload = {
      apikey:                  Deno.env.get('CINETPAY_API_KEY'),
      site_id:                 Deno.env.get('CINETPAY_SITE_ID'),
      transaction_id:          transactionId,
      amount,
      currency:               'XOF',
      description:             planLabels[planType] || 'LINGUA SPACE Abonnement',
      customer_name:           linguaUser.full_name,
      customer_email:          linguaUser.email,
      customer_phone_number:   linguaUser.phone || '',
      customer_address:        'Abidjan',
      customer_city:           'Abidjan',
      customer_country:        'CI',
      customer_state:          'CI',
      customer_zip_code:       '00225',
      notify_url:              `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
      return_url:              `${appUrl}/dashboard?payment=success`,
      cancel_url:              `${appUrl}/subscribe?payment=cancelled`,
      channels:                paymentMethod === 'card' ? 'CREDIT_CARD' : 'MOBILE_MONEY',
    }

    const cinetpayRes = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    const cinetpayData = await cinetpayRes.json()

    // Stocker la référence de transaction
    await supabase
      .from('lingua_subscriptions')
      .update({ payment_ref: transactionId })
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)

    return new Response(JSON.stringify(cinetpayData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('payment-init error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
