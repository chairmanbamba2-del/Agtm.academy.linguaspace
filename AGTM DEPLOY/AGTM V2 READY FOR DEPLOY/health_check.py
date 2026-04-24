#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rapport de Sante Final - AGTM Digital Academy Premium"""
import re, os

content = open('dashboard-premium-lot2-final.html','rb').read().decode('utf-8','replace')

# IDs critiques
ids = [
    'etudBody', 'planSujet', 'rapsTableBody', 'fcCalendar', 'aiChatBox',
    'notifBtn', 'presSeance', 'feuilleContent', 'cmdPalette', 'chartOvw',
    'riskContainer', 'cohortContainer', 'agendaTodayDate', 'agendaTodayContainer',
    'agendaCount', 'rC', 'rsObj', 'rsObs', 'pfEtud', 'pfLignes', 'pfTotal',
    'plnE', '_echDate', 'aiMsgInput',
]

print("=== VERIFICATION IDs CRITIQUES ===")
ok_ids = 0
missing_ids = 0
for id_ in sorted(set(ids)):
    found = (f'id="{id_}"' in content) or (f"id='{id_}'" in content)
    status = "OK" if found else "ABSENT"
    if found: ok_ids += 1
    else: missing_ids += 1
    print(f"  {status}  #{id_}")

print(f"\nTotal: {ok_ids} presents, {missing_ids} absents")

# Scripts window._*
print()
print("=== SCRIPTS SUPABASE window._* ===")
funcs = re.findall(r'window\._(\w+)\s*=', content)
unique_funcs = sorted(set(funcs))
print(f"  {len(unique_funcs)} fonctions window._* definies")
for f in unique_funcs[:25]:
    print(f"  window._{f}")
if len(unique_funcs) > 25:
    print(f"  ... et {len(unique_funcs)-25} autres")

# Palette couleurs
print()
print("=== PALETTE COULEURS ===")
old_gold = content.count('#E8941A')
new_gold = content.count('#D4A017')
premium_gold = content.count('--premium-gold')
premium_card = content.count('premium-card')
print(f"  #E8941A (ancien or): {old_gold} occurrences")
print(f"  #D4A017 (nouveau or): {new_gold} occurrences")
print(f"  --premium-gold: {premium_gold} occurrences")
print(f"  .premium-card: {premium_card} occurrences")

# Modules par section
print()
print("=== MODULES DETECTES ===")
modules = [
    ("Module 1 - Etudiants", "etudBody"),
    ("Module 2 - Catalogue", "catalogueBody"),
    ("Module 3 - Finance Encaissements", "paiementsBody"),
    ("Module 4 - KPIs Admin", "kpiContainer"),
    ("Module 5 - Agenda du Jour", "agendaTodayContainer"),
    ("Module 6 - Formateurs", "formateursBody"),
    ("Module 7 - Graphique Revenus", "chartOvw"),
    ("Module 8 - Etudiants a risque", "riskContainer"),
    ("Module 9 - Cohortes", "cohortContainer"),
    ("Module 10 - Profil Formateur", "fmtNom"),
    ("Module 11 - Planifier Seance", "planSujet"),
    ("Module 12 - Classes & Etudiants", "classesBody"),
    ("Module 13 - English Corner", "ecModulesList"),
    ("Module 14 - Rapports Pedagogiques", "rapsTableBody"),
    ("Module 15 - Facturation Proforma", "pfEtud"),
    ("Module 16 - Echeancier", "plnE"),
    ("Module 17 - Depenses", "depBody"),
    ("Module 18 - Pointage", "presSeance"),
    ("Module 19 - Profil Etudiant", "etudProfilNom"),
    ("Module 20 - Catalogue Etudiant", "ecCatalogueBody"),
    ("Module 21 - Test Placement", "testPlacementBody"),
    ("Module 22 - Assistant IA", "aiChatBox"),
    ("Module 23 - Parametres IA", "aiParamsBody"),
    ("Module 24 - Marketing", "mktBody"),
    ("Module 25 - WhatsApp", "waBody"),
    ("Module 26 - Dashboard Etudiant", "etudDashBody"),
    ("Module 27 - Dashboard Investisseur", "invDashBody"),
    ("Module 28 - Dashboard Direction", "dirDashBody"),
    ("Module 29 - Certificats", "certBody"),
    ("Module 30 - Statistiques", "statsBody"),
    ("Module 31 - Utilisateurs", "usersBody"),
    ("Module 32 - Calendrier", "fcCalendar"),
    ("Module 33 - Parametres", "settingsBody"),
]

premium_count = 0
stable_count = 0
absent_count = 0

for name, id_ in modules:
    in_html = (f'id="{id_}"' in content) or (f"id='{id_}'" in content)
    # Verifier si c'est une premium-card
    is_premium = False
    if in_html:
        idx = content.find(f'id="{id_}"')
        if idx < 0:
            idx = content.find(f"id='{id_}'")
        # Chercher premium-card dans les 2000 chars avant
        context = content[max(0,idx-2000):idx]
        is_premium = 'premium-card' in context

    if in_html and is_premium:
        status = "PREMIUM"
        premium_count += 1
    elif in_html:
        status = "STABLE (non-premium)"
        stable_count += 1
    else:
        status = "ABSENT"
        absent_count += 1

    print(f"  {status:25s}  {name}")

print()
print(f"  PREMIUM:  {premium_count}/33 modules")
print(f"  STABLE:   {stable_count}/33 modules")
print(f"  ABSENTS:  {absent_count}/33 modules")

print()
print("=== SANTE GLOBALE ===")
score = (ok_ids / len(set(ids))) * 100
print(f"  IDs critiques: {ok_ids}/{len(set(ids))} ({score:.0f}%)")
print(f"  Modules Premium: {premium_count}/33")
print(f"  Modules stables: {stable_count}/33")
print(f"  Modules absents: {absent_count}/33")
print(f"  Palette harmonisee: {'OUI' if old_gold == 0 else 'NON (' + str(old_gold) + ' occurrences #E8941A restantes)'}")
print()
if old_gold == 0 and ok_ids >= 20 and absent_count <= 5:
    print("  STATUT: PRET POUR LE MERGE FINAL")
else:
    print("  STATUT: CORRECTIONS NECESSAIRES AVANT MERGE")
