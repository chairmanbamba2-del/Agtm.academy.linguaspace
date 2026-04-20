// ════════════════════════════════════════════════════════════
// EDGE FUNCTION : weekly-report
// Envoie un rapport de progression hebdomadaire par email
// À déclencher via un Cron Job Supabase chaque lundi matin
//
// Supabase Dashboard → Database → Cron Jobs
// Schedule : 0 7 * * 1  (chaque lundi à 7h)
// HTTP POST : https://PROJET.supabase.co/functions/v1/weekly-report
// Headers   : Authorization: Bearer SERVICE_ROLE_KEY
// ════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SERVICE_ROLE_KEY')!
)

const LANG_NAMES: Record<string, string> = {
  en: 'Anglais', fr: 'Français', es: 'Espagnol', de: 'Allemand'
}

Deno.serve(async (_req: Request) => {
  try {
    // Récupérer tous les abonnés actifs avec leur progression
    const { data: subs } = await supabase
      .from('lingua_subscriptions')
      .select(`
        user_id, plan_type,
        lingua_users ( full_name, email )
      `)
      .eq('status', 'active')

    if (!subs || subs.length === 0) {
      return new Response('No active subscriptions', { status: 200 })
    }

    let sent = 0
    let errors = 0

    for (const sub of subs) {
      try {
        const user = (sub as any).lingua_users
        if (!user?.email) continue

        // Récupérer la progression
        const { data: progress } = await supabase
          .from('lingua_progress')
          .select('*')
          .eq('user_id', sub.user_id)

        if (!progress || progress.length === 0) continue

        // Calculer les stats hebdomadaires
        const totalXP = progress.reduce((s: number, p: any) => s + (p.xp_points || 0), 0)
        const totalModules = progress.reduce((s: number, p: any) => s + (p.modules_completed || 0), 0)
        const maxStreak = progress.reduce((max: number, p: any) => Math.max(max, p.streak_days || 0), 0)

        // Construire l'email HTML
        const emailHtml = buildEmailTemplate({
          name: user.full_name,
          progress,
          totalXP,
          totalModules,
          maxStreak,
          plan: sub.plan_type,
        })

        // Envoyer via Resend
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from:    'LINGUA SPACE <coach@africaglobaltraining.com>',
            to:      [user.email],
            subject: `🌟 Votre rapport de progression LINGUA SPACE — Semaine du ${getWeekLabel()}`,
            html:    emailHtml,
          }),
        })

        if (emailRes.ok) {
          sent++
        } else {
          errors++
          console.error('Email failed for:', user.email, await emailRes.text())
        }

        // Pause pour respecter les rate limits Resend
        await new Promise(r => setTimeout(r, 100))

      } catch (err) {
        errors++
        console.error('Error processing user:', sub.user_id, err)
      }
    }

    console.log(`Weekly reports sent: ${sent}, errors: ${errors}`)
    return new Response(JSON.stringify({ sent, errors }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('weekly-report error:', error)
    return new Response('Internal error', { status: 500 })
  }
})

// ─── Helpers ────────────────────────────────────────────────

