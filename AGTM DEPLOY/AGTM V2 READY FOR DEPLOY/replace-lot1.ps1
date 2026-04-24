# Script PowerShell pour intégrer le Lot 1 dans dashboard.html
# Règle d'or : ne pas modifier les IDs, data-attributes, onclick

param(
    [string]$DashboardPath = "dashboard.html",
    [string]$ModulesPath = "agtm-premium-design\modules-transformed-lot1.html",
    [string]$OutputPath = "dashboard-premium-lot1.html"
)

Write-Host "Lecture des fichiers..." -ForegroundColor Cyan

# Lecture encodage UTF8
$dashboardContent = [System.IO.File]::ReadAllText($DashboardPath, [System.Text.Encoding]::UTF8)
$modulesContent = [System.IO.File]::ReadAllText($ModulesPath, [System.Text.Encoding]::UTF8)

# Extraction des modules transformés
$modulePattern = '(?s)<!-- MODULE (\d+):.*?-->(.*?)(?=<!-- MODULE (\d+):|<!-- ================================================== -->)'
$moduleMatches = [regex]::Matches($modulesContent, $modulePattern)

$modules = @{}
foreach ($match in $moduleMatches) {
    $num = $match.Groups[1].Value
    $content = $match.Groups[2].Value.Trim()
    $modules[$num] = $content
    Write-Host "Module $num chargé (longueur: $($content.Length))" -ForegroundColor Green
}

if ($modules.Count -eq 0) {
    Write-Host "Aucun module trouvé dans $ModulesPath" -ForegroundColor Red
    exit 1
}

# 1. REMPLACEMENT KPIs (Module 4)
# Chercher la section KPIs et la remplacer
$kpiPattern = '(?s)(\s*<!-- ── KPIs ────────────────────────────────────────────── -->\s*<div style="display:grid;grid-template-columns:repeat\(4,1fr\);gap:14px;margin-bottom:14px">.*?<!-- ── Dossiers Formateurs ─────────────────────────────── -->)'
$kpiMatch = [regex]::Match($dashboardContent, $kpiPattern)

if ($kpiMatch.Success -and $modules['4']) {
    $oldKpi = $kpiMatch.Groups[0].Value
    $newKpi = @"

        <!-- ── KPIs ────────────────────────────────────────────── -->
        <!-- Remplacement par Module 4 transformé -->
        $($modules['4'])
        <!-- ── Dossiers Formateurs ─────────────────────────────── -->
"@
    $dashboardContent = $dashboardContent.Replace($oldKpi, $newKpi)
    Write-Host "✓ Section KPIs remplacée (Module 4)" -ForegroundColor Green
} else {
    Write-Host "⚠ Section KPIs non trouvée ou Module 4 manquant" -ForegroundColor Yellow
}

# 2. REMPLACEMENT Dossiers Formateurs (Module 6)
# Chercher la section Formateurs jusqu'à la suivante (Graphique revenus)
$formateurPattern = '(?s)(\s*<!-- ── Dossiers Formateurs ─────────────────────────────── -->.*?<!-- ── Graphique revenus ─────────────────────────────────── -->)'
$formateurMatch = [regex]::Match($dashboardContent, $formateurPattern)

if ($formateurMatch.Success -and $modules['6']) {
    $oldFormateur = $formateurMatch.Groups[0].Value
    $newFormateur = @"

        <!-- ── Dossiers Formateurs ─────────────────────────────── -->
        <!-- Remplacement par Module 6 transformé -->
        $($modules['6'])
        <!-- ── Graphique revenus ─────────────────────────────────── -->
"@
    $dashboardContent = $dashboardContent.Replace($oldFormateur, $newFormateur)
    Write-Host "✓ Section Formateurs remplacée (Module 6)" -ForegroundColor Green
} else {
    Write-Host "⚠ Section Formateurs non trouvée ou Module 6 manquant" -ForegroundColor Yellow
}

# 3. REMPLACEMENT Graphique revenus (Module 7)
# Chercher la section Graphique revenus jusqu'à la suivante (Étudiants à risque)
$graphiquePattern = '(?s)(\s*<!-- ── Graphique revenus ─────────────────────────────────── -->.*?<!-- ── Étudiants à risque ─────────────────────────────── -->)'
$graphiqueMatch = [regex]::Match($dashboardContent, $graphiquePattern)

