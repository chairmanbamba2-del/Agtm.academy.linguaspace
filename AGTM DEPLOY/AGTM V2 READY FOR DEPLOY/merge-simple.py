#!/usr/bin/env python3
"""
Script ultra-simple pour merger le Lot 2
Sans emojis, sans encodage problématique
"""

import os
import sys

def main():
    print("=== MERGE SIMPLE DU LOT 2 ===")
    print("Version minimale Python")
    print()
    
    # Chemins des fichiers
    source_file = "dashboard-premium-lot1.html"
    lot2_file = "agtm-premium-design/modules-transformed-lot2.html"
    output_file = "dashboard-premium-lot2-final.html"
    
    # Vérifier l'existence des fichiers
    if not os.path.exists(source_file):
        print(f"ERREUR: Fichier source introuvable: {source_file}")
        return 1
        
    if not os.path.exists(lot2_file):
        print(f"ERREUR: Fichier Lot 2 introuvable: {lot2_file}")
        return 1
    
    # Lecture des fichiers
    print("Lecture des fichiers...")
    try:
        with open(source_file, 'r', encoding='utf-8') as f:
            source_content = f.read()
        with open(lot2_file, 'r', encoding='utf-8') as f:
            lot2_content = f.read()
    except Exception as e:
        print(f"ERREUR lecture fichier: {e}")
        return 1
    
    print(f"Source: {len(source_content)} caracteres")
    print(f"Lot 2: {len(lot2_content)} caracteres")
    print()
    
    # Extraction du Module 11 (PLANIFIER UNE SÉANCE) du Lot 2
    print("Extraction du Module 11 (PLANIFIER UNE SÉANCE)...")
    
    module11_start = lot2_content.find("<!-- MODULE 11:")
    if module11_start == -1:
        print("ERREUR: Module 11 non trouve dans le Lot 2")
        return 1
    
    module12_start = lot2_content.find("<!-- MODULE 12:", module11_start)
    if module12_start == -1:
        module12_start = len(lot2_content)
    
    module11_content = lot2_content[module11_start:module12_start].strip()
    print(f"Module 11 extrait: {len(module11_content)} caracteres")
    print()
    
    # Recherche de la section à remplacer dans le source
    print("Recherche de la section à remplacer dans le source...")
    
    # Chercher "planBtnGroupe" comme point de repère
    marker_pos = source_content.find('id="planBtnGroupe"')
    if marker_pos == -1:
        print("AVERTISSEMENT: Marqueur 'planBtnGroupe' non trouve")
        # Chercher "planSubmit()" comme alternative
        marker_pos = source_content.find("planSubmit()")
        if marker_pos == -1:
            print("ERREUR: Aucun marqueur trouve pour le Module 11")
            return 1
        print("Marqueur alternatif trouve: 'planSubmit()'")
    else:
        print("Marqueur trouve: 'planBtnGroupe'")
    
    # Trouver le début de la section (remonter au commentaire précédent)
    section_start = source_content.rfind("<!--", 0, marker_pos)
    if section_start == -1:
        section_start = marker_pos - 500  # Approximatif
        if section_start < 0:
            section_start = 0
        print("Debut de section approximatif (pas de commentaire trouve)")
    else:
        print(f"Debut de section trouve à la position {section_start}")
    
    # Trouver la fin de la section (prochain commentaire majeur)
    section_end = source_content.find("<!-- MODULE 12:", section_start)
    if section_end == -1:
        section_end = source_content.find("<!-- MODULE 13:", section_start)
    if section_end == -1:
        section_end = source_content.find("<!--", section_start + 100)
    if section_end == -1:
        section_end = len(source_content)
        print("Fin de section definie comme fin du fichier")
    else:
        print(f"Fin de section trouvee à la position {section_end}")
    
    print(f"Section identifiee: positions {section_start}-{section_end}")
    print(f"Longueur de la section actuelle: {section_end - section_start} caracteres")
    print()
    
    # Remplacer la section
    print("Remplacement de la section...")
    
    # Créer le nouveau contenu
    result = (
        source_content[:section_start] + 
        module11_content + 
        source_content[section_end:]
    )
    
    # Ajouter un en-tête
    print("Ajout de l'en-tête...")
    
    header = """<!-- ================================================== -->
<!-- DASHBOARD PREMIUM LOT 2 FINAL - MERGE PYTHON -->
<!-- Merge exécuté le 22/04/2026 -->
<!-- Module 11 transformé avec style "Elite Academy" -->
<!-- Edge Function IA prête: /supabase/functions/generate-module-content/ -->
<!-- ================================================== -->

"""
    
    result = header + result
    
    # Écrire le fichier de sortie
    print(f"Ecriture du fichier {output_file}...")
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(result)
        print(f"Fichier cree avec succes!")
        print(f"Taille finale: {len(result)} caracteres")
    except Exception as e:
        print(f"ERREUR lors de l'ecriture du fichier: {e}")
        return 1
    
    print()
    
    # Vérifications finales
    print("=== VERIFICATIONS FINALES ===")
    
    checks = {
        "agtm-card premium-card": "agtm-card premium-card" in result,
        "planBtnGroupe": "planBtnGroupe" in result,
        "planBtnIndiv": "planBtnIndiv" in result,
        "MODULE 11:": "MODULE 11:" in result,
        "planSubmit()": "planSubmit()" in result,
    }
    
    for check_name, check_result in checks.items():
        if check_result:
            print(f"OK: '{check_name}' present")
        else:
            print(f"ATTENTION: '{check_name}' absent")
    
    print()
    print("=== RESUME ===")
    print(f"Fichier genere: {output_file}")
    print(f"Module integre: Module 11 (PLANIFIER UNE SÉANCE)")
    print(f"Taille finale: {len(result)} caracteres")
    print(f"Difference: {len(result) - len(source_content)} caracteres")
    print()
    print("MERGE TERMINE AVEC SUCCES!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())