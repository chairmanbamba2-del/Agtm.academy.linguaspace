#!/usr/bin/env python3
"""
Script final pour merger le Lot 2 dans dashboard-premium-lot1.html
Version Python robuste avec gestion d'encodage UTF-8
"""

import os
import sys
from datetime import datetime

def read_file_utf8(filepath):
    """Lire un fichier avec encodage UTF-8"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"❌ Erreur lecture {filepath}: {e}")
        return None

def write_file_utf8(filepath, content):
    """Écrire un fichier avec encodage UTF-8"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"❌ Erreur écriture {filepath}: {e}")
        return False

def main():
    print("=== MERGE FINAL DU LOT 2 ===")
    print("Version Python - Encodage UTF-8 garanti")
    print()
    
    # Chemins des fichiers
    source_file = "dashboard-premium-lot1.html"
    lot2_file = "agtm-premium-design/modules-transformed-lot2.html"
    output_file = "dashboard-premium-lot2-final.html"
    
    # Vérifier l'existence des fichiers
    if not os.path.exists(source_file):
        print(f"❌ Fichier source introuvable: {source_file}")
        return 1
        
    if not os.path.exists(lot2_file):
        print(f"❌ Fichier Lot 2 introuvable: {lot2_file}")
        return 1
    
    # Lecture des fichiers
    print("📖 Lecture des fichiers...")
    source_content = read_file_utf8(source_file)
    lot2_content = read_file_utf8(lot2_file)
    
    if source_content is None or lot2_content is None:
        return 1
    
    print(f"✅ Source: {len(source_content)} caractères")
    print(f"✅ Lot 2: {len(lot2_content)} caractères")
    print()
    
    # Extraction du Module 11 (PLANIFIER UNE SÉANCE) du Lot 2
    print("🔍 Extraction du Module 11 (PLANIFIER UNE SÉANCE)...")
    
    module11_start = lot2_content.find("<!-- MODULE 11:")
    if module11_start == -1:
        print("❌ Module 11 non trouvé dans le Lot 2")
        return 1
    
    module12_start = lot2_content.find("<!-- MODULE 12:", module11_start)
    if module12_start == -1:
        module12_start = len(lot2_content)
    
    module11_content = lot2_content[module11_start:module12_start].strip()
    print(f"✅ Module 11 extrait: {len(module11_content)} caractères")
    print()
    
    # Recherche de la section à remplacer dans le source
    print("🔍 Recherche de la section à remplacer dans le source...")
    
    # Chercher "planBtnGroupe" comme point de repère
    marker_pos = source_content.find('id="planBtnGroupe"')
    if marker_pos == -1:
        print("⚠ Marqueur 'planBtnGroupe' non trouvé")
        # Chercher "planSubmit()" comme alternative
        marker_pos = source_content.find("planSubmit()")
        if marker_pos == -1:
            print("❌ Aucun marqueur trouvé pour le Module 11")
            return 1
        print("✅ Marqueur alternatif trouvé: 'planSubmit()'")
    else:
        print("✅ Marqueur trouvé: 'planBtnGroupe'")
    
    # Trouver le début de la section (remonter au commentaire précédent)
    section_start = source_content.rfind("<!--", 0, marker_pos)
    if section_start == -1:
        section_start = marker_pos - 500  # Approximatif
        if section_start < 0:
            section_start = 0
        print("⚠ Début de section approximatif (pas de commentaire trouvé)")
    else:
        print(f"✅ Début de section trouvé à la position {section_start}")
    
    # Trouver la fin de la section (prochain commentaire majeur)
    section_end = source_content.find("<!-- MODULE 12:", section_start)
    if section_end == -1:
        section_end = source_content.find("<!-- MODULE 13:", section_start)
    if section_end == -1:
        section_end = source_content.find("<!--", section_start + 100)
    if section_end == -1:
        section_end = len(source_content)
        print("⚠ Fin de section définie comme fin du fichier")
    else:
        print(f"✅ Fin de section trouvée à la position {section_end}")
    
    print(f"📏 Section identifiée: positions {section_start}-{section_end}")
    print(f"   Longueur de la section actuelle: {section_end - section_start} caractères")
    print()
    
    # Remplacer la section
    print("🔄 Remplacement de la section...")
    
    # Créer le nouveau contenu
    result = (
        source_content[:section_start] + 
        module11_content + 
        source_content[section_end:]
    )
    
    # Ajouter un en-tête
    print("📝 Ajout de l'en-tête...")
    
    header = f"""<!-- ================================================== -->
<!-- DASHBOARD PREMIUM LOT 2 FINAL - MERGE PYTHON -->
<!-- Merge exécuté le {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} -->
<!-- Module 11 transformé avec style "Elite Academy" -->
<!-- Edge Function IA prête: /supabase/functions/generate-module-content/ -->
<!-- ================================================== -->

"""
    
    result = header + result
    
    # Écrire le fichier de sortie
    print(f"💾 Écriture du fichier {output_file}...")
    
    if write_file_utf8(output_file, result):
        print(f"✅ Fichier créé avec succès!")
        print(f"📏 Taille finale: {len(result)} caractères")
    else:
        print("❌ Erreur lors de l'écriture du fichier")
        return 1
    
    print()
    
    # Vérifications finales
    print("=== VÉRIFICATIONS FINALES ===")
    
    checks = {
        "agtm-card premium-card": "agtm-card premium-card" in result,
        "planBtnGroupe": "planBtnGroupe" in result,
        "planBtnIndiv": "planBtnIndiv" in result,
        "MODULE 11:": "MODULE 11:" in result,
        "planSubmit()": "planSubmit()" in result,
    }
    
    for check_name, check_result in checks.items():
        if check_result:
            print(f"✅ '{check_name}' présent")
        else:
            print(f"⚠ '{check_name}' absent")
    
    print()
    print("=== RÉSUMÉ ===")
    print(f"Fichier généré: {output_file}")
    print(f"Module intégré: Module 11 (PLANIFIER UNE SÉANCE)")
    print(f"Taille finale: {len(result)} caractères")
    print(f"Différence: {len(result) - len(source_content)} caractères")
    print()
    print("✅ MERGE TERMINÉ AVEC SUCCÈS!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())