#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script d'injection des IDs critiques manquants dans dashboard-premium-lot2-final.html
- agendaTodayDate / agendaTodayContainer (Module 5 - Agenda du Jour)
- rapsTableBody (Module 14 - Rapports Pédagogiques)
"""

import os

DASHBOARD = 'dashboard-premium-lot2-final.html'

# Lire le fichier
with open(DASHBOARD, 'rb') as f:
    raw = f.read()

content = raw.decode('utf-8', errors='replace')
print(f"Fichier lu: {len(content)} caractères")

# ─────────────────────────────────────────────────────────────────────────────
# INJECTION 1 : Agenda du Jour (agendaTodayDate + agendaTodayContainer)
# ─────────────────────────────────────────────────────────────────────────────
AGENDA_HTML = '''
<!-- ── MODULE 5 : Agenda du Jour ─────────────────────────────── -->
<div class="agtm-card premium-card" style="margin-bottom: 1.5rem;">
  <div class="premium-card-header">
    <div>
      <div class="premium-card-title">📅 Agenda du Jour</div>
      <div class="premium-card-subtitle">Séances et événements planifiés pour aujourd'hui</div>
    </div>
    <div class="agtm-btn-group">
      <button onclick="window._refreshAgenda()" class="agtm-btn agtm-btn-secondary agtm-btn-sm">🔄 Actualiser</button>
      <button onclick="navigateTo('planning')" class="agtm-btn agtm-btn-primary agtm-btn-sm">➕ Planifier</button>
    </div>
  </div>
  <div class="premium-card-body">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
      <div style="font-weight: 800; color: var(--premium-gold); font-size: .92rem; display: flex; align-items: center; gap: 8px;">
        📅 Agenda du jour — <span id="agendaTodayDate" style="color: var(--premium-text-2); font-weight: 400; font-size: .82rem;"></span>
      </div>
    </div>
    <div id="agendaTodayContainer" style="display: grid; gap: 8px;">
      <div style="color: var(--premium-text-3); text-align: center; padding: 20px; font-size: .8rem;">Chargement…</div>
    </div>
  </div>
  <div class="premium-card-footer">
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <div style="font-size: .75rem; color: var(--premium-text-3);">
        <span id="agendaCount">0</span> séance(s) planifiée(s)
      </div>
      <button onclick="navigateTo('calendar')" class="agtm-btn agtm-btn-ghost agtm-btn-sm">🗓️ Voir le calendrier complet →</button>
    </div>
  </div>
</div>

'''

# ─────────────────────────────────────────────────────────────────────────────
# INJECTION 2 : Rapports Pédagogiques (rapsTableBody)
# ─────────────────────────────────────────────────────────────────────────────
RAPPORTS_HTML = '''
<!-- ── MODULE 14 : Rapports Pédagogiques ─────────────────────── -->
<div class="agtm-card premium-card" style="margin-bottom: 1.5rem;">
  <div class="premium-card-header">
    <div>
      <div class="premium-card-title">📝 Rapports Pédagogiques</div>
      <div class="premium-card-subtitle">Suivi des séances et honoraires formateurs</div>
    </div>
  </div>
  <div class="premium-card-body" style="padding: 0;">
    <div style="padding:18px 20px;border-bottom:1px solid rgba(255,255,255,0.07)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="font-weight:800;color:var(--premium-gold);font-size:.92rem">📊 Statistiques formateur</div>
        <span id="rapsCount" style="font-size:.75rem;padding:3px 10px;border-radius:10px;background:rgba(212,160,23,.15);color:var(--premium-gold);border:1px solid rgba(212,160,23,.3)">0 rapport</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
        <div style="text-align:center">
          <div id="rapsStatRealisees" style="color:#4AE090;font-size:1.5rem;font-weight:800">0</div>
          <div style="font-size:.68rem;color:var(--premium-text-3)">Séances réalisées</div>
        </div>
        <div style="text-align:center">
          <div id="rapsStatPlanifiees" style="color:#4A90D9;font-size:1.5rem;font-weight:800">0</div>
          <div style="font-size:.68rem;color:var(--premium-text-3)">À venir</div>
        </div>
        <div style="text-align:center">
          <div id="rapsStatEtudiants" style="color:#E8B84B;font-size:1.5rem;font-weight:800">0</div>
          <div style="font-size:.68rem;color:var(--premium-text-3)">Étudiants</div>
        </div>
        <div style="text-align:center">
          <div id="rapsStatHonoraires" style="color:var(--premium-gold);font-size:1.5rem;font-weight:800">0€</div>
          <div style="font-size:.68rem;color:var(--premium-text-3)">Honoraires</div>
        </div>
      </div>
    </div>
    <div style="overflow-x:auto">
      <table class="agtm-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Classe / Étudiant</th>
            <th>Thème</th>
            <th>Progression</th>
            <th>Honoraires</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="rapsTableBody">
          <tr><td colspan="6" style="text-align:center;padding:20px;color:var(--premium-text-3);font-size:.8rem;">Chargement des rapports…</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="premium-card-footer">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.07);">
      <div style="font-size: .75rem; color: var(--premium-text-3);">Rapports de séances en temps réel</div>
      <button onclick="navigateTo('rapports')" class="agtm-btn agtm-btn-primary">📋 Voir tous les rapports</button>
    </div>
  </div>
</div>

'''

# Vérifier si déjà injecté
already_agenda = 'id="agendaTodayDate"' in content
already_raps = 'id="rapsTableBody"' in content

print(f"agendaTodayDate déjà présent: {already_agenda}")
print(f"rapsTableBody déjà présent: {already_raps}")

modified = False

# Injection Agenda avant "Progression des Cohortes"
if not already_agenda:
    # Chercher le marqueur de la section Cohortes
    markers = [
        '<!-- \u2500\u2500 Progression des Cohortes',
        'Progression des Cohortes',
    ]
    for marker in markers:
        idx = content.find(marker)
        if idx >= 0:
            # Remonter au début de la ligne
            line_start = content.rfind('\n', 0, idx) + 1
            content = content[:line_start] + AGENDA_HTML + content[line_start:]
            print(f"✅ Agenda du Jour injecté avant '{marker}' (pos {idx})")
            modified = True
            break
    if not modified:
        print("⚠️ Marqueur Cohortes non trouvé - injection Agenda ignorée")
else:
    print("ℹ️ agendaTodayDate déjà présent, pas d'injection")

# Injection Rapports avant la fermeture du template principal (avant `) // Load async`)
if not already_raps:
    marker_raps = '`) // Load async sections after DOM'
    idx_raps = content.find(marker_raps)
    if idx_raps >= 0:
        line_start = content.rfind('\n', 0, idx_raps) + 1
        content = content[:line_start] + RAPPORTS_HTML + content[line_start:]
        print(f"✅ rapsTableBody injecté avant le marqueur async (pos {idx_raps})")
        modified = True
    else:
        print("⚠️ Marqueur async non trouvé - injection Rapports ignorée")
else:
    print("ℹ️ rapsTableBody déjà présent, pas d'injection")

# Sauvegarder
if modified:
    with open(DASHBOARD, 'wb') as f:
        f.write(content.encode('utf-8'))
    print(f"\n✅ Fichier sauvegardé: {DASHBOARD}")
else:
    print("\nℹ️ Aucune modification nécessaire")

# Vérification finale
content_check = open(DASHBOARD, 'rb').read().decode('utf-8', errors='replace')
print("\n=== VÉRIFICATION FINALE ===")
print(f"agendaTodayDate HTML: {'✅ PRÉSENT' if 'id=\"agendaTodayDate\"' in content_check else '❌ ABSENT'}")
print(f"agendaTodayContainer HTML: {'✅ PRÉSENT' if 'id=\"agendaTodayContainer\"' in content_check else '❌ ABSENT'}")
print(f"rapsTableBody HTML: {'✅ PRÉSENT' if 'id=\"rapsTableBody\"' in content_check else '❌ ABSENT'}")
