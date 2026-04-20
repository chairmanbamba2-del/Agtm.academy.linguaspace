// ============================================================
// EDGE FUNCTION : generate-certificate
// Génère le certificat PDF, le stocke dans Supabase Storage
// et envoie un email avec le certificat en pièce jointe
// ============================================================
import { createClient } from 'npm:@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const LANG_NAMES_FR: Record<string,string> = {
  en: 'Anglais (English)', fr: 'Français', es: 'Espagnol (Español)', de: 'Allemand (Deutsch)'
}
const LEVEL_LABELS: Record<string,string> = {
  A1: 'Découverte', A2: 'Élémentaire',
  B1: 'Intermédiaire', B2: 'Intermédiaire avancé',
  C1: 'Autonome', C2: 'Maîtrise'
}

// ─── Générer un code de vérification unique ──────────────────
function generateVerifCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

// ─── Formater une date en français ──────────────────────────
function formatDateFR(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

// ─── Template HTML du certificat ────────────────────────────
function buildCertificateHTML(data: {
  recipientName:  string
  language:       string
  level:          string
  scoreGlobal:    number
  scoreListening: number
  scoreReading:   number
  scoreGrammar:   number
  certNumber:     string
  verifCode:      string
  issuedAt:       Date
  validUntil:     Date
  appUrl:         string
}): string {
  const {
    recipientName, language, level, scoreGlobal,
    scoreListening, scoreReading, scoreGrammar,
    certNumber, verifCode, issuedAt, validUntil, appUrl
  } = data

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Certificat LINGUA SPACE — ${certNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 297mm; height: 210mm;
    background: linear-gradient(135deg, #0D2D52 0%, #1B4F8A 60%, #0D2D52 100%);
    font-family: 'Cormorant Garamond', Georgia, serif;
    color: #FAFAF8;
    position: relative;
    overflow: hidden;
  }
  /* Bordure décorative */
  .border-outer {
    position: absolute; inset: 8mm;
    border: 2px solid #E8941A;
    pointer-events: none;
  }
  .border-inner {
    position: absolute; inset: 11mm;
    border: 1px solid rgba(232,148,26,0.3);
    pointer-events: none;
  }
  /* Filigrane */
  .watermark {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%) rotate(-25deg);
    font-size: 120pt; font-weight: 700;
    color: rgba(255,255,255,0.025);
    white-space: nowrap; pointer-events: none;
    letter-spacing: .1em;
  }
  /* Ornements coins */
  .corner { position: absolute; width: 20mm; height: 20mm; }
  .corner-tl { top: 6mm; left: 6mm; border-top: 3px solid #E8941A; border-left: 3px solid #E8941A; }
  .corner-tr { top: 6mm; right: 6mm; border-top: 3px solid #E8941A; border-right: 3px solid #E8941A; }
  .corner-bl { bottom: 6mm; left: 6mm; border-bottom: 3px solid #E8941A; border-left: 3px solid #E8941A; }
  .corner-br { bottom: 6mm; right: 6mm; border-bottom: 3px solid #E8941A; border-right: 3px solid #E8941A; }
  /* Contenu */
  .content {
    position: relative; z-index: 10;
    padding: 16mm 22mm;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }
  .header { text-align: center; }
  .header-brand {
    font-family: 'Space Mono', monospace;
    font-size: 8pt; letter-spacing: .35em;
    color: rgba(255,255,255,0.5); text-transform: uppercase;
    margin-bottom: 2mm;
  }
  .header-title {
    font-size: 11pt; font-weight: 300; letter-spacing: .35em;
    color: #F5B942; text-transform: uppercase;
  }
  .divider {
    width: 60mm; height: 1px;
    background: linear-gradient(90deg, transparent, #E8941A, transparent);
    margin: 3mm auto;
  }
  .body-text { text-align: center; }
  .certifies { font-size: 10pt; color: rgba(255,255,255,0.6); letter-spacing: .1em; }
  .recipient {
    font-size: 26pt; font-weight: 600;
    color: #FAFAF8; letter-spacing: .06em;
    margin: 2mm 0;
  }
  .body-sub { font-size: 9pt; color: rgba(255,255,255,0.55); letter-spacing: .08em; margin: 1mm 0; }
  .level-badge {
    display: inline-block;
    font-size: 42pt; font-weight: 700;
    color: #E8941A;
    border: 2.5px solid #E8941A;
    padding: 1mm 8mm;
    margin: 2mm 0;
    letter-spacing: .1em;
  }
  .lang-name {
    font-family: 'Space Mono', monospace;
    font-size: 8pt; letter-spacing: .25em;
    color: rgba(255,255,255,0.7); text-transform: uppercase;
  }
  /* Scores */
  .scores {
    display: flex; gap: 6mm; justify-content: center; margin: 3mm 0;
  }
  .score-item { text-align: center; background: rgba(0,0,0,0.25); padding: 2mm 4mm; }
  .score-val { font-size: 18pt; color: #F5B942; font-weight: 600; }
  .score-label {
    font-family: 'Space Mono', monospace; font-size: 6pt;
    color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: .1em;
    margin-top: 0.5mm;
  }
  .global-score {
    font-size: 10pt; color: rgba(255,255,255,0.7);
    font-style: italic; margin: 1mm 0;
  }
  /* Footer */
  .footer {
    width: 100%; display: flex;
    justify-content: space-between; align-items: flex-end;
    padding-top: 3mm; border-top: 1px solid rgba(232,148,26,0.25);
  }
  .signature { text-align: left; }
  .sig-line { width: 40mm; height: 1px; background: rgba(255,255,255,0.3); margin-bottom: 1mm; }
  .sig-name { font-size: 10pt; font-weight: 600; color: #FAFAF8; }
  .sig-title {
    font-family: 'Space Mono', monospace; font-size: 6pt;
    color: rgba(255,255,255,0.45); letter-spacing: .1em; text-transform: uppercase;
    margin-top: 0.5mm;
  }
  .qr-section { text-align: center; }
  .qr-placeholder {
    width: 18mm; height: 18mm; background: #FAFAF8;
    display: flex; align-items: center; justify-content: center;
    font-size: 6pt; color: #0D2D52; margin: 0 auto 1mm;
    font-family: 'Space Mono', monospace;
  }
  .qr-url {
    font-family: 'Space Mono', monospace; font-size: 5pt;
    color: rgba(255,255,255,0.4);
  }
  .meta { text-align: right; }
  .meta-line {
    font-family: 'Space Mono', monospace; font-size: 6pt;
    color: rgba(255,255,255,0.4); line-height: 1.9; letter-spacing: .05em;
  }
  .meta-code {
    font-family: 'Space Mono', monospace; font-size: 7pt;
    color: #E8941A; letter-spacing: .08em;
  }
</style>
</head>
<body>
  <!-- Décorations -->
  <div class="watermark">LINGUA</div>
  <div class="border-outer"></div>
  <div class="border-inner"></div>
  <div class="corner corner-tl"></div>
  <div class="corner corner-tr"></div>
  <div class="corner corner-bl"></div>
  <div class="corner corner-br"></div>

  <div class="content">
    <!-- Header -->
    <div class="header">
      <div class="header-brand">AGTM Digital Academy · Abidjan, Côte d'Ivoire</div>
      <div class="header-title">Certificat Officiel de Niveau Linguistique</div>
      <div class="divider"></div>
    </div>

    <!-- Corps -->
    <div class="body-text">
      <div class="certifies">Ce document certifie que</div>
      <div class="recipient">${recipientName.toUpperCase()}</div>
      <div class="body-sub">a passé avec succès l'évaluation officielle LINGUA SPACE et a obtenu le niveau</div>
      <div class="level-badge">${level}</div>
      <div class="body-sub" style="margin-bottom:1mm">${LEVEL_LABELS[level]} · ${LANG_NAMES_FR[language]}</div>

      <!-- Scores -->
      <div class="scores">
        <div class="score-item">
          <div class="score-val">${scoreListening}%</div>
          <div class="score-label">Compréhension<br>orale</div>
        </div>
        <div class="score-item">
          <div class="score-val">${scoreReading}%</div>
          <div class="score-label">Compréhension<br>écrite</div>
        </div>
        <div class="score-item">
          <div class="score-val">${scoreGrammar}%</div>
          <div class="score-label">Grammaire &<br>Vocabulaire</div>
        </div>
        <div class="score-item" style="border: 1.5px solid rgba(232,148,26,0.4);">
          <div class="score-val" style="color:#E8941A;font-size:22pt">${scoreGlobal}%</div>
          <div class="score-label">Score<br>global</div>
        </div>
      </div>

      <div class="global-score">Score global de <strong>${scoreGlobal}%</strong> — Niveau <strong>${level} · ${LEVEL_LABELS[level]}</strong> validé</div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="signature">
        <div class="sig-line"></div>
        <div class="sig-name">Chairman Bamba</div>
        <div class="sig-title">Directeur — AGTM Digital Academy</div>
        <div class="sig-title">Plateforme LINGUA SPACE</div>
      </div>

      <div class="qr-section">
        <div class="qr-placeholder">QR<br>CODE</div>
        <div class="qr-url">${appUrl}/verify/${verifCode}</div>
      </div>

      <div class="meta">
        <div class="meta-code">${certNumber}</div>
        <div class="meta-line">Code vérif : <span style="color:#E8941A">${verifCode}</span></div>
        <div class="meta-line">Émis le ${formatDateFR(issuedAt)}</div>
        <div class="meta-line">Valide jusqu'au ${formatDateFR(validUntil)}</div>
        <div class="meta-line">${appUrl}</div>
      </div>
    </div>
  </div>
</body>
</html>`
}

// ─── Handler principal ───────────────────────────────────────
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

    const { testId } = await req.json()
    const appUrl = Deno.env.get('APP_URL') || 'https://lingua.africaglobaltraining.com'

    // Récupérer le test complété
    const { data: test } = await supabase
      .from('lingua_level_tests')
      .select('*, lingua_users(full_name, email)')
      .eq('id', testId)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single()

    if (!test) return new Response('Completed test not found', { status: 404 })
    if (!test.passed) return new Response('Test not passed — score insufficient', { status: 400 })

    // Vérifier si un certificat existe déjà pour ce test
    const { data: existing } = await supabase
      .from('lingua_certificates')
      .select('*')
      .eq('test_id', testId)
      .single()

    if (existing) {
      return new Response(JSON.stringify(existing), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    // Générer le numéro et le code de vérification
    const { data: certNumberData } = await supabase
      .rpc('generate_certificate_number', { lang: test.language })
    const certNumber = certNumberData || `LINGUA-${test.language.toUpperCase()}-${Date.now()}`
    const verifCode  = generateVerifCode()

    const issuedAt   = new Date()
    const validUntil = new Date(issuedAt)
    validUntil.setFullYear(validUntil.getFullYear() + 2)

    const recipientName = (test as any).lingua_users?.full_name || 'Apprenant LINGUA SPACE'

    // Générer le HTML du certificat
    const certHTML = buildCertificateHTML({
      recipientName,
      language:       test.language,
      level:          test.level_obtained,
      scoreGlobal:    test.score_global,
      scoreListening: test.score_comprehension_orale,
      scoreReading:   test.score_comprehension_ecrite,
      scoreGrammar:   test.score_grammaire_vocabulaire,
      certNumber,
      verifCode,
      issuedAt,
      validUntil,
      appUrl,
    })

    // Stocker le HTML dans Supabase Storage (le frontend peut le convertir en PDF)
    const fileName = `certificates/${user.id}/${certNumber}.html`
    await supabase.storage
      .from('lingua-documents')
      .upload(fileName, certHTML, { contentType: 'text/html', upsert: true })

    const { data: { publicUrl } } = supabase.storage
      .from('lingua-documents')
      .getPublicUrl(fileName)

    // Créer le certificat en DB
    const { data: cert, error } = await supabase
      .from('lingua_certificates')
      .insert({
        certificate_number: certNumber,
        user_id:            user.id,
        test_id:            testId,
        language:           test.language,
        recipient_name:     recipientName,
        level_certified:    test.level_obtained,
        score_global:       test.score_global,
        score_listening:    test.score_comprehension_orale,
        score_reading:      test.score_comprehension_ecrite,
        score_grammar:      test.score_grammaire_vocabulaire,
        issued_at:          issuedAt.toISOString(),
        valid_until:        validUntil.toISOString(),
        verification_code:  verifCode,
        pdf_url:            publicUrl,
        pdf_generated_at:   new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Envoyer l'email avec le certificat
    const userEmail = (test as any).lingua_users?.email
    if (userEmail) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    'LINGUA SPACE <certifications@africaglobaltraining.com>',
          to:      [userEmail],
          subject: `🎓 Votre certificat de niveau ${test.level_obtained} en ${LANG_NAMES_FR[test.language]} — LINGUA SPACE`,
          html: `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#0D2D52;color:#FAFAF8;padding:40px 30px;border:2px solid #E8941A;">
  <h1 style="color:#E8941A;font-size:24px;text-align:center">🎓 Félicitations !</h1>
  <p style="text-align:center;color:rgba(255,255,255,.7)">AGTM Digital Academy · LINGUA SPACE</p>
  <hr style="border-color:rgba(232,148,26,.3);margin:20px 0">
  <p>Cher(e) <strong>${recipientName}</strong>,</p>
  <p style="margin:15px 0">Nous avons le plaisir de vous informer que vous avez obtenu votre <strong style="color:#E8941A">Certificat Officiel de Niveau ${test.level_obtained}</strong> en <strong>${LANG_NAMES_FR[test.language]}</strong>.</p>
  <div style="background:rgba(0,0,0,.3);border:1px solid rgba(232,148,26,.3);padding:20px;text-align:center;margin:20px 0">
    <div style="font-size:42px;font-weight:700;color:#E8941A">${test.level_obtained}</div>
    <div style="color:rgba(255,255,255,.7);font-size:14px">${LEVEL_LABELS[test.level_obtained]} · Score global : ${test.score_global}%</div>
  </div>
  <p><strong>Code de vérification :</strong> <span style="font-family:monospace;color:#E8941A;font-size:18px">${verifCode}</span></p>
  <p style="font-size:12px;color:rgba(255,255,255,.5)">N° ${certNumber} · Valide jusqu'au ${formatDateFR(validUntil)}</p>
  <a href="${publicUrl}" style="display:block;background:#E8941A;color:#0D2D52;padding:14px;text-align:center;font-weight:bold;margin:20px 0;text-decoration:none">⬇ Télécharger mon certificat</a>
  <p style="font-size:11px;color:rgba(255,255,255,.4);text-align:center">Vérification : ${appUrl}/verify/${verifCode}</p>
</div>`,
        }),
      })
    }

    return new Response(JSON.stringify(cert), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (error) {
    console.error('generate-certificate error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})