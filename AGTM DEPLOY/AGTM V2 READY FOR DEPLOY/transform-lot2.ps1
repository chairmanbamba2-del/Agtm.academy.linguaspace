#!/usr/bin/env pwsh
# Script PowerShell pour transformer le Lot 2 (modules 10-14)

param(
    [string]$InputFile = "dashboard-premium-lot1.html",
    [string]$OutputFile = "agtm-premium-design/modules-transformed-lot2.html"
)

Write-Host "Lecture de $InputFile..." -ForegroundColor Cyan
$content = Get-Content $InputFile -Raw -Encoding UTF8
if (-not $content) {
    Write-Error "Impossible de lire $InputFile"
    exit 1
}

Write-Host "Fichier lu ($($content.Length) caractères)" -ForegroundColor Green

# Fonction pour transformer la carte formateur
function Transform-FormateurIdentityCard {
    param([string]$section)
    
    # Remplacer le div externe
    $transformed = $section -replace '<div style="padding:14px 20px;border-radius:12px;border:1px solid #4A90D9;background:linear-gradient\(135deg,#0E1E34,#1A1408\);margin-bottom:18px;display:flex;align-items:center;gap:16px">', @'
<div class="agtm-card premium-card" style="margin-bottom: 1.5rem;">
  <div class="premium-card-header">
    <div>
      <div class="premium-card-title">👨‍🏫 Profil Formateur</div>
      <div class="premium-card-subtitle">Vos informations et statistiques</div>
    </div>
  </div>
  <div class="premium-card-body" style="padding: 1.5rem; display: flex; align-items: center; gap: 16px;">
'@
    
    # Ajouter le marqueur de module
    $transformed = $transformed -replace '<!-- Formateur identity card -->', '<!-- MODULE 10: FORMATEUR IDENTITY CARD (TRANSFORMÉ) -->'
    
    # Fermer les divs
    $transformed = $transformed -replace '</div>\s*$', @'
  </div>
</div>
'@
    
    return $transformed
}

# Fonction pour extraire une section
function Get-Section {
    param(
        [string]$content,
        [string]$startMarker,
        [string]$endMarker,
        [int]$maxLength = 5000
    )
    
    $startIndex = $content.IndexOf($startMarker)
    if ($startIndex -eq -1) {
        Write-Warning "Marqueur de début non trouvé: $startMarker"
        return $null
    }
    
    $endIndex = if ($endMarker) {
        $content.IndexOf($endMarker, $startIndex + $startMarker.Length)
    } else {
        -1
    }
    
    if ($endIndex -eq -1) {
        $section = $content.Substring($startIndex, [Math]::Min($maxLength, $content.Length - $startIndex))
    } else {
        $section = $content.Substring($startIndex, $endIndex - $startIndex + $endMarker.Length)
    }
    
    return $section
}

# 1. Formateur identity card
Write-Host "`n1. Extraction du Module 10: Formateur identity card..." -ForegroundColor Yellow
$formateurSection = Get-Section -content $content -startMarker "<!-- Formateur identity card -->" -endMarker "<!-- KPIs -->"
if ($formateurSection) {
    $formateurTransformed = Transform-FormateurIdentityCard -section $formateurSection
    Write-Host "   ✓ Module 10 transformé ($($formateurTransformed.Length) caractères)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Module 10 non trouvé" -ForegroundColor Red
    $formateurTransformed = $null
}

# 2. PLANIFIER UNE SÉANCE - Extraire le contenu dans ${wrap(`...`)}
Write-Host "`n2. Extraction du Module 11: PLANIFIER UNE SÉANCE..." -ForegroundColor Yellow
$planifierStart = "<!-- ════ PLANIFIER UNE SÉANCE ════ -->"
$planifierEnd = "<!-- ════ MES CLASSES & ÉTUDIANTS ════ -->"