if ($graphiqueMatch.Success -and $modules['7']) {
    $oldGraphique = $graphiqueMatch.Groups[0].Value
    $newGraphique = @"

        <!-- ── Graphique revenus ─────────────────────────────────── -->
        <!-- Remplacement par Module 7 transformé -->
        $($modules['7'])
        <!-- ── Étudiants à risque ─────────────────────────────── -->
"@
    $dashboardContent = $dashboardContent.Replace($oldGraphique, $newGraphique)
    Write-Host "✓ Section Graphique revenus remplacée (Module 7)" -ForegroundColor Green
} else {
    Write-Host "⚠ Section Graphique revenus non trouvée ou Module 7 manquant" -ForegroundColor Yellow
}

# 4. REMPLACEMENT Étudiants à risque (Module 8)
# Chercher la section Étudiants à risque jusqu'à la suivante (Progression des Cohortes)
$risquePattern = '(?s)(\s*<!-- ── Étudiants à risque ─────────────────────────────── -->.*?<!-- ── Progression des Cohortes ───────────────────────── -->)'
$risqueMatch = [regex]::Match($dashboardContent, $risquePattern)

if ($risqueMatch.Success -and $modules['8']) {
    $oldRisque = $risqueMatch.Groups[0].Value
    $newRisque = @"

        <!-- ── Étudiants à risque ─────────────────────────────── -->
        <!-- Remplacement par Module 8 transformé -->
        $($modules['8'])
        <!-- ── Progression des Cohortes ───────────────────────── -->
"@
    $dashboardContent = $dashboardContent.Replace($oldRisque, $newRisque)
    Write-Host "✓ Section Étudiants à risque remplacée (Module 8)" -ForegroundColor Green
} else {
    Write-Host "⚠ Section Étudiants à risque non trouvée ou Module 8 manquant" -ForegroundColor Yellow
}

# 5. REMPLACEMENT Progression des Cohortes (Module 9)
# Chercher la section Cohortes jusqu'à la fin de la fonction renderOverview
# Cette section se termine par la fin de la template string (`)
$cohortePattern = '(?s)(\s*<!-- ── Progression des Cohortes ───────────────────────── -->.*?)(?=`\s*\)\s*// Load async sections after DOM)'
$cohorteMatch = [regex]::Match($dashboardContent, $cohortePattern)

if ($cohorteMatch.Success -and $modules['9']) {
    $oldCohorte = $cohorteMatch.Groups[1].Value
    $newCohorte = @"

        <!-- ── Progression des Cohortes ───────────────────────── -->
        <!-- Remplacement par Module 9 transformé -->
        $($modules['9'])
"@
    $dashboardContent = $dashboardContent.Replace($oldCohorte, $newCohorte)
    Write-Host "✓ Section Progression des Cohortes remplacée (Module 9)" -ForegroundColor Green
} else {
    Write-Host "⚠ Section Progression des Cohortes non trouvée ou Module 9 manquant" -ForegroundColor Yellow
}

# 6. REMPLACEMENT Agenda du jour (Module 5) - dans renderOverview
# L'agenda est dans une section séparée après les cohortes
$agendaPattern = '(?s)(\s*<!-- ── AGENDA DU JOUR ──────────────────────────────────── -->\s*<div style="margin-top:20px">.*?)(?=`\s*\)\s*// Load async sections after DOM)'
$agendaMatch = [regex]::Match($dashboardContent, $agendaPattern)

if ($agendaMatch.Success -and $modules['5']) {
    $oldAgenda = $agendaMatch.Groups[1].Value
    $newAgenda = @"

        <!-- ── AGENDA DU JOUR ──────────────────────────────────── -->
        <!-- Remplacement par Module 5 transformé -->
        $($modules['5'])
"@
    $dashboardContent = $dashboardContent.Replace($oldAgenda, $newAgenda)
    Write-Host "✓ Section Agenda du jour remplacée (Module 5)" -ForegroundColor Green
} else {
    Write-Host "⚠ Section Agenda du jour non trouvée ou Module 5 manquant" -ForegroundColor Yellow
}

# Écriture du fichier de sortie
Write-Host "Écriture du fichier $OutputPath..." -ForegroundColor Cyan
[System.IO.File]::WriteAllText($OutputPath, $dashboardContent, [System.Text.Encoding]::UTF8)

Write-Host "`n✅ Intégration Lot 1 terminée !" -ForegroundColor Green
Write-Host "Fichier généré : $OutputPath" -ForegroundColor Cyan
Write-Host "Pensez à vérifier l'intégration des modules transformés." -ForegroundColor Yellow