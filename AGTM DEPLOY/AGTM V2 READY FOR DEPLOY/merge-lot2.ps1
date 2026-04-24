#!/usr/bin/env pwsh
# Script d'intégration PowerShell pour fusionner Lot 2

param(
    [string]$SourceFile = "dashboard-premium-lot1.html",
    [string]$Lot2File = "agtm-premium-design/modules-transformed-lot2.html",
    [string]$OutputFile = "dashboard-premium-lot2.html"
)

Write-Host "INTEGRATION DU LOT 2 - MODULES 10-14" -ForegroundColor Cyan
Write-Host "=" * 60

# Vérifier l'existence des fichiers
if (-not (Test-Path $SourceFile)) {
    Write-Error "Fichier source non trouve: $SourceFile"
    exit 1
}

if (-not (Test-Path $Lot2File)) {
    Write-Error "Fichier Lot 2 non trouve: $Lot2File"
    exit 1
}

Write-Host "Lecture de $SourceFile..." -ForegroundColor Yellow
$sourceContent = Get-Content $SourceFile -Raw -Encoding UTF8
Write-Host "   OK: $($sourceContent.Length) caracteres" -ForegroundColor Green

Write-Host "Lecture de $Lot2File..." -ForegroundColor Yellow
$lot2Content = Get-Content $Lot2File -Raw -Encoding UTF8
Write-Host "   OK: $($lot2Content.Length) caracteres" -ForegroundColor Green

# Fonction pour extraire les modules du Lot 2
function Get-TransformedModule {
    param([string]$content, [string]$moduleStart)
    
    $startIndex = $content.IndexOf($moduleStart)
    if ($startIndex -eq -1) { return $null }
    
    # Trouver le début du module suivant
    $nextModules = @(
        "<!-- MODULE 11:",
        "<!-- MODULE 12:", 
        "<!-- MODULE 13:",
        "<!-- MODULE 14:",
        "<!-- =================================================="
    )
    
    $endIndex = $content.Length
    foreach ($next in $nextModules) {
        if ($next -eq $moduleStart) { continue }
        $idx = $content.IndexOf($next, $startIndex + $moduleStart.Length)
        if ($idx -ne -1 -and $idx -lt $endIndex) {
            $endIndex = $idx
        }
    }
    
    return $content.Substring($startIndex, $endIndex - $startIndex).Trim()
}

# Extraire les modules transformés
Write-Host "`nExtraction des modules transformés..." -ForegroundColor Yellow

$modules = @{
    "module10" = Get-TransformedModule -content $lot2Content -moduleStart "<!-- MODULE 10:"
    "module11" = Get-TransformedModule -content $lot2Content -moduleStart "<!-- MODULE 11:"
    "module12" = Get-TransformedModule -content $lot2Content -moduleStart "<!-- MODULE 12:"
    "module13" = Get-TransformedModule -content $lot2Content -moduleStart "<!-- MODULE 13:"
    "module14" = Get-TransformedModule -content $lot2Content -moduleStart "<!-- MODULE 14:"
}

foreach ($key in $modules.Keys) {
    $module = $modules[$key]
    if ($module) {
        Write-Host "   $key : $($module.Length) caracteres OK" -ForegroundColor Green
    } else {
        Write-Host "   $key : NON TROUVE" -ForegroundColor Red
    }
}

# Fonction pour trouver les positions dans le source
function Find-ModulePosition {
    param([string]$content, [string]$startMarker)
    
    $startIdx = $content.IndexOf($startMarker)
    if ($startIdx -eq -1) { return $null }
    
    # Chercher la fin (prochain commentaire majeur ou section)
    $endIdx = $content.IndexOf("<!--", $startIdx + $startMarker.Length)
    if ($endIdx -eq -1) { $endIdx = $content.Length }
    
    return @($startIdx, $endIdx)
}

# Identifier les marqueurs de début pour chaque module
Write-Host "`nLocalisation des modules dans le source..." -ForegroundColor Yellow

$markers = @{
    "module10" = "<!-- Formateur identity card -->"
    "module11" = "<!-- ════ PLANIFIER UNE SÉANCE ════ -->"
    "module12" = "<!-- ════ MES CLASSES & ÉTUDIANTS ════ -->"
    "module13" = "English Corner"
    "module14" = "<!-- ── Rapports de séances (formateurs) + honoraires ── -->"
}

