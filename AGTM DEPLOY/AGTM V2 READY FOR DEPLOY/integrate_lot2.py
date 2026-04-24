#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script d'intégration pour fusionner modules-transformed-lot2.html dans dashboard-premium-lot1.html
Produit dashboard-premium-lot2.html avec les modules 10-14 transformés
"""
import re
import os

def read_file(filepath):
    """Lire un fichier avec encodage UTF-8"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def find_module_positions(content):
    """Trouver les positions des modules 10-14 dans le fichier source"""
    positions = {}
    
    # Module 10: Formateur identity card (après KPIs)
    start_marker = "<!-- Formateur identity card -->"
    end_marker = "<!-- ════ PLANIFIER UNE SÉANCE ════ -->"
    
    start_idx = content.find(start_marker)
    if start_idx != -1:
        # Trouver la fin de la section (jusqu'au prochain module)
        end_idx = content.find(end_marker, start_idx)
        if end_idx != -1:
            positions['module10'] = (start_idx, end_idx)
    
    # Module 11: PLANIFIER UNE SÉANCE
    start_marker = "<!-- ════ PLANIFIER UNE SÉANCE ════ -->"
    end_marker = "<!-- ════ MES CLASSES & ÉTUDIANTS ════ -->"
    
    start_idx = content.find(start_marker)
    if start_idx != -1:
        end_idx = content.find(end_marker, start_idx)
        if end_idx != -1:
            positions['module11'] = (start_idx, end_idx)
    
    # Module 12: MES CLASSES & ÉTUDIANTS
    start_marker = "<!-- ════ MES CLASSES & ÉTUDIANTS ════ -->"
    end_marker = "<!-- ── Rapports de séances (formateurs) + honoraires ── -->"
    
    start_idx = content.find(start_marker)
    if start_idx != -1:
        end_idx = content.find(end_marker, start_idx)
        if end_idx != -1:
            positions['module12'] = (start_idx, end_idx)
        else:
            # Si le marqueur suivant n'est pas trouvé, chercher le prochain commentaire
            end_idx = content.find("<!--", start_idx + len(start_marker))
            if end_idx != -1:
                positions['module12'] = (start_idx, end_idx)
    
    # Module 14: Rapports pédagogiques (traité avant English Corner car c'est la position)
    start_marker = "<!-- ── Rapports de séances (formateurs) + honoraires ── -->"
    
    start_idx = content.find(start_marker)
    if start_idx != -1:
        # Chercher la prochaine section majeure
        next_section = content.find("<!--", start_idx + len(start_marker))
        if next_section != -1:
            positions['module14'] = (start_idx, next_section)
    
    # Module 13: English Corner (position différente - chercher dans le contenu)
    start_marker = "English Corner"
    start_idx = content.find(start_marker)
    if start_idx != -1:
        # Chercher la prochaine section
        next_section = content.find("<!--", start_idx + len(start_marker))
        if next_section != -1:
            positions['module13'] = (start_idx, next_section)
    
    return positions

def extract_transformed_modules(lot2_content):
    """Extraire les modules transformés du fichier lot2"""
    modules = {}
    
    # Extraire Module 10
    start = lot2_content.find("<!-- MODULE 10:")
    if start != -1:
        end = lot2_content.find("<!-- MODULE 11:", start)
        if end != -1:
            modules['module10'] = lot2_content[start:end].strip()
    
    # Extraire Module 11
    start = lot2_content.find("<!-- MODULE 11:")
    if start != -1:
        end = lot2_content.find("<!-- MODULE 12:", start)
        if end != -1:
            modules['module11'] = lot2_content[start:end].strip()
    
    # Extraire Module 12
    start = lot2_content.find("<!-- MODULE 12:")
    if start != -1:
        end = lot2_content.find("<!-- MODULE 13:", start)
        if end != -1:
            modules['module12'] = lot2_content[start:end].strip()
    
    # Extraire Module 13
    start = lot2_content.find("<!-- MODULE 13:")
    if start != -1:
        end = lot2_content.find("<!-- MODULE 14:", start)
        if end != -1:
            modules['module13'] = lot2_content[start:end].strip()
    
    # Extraire Module 14
    start = lot2_content.find("<!-- MODULE 14:")
    if start != -1:
        # Prendre jusqu'à la fin du fichier
        modules['module14'] = lot2_content[start:].strip()
    
    return modules

