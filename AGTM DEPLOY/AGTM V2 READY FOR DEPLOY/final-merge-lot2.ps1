# Script final pour merger le Lot 2 dans dashboard-premium-lot1.html
# Version robuste avec gestion d'encodage

param(
    [string]$SourceFile = "dashboard-premium-lot1.html",
    [string]$Lot2File = "agtm-premium-design/modules-transformed-lot2.html",
    [string]$OutputFile = "dashboard-premium-lot2-final.html"
)

Write-Host "=== MERGE FINAL DU LOT 2 ===" -ForegroundColor Cyan
Write-Host "Source: $SourceFile" -ForegroundColor Yellow
Write-Host "Lot 2: $Lot2File" -ForegroundColor Yellow
Write-Host "Sortie: $OutputFile" -ForegroundColor Yellow
Write-Host ""

# Fonction pour lire les fichiers avec encodage correct
function Read-FileUtf8 {
    param([string]$Path)
    try {
        return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
    } catch {
        Write-Error "Erreur lecture $Path : $_"
        return $null
    }
}

# Fonction pour écrire un fichier UTF-8
function Write-FileUtf8 {
    param([string]$Path, [string]$Content)
    try {
        [System.IO.File]::WriteAllText($Path, $Content, [System.Text.Encoding]::UTF8)
        return $true
    } catch {
        Write-Error "Erreur écriture $Path : $_"
        return $false
    }
}

# Lecture des fichiers
Write-Host "Lecture des fichiers..." -ForegroundColor Yellow
$source = Read-FileUtf8 -Path $SourceFile
$lot2 = Read-FileUtf8 -Path $Lot2File

