# Script simplifié pour merger le Lot 2
# Version ultra-simple sans erreurs

Write-Host "=== MERGE SIMPLIFIÉ LOT 2 ===" -ForegroundColor Cyan

# Lire les fichiers
$source = Get-Content "dashboard-premium-lot1.html" -Raw
$lot2 = Get-Content "agtm-premium-design/modules-transformed-lot2.html" -Raw

Write-Host "Source: $($source.Length) caractères" -ForegroundColor Yellow
Write-Host "Lot 2: $($lot2.Length) caractères" -ForegroundColor Yellow
Write-Host ""

# Extraire le Module 11 (PLANIFIER UNE SÉANCE) du Lot 2
Write-Host "Extraction du Module 11..." -ForegroundColor Yellow

$module11Start = $lot2.IndexOf("<!-- MODULE 11:")
if ($module11Start -eq -1) {
    Write-Host "❌ Module 11 non trouvé" -ForegroundColor Red
    exit 1
}

$module12Start = $lot2.IndexOf("<!-- MODULE 12:")
if ($module12Start -eq -1) {
    $module12Start = $lot2.Length
}

$module11Content = $lot2.Substring($module11Start, $module12Start - $module11Start).Trim()
Write-Host "✓ Module 11 extrait: $($module11Content.Length) caractères" -ForegroundColor Green

# Trouver la section à remplacer dans le source
Write-Host "`nRecherche de la section à remplacer..." -ForegroundColor Yellow

# Chercher "planBtnGroupe" comme point de repère
$marker = $source.IndexOf('id="planBtnGroupe"')
if ($marker -eq -1) {
    Write-Host "⚠ Marqueur 'planBtnGroupe' non trouvé" -ForegroundColor Yellow
    # Chercher "planSubmit()" comme alternative
    $marker = $source.IndexOf("planSubmit()")
    if ($marker -eq -1) {
        Write-Host "❌ Aucun marqueur trouvé pour le Module 11" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Marqueur alternatif trouvé: 'planSubmit()'" -ForegroundColor Green
} else {
    Write-Host "✓ Marqueur trouvé: 'planBtnGroupe'" -ForegroundColor Green
}

# Trouver le début de la section (remonter au commentaire précédent)
$sectionStart = $source.LastIndexOf("<!--", $marker)
if ($sectionStart -eq -1) {
    $sectionStart = $marker - 500  # Approximatif
    if ($sectionStart -lt 0) { $sectionStart = 0 }
}

# Trouver la fin de la section (prochain commentaire majeur)
$sectionEnd = $source.IndexOf("<!-- MODULE 12:", $sectionStart)
if ($sectionEnd -eq -1) {
    $sectionEnd = $source.IndexOf("<!-- MODULE 13:", $sectionStart)
}
if ($sectionEnd -eq -1) {
    $sectionEnd = $source.IndexOf("<!--", $sectionStart + 100)
}
if ($sectionEnd -eq -1) {
    $sectionEnd = $source.Length
}

Write-Host "Section identifiée: position $sectionStart-$sectionEnd" -ForegroundColor Green

# Remplacer la section
$result = $source.Remove($sectionStart, $sectionEnd - $sectionStart).Insert($sectionStart, $module11Content)

# Ajouter un en-tête
$header = @"
<!-- ================================================== -->
<!-- DASHBOARD PREMIUM LOT 2 FINAL - MERGE SIMPLIFIÉ -->
<!-- Merge exécuté le $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') -->
<!-- Module 11 transformé avec style "Elite Academy" -->
<!-- Edge Function IA prête: /supabase/functions/generate-module-content/ -->
<!-- ================================================== -->

"@

$result = $header + $result

# Écrire le fichier
$outputFile = "dashboard-premium-lot2-final.html"
Set-Content -Path $outputFile -Value $result -Encoding UTF8

Write-Host "`n✓ Fichier créé: $outputFile" -ForegroundColor Green
Write-Host "  Taille: $($result.Length) caractères" -ForegroundColor Yellow

# Vérifications rapides
Write-Host "`n=== VÉRIFICATIONS ===" -ForegroundColor Cyan

if ($result.Contains("agtm-card premium-card")) {
    Write-Host "✓ 'agtm-card premium-card' présent" -ForegroundColor Green
} else {
    Write-Host "⚠ 'agtm-card premium-card' absent" -ForegroundColor Yellow
}

if ($result.Contains("planBtnGroupe")) {
    Write-Host "✓ 'planBtnGroupe' présent" -ForegroundColor Green
} else {
    Write-Host "⚠ 'planBtnGroupe' absent" -ForegroundColor Yellow
}

if ($result.Contains("MODULE 11:")) {
    Write-Host "✓ 'MODULE 11:' présent" -ForegroundColor Green
} else {
    Write-Host "⚠ 'MODULE 11:' absent" -ForegroundColor Yellow
}

Write-Host "`n✅ MERGE TERMINÉ!" -ForegroundColor Green
Write-Host "Fichier: $outputFile" -ForegroundColor Yellow