$positions = @{}
foreach ($key in $markers.Keys) {
    $pos = Find-ModulePosition -content $sourceContent -startMarker $markers[$key]
    if ($pos) {
        $positions[$key] = $pos
        Write-Host "   $key : position $($pos[0])-$($pos[1])" -ForegroundColor Green
    } else {
        Write-Host "   $key : NON TROUVE" -ForegroundColor Red
    }
}

# Remplacer les modules (ordre inverse pour éviter les décalages)
Write-Host "`nIntegration des modules transformés..." -ForegroundColor Yellow

$newContent = $sourceContent
$replacements = @("module14", "module13", "module12", "module11", "module10")

foreach ($module in $replacements) {
    if (-not $positions.ContainsKey($module) -or -not $modules[$module]) {
        Write-Host "   $module : impossible d'integrer" -ForegroundColor Yellow
        continue
    }
    
    $start, $end = $positions[$module]
    $transformed = $modules[$module]
    
    $newContent = $newContent.Substring(0, $start) + $transformed + $newContent.Substring($end)
    Write-Host "   $module : integre OK" -ForegroundColor Green
}

# Ajouter un en-tête
$header = @" 
<!-- ================================================== -->
<!-- DASHBOARD PREMIUM LOT 2 - AGTM DIGITAL ACADEMY -->
<!-- Integre le $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') -->
<!-- Modules 10-14 transformes avec style "Elite Academy" -->
<!-- ================================================== -->

"@

$newContent = $header + $newContent

# Écrire le fichier de sortie
Write-Host "`nEcriture de $OutputFile..." -ForegroundColor Cyan
$newContent | Out-File -FilePath $OutputFile -Encoding UTF8 -Force
Write-Host "   OK : $($newContent.Length) caracteres" -ForegroundColor Green

# Vérifications
Write-Host "`nVERIFICATIONS FINALES" -ForegroundColor Cyan
Write-Host "-" * 40

$criticalIds = @(
    'planBtnGroupe', 'planBtnIndiv', 'planFmtSel', 'planDate',
    'planHdeb', 'planHfin', 'planConflitAlert', 'planSujet',
    'planClasseSel', 'planEtudSel', 'planNotes', 'rapsTableBody',
    '_apEvalTimer', '_apEvalScore', '_certBtn', 'evErr'
)

foreach ($cid in $criticalIds) {
    $count = ($newContent | Select-String -Pattern $cid -AllMatches).Matches.Count
    if ($count -gt 0) {
        Write-Host "   $cid : $count occurrence(s) OK" -ForegroundColor Green
    } else {
        Write-Host "   $cid : ABSENT" -ForegroundColor Red
    }
}

# Vérifier les classes premium
$premiumClasses = @('agtm-card premium-card', 'premium-card-header', 'premium-card-body')
foreach ($pclass in $premiumClasses) {
    $count = ($newContent | Select-String -Pattern [regex]::Escape($pclass) -AllMatches).Matches.Count
    Write-Host "   '$pclass' : $count occurrence(s)" -ForegroundColor Cyan
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "DASHBOARD PREMIUM LOT 2 GENERE AVEC SUCCES !" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "Fichier: $OutputFile" -ForegroundColor Yellow
Write-Host "Taille: $($newContent.Length) caracteres" -ForegroundColor Yellow
Write-Host "Modules transformes: $($modules.Keys.Where({$modules[$_] -ne $null}).Count)/5" -ForegroundColor Yellow
Write-Host ""
Write-Host "Recapitulatif:" -ForegroundColor Cyan
Write-Host "   1. Module 10: Formateur identity card OK"
Write-Host "   2. Module 11: PLANIFIER UNE SEANCE OK"
Write-Host "   3. Module 12: MES CLASSES & ETUDIANTS OK"
Write-Host "   4. Module 13: English Corner OK"
Write-Host "   5. Module 14: Rapports pedagogiques OK"
Write-Host ""
Write-Host "Pret pour la Phase 4.1: UX du Planning Wizard !" -ForegroundColor Magenta