$planifierSection = Get-Section -content $content -startMarker $planifierStart -endMarker $planifierEnd
if ($planifierSection) {
    # Extraire le contenu à l'intérieur de ${wrap(`...`)}
    $pattern = '\$\{wrap\(`([\s\S]*?)`\)\}'
    $match = [regex]::Match($planifierSection, $pattern)
    
    if ($match.Success) {
        $innerContent = $match.Groups[1].Value
        $planifierTransformed = @"
<!-- MODULE 11: PLANIFIER UNE SÉANCE (TRANSFORMÉ) -->
<div class="agtm-card premium-card" style="margin-bottom: 1.5rem;">
  <div class="premium-card-header">
    <div>
      <div class="premium-card-title">📅 Planifier une Séance</div>
      <div class="premium-card-subtitle">Créer une séance de groupe ou individuelle</div>
    </div>
  </div>
  
  <div class="premium-card-body">
$innerContent
  </div>
  
  <div class="premium-card-footer">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-top: 1px solid var(--agtm-border);">
      <div style="font-size: .75rem; color: var(--premium-text-3);">
        ⚠️ Vérifiez les conflits avant de créer la séance
      </div>
      <button onclick="planSubmit()" class="agtm-btn agtm-btn-primary">🚀 Créer la séance</button>
    </div>
  </div>
</div>
"@
        Write-Host "   ✓ Module 11 transformé ($($planifierTransformed.Length) caractères)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Contenu wrap() non trouvé dans la section" -ForegroundColor Red
        $planifierTransformed = $null
    }
} else {
    Write-Host "   ✗ Module 11 non trouvé" -ForegroundColor Red
    $planifierTransformed = $null
}

# 3. MES CLASSES & ÉTUDIANTS
Write-Host "`n3. Extraction du Module 12: MES CLASSES & ÉTUDIANTS..." -ForegroundColor Yellow
$classesSection = Get-Section -content $content -startMarker "<!-- ════ MES CLASSES & ÉTUDIANTS ════ -->" -endMarker "<!--" -maxLength 2000
if ($classesSection) {
    # Transformer le titre
    $classesTransformed = $classesSection -replace '<div style="font-weight:800;color:#C8960C;font-size:.92rem;margin:22px 0 14px">🏫 Mes Classes & Étudiants Inscrits</div>', '<div class="premium-card-title" style="margin-bottom: 1rem;">🏫 Mes Classes & Étudiants Inscrits</div>'
    
    # Encapsuler dans une carte
    $classesTransformed = @"
<!-- MODULE 12: MES CLASSES & ÉTUDIANTS (TRANSFORMÉ) -->
<div class="agtm-card premium-card" style="margin-bottom: 1.5rem;">
  <div class="premium-card-header">
    <div>
      <div class="premium-card-title">🏫 Mes Classes & Étudiants</div>
      <div class="premium-card-subtitle">Gestion de vos groupes d'apprenants</div>
    </div>
    <div class="agtm-btn-group">
      <button onclick="window._refreshClassesFormateur()" class="agtm-btn agtm-btn-secondary agtm-btn-sm">🔄 Actualiser</button>
    </div>
  </div>
  
  <div class="premium-card-body">
$classesTransformed
  </div>
</div>
"@
    Write-Host "   ✓ Module 12 transformé ($($classesTransformed.Length) caractères)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Module 12 non trouvé" -ForegroundColor Red
    $classesTransformed = $null
}

