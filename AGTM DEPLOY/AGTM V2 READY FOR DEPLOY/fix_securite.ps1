# ══════════════════════════════════════════════════════════════
#  fix_securite.ps1 — Correctifs de sécurité immédiats
#  AGTM Digital Academy — Audit de Sécurité Critique
# ══════════════════════════════════════════════════════════════

Write-Host "`n🔒 AUDIT DE SÉCURITÉ — Correctifs immédiats`n" -ForegroundColor Cyan

# ═══ 1. NETLIFY.TOML — Nettoyer les clés en clair ═══════════
Write-Host "📄 netlify.toml..." -NoNewline
$nt = Get-Content "netlify.toml" -Raw

# Remplacer les valeurs sur la ligne suivante (format TOML: KEY = \n"VALUE")
# On capture KEY = puis retour à la ligne puis "VALEUR"
$nt = [regex]::Replace($nt, '(ANTHROPIC_API_KEY(?:_BACKUP)?)\s*=\s*\n\s*"[^"]+"', '$1 = "TODO_DANS_NETLIFY_UI"')
$nt = [regex]::Replace($nt, '(GROQ_API_KEY(?:_BACKUP)?)\s*=\s*\n\s*"[^"]+"', '$1 = "TODO_DANS_NETLIFY_UI"')
$nt = [regex]::Replace($nt, '(DEEPSEEK_API_KEY(?:_BACKUP)?)\s*=\s*\n\s*"[^"]+"', '$1 = "TODO_DANS_NETLIFY_UI"')
$nt = [regex]::Replace($nt, '(BRAVE_SEARCH_API_KEY)\s*=\s*\n\s*"[^"]+"', '$1 = "TODO_DANS_NETLIFY_UI"')
$nt = [regex]::Replace($nt, '(TAVILY_API_KEY)\s*=\s*\n\s*"[^"]+"', '$1 = "TODO_DANS_NETLIFY_UI"')
$nt = [regex]::Replace($nt, '(YOUTUBE_API_KEY(?:_BACKUP)?)\s*=\s*\n\s*"[^"]+"', '$1 = "TODO_DANS_NETLIFY_UI"')
$nt = [regex]::Replace($nt, '(LISTEN_NOTES_KEY)\s*=\s*\n\s*"[^"]+"', '$1 = "TODO_DANS_NETLIFY_UI"')
$nt = [regex]::Replace($nt, '(TWILIO_ACCOUNT_SID)\s*=\s*\n\s*"[^"]+"', '$1 = "TODO_DANS_NETLIFY_UI"')
$nt = [regex]::Replace($nt, '(TWILIO_AUTH_TOKEN)\s*=\s*\n\s*"[^"]+"', '$1 = "TODO_DANS_NETLIFY_UI"')
$nt = [regex]::Replace($nt, '(TWILIO_WHATSAPP_FROM)\s*=\s*\n\s*"[^"]+"', '$1 = "TODO_DANS_NETLIFY_UI"')
$nt = [regex]::Replace($nt, '(TWILIO_TEMPLATE_\w+)\s*=\s*\n\s*"[^"]+"', '$1 = "TODO_DANS_NETLIFY_UI"')
$nt = [regex]::Replace($nt, '(SUPABASE_SERVICE_KEY)\s*=\s*\n\s*"[^"]+"', '$1 = "TODO_DANS_NETLIFY_UI"')
$nt = [regex]::Replace($nt, '(SUPABASE_ANON_KEY)\s*=\s*\n\s*"[^"]+"', '$1 = "TODO_VOIR_ENV"')
$nt = [regex]::Replace($nt, '(SUPABASE_URL)\s*=\s*\n\s*"[^"]+"', '$1 = "TODO_VOIR_ENV"')

# Vérifier s'il reste des clés
$stillHasKeys = $nt -match 'sk-ant|gsk_|sb_secret'
if (-not $stillHasKeys) {
    Set-Content "netlify.toml" $nt
    Write-Host " ✅ NETTOYÉ" -ForegroundColor Green
} else {
    Write-Host " ❌ ENCORE DES CLÉS" -ForegroundColor Red
    # Tentative alternative: remplacer ligne par ligne
    Write-Host "   → Tentative alternative..." -NoNewline
    $lines = Get-Content "netlify.toml"
    $newLines = @()
    $skip = $false
    foreach ($line in $lines) {
        if ($line -match '"(sk-ant|gsk_|AIza|sb_secret|AC[a-z0-9]|tvly-|BSA)[^"]*"') {
            $skip = $true
            continue
        }
        if ($skip -and $line -match '"') {
            $skip = $false
            continue
        }
        if (-not $skip) {
            $newLines += $line
        }
    }
    Set-Content "netlify.toml" $newLines
    Write-Host " ✅ Lignes clés supprimées" -ForegroundColor Yellow
}

