# Script simple pour créer dashboard-premium-lot2.html
$source = Get-Content "dashboard-premium-lot1.html" -Raw -Encoding UTF8
$lot2 = Get-Content "agtm-premium-design/modules-transformed-lot2.html" -Raw -Encoding UTF8

# Remplacer les sections avec des marqueurs simples
# Module 10: Formateur identity card
$pattern10 = "<!-- Formateur identity card -->[\s\S]*?<!-- KPIs -->"
$module10 = ($lot2 -split "<!-- MODULE 10:" -split "<!-- MODULE 11:")[0]
if ($module10) {
    $source = $source -replace $pattern10, $module10
    Write-Host "Module 10 remplace" -ForegroundColor Green
}

# Module 11: PLANIFIER UNE SEANCE
$pattern11 = "<!-- ════ PLANIFIER UNE SÉANCE ════ -->[\s\S]*?<!-- ════ MES CLASSES & ÉTUDIANTS ════ -->"
$module11 = ($lot2 -split "<!-- MODULE 11:" -split "<!-- MODULE 12:")[0]
if ($module11) {
    $source = $source -replace $pattern11, $module11
    Write-Host "Module 11 remplace" -ForegroundColor Green
}

# Module 12: MES CLASSES & ETUDIANTS
$pattern12 = "<!-- ════ MES CLASSES & ÉTUDIANTS ════ -->[\s\S]*?<!-- ── Rapports de séances"
$module12 = ($lot2 -split "<!-- MODULE 12:" -split "<!-- MODULE 13:")[0]
if ($module12) {
    $source = $source -replace $pattern12, $module12
    Write-Host "Module 12 remplace" -ForegroundColor Green
}

# Module 13: English Corner - on va le chercher par l'ID
$pattern13 = "English Corner[\s\S]*?<!--"
$module13 = ($lot2 -split "<!-- MODULE 13:" -split "<!-- MODULE 14:")[0]
if ($module13) {
    # Remplacer la première occurrence de English Corner
    $source = $source -replace "English Corner[\s\S]*?<div", "$module13<div"
    Write-Host "Module 13 remplace" -ForegroundColor Green
}

# Module 14: Rapports pedagogiques
$pattern14 = "<!-- ── Rapports de séances[\s\S]*?<!--"
$module14 = ($lot2 -split "<!-- MODULE 14:" -split "<!-- ==================================================")[0]
if ($module14) {
    $source = $source -replace $pattern14, $module14
    Write-Host "Module 14 remplace" -ForegroundColor Green
}

# Ajouter un en-tête
$header = @"
<!-- ================================================== -->
<!-- DASHBOARD PREMIUM LOT 2 - AGTM DIGITAL ACADEMY -->
<!-- Intégré le $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') -->
<!-- Modules 10-14 transformés avec style "Elite Academy" -->
<!-- ================================================== -->

"@

$source = $header + $source

# Écrire le fichier
$source | Out-File "dashboard-premium-lot2.html" -Encoding UTF8
Write-Host "dashboard-premium-lot2.html cree avec succes !" -ForegroundColor Cyan
Write-Host "Taille: $($source.Length) caracteres" -ForegroundColor Yellow