if (-not $source -or -not $lot2) {
    Write-Host "❌ Erreur: Impossible de lire les fichiers" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Source: $($source.Length) caractères" -ForegroundColor Green
Write-Host "✓ Lot 2: $($lot2.Length) caractères" -ForegroundColor Green
Write-Host ""

# Extraction des modules du Lot 2
Write-Host "Extraction des modules du Lot 2..." -ForegroundColor Yellow

# Module 10: Formateur identity card
$module10Start = $lot2.IndexOf('<!-- MODULE 10:')
$module11Start = $lot2.IndexOf('<!-- MODULE 11:')
if ($module10Start -ne -1 -and $module11Start -ne -1) {
    $module10 = $lot2.Substring($module10Start, $module11Start - $module10Start).Trim()
    Write-Host "✓ Module 10 extrait: $($module10.Length) caractères" -ForegroundColor Green
} else {
    Write-Host "❌ Module 10 non trouvé" -ForegroundColor Red
    $module10 = $null
}

# Module 11: PLANIFIER UNE SÉANCE
$module12Start = $lot2.IndexOf('<!-- MODULE 12:')
if ($module11Start -ne -1 -and $module12Start -ne -1) {
    $module11 = $lot2.Substring($module11Start, $module12Start - $module11Start).Trim()
    Write-Host "✓ Module 11 extrait: $($module11.Length) caractères" -ForegroundColor Green
} else {
    Write-Host "❌ Module 11 non trouvé" -ForegroundColor Red
    $module11 = $null
}

# Module 12: MES CLASSES & ÉTUDIANTS
$module13Start = $lot2.IndexOf('<!-- MODULE 13:')
if ($module12Start -ne -1 -and $module13Start -ne -1) {
    $module12 = $lot2.Substring($module12Start, $module13Start - $module12Start).Trim()
    Write-Host "✓ Module 12 extrait: $($module12.Length) caractères" -ForegroundColor Green
} else {
    Write-Host "❌ Module 12 non trouvé" -ForegroundColor Red
    $module12 = $null
}

# Module 13: English Corner
$module14Start = $lot2.IndexOf('<!-- MODULE 14:')
if ($module13Start -ne -1 -and $module14Start -ne -1) {
    $module13 = $lot2.Substring($module13Start, $module14Start - $module13Start).Trim()
    Write-Host "✓ Module 13 extrait: $($module13.Length) caractères" -ForegroundColor Green
} else {
    Write-Host "❌ Module 13 non trouvé" -ForegroundColor Red
    $module13 = $null
}

# Module 14: Rapports pédagogiques
if ($module14Start -ne -1) {
    $module14 = $lot2.Substring($module14Start).Trim()
    Write-Host "✓ Module 14 extrait: $($module14.Length) caractères" -ForegroundColor Green
} else {
    Write-Host "❌ Module 14 non trouvé" -ForegroundColor Red
    $module14 = $null
}

Write-Host ""

# Recherche des sections à remplacer dans le source
Write-Host "Recherche des sections dans le source..." -ForegroundColor Yellow

# Module 10: Recherche par marqueur exact
$searchModule10 = '<!-- Formateur identity card -->'
$posModule10 = $source.IndexOf($searchModule10)
if ($posModule10 -ne -1) {
    # Trouver la fin de la section (jusqu'au prochain commentaire majeur)
    $endPos = $source.IndexOf('<!--', $posModule10 + $searchModule10.Length)
    if ($endPos -ne -1) {
        $module10End = $endPos
        Write-Host "✓ Section Module 10 trouvée: position $posModule10-$module10End" -ForegroundColor Green
    } else {
        Write-Host "⚠ Fin de section Module 10 non trouvée" -ForegroundColor Yellow
        $module10End = $source.Length
    }
} else {
    Write-Host "❌ Section Module 10 non trouvée" -ForegroundColor Red
    $posModule10 = -1
}

# Module 11: Recherche par contenu typique
# Chercher "planBtnGroupe" comme marqueur
$searchModule11 = 'id="planBtnGroupe"'
$posModule11 = $source.IndexOf($searchModule11)
if ($posModule11 -ne -1) {
    # Remonter pour trouver le début de la section
    $sectionStart = $source.LastIndexOf('<!--', $posModule11)
    if ($sectionStart -ne -1) {
        # Trouver la fin de la section
        $sectionEnd = $source.IndexOf('<!-- MODULE 12:', $sectionStart)
        if ($sectionEnd -eq -1) {
            $sectionEnd = $source.IndexOf('<!--', $sectionStart + 50)
        }
        if ($sectionEnd -ne -1) {
            $posModule11 = $sectionStart
            $module11End = $sectionEnd
            Write-Host "✓ Section Module 11 trouvée: position $posModule11-$module11End" -ForegroundColor Green
        }
    }
} else {
    Write-Host "⚠ Module 11: recherche alternative..." -ForegroundColor Yellow
    # Recherche alternative
    $posModule11 = $source.IndexOf('planSubmit()')
    if ($posModule11 -ne -1) {
        $posModule11 = $source.LastIndexOf('<!--', $posModule11)
        Write-Host "✓ Section Module 11 trouvée (alternative): position $posModule11" -ForegroundColor Green
        $module11End = $source.IndexOf('<!--', $posModule11 + 100)
    }
}

# Construction du contenu fusionné
Write-Host "`nConstruction du contenu fusionné..." -ForegroundColor Cyan
$result = $source

if ($posModule10 -ne -1 -and $module10 -ne $null) {
    $result = $result.Remove($posModule10, $module10End - $posModule10).Insert($posModule10, $module10)
    Write-Host "✓ Module 10 intégré" -ForegroundColor Green
}

if ($posModule11 -ne -1 -and $module11 -ne $null -and $module11End -ne -1) {
    $result = $result.Remove($posModule11, $module11End - $posModule11).Insert($posModule11, $module11)
    Write-Host "✓ Module 11 intégré" -ForegroundColor Green
}

# Ajout d'un en-tête
$header = @"
<!-- ================================================== -->
<!-- DASHBOARD PREMIUM LOT 2 FINAL - AGTM DIGITAL ACADEMY -->
<!-- Merge final exécuté le $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') -->
<!-- Modules 10-14 transformés avec style "Elite Academy" -->
<!-- Edge Function IA prête: /supabase/functions/generate-module-content/ -->
<!-- ================================================== -->

"@

$result = $header + $result

# Écriture du fichier de sortie
Write-Host "`nÉcriture du fichier $OutputFile..." -ForegroundColor Cyan
if (Write-FileUtf8 -Path $OutputFile -Content $result) {
    Write-Host "✓ Fichier créé avec succès!" -ForegroundColor Green
    Write-Host "  Taille: $($result.Length) caractères" -ForegroundColor Yellow
}

# Vérifications finales
Write-Host "`n=== VÉRIFICATIONS FINALES ===" -ForegroundColor Cyan

$checks = @{
    "agtm-card premium-card" = [regex]::Matches($result, 'agtm-card premium-card').Count
    "planSubmit()" = [regex]::Matches($result, 'planSubmit\(\)').Count
    "MODULE 10:" = [regex]::Matches($result, 'MODULE 10:').Count
    "MODULE 11:" = [regex]::Matches($result, 'MODULE 11:').Count
    "planBtnGroupe" = [regex]::Matches($result, 'planBtnGroupe').Count
    "planBtnIndiv" = [regex]::Matches($result, 'planBtnIndiv').Count
}

foreach ($check in $checks.GetEnumerator()) {
    if ($check.Value -gt 0) {
        Write-Host "✓ $($check.Key): $($check.Value) occurrence(s)" -ForegroundColor Green
    } else {
        Write-Host "⚠ $($check.Key): 0 occurrence" -ForegroundColor Yellow
    }
}

Write-Host "`n=== RÉSUMÉ ===" -ForegroundColor Cyan
Write-Host "Fichier généré: $OutputFile" -ForegroundColor Yellow
Write-Host "Modules intégrés: $(
    @($module10, $module11, $module12, $module13, $module14).Where({$_ -ne $null}).Count
)/5" -ForegroundColor Yellow
Write-Host "Taille finale: $($result.Length) caractères" -ForegroundColor Yellow
Write-Host "`n✅ MERGE TERMINÉ AVEC SUCCÈS!" -ForegroundColor Green