# ═══ 2. DASHBOARD.HTML — SERVICE_ROLE → ANON_KEY ═══════════
Write-Host "`n📄 dashboard.html..." -NoNewline
$dash = Get-Content "dashboard.html" -Raw
$serviceCount = ([regex]::Matches($dash, 'SERVICE_ROLE')).Count
$anonCount = ([regex]::Matches($dash, 'SUPABASE_ANON_KEY')).Count

Write-Host " (SERVICE_ROLE: $serviceCount, ANON_KEY: $anonCount)" -NoNewline

if ($serviceCount -gt 0) {
    # 1. Remplacer déclaration JWT
    $dash = $dash -replace "const SUPABASE_SERVICE_ROLE\s*=\s*'[^']+';", "// ⚠️ SÉCURITÉ: SERVICE_ROLE supprimé — utiliser ANON_KEY
    const SUPABASE_SERVICE_ROLE = null;
    const SUPABASE_ANON_KEY = null; // à définir via supabaseAnonKey"

    # 2. Remplacer les headers Bearer
    $dash = $dash -replace "`$`{SUPABASE_SERVICE_ROLE`}", '${SUPABASE_ANON_KEY}'
    $dash = $dash -replace 'apikey:\s*SUPABASE_SERVICE_ROLE', 'apikey: SUPABASE_ANON_KEY'

    Set-Content "dashboard.html" $dash
    Write-Host " → ✅ CORRIGÉ" -ForegroundColor Green
} else {
    Write-Host " → ✅ Déjà propre" -ForegroundColor Green
}

# ═══ 3. .ENV.EXAMPLE ═══════════════════════════════════════
if (-not (Test-Path ".env.example")) {
    Write-Host "`n📄 .env.example..." -NoNewline
    @"
# ══════════════════════════════════════════════════════════════
# AGTM Digital Academy — Variables d'environnement
# À configurer dans Netlify UI → Environment variables
# ══════════════════════════════════════════════════════════════

# ── Supabase ──
SUPABASE_URL=https://fglzovvsyloprokmdadx.supabase.co
SUPABASE_ANON_KEY=sb_publishable_VOTRE_CLE
SUPABASE_SERVICE_KEY=sb_secret_VOTRE_CLE

# ── IA Multi-LLM ──
ANTHROPIC_API_KEY=sk-ant-VOTRE_CLE
GROQ_API_KEY=gsk_VOTRE_CLE
DEEPSEEK_API_KEY=sk-VOTRE_CLE

# ── Services ──
BRAVE_SEARCH_API_KEY=BSA_VOTRE_CLE
TAVILY_API_KEY=tvly-VOTRE_CLE
LISTEN_NOTES_KEY=VOTRE_CLE

# ── YouTube ──
YOUTUBE_API_KEY=AIza_VOTRE_CLE

# ── Twilio ──
TWILIO_ACCOUNT_SID=AC_VOTRE_SID
TWILIO_AUTH_TOKEN=VOTRE_TOKEN
TWILIO_WHATSAPP_FROM=+225XXXXXXXXX
ADMIN_WHATSAPP_PHONE=+225XXXXXXXXX
"@ | Set-Content ".env.example"
    Write-Host " ✅ CRÉÉ" -ForegroundColor Green
} else {
    Write-Host "`n📄 .env.example déjà existant" -ForegroundColor Yellow
}

# ═══ 4. VÉRIFICATION FINALE ═════════════════════════════════
Write-Host "`n═══ VÉRIFICATION FINALE ═══" -ForegroundColor Cyan
$nv = Get-Content "netlify.toml" -Raw
$stillHas = ($nv -match 'sk-ant' -or $nv -match 'gsk_' -or $nv -match 'sb_secret')
if ($stillHas) {
    $m = [regex]::Matches($nv, '(sk-ant|gsk_|AIza|sb_secret|AC[a-z0-9]{32}|\btvly-)')
    Write-Host "⚠️  netlify.toml: $($m.Count) pattern(s) suspect(s) détecté(s)" -ForegroundColor Yellow
} else {
    Write-Host "✅ netlify.toml: PROPRE (aucune clé en clair)" -ForegroundColor Green
}

$dv = Get-Content "dashboard.html" -Raw
$sc = ([regex]::Matches($dv, 'SERVICE_ROLE')).Count
Write-Host "✅ dashboard.html: SERVICE_ROLE = $sc occurrences" -ForegroundColor Green
Write-Host "`n🔒 CORRECTIFS TERMINÉS" -ForegroundColor Cyan
Write-Host "⚠️  Pour supprimer netlify.toml du tracking git si déjà commité :"
Write-Host "   git rm --cached netlify.toml"
Write-Host "   git rm --cached netlify_optimized.toml"
Write-Host "   echo 'netlify.toml' >> .gitignore"
Write-Host "`n⚠️  RÉGÉNÉREZ les clés API compromises !" -ForegroundColor Yellow
