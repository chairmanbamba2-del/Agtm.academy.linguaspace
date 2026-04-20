import { createClient } from 'npm:@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

function ok(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...CORS, 'Content-Type': 'application/json' }
  })
}
function err(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status, headers: { ...CORS, 'Content-Type': 'application/json' }
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    // Vérifier admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return err('Unauthorized', 401)

    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (!user) return err('Unauthorized', 401)

    const { data: caller } = await supabase
      .from('lingua_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!['admin','super_admin'].includes(caller?.role)) {
      return err('Forbidden', 403)
    }

    const { action, payload } = await req.json()

    // ── Créer un utilisateur manuellement ──────────────────
    if (action === 'create_user') {
      const { email, password, fullName, phone, planType, selectedLanguage, paymentMode, notes } = payload

      // Créer dans auth.users
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, phone, country: 'CI' }
      })
      if (authErr) throw authErr

      // Le trigger crée lingua_users automatiquement
      // Attendre le trigger
      await new Promise(r => setTimeout(r, 500))

      // Créer l'abonnement si planType fourni
      if (planType) {
        const now      = new Date()
        const expiresAt = new Date(now)
        expiresAt.setMonth(expiresAt.getMonth() + 1)

        const amount = planType === 'all_access' ? 15000 : 10000

        const { data: sub } = await supabase
          .from('lingua_subscriptions')
          .insert({
            user_id:           authUser.user.id,
            plan_type:         planType,
            selected_language: planType === 'uni' ? selectedLanguage : null,
            status:            'active',
            payment_mode:      paymentMode || 'manual',
            amount_fcfa:       amount,
            started_at:        now.toISOString(),
            expires_at:        expiresAt.toISOString(),
            created_by_admin:  user.id,
            notes,
          })
          .select()
          .single()

        // Créer la progression
        const languages = planType === 'all_access'
          ? ['en','es','de','fr']
          : [selectedLanguage]

        for (const lang of languages.filter(Boolean)) {
          await supabase.from('lingua_progress').upsert({
            user_id:  authUser.user.id,
            language: lang,
            current_level: 'A1',
            xp_points: 0,
            streak_days: 0,
          }, { onConflict: 'user_id,language' })
        }

        // Créer la transaction
        if (paymentMode !== 'free') {
          await supabase.from('lingua_transactions').insert({
            type:        'subscription',
            direction:   'income',
            user_id:     authUser.user.id,
            amount_fcfa: amount,
            description: `Abonnement ${planType.toUpperCase()} — créé par admin`,
            category:    planType === 'all_access' ? 'abonnement_all_access' : 'abonnement_uni',
            payment_mode: paymentMode || 'manual',
            status:      'confirmed',
          })
        }

        // Logger l'événement
        await supabase.from('lingua_subscription_events').insert({
          subscription_id: sub.id,
          user_id:         authUser.user.id,
          event_type:      'created',
          notes:           `Créé manuellement par admin. Mode: ${paymentMode}`,
          created_by:      user.id,
        })
      }

      return ok({ success: true, userId: authUser.user.id })
    }

    // ── Suspendre un utilisateur ───────────────────────────
    if (action === 'suspend_user') {
      const { userId, reason } = payload

      await supabase
        .from('lingua_users')
        .update({ status: 'suspended', suspended_at: new Date().toISOString(), suspended_reason: reason })
        .eq('id', userId)

      await supabase
        .from('lingua_subscriptions')
        .update({ status: 'expired', suspended_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('status', 'active')

      await supabase.auth.admin.updateUserById(userId, { ban_duration: 'none' })

      return ok({ success: true })
    }

    // ── Réactiver un utilisateur ───────────────────────────
    if (action === 'reactivate_user') {
      const { userId } = payload

      await supabase
        .from('lingua_users')
        .update({ status: 'active', suspended_at: null, suspended_reason: null })
        .eq('id', userId)

      return ok({ success: true })
    }

    // ── Renouveler/modifier un abonnement ──────────────────
    if (action === 'update_subscription') {
      const { subscriptionId, userId, planType, selectedLanguage, months, paymentMode, notes } = payload

      const now      = new Date()
      const expiresAt = new Date(now)
      expiresAt.setMonth(expiresAt.getMonth() + (months || 1))

      await supabase
        .from('lingua_subscriptions')
        .update({
          plan_type:         planType,
          selected_language: planType === 'uni' ? selectedLanguage : null,
          status:            'active',
          payment_mode:      paymentMode,
          started_at:        now.toISOString(),
          expires_at:        expiresAt.toISOString(),
          notes,
        })
        .eq('id', subscriptionId)

      // Logger
      await supabase.from('lingua_subscription_events').insert({
        subscription_id: subscriptionId,
        user_id:         userId,
        event_type:      'renewed',
        notes:           `Renouvellement manuel. Plan: ${planType}. Mode: ${paymentMode}`,
        created_by:      user.id,
      })

      return ok({ success: true })
    }

    // ── Upgrade UNI → ALL ACCESS ───────────────────────────
    if (action === 'upgrade_subscription') {
      const { subscriptionId, userId } = payload

      const { data: sub } = await supabase
        .from('lingua_subscriptions')
        .update({
          plan_type:         'all_access',
          selected_language: null,
          amount_fcfa:       15000,
        })
        .eq('id', subscriptionId)
        .select()
        .single()

      // Créer progressions pour les nouvelles langues
      for (const lang of ['en','es','de','fr']) {
        await supabase.from('lingua_progress').upsert({
          user_id: userId, language: lang,
          current_level: 'A1', xp_points: 0, streak_days: 0,
        }, { onConflict: 'user_id,language' })
      }

      await supabase.from('lingua_subscription_events').insert({
        subscription_id: subscriptionId,
        user_id:         userId,
        event_type:      'upgraded',
        notes:           'Upgrade UNI → ALL ACCESS',
        created_by:      user.id,
      })

      return ok({ success: true })
    }

    // ── Liste des utilisateurs (admin) ─────────────────────
    if (action === 'list_users') {
      const { search, status, plan, page = 1, limit = 20 } = payload || {}
      const offset = (page - 1) * limit

      let query = supabase
        .from('lingua_users')
        .select(`
          id, email, full_name, phone, role, status,
          created_at, suspended_at, suspended_reason,
          lingua_subscriptions (
            id, plan_type, selected_language, status,
            amount_fcfa, payment_mode, started_at, expires_at
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (search) query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
      if (status) query = query.eq('status', status)

      const { data, count } = await query
      return ok({ users: data, total: count, page, limit })
    }

    return err('Unknown action')

  } catch (error) {
    console.error('admin-actions error:', error)
    return err(error.message, 500)
  }
})