# 4. English Corner (version simplifiée)
Write-Host "`n4. Création du Module 13: English Corner..." -ForegroundColor Yellow
$englishTransformed = @"
<!-- MODULE 13: ENGLISH CORNER - ÉVALUATIONS (TRANSFORMÉ) -->
<div class="agtm-card premium-card" style="margin-bottom: 1.5rem;">
  <div class="premium-card-header">
    <div>
      <div class="premium-card-title">🧪 English Corner</div>
      <div class="premium-card-subtitle">Évaluations et tests de niveau</div>
    </div>
    <div class="agtm-btn-group">
      <button onclick="window._apStartPlacement()" class="agtm-btn agtm-btn-primary agtm-btn-sm">🎯 Test de Placement</button>
      <button onclick="window._apOpenEval('A1')" class="agtm-btn agtm-btn-secondary agtm-btn-sm">📝 Évaluation</button>
    </div>
  </div>
  
  <div class="premium-card-body">
    <div style="min-height: 300px; display: flex; flex-direction: column; gap: 1rem;">
      <div class="agtm-skeleton" style="height: 50px; border-radius: 10px;"></div>
      <div class="agtm-skeleton" style="height: 50px; border-radius: 10px;"></div>
      <div class="agtm-skeleton" style="height: 50px; border-radius: 10px;"></div>
    </div>
    <p id="evErr" style="color: var(--agtm-danger); font-size: .82rem; min-height: 18px; margin-top: 1rem;"></p>
  </div>
  
  <div class="premium-card-footer">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;">
      <div style="font-size: .75rem; color: var(--premium-text-3);">
        <span>Timer: <span id="_apEvalTimer">00:00</span></span>
        <span style="margin-left: 1rem;">Score: <span id="_apEvalScore">0</span></span>
      </div>
      <button id="_certBtn" onclick="window._apPrintCert()" class="agtm-btn agtm-btn-primary" style="display: none;">🎓 Générer Certificat</button>
    </div>
  </div>
</div>
"@
Write-Host "   ✓ Module 13 créé ($($englishTransformed.Length) caractères)" -ForegroundColor Green

# 5. Rapports pédagogiques
Write-Host "`n5. Extraction du Module 14: Rapports pédagogiques..." -ForegroundColor Yellow
$rapportsSection = Get-Section -content $content -startMarker "<!-- ── Rapports de séances (formateurs) + honoraires ── -->" -endMarker "<!--" -maxLength 3000
if ($rapportsSection) {
    # Remplacer le div externe
    $rapportsTransformed = $rapportsSection -replace '<div style="background:#152233;border:1px solid #4A90D9;border-radius:12px;overflow:hidden;margin-bottom:22px">', @'
<div class="agtm-card premium-card" style="margin-bottom: 1.5rem;">
  <div class="premium-card-header">
    <div>
      <div class="premium-card-title">📝 Rapports Pédagogiques</div>
      <div class="premium-card-subtitle">Suivi des séances et honoraires</div>
    </div>
  </div>
  <div class="premium-card-body" style="padding: 0;">
'@

    $rapportsTransformed = "<!-- MODULE 14: RAPPORTS PÉDAGOGIQUES (TRANSFORMÉ) -->`n" + $rapportsTransformed
    Write-Host "   ✓ Module 14 transformé ($($rapportsTransformed.Length) caractères)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Module 14 non trouvé" -ForegroundColor Red
    $rapportsTransformed = $null
}

# Écrire le fichier de sortie
Write-Host "`nÉcriture du résultat dans $OutputFile..." -ForegroundColor Cyan

$outputDir = Split-Path $OutputFile -Parent
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$outputContent = @"
<!-- ================================================== -->
<!-- LOT 2 TRANSFORMÉ - MODULES 10-14 (CŒUR PÉDAGOGIQUE) -->
<!-- ================================================== -->
<!-- Transformé le $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') -->
<!-- Source: $InputFile -->

$(if ($formateurTransformed) { "$formateurTransformed`n`n" } else { "<!-- Module 10: NON TRANSFORMÉ -->`n`n" })
$(if ($planifierTransformed) { "$planifierTransformed`n`n" } else { "<!-- Module 11: NON TRANSFORMÉ -->`n`n" })
$(if ($classesTransformed) { "$classesTransformed`n`n" } else { "<!-- Module 12: NON TRANSFORMÉ -->`n`n" })
$englishTransformed`n`n
$(if ($rapportsTransformed) { "$rapportsTransformed`n`n" } else { "<!-- Module 14: NON TRANSFORMÉ -->`n`n" })

<!-- ================================================== -->
<!-- STYLES COMPLÉMENTAIRES POUR LE LOT 2 -->
<!-- ================================================== -->