function getWeekLabel() {
  const now = new Date()
  const lastMonday = new Date(now)
  lastMonday.setDate(now.getDate() - now.getDay() + 1)
  return lastMonday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

function buildEmailTemplate({ name, progress, totalXP, totalModules, maxStreak, plan }: any) {
  const firstName = name.split(' ')[0]

  const langRows = progress.map((p: any) => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1E3A5F;">
        <strong style="color: #FAFAF8;">${LANG_NAMES[p.language] || p.language}</strong>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1E3A5F; text-align: center;">
        <span style="color: #E8941A; font-family: monospace; font-size: 18px; font-weight: bold;">
          ${p.current_level}
        </span>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1E3A5F; text-align: center; color: #8A9AB5;">
        ${p.modules_completed || 0} modules
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1E3A5F; text-align: center; color: #8A9AB5;">
        ${p.xp_points?.toLocaleString() || 0} XP
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1E3A5F; text-align: center; color: #8A9AB5;">
        🔥 ${p.streak_days || 0}j
      </td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport de progression LINGUA SPACE</title>
</head>
<body style="margin:0; padding:0; background:#080F1A; font-family: 'DM Sans', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="text-align: center; padding: 40px 20px 30px;">
      <p style="font-family: monospace; font-size: 10px; letter-spacing: 0.3em; color: #8A9AB5; text-transform: uppercase; margin-bottom: 8px;">
        AGTM Digital Academy
      </p>
      <h1 style="font-family: Georgia, serif; font-size: 36px; color: #E8941A; margin: 0; font-weight: normal; font-style: italic;">
        LINGUA SPACE
      </h1>
      <p style="color: #8A9AB5; font-size: 14px; margin-top: 8px;">Rapport de progression hebdomadaire</p>
    </div>

    <!-- Salutation -->
    <div style="background: #132540; border: 1px solid #1E3A5F; padding: 24px 28px; margin-bottom: 16px;">
      <p style="color: #FAFAF8; font-size: 16px; margin: 0 0 8px;">
        Bonjour <strong style="color: #E8941A;">${firstName}</strong> ! 👋
      </p>
      <p style="color: #8A9AB5; font-size: 14px; margin: 0; line-height: 1.6;">
        Voici le bilan de votre progression cette semaine. Continuez comme ça — chaque jour compte !
      </p>
    </div>

    <!-- Stats globales -->
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px;">
      ${[
        { icon: '⚡', value: totalXP.toLocaleString(), label: 'XP Total' },
        { icon: '📚', value: totalModules, label: 'Modules' },
        { icon: '🔥', value: `${maxStreak}j`, label: 'Meilleure série' },
      ].map(s => `
        <div style="background: #132540; border: 1px solid #1E3A5F; padding: 20px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 6px;">${s.icon}</div>
          <div style="font-family: Georgia, serif; font-size: 28px; color: #E8941A; line-height: 1;">${s.value}</div>
          <div style="font-size: 11px; color: #8A9AB5; margin-top: 4px; font-family: monospace; letter-spacing: 0.15em; text-transform: uppercase;">${s.label}</div>
        </div>
      `).join('')}
    </div>

    <!-- Tableau de progression par langue -->
    <div style="background: #132540; border: 1px solid #1E3A5F; margin-bottom: 16px; overflow: hidden;">
      <div style="padding: 16px 20px; border-bottom: 1px solid #1E3A5F;">
        <h2 style="font-family: Georgia, serif; font-size: 18px; color: #FAFAF8; margin: 0;">Progression par langue</h2>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: rgba(27,79,138,0.3);">
            <th style="padding: 10px 16px; text-align: left; font-size: 10px; color: #8A9AB5; font-family: monospace; letter-spacing: 0.2em; text-transform: uppercase; font-weight: normal;">Langue</th>
            <th style="padding: 10px 16px; text-align: center; font-size: 10px; color: #8A9AB5; font-family: monospace; letter-spacing: 0.2em; text-transform: uppercase; font-weight: normal;">Niveau</th>
            <th style="padding: 10px 16px; text-align: center; font-size: 10px; color: #8A9AB5; font-family: monospace; letter-spacing: 0.2em; text-transform: uppercase; font-weight: normal;">Modules</th>
            <th style="padding: 10px 16px; text-align: center; font-size: 10px; color: #8A9AB5; font-family: monospace; letter-spacing: 0.2em; text-transform: uppercase; font-weight: normal;">XP</th>
            <th style="padding: 10px 16px; text-align: center; font-size: 10px; color: #8A9AB5; font-family: monospace; letter-spacing: 0.2em; text-transform: uppercase; font-weight: normal;">Série</th>
          </tr>
        </thead>
        <tbody>
          ${langRows}
        </tbody>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align: center; padding: 24px;">
      <a href="https://lingua.africaglobaltraining.com/dashboard"
         style="background: #E8941A; color: #080F1A; padding: 14px 32px; font-size: 13px; font-weight: bold; text-decoration: none; letter-spacing: 0.1em; display: inline-block;">
        REPRENDRE MA PROGRESSION →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; border-top: 1px solid #1E3A5F;">
      <p style="font-size: 11px; color: #8A9AB5; margin: 0;">
        AGTM Digital Academy · Abidjan, Côte d'Ivoire<br>
        <a href="https://lingua.africaglobaltraining.com" style="color: #E8941A; text-decoration: none;">lingua.africaglobaltraining.com</a>
      </p>
      <p style="font-size: 10px; color: #1E3A5F; margin-top: 10px;">
        Vous recevez cet email car vous êtes abonné à LINGUA SPACE.
      </p>
    </div>

  </div>
</body>
</html>
  `
}
