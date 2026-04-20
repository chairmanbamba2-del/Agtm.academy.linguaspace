// ============================================================
// EDGE FUNCTION : generate-receipt
// Génère un reçu PDF pour tout paiement confirmé
// Appelé automatiquement depuis payment-webhook
// ============================================================
import { createClient } from 'npm:@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

function formatDateFR(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const PLAN_LABELS: Record<string,string> = {
  uni:        'LINGUA SPACE — Abonnement UNI (1 langue)',
  all_access: 'LINGUA SPACE — Abonnement ALL ACCESS (4 langues)',
}

const LANG_LABELS: Record<string,string> = {
  en: 'Anglais', fr: 'Français', es: 'Espagnol', de: 'Allemand'
}

const PAY_LABELS: Record<string,string> = {
  orange_money: '🟠 Orange Money',
  wave:         '🔵 Wave',
  mtn:          '🟡 MTN MoMo',
  card:         '💳 Carte bancaire',
  flutterwave:  '🌍 Flutterwave',
}

function buildReceiptHTML(data: {
  receiptNumber:   string
  recipientName:   string
  recipientEmail:  string
  recipientPhone:  string
  planType:        string
  selectedLang:    string | null
  amount:          number
  paymentMethod:   string
  paymentRef:      string
  transactionDate: Date
  appUrl:          string
}): string {
  const {
    receiptNumber, recipientName, recipientEmail, recipientPhone,
    planType, selectedLang, amount, paymentMethod, paymentRef,
    transactionDate, appUrl
  } = data

  const periodStart = formatDateFR(transactionDate)
  const periodEnd   = new Date(transactionDate)
  periodEnd.setMonth(periodEnd.getMonth() + 1)
  const periodEndStr = formatDateFR(periodEnd)

  const planLabel = PLAN_LABELS[planType] || 'Abonnement LINGUA SPACE'
  const langNote  = selectedLang ? `Langue sélectionnée : ${LANG_LABELS[selectedLang]}` : 'Toutes les langues (EN · ES · DE · FR)'

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 15mm 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, serif; color: #111; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 3px solid #0D2D52; margin-bottom: 24px; }
  .logo { font-size: 22px; color: #0D2D52; font-weight: 700; }
  .logo-sub { font-size: 9px; letter-spacing: .25em; color: #8A9AB5; text-transform: uppercase; margin-top: 3px; font-family: 'Courier New', monospace; }
  .receipt-num { text-align: right; }
  .receipt-num-val { font-family: 'Courier New', monospace; font-size: 13px; color: #E8941A; font-weight: 700; }
  .receipt-num-date { font-size: 10px; color: #8A9AB5; margin-top: 3px; }
  .section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  .section-title { font-size: 8px; letter-spacing: .2em; text-transform: uppercase; color: #8A9AB5; font-family: 'Courier New', monospace; margin-bottom: 6px; }
  .section-val { font-size: 12px; line-height: 1.8; color: #111; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { padding: 8px 12px; font-size: 9px; letter-spacing: .15em; color: #8A9AB5; text-align: left; border-bottom: 1px solid #E5E7EB; text-transform: uppercase; font-family: 'Courier New', monospace; background: #F9FAFB; }
  td { padding: 10px 12px; font-size: 11px; border-bottom: 1px solid #F0F0F0; color: #111; }
  .td-right { text-align: right; }
  .total-row { border-top: 2px solid #0D2D52; }
  .total-row td { font-size: 14px; font-weight: 700; color: #0D2D52; padding-top: 12px; }
  .total-amount { color: #E8941A !important; }
  .status-badge { display: inline-block; background: #DCFCE7; border: 1px solid #BBF7D0; color: #16A34A; padding: 3px 10px; font-size: 9px; letter-spacing: .15em; font-family: 'Courier New', monospace; text-transform: uppercase; border-radius: 2px; }
  .footer { border-top: 1px solid #E5E7EB; padding-top: 16px; text-align: center; font-size: 9px; color: #8A9AB5; font-family: 'Courier New', monospace; letter-spacing: .1em; text-transform: uppercase; line-height: 2; }
  .highlight { background: #FFF9F0; border: 1px solid #FDE68A; padding: 10px 14px; margin-bottom: 16px; font-size: 10px; color: #92400E; border-radius: 2px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">LINGUA SPACE</div>
      <div class="logo-sub">AGTM Digital Academy · Reçu officiel</div>
    </div>
    <div class="receipt-num">
      <div class="receipt-num-val">${receiptNumber}</div>
      <div class="receipt-num-date">${formatDateFR(transactionDate)}</div>
    </div>
  </div>

  <div class="section">
    <div>
      <div class="section-title">Émetteur</div>
      <div class="section-val">
        AGTM Digital Academy<br>
        Plateforme LINGUA SPACE<br>
        Abidjan, Côte d'Ivoire<br>
        ${appUrl}
      </div>
    </div>
    <div>
      <div class="section-title">Client</div>
      <div class="section-val">
        ${recipientName}<br>
        ${recipientEmail}<br>
        ${recipientPhone || 'N/A'}
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Période</th>
        <th class="td-right">Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>${planLabel}</strong><br>
          <span style="font-size:10px;color:#8A9AB5">${langNote}</span>
        </td>
        <td style="font-size:10px;color:#8A9AB5">
          Du ${periodStart}<br>au ${periodEndStr}
        </td>
        <td class="td-right" style="font-size:14px;font-weight:600">${amount.toLocaleString('fr-FR')} FCFA</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="2">TOTAL TTC (XOF)</td>
        <td class="td-right total-amount">${amount.toLocaleString('fr-FR')} FCFA</td>
      </tr>
    </tfoot>
  </table>

  <div class="section" style="margin-bottom:20px">
    <div>
      <div class="section-title">Mode de paiement</div>
      <div class="section-val">
        ${PAY_LABELS[paymentMethod] || paymentMethod}<br>
        <span style="font-size:10px;color:#8A9AB5;font-family:'Courier New',monospace">Réf: ${paymentRef}</span>
      </div>
    </div>
    <div>
      <div class="section-title">Statut du paiement</div>
      <div class="section-val">
        <span class="status-badge">✓ Paiement confirmé</span>
      </div>
    </div>
  </div>

  <div class="highlight">
    ℹ️ Ce reçu constitue la preuve officielle de votre paiement et de votre abonnement à la plateforme LINGUA SPACE. Conservez-le pour vos archives.
  </div>

  <div class="footer">
    Merci pour votre confiance · AGTM LINGUA SPACE · ${appUrl}<br>
    Pour toute question : support@africaglobaltraining.com
  </div>
</body>
</html>`
}

// ─── Handler ────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'authorization, content-type' } })
  }

  try {
    // Appelé depuis payment-webhook (service role) ou auth utilisateur
    const { subscriptionId, userId } = await req.json()
    const appUrl = Deno.env.get('APP_URL') || 'https://lingua.africaglobaltraining.com'

    // Récupérer les données
    const { data: sub } = await supabase
      .from('lingua_subscriptions')
      .select('*, lingua_users(full_name, email, phone)')
      .eq('id', subscriptionId)
      .single()

    if (!sub) return new Response('Subscription not found', { status: 404 })

    const user = (sub as any).lingua_users

    // Générer le numéro de reçu
    const { data: receiptNum } = await supabase.rpc('generate_receipt_number')
    const receiptNumber = receiptNum || `REC-${Date.now()}`

    const receiptHTML = buildReceiptHTML({
      receiptNumber,
      recipientName:   user.full_name,
      recipientEmail:  user.email,
      recipientPhone:  user.phone,
      planType:        sub.plan_type,
      selectedLang:    sub.selected_language,
      amount:          sub.amount_fcfa,
      paymentMethod:   sub.payment_method,
      paymentRef:      sub.payment_ref || 'N/A',
      transactionDate: new Date(sub.started_at || Date.now()),
      appUrl,
    })

    // Stocker dans Supabase Storage
    const fileName = `receipts/${userId}/${receiptNumber}.html`
    await supabase.storage.from('lingua-documents').upload(fileName, receiptHTML, {
      contentType: 'text/html', upsert: true
    })
    const { data: { publicUrl } } = supabase.storage.from('lingua-documents').getPublicUrl(fileName)

    // Créer la transaction financière
    await supabase.from('lingua_transactions').insert({
      type:            'subscription',
      direction:       'income',
      subscription_id: subscriptionId,
      user_id:         userId,
      amount_fcfa:     sub.amount_fcfa,
      payment_method:  sub.payment_method,
      payment_ref:     sub.payment_ref,
      description:     `Abonnement LINGUA SPACE ${sub.plan_type.toUpperCase()}`,
      category:        sub.plan_type === 'uni' ? 'abonnement_uni' : 'abonnement_all_access',
      receipt_number:  receiptNumber,
      receipt_pdf_url: publicUrl,
      receipt_sent_at: new Date().toISOString(),
      status:          'confirmed',
    })

    // Envoyer le reçu par email
    if (user.email) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    'LINGUA SPACE <noreply@africaglobaltraining.com>',
          to:      [user.email],
          subject: `🧾 Reçu d'inscription LINGUA SPACE — ${receiptNumber}`,
          html:    `<p>Votre abonnement est confirmé. <a href="${publicUrl}">Télécharger votre reçu</a>.</p>`,
        }),
      })
    }

    return new Response(JSON.stringify({ receiptNumber, pdfUrl: publicUrl }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (error) {
    console.error('generate-receipt error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