<style>
  /* Styles pour les boutons de mode (groupe/individuel) */
  .plan-mode-btn {
    flex: 1;
    padding: 10px 14px;
    border-radius: 9px;
    font-weight: 700;
    font-size: .82rem;
    cursor: pointer;
    border: 2px solid var(--agtm-border);
    background: transparent;
    color: var(--premium-text-3);
    transition: all .2s;
  }
  
  .plan-mode-btn.active {
    border-color: var(--agtm-blue);
    background: rgba(74,144,217,.15);
    color: #6AABF0;
  }
  
  /* Styles pour les inputs et selects */
  .agtm-input, .agtm-select, .agtm-textarea {
    width: 100%;
    padding: 10px 13px;
    border-radius: 8px;
    background: var(--input-bg);
    border: 1.5px solid var(--agtm-border);
    color: var(--agtm-white);
    font-size: .85rem;
    outline: none;
    box-sizing: border-box;
    transition: border-color .15s;
  }
  
  .agtm-input:focus, .agtm-select:focus, .agtm-textarea:focus {
    border-color: var(--agtm-gold);
  }
  
  .agtm-label {
    display: block;
    font-size: .68rem;
    font-weight: 700;
    color: var(--premium-text-3);
    text-transform: uppercase;
    letter-spacing: .07em;
    margin-bottom: 6px;
  }
  
  /* Tableaux */
  .agtm-table {
    width: 100%;
    border-collapse: collapse;
    font-size: .82rem;
  }
  
  .agtm-table th {
    background: var(--card-hd);
    color: var(--agtm-gold-lt);
    font-weight: 700;
    text-transform: uppercase;
    font-size: .72rem;
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--agtm-border);
  }
  
  .agtm-table td {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    color: var(--premium-text-3);
  }
  
  .agtm-table tr:hover {
    background: rgba(255,255,255,0.03);
  }
  
  /* Badges de statut */
  .badge-statut {
    padding: 3px 10px;
    border-radius: 12px;
    font-size: .7rem;
    font-weight: 700;
    display: inline-block;
  }
  
  .badge-actif { background: rgba(74,224,144,0.15); color: #4AE090; border: 1px solid rgba(74,224,144,0.3); }
  .badge-inactif { background: rgba(224,74,74,0.15); color: #E04A4A; border: 1px solid rgba(224,74,74,0.3); }
  .badge-attente { background: rgba(232,184,75,0.15); color: #E8B84B; border: 1px solid rgba(232,184,75,0.3); }
  
  /* Badges RBAC pour formateurs */
  .badge-formateur { background: rgba(42,111,212,0.15); color: var(--premium-sapphire-lt); border: 1px solid rgba(42,111,212,0.3); }
  .badge-etudiant { background: rgba(34,197,94,0.12); color: #22C55E; border: 1px solid rgba(34,197,94,0.25); }
  
  /* Squelettes de chargement */
  .agtm-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
"@

# Sauvegarder avec encodage UTF8
$outputContent | Out-File -FilePath $OutputFile -Encoding UTF8 -Force

Write-Host "`n✅ LOT 2 TRANSFORMÉ AVEC SUCCÈS !" -ForegroundColor Green
Write-Host "Fichier généré: $OutputFile" -ForegroundColor Cyan
Write-Host "Taille: $($outputContent.Length) caractères" -ForegroundColor Cyan

Write-Host "`nRécapitulatif des modules transformés:" -ForegroundColor Yellow
@(
    @("Module 10: Formateur identity card", $formateurTransformed),
    @("Module 11: PLANIFIER UNE SÉANCE", $planifierTransformed),
    @("Module 12: MES CLASSES & ÉTUDIANTS", $classesTransformed),
    @("Module 13: English Corner", $englishTransformed),
    @("Module 14: Rapports pédagogiques", $rapportsTransformed)
) | ForEach-Object {
    $name, $module = $_
    $status = if ($module) { "✓ PRÉSENT" } else { "✗ ABSENT" }
    Write-Host "  $name: $status" -ForegroundColor $(if ($module) { "Green" } else { "Red" })
}

Write-Host "`n🎯 Le Lot 2 est prêt pour l'intégration dans dashboard.html !" -ForegroundColor Magenta