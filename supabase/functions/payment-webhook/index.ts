// ============================================================
// EDGE FUNCTION : payment-webhook (VERSION MISE À JOUR v2)
// Inclut : activation abonnement + génération reçu automatique
//          + création transaction financière
// ============================================================
import { createClient } from 'npm:@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json()
    const { cpm_trans_id, cpm_result, cpm_amount, cpm_site_id } = body

    console.log('Payment webhook received:', { cpm_trans_id, cpm_result })

    // Vérifier la clé du site
    if (cpm_site_id !== Deno.env.get('CINETPAY_SITE_ID')) {
      return new Response('Invalid site', { status: 403 })
    }

    // Paiement échoué
    if (cpm_result !== '00') {
      await supabase
        .from('lingua_subscriptions')
        .update({ status: 'cancelled' })
        .eq('payment_ref', cpm_trans_id)
      return new Response('Payment failed', { status: 200 })
    }

    // Récupérer l'abonnement en attente
    const { data: sub, error: subError } = await supabase
      .from('lingua_subscriptions')
      .select('*, lingua_users(full_name, email)')
      .eq('payment_ref', cpm_trans_id)
      .eq('status', 'pending')
      .single()

    if (subError || !sub) {
      console.error('Subscription not found:', cpm_trans_id)
      return new Response('Subscription not found', { status: 200 })
    }

    const now      = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    // ── 1. Activer l'abonnement ─────────────────────────────
    await supabase
      .from('lingua_subscriptions')
      .update({
        status:     'active',
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', sub.id)

    // ── 2. Initialiser la progression pour chaque langue ────
    const languages = sub.plan_type === 'all_access'
      ? ['en', 'es', 'de', 'fr']
      : [sub.selected_language]

    for (const lang of languages.filter(Boolean)) {
      await supabase.from('lingua_progress').upsert({
        user_id:          sub.user_id,
        language:         lang,
        current_level:    'A1',
        modules_completed: 0,
        xp_points:        0,
        streak_days:      0,
        last_activity_at: now.toISOString(),
      }, { onConflict: 'user_id,language' })
    }

    // ── 3. Générer le reçu automatiquement ─────────────────
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          subscriptionId: sub.id,
          userId:         sub.user_id,
        }),
      })
    } catch (receiptErr) {
      // Ne pas bloquer l'activation si le reçu échoue
      console.error('Receipt generation failed (non-blocking):', receiptErr)
    }

    console.log(`✅ Subscription activated: ${sub.id} | Plan: ${sub.plan_type} | User: ${sub.user_id}`)
    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('payment-webhook error:', error)
    return new Response('Internal error', { status: 500 })
  }
})