#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour extraire et transformer le Lot 2 (modules 10-14) de dashboard-premium-lot1.html
Modules : Formateur identity card, PLANIFIER UNE SÉANCE, MES CLASSES & ÉTUDIANTS, English Corner, Rapports pédagogiques
"""
import re
import sys

def read_file_utf8(filepath):
    """Lire un fichier avec encodage UTF-8"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Erreur de lecture {filepath}: {e}")
        sys.exit(1)

def extract_section(content, start_marker, end_marker=None, max_lines=None):
    """Extraire une section entre deux marqueurs"""
    start_idx = content.find(start_marker)
    if start_idx == -1:
        print(f"Marqueur de début non trouvé: {start_marker[:50]}...")
        return None
    
    if end_marker:
        end_idx = content.find(end_marker, start_idx + len(start_marker))
        if end_idx == -1:
            print(f"Marqueur de fin non trouvé: {end_marker[:50]}...")
            # Prendre jusqu'à la fin du fichier
            section = content[start_idx:]
        else:
            section = content[start_idx:end_idx + len(end_marker)]
    else:
        # Si pas de marqueur de fin, prendre un certain nombre de lignes
        lines = content[start_idx:].split('\n')
        if max_lines:
            section = '\n'.join(lines[:max_lines])
        else:
            section = content[start_idx:]
    
    return section

def transform_formateur_identity(section):
    """Transformer la carte d'identité formateur en style premium"""
    # Remplacer le div externe par .agtm-card.premium-card
    transformed = re.sub(
        r'<div style="padding:14px 20px;border-radius:12px;border:1px solid #4A90D9;background:linear-gradient\(135deg,#0E1E34,#1A1408\);margin-bottom:18px;display:flex;align-items:center;gap:16px">',
        '<div class="agtm-card premium-card" style="margin-bottom: 1.5rem;">\n  <div class="premium-card-body" style="padding: 1.5rem; display: flex; align-items: center; gap: 16px;">',
        section
    )
    
    # Ajouter un header
    transformed = transformed.replace(
        '<!-- Formateur identity card -->',
        '<!-- MODULE 10: FORMATEUR IDENTITY CARD (TRANSFORMÉ) -->\n<div class="agtm-card premium-card" style="margin-bottom: 1.5rem;">\n  <div class="premium-card-header">\n    <div>\n      <div class="premium-card-title">👨‍🏫 Profil Formateur</div>\n      <div class="premium-card-subtitle">Vos informations et statistiques</div>\n    </div>\n  </div>\n  <div class="premium-card-body" style="padding: 1.5rem; display: flex; align-items: center; gap: 16px;">'
    )
    
    # Fermer les divs correctement
    transformed = transformed.replace('</div>', '</div>\n  </div>\n</div>', 1)
    
    return transformed

def transform_planifier_seance(section):
    """Transformer la section PLANIFIER UNE SÉANCE"""
    # Extraire le contenu à l'intérieur de ${wrap(` ... `)}
    match = re.search(r'\$\{wrap\(`(.*?)`\)\}', section, re.DOTALL)
    if not match:
        return section
    
    inner_content = match.group(1)
    
    # Transformer en carte premium
    transformed = f"""<!-- MODULE 11: PLANIFIER UNE SÉANCE (TRANSFORMÉ) -->
<div class="agtm-card premium-card" style="margin-bottom: 1.5rem;">
  <div class="premium-card-header">
    <div>
      <div class="premium-card-title">📅 Planifier une Séance</div>
      <div class="premium-card-subtitle">Créer une séance de groupe ou individuelle</div>
    </div>
  </div>
  
  <div class="premium-card-body">
{inner_content}
  </div>
  
  <div class="premium-card-footer">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-top: 1px solid var(--agtm-border);">
      <div style="font-size: .75rem; color: var(--premium-text-3);">
        ⚠️ Vérifiez les conflits avant de créer la séance
      </div>
      <button onclick="planSubmit()" class="agtm-btn agtm-btn-primary">🚀 Créer la séance</button>
    </div>
  </div>
</div>"""
    
    return transformed