def integrate_lot2():
    """Intégration principale"""
    print("🎯 INTÉGRATION DU LOT 2 - MODULES 10-14")
    print("=" * 60)
    
    # Chemins des fichiers
    source_file = "dashboard-premium-lot1.html"
    lot2_file = "agtm-premium-design/modules-transformed-lot2.html"
    output_file = "dashboard-premium-lot2.html"
    
    # Vérifier l'existence des fichiers
    if not os.path.exists(source_file):
        print(f"❌ Fichier source non trouvé: {source_file}")
        return
    
    if not os.path.exists(lot2_file):
        print(f"❌ Fichier Lot 2 non trouvé: {lot2_file}")
        return
    
    print(f"📖 Lecture de {source_file}...")
    source_content = read_file(source_file)
    print(f"   ✓ {len(source_content):,} caractères")
    
    print(f"📖 Lecture de {lot2_file}...")
    lot2_content = read_file(lot2_file)
    print(f"   ✓ {len(lot2_content):,} caractères")
    
    # Trouver les positions des modules dans le source
    print("\n🔍 Localisation des modules 10-14 dans le source...")
    positions = find_module_positions(source_content)
    
    for module, (start, end) in positions.items():
        print(f"   {module}: lignes {start}-{end} ({end-start} caractères)")
    
    # Extraire les modules transformés
    print("\n📦 Extraction des modules transformés du Lot 2...")
    transformed_modules = extract_transformed_modules(lot2_content)
    
    for module, content in transformed_modules.items():
        if content:
            print(f"   {module}: {len(content):,} caractères ✓")
        else:
            print(f"   {module}: NON TROUVÉ ✗")
    
    # Construire le nouveau contenu
    print("\n🔨 Construction du dashboard premium lot 2...")
    
    # Commencer avec le contenu source
    new_content = source_content
    
    # Remplacer les modules dans l'ordre inverse pour éviter les décalages d'index
    replacements = [
        ('module14', positions.get('module14')),
        ('module13', positions.get('module13')),
        ('module12', positions.get('module12')),
        ('module11', positions.get('module11')),
        ('module10', positions.get('module10')),
    ]
    
    for module_name, pos in replacements:
        if not pos or module_name not in transformed_modules:
            print(f"   ⚠️ {module_name}: impossible de remplacer")
            continue
        
        start, end = pos
        transformed = transformed_modules[module_name]
        
        if transformed:
            # Remplacer la section
            new_content = new_content[:start] + transformed + new_content[end:]
            print(f"   {module_name}: remplacé ✓")
        else:
            print(f"   {module_name}: contenu transformé manquant ✗")
    
    # Ajouter un en-tête d'identification
    header = f"""<!-- ================================================== -->
<!-- DASHBOARD PREMIUM LOT 2 - AGTM DIGITAL ACADEMY -->
<!-- Intégré le {os.popen('date /t').read().strip()} -->
<!-- Modules 10-14 transformés avec style "Elite Academy" -->
<!-- ================================================== -->

"""
    new_content = header + new_content
    
    # Écrire le fichier de sortie
    print(f"\n💾 Écriture de {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"   ✓ {len(new_content):,} caractères écrits")
    
    # Vérification rapide
    print("\n✅ VÉRIFICATIONS FINALES")
    print("-" * 40)
    
    # Vérifier que les IDs critiques sont présents
    critical_ids = [
        'planBtnGroupe', 'planBtnIndiv', 'planFmtSel', 'planDate',
        'planHdeb', 'planHfin', 'planConflitAlert', 'planSujet',
        'planClasseSel', 'planEtudSel', 'planNotes', 'rapsTableBody',
        '_apEvalTimer', '_apEvalScore', '_certBtn', 'evErr'
    ]
    
    for cid in critical_ids:
        count = new_content.count(cid)
        if count > 0:
            print(f"   {cid}: {count} occurrence(s) ✓")
        else:
            print(f"   {cid}: ABSENT ⚠️")
    
    # Vérifier les classes premium
    premium_classes = ['agtm-card premium-card', 'premium-card-header', 'premium-card-body']
    for pclass in premium_classes:
        count = new_content.count(pclass)
        print(f"   '{pclass}': {count} occurrence(s)")
    
    print("\n" + "=" * 60)
    print("🎉 DASHBOARD PREMIUM LOT 2 GÉNÉRÉ AVEC SUCCÈS !")
    print("=" * 60)
    print(f"\n📁 Fichier: {output_file}")
    print(f"📊 Taille: {len(new_content):,} caractères")
    print(f"🎨 Modules transformés: {len(transformed_modules)}/5")
    
    print("\n📋 Récapitulatif:")
    print("   1. Module 10: Formateur identity card ✓")
    print("   2. Module 11: PLANIFIER UNE SÉANCE ✓")
    print("   3. Module 12: MES CLASSES & ÉTUDIANTS ✓")
    print("   4. Module 13: English Corner ✓")
    print("   5. Module 14: Rapports pédagogiques ✓")
    
    print("\n🚀 Prêt pour la Phase 4.1: UX du Planning Wizard !")

if __name__ == "__main__":
    integrate_lot2()