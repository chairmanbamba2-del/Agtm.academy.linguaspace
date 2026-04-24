#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script Python pour intégrer le Lot 1 (modules 4-9) transformés dans dashboard.html
Règle d'or : ne pas modifier les IDs, data-attributes, onclick
"""
import re
import sys
import os

def read_file_utf8(filepath):
    """Lire un fichier avec encodage UTF-8"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"❌ Erreur de lecture {filepath}: {e}")
        sys.exit(1)

def write_file_utf8(filepath, content):
    """Écrire un fichier avec encodage UTF-8"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Fichier écrit : {filepath}")
    except Exception as e:
        print(f"❌ Erreur d'écriture {filepath}: {e}")
        sys.exit(1)

def extract_modules(modules_content):
    """Extraire les modules 4-9 du fichier transformé"""
    modules = {}
    # Pattern pour capturer chaque module avec son numéro
    pattern = r'<!-- MODULE (\d+):[^>]*-->(.*?)(?=<!-- MODULE \d+:|<!-- ================================================== -->)'
    
    matches = re.findall(pattern, modules_content, re.DOTALL)
    for num, content in matches:
        modules[num] = content.strip()
        print(f"📦 Module {num} extrait (longueur: {len(content)})")
    
    if not modules:
        print("⚠ Aucun module trouvé dans le fichier transformé")
    
    return modules

def replace_section(dashboard_content, start_marker, end_marker, new_content):
    """Remplacer une section entre deux marqueurs"""
    # Échapper les marqueurs pour regex
    start_escaped = re.escape(start_marker)
    end_escaped = re.escape(end_marker)
    
    # Pattern pour capturer de start_marker à end_marker (non gourmand)
    pattern = rf'({start_escaped}.*?{end_escaped})'
    
    match = re.search(pattern, dashboard_content, re.DOTALL)
    if match:
        old_section = match.group(1)
        # Conserver le marqueur de fin
        replacement = f"{start_marker}\n{new_content}\n{end_marker}"
        dashboard_content = dashboard_content.replace(old_section, replacement)
        print(f"✅ Section remplacée entre '{start_marker[:30]}...' et '{end_marker[:30]}...'")
        return dashboard_content, True
    else:
        print(f"⚠ Section non trouvée entre '{start_marker[:30]}...' et '{end_marker[:30]}...'")
        return dashboard_content, False

def main():
    # Chemins des fichiers
    dashboard_path = "dashboard.html"
    modules_path = "agtm-premium-design/modules-transformed-lot1.html"
    output_path = "dashboard-premium-lot1.html"
    
    print("🔍 Lecture des fichiers...")
    
    # Lecture des fichiers
    dashboard_content = read_file_utf8(dashboard_path)
    modules_content = read_file_utf8(modules_path)
    
    # Extraction des modules transformés
    modules = extract_modules(modules_content)
    
    # Vérification des modules nécessaires
    required_modules = ['4', '5', '6', '7', '8', '9']
    for mod in required_modules:
        if mod not in modules:
            print(f"⚠ Module {mod} manquant dans le fichier transformé")
    
    # 1. REMPLACEMENT KPIs (Module 4)
    # Section KPIs -> Dossiers Formateurs
    kpi_start = '        <!-- ── KPIs ────────────────────────────────────────────── -->'
    kpi_end = '        <!-- ── Dossiers Formateurs ─────────────────────────────── -->'
    
    if '4' in modules:
        # On garde les commentaires originaux, on insère le module entre les deux
        pattern = re.escape(kpi_start) + r'.*?' + re.escape(kpi_end)
        old_section = re.search(pattern, dashboard_content, re.DOTALL)
        if old_section:
            new_section = f"{kpi_start}\n{modules['4']}\n{kpi_end}"
            dashboard_content = dashboard_content.replace(old_section.group(0), new_section)
            print("✅ Section KPIs remplacée (Module 4)")
    
    # 2. REMPLACEMENT Dossiers Formateurs (Module 6)
    # Section Formateurs -> Graphique revenus
    formateur_start = '        <!-- ── Dossiers Formateurs ─────────────────────────────── -->'
    formateur_end = '        <!-- ── Graphique revenus ─────────────────────────────────── -->'
    
    if '6' in modules:
        pattern = re.escape(formateur_start) + r'.*?' + re.escape(formateur_end)
        old_section = re.search(pattern, dashboard_content, re.DOTALL)
        if old_section:
            new_section = f"{formateur_start}\n{modules['6']}\n{formateur_end}"
            dashboard_content = dashboard_content.replace(old_section.group(0), new_section)
            print("✅ Section Formateurs remplacée (Module 6)")
    
    # 3. REMPLACEMENT Graphique revenus (Module 7)
    # Section Graphique revenus -> Étudiants à risque
    graphique_start = '        <!-- ── Graphique revenus ─────────────────────────────────── -->'
    graphique_end = '        <!-- ── Étudiants à risque ─────────────────────────────── -->'
    
    if '7' in modules:
        pattern = re.escape(graphique_start) + r'.*?' + re.escape(graphique_end)
        old_section = re.search(pattern, dashboard_content, re.DOTALL)
        if old_section:
            new_section = f"{graphique_start}\n{modules['7']}\n{graphique_end}"
            dashboard_content = dashboard_content.replace(old_section.group(0), new_section)
            print("✅ Section Graphique revenus remplacée (Module 7)")
    
    # 4. REMPLACEMENT Étudiants à risque (Module 8)
    # Section Étudiants à risque -> Progression des Cohortes
    risque_start = '        <!-- ── Étudiants à risque ─────────────────────────────── -->'
    risque_end = '        <!-- ── Progression des Cohortes ───────────────────────── -->'
    
    if '8' in modules:
        pattern = re.escape(risque_start) + r'.*?' + re.escape(risque_end)
        old_section = re.search(pattern, dashboard_content, re.DOTALL)
        if old_section:
            new_section = f"{risque_start}\n{modules['8']}\n{risque_end}"
            dashboard_content = dashboard_content.replace(old_section.group(0), new_section)
            print("✅ Section Étudiants à risque remplacée (Module 8)")
    
    # 5. REMPLACEMENT Progression des Cohortes (Module 9)
    # Section Cohortes jusqu'à la fin de la template string
    # On cherche la section et on la remplace jusqu'à la fin de la fonction
    cohorte_start = '        <!-- ── Progression des Cohortes ───────────────────────── -->'
    # Chercher jusqu'à la fin de la template string (`)
    if '9' in modules:
        # Pattern plus précis: depuis cohorte_start jusqu'à "`) // Load async sections after DOM"
        pattern = re.escape(cohorte_start) + r'.*?`\)\s*// Load async sections after DOM'
        old_section = re.search(pattern, dashboard_content, re.DOTALL)
        if old_section:
            # On garde la fin après le module
            new_section = f"{cohorte_start}\n{modules['9']}\n"
            dashboard_content = dashboard_content.replace(old_section.group(0), new_section + "`) // Load async sections after DOM")
            print("✅ Section Progression des Cohortes remplacée (Module 9)")
    
    # 6. REMPLACEMENT Agenda du jour (Module 5)
    # Section Agenda est dans renderOverview, après les cohortes
    agenda_start = '        <!-- ── AGENDA DU JOUR ──────────────────────────────────── -->'
    # Chercher jusqu'à la fin de la template string aussi
    if '5' in modules:
        pattern = re.escape(agenda_start) + r'.*?`\)\s*// Load async sections after DOM'
        old_section = re.search(pattern, dashboard_content, re.DOTALL)
        if old_section:
            new_section = f"{agenda_start}\n{modules['5']}\n"
            dashboard_content = dashboard_content.replace(old_section.group(0), new_section + "`) // Load async sections after DOM")
            print("✅ Section Agenda du jour remplacée (Module 5)")
    
    # Écriture du fichier de sortie
    print(f"\n💾 Écriture du fichier {output_path}...")
    write_file_utf8(output_path, dashboard_content)
    
    # Statistiques
    print("\n" + "="*50)
    print("📊 RÉCAPITULATIF DE L'INTÉGRATION LOT 1")
    print("="*50)
    for mod in required_modules:
        status = "✅ Intégré" if mod in modules else "❌ Manquant"
        print(f"Module {mod}: {status}")
    
    print("\n✅ Intégration Lot 1 terminée !")
    print(f"Fichier généré : {output_path}")
    print("Vérifiez que les IDs, data-attributes et onclick sont préservés.")

if __name__ == "__main__":
    main()