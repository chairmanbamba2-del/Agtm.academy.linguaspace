# ═══════════════════════════════════════════════════════════════
#  AGTM Academy — Script de Migration Supabase
#  Exécute migration_quota.sql + supabase_RLS_security.sql
#  Auteur : ISSA BAMBA | Outil : Claude
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║   AGTM DIGITAL ACADEMY — Migration Base de Données       ║" -ForegroundColor Yellow
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""
Write-Host "📌 Pour trouver votre mot de passe de base de données :" -ForegroundColor Cyan
Write-Host "   Supabase Dashboard → Settings → Database → Database password" -ForegroundColor Cyan
Write-Host "   Lien direct : https://supabase.com/dashboard/project/fglzovvsyloprokmdadx/settings/database" -ForegroundColor Cyan
Write-Host ""

# Demander le mot de passe de façon sécurisée
$securePass = Read-Host "🔑 Entrez votre mot de passe Supabase DB" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
$plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

if ([string]::IsNullOrWhiteSpace($plainPass)) {
    Write-Host "❌ Mot de passe vide. Annulation." -ForegroundColor Red
    exit 1
}

# Définir la variable d'environnement pour Node.js
$env:SUPABASE_DB_PASSWORD = $plainPass

# Aller dans le répertoire du projet
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host ""
Write-Host "🚀 Lancement de la migration..." -ForegroundColor Green
Write-Host ""

# Exécuter le script Node.js
node agtm_pg_migrate.js

# Nettoyer le mot de passe de la mémoire
$env:SUPABASE_DB_PASSWORD = ""
Remove-Variable -Name plainPass -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Migration terminée. Appuyez sur une touche pour fermer..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