def transform_classes_etudiants(section):
    """Transformer la section MES CLASSES & ÉTUDIANTS"""
    # Remplacer le style inline par des classes
    transformed = re.sub(
        r'<div style="font-weight:800;color:#C8960C;font-size:.92rem;margin:22px 0 14px">🏫 Mes Classes & Étudiants Inscrits</div>',
        '<div class="premium-card-title" style="margin-bottom: 1rem;">🏫 Mes Classes & Étudiants Inscrits</div>',
        section
    )
    
    # Encapsuler dans une carte premium
    transformed = f"""<!-- MODULE 12: MES CLASSES & ÉTUDIANTS (TRANSFORMÉ) -->
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
{transformed}
  </div>
</div>"""
    
    return transformed

def transform_english_corner(section):
    """Transformer la section English Corner"""
    # Trouver la section English Corner (simple transformation pour l'instant)
    transformed = f"""<!-- MODULE 13: ENGLISH CORNER - ÉVALUATIONS (TRANSFORMÉ) -->
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
    <!-- Le contenu English Corner sera inséré ici dynamiquement -->
    <div id="evalQContainer" style="min-height: 300px;">
      <div class="agtm-skeleton" style="height: 50px; margin-bottom: 8px; border-radius: 10px;"></div>
      <div class="agtm-skeleton" style="height: 50px; margin-bottom: 8px; border-radius: 10px;"></div>
      <div class="agtm-skeleton" style="height: 50px; margin-bottom: 8px; border-radius: 10px;"></div>
    </div>
    <p id="evErr" style="color: var(--agtm-danger); font-size: .82rem; min-height: 18px; margin-top: 1rem;"></p>
  </div>
  
  <div class="premium-card-footer">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem;">
      <div style="font-size: .75rem; color: var(--premium-text-3);">
        Timer: <span id="_apEvalTimer">00:00</span> | Score: <span id="_apEvalScore">0</span>
      </div>
      <button id="_certBtn" onclick="window._apPrintCert()" class="agtm-btn agtm-btn-primary" style="display: none;">🎓 Générer Certificat</button>
    </div>
  </div>
</div>"""
    
    return transformed

def transform_rapports_pedagogiques(section):
    """Transformer la section Rapports pédagogiques"""
    # Remplacer le div externe
    transformed = re.sub(
        r'<div style="background:#152233;border:1px solid #4A90D9;border-radius:12px;overflow:hidden;margin-bottom:22px">',
        '<div class="agtm-card premium-card" style="margin-bottom: 1.5rem;">\n  <div class="premium-card-header">\n    <div>\n      <div class="premium-card-title">📝 Rapports Pédagogiques</div>\n      <div class="premium-card-subtitle">Suivi des séances et honoraires</div>\n    </div>\n  </div>\n  <div class="premium-card-body" style="padding: 0;">',
        section
    )
    
    # Ajouter le marqueur de module
    transformed = f"""<!-- MODULE 14: RAPPORTS PÉDAGOGIQUES (TRANSFORMÉ) -->
{transformed}"""
    
    return transformed

def main():
    # Lecture du fichier
    input_file = "dashboard-premium-lot1.html"
    print(f"Lecture de {input_file}...")
    content = read_file_utf8(input_file)
    
    # 1. Formateur identity card (ligne 2704)
    print("\n1. Extraction du Module 10: Formateur identity card...")
    formateur_section = extract_section(content, "<!-- Formateur identity card -->", "<!-- KPIs -->")
    if formateur_section:
        formateur_transformed = transform_formateur_identity(formateur_section)
        print(f"   ✓ Module 10 transformé ({len(formateur_transformed)} caractères)")
    else:
        print("   ✗ Module 10 non trouvé")
        formateur_transformed = None
    
    # 2. PLANIFIER UNE SÉANCE (ligne 2722)
    print("\n2. Extraction du Module 11: PLANIFIER UNE SÉANCE...")
    planifier_section = extract_section(content, "<!-- ════ PLANIFIER UNE SÉANCE ════ -->", "<!-- ════ MES CLASSES & ÉTUDIANTS ════ -->")
    if planifier_section:
        planifier_transformed = transform_planifier_seance(planifier_section)
        print(f"   ✓ Module 11 transformé ({len(planifier_transformed)} caractères)")
    else:
        print("   ✗ Module 11 non trouvé")
        planifier_transformed = None
    
    # 3. MES CLASSES & ÉTUDIANTS (ligne 2874)
    print("\n3. Extraction du Module 12: MES CLASSES & ÉTUDIANTS...")
    classes_section = extract_section(content, "<!-- ════ MES CLASSES & ÉTUDIANTS ════ -->", "<!-- ── Rapports de séances", 100)
    if classes_section:
        classes_transformed = transform_classes_etudiants(classes_section)
        print(f"   ✓ Module 12 transformé ({len(classes_transformed)} caractères)")
    else:
        print("   ✗ Module 12 non trouvé")
        classes_transformed = None
    
    # 4. English Corner (ligne 515) - besoin de plus de contexte
    print("\n4. Extraction du Module 13: English Corner...")
    english_section = extract_section(content, "English Corner", "<!--", 50)
    if english_section:
        english_transformed = transform_english_corner(english_section)
        print(f"   ✓ Module 13 transformé ({len(english_transformed)} caractères)")
    else:
        print("   ✗ Module 13 non trouvé")
        english_transformed = None
    
    # 5. Rapports pédagogiques (ligne 8673)
    print("\n5. Extraction du Module 14: Rapports pédagogiques...")
    rapports_section = extract_section(content, "<!-- ── Rapports de séances (formateurs) + honoraires ── -->", "<!--", 200)
    if rapports_section:
        rapports_transformed = transform_rapports_pedagogiques(rapports_section)
        print(f"   ✓ Module 14 transformé ({len(rapports_transformed)} caractères)")
    else:
        print("   ✗ Module 14 non trouvé")
        rapports_transformed = None
    
    # Écrire le résultat dans un fichier
    output_file = "agtm-premium-design/modules-transformed-lot2.html"
    print(f"\nÉcriture du résultat dans {output_file}...")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("<!-- ================================================== -->\n")
        f.write("<!-- LOT 2 TRANSFORMÉ - MODULES 10-14 (CŒUR PÉDAGOGIQUE) -->\n")
        f.write("<!-- ================================================== -->\n\n")
        
        if formateur_transformed:
            f.write(formateur_transformed)
            f.write("\n\n")
        
        if planifier_transformed:
            f.write(planifier_transformed)
            f.write("\n\n")
        
        if classes_transformed:
            f.write(classes_transformed)
            f.write("\n\n")
        
        if english_transformed:
            f.write(english_transformed)
            f.write("\n\n")
        
        if rapports_transformed:
            f.write(rapports_transformed)
            f.write("\n\n")
        
        # Ajouter les styles CSS nécessaires
        f.write("""
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
</style>
""")
    
    print(f"\n✅ Lot 2 transformé avec succès !")
    print(f"Fichier généré : {output_file}")
    print("\nRécapitulatif :")
    modules = [
        ("Module 10: Formateur identity card", formateur_transformed),
        ("Module 11: PLANIFIER UNE SÉANCE", planifier_transformed),
        ("Module 12: MES CLASSES & ÉTUDIANTS", classes_transformed),
        ("Module 13: English Corner", english_transformed),
        ("Module 14: Rapports pédagogiques", rapports_transformed),
    ]
    
    for name, module in modules:
        status = "✓ PRÉSENT" if module else "✗ ABSENT"
        print(f"  {name}: {status}")

if __name__ == "__main__":
    main()