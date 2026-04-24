#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Injecte la section Moteur IA Pédagogique dans index.html"""

MOTEUR_IA = '''
  <!-- ═══════════════════════════════════════════════════════════
       SECTION MOTEUR IA PÉDAGOGIQUE
  ═══════════════════════════════════════════════════════════ -->
  <section style="padding:90px 24px;background:linear-gradient(180deg,#060C14 0%,#0A1220 100%);position:relative;overflow:hidden;">
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:350px;background:radial-gradient(ellipse,rgba(42,111,212,0.07) 0%,transparent 70%);pointer-events:none;"></div>
    <div style="max-width:1100px;margin:0 auto;position:relative;z-index:1;">
      <div style="text-align:center;margin-bottom:60px;">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 16px;background:rgba(42,111,212,0.1);border:1px solid rgba(42,111,212,0.25);border-radius:99px;font-size:0.68rem;font-family:monospace;color:#5A9FFF;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:20px;">
          &#9889; Technologie Exclusive 2026 &#9889;
        </div>
        <h2 style="font-family:Georgia,serif;font-size:clamp(1.8rem,4vw,2.8rem);font-weight:700;color:#F0EAD6;line-height:1.2;margin-bottom:16px;">
          Le <span style="background:linear-gradient(135deg,#D4A017 0%,#F0C040 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Moteur IA Pédagogique</span><br>
          qui génère 100 modules d'excellence
        </h2>
        <p style="font-size:1rem;color:#6A8098;max-width:580px;margin:0 auto;line-height:1.7;">
          Notre pipeline IA propriétaire transforme chaque sujet brut en un module pédagogique complet,
          structuré et validé — en moins de 10 secondes.
        </p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:60px;">
        <div style="background:rgba(15,26,46,0.8);border:1px solid rgba(212,160,23,0.15);border-radius:16px;padding:28px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#D4A017,transparent);"></div>
          <div style="width:44px;height:44px;background:rgba(212,160,23,0.12);border:1px solid rgba(212,160,23,0.3);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:16px;">&#128221;</div>
          <div style="font-size:0.62rem;font-family:monospace;color:#D4A017;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Étape 01</div>
          <div style="font-family:Georgia,serif;font-size:1rem;font-weight:700;color:#F0EAD6;margin-bottom:10px;">Saisie du Sujet</div>
          <div style="font-size:0.78rem;color:#6A8098;line-height:1.6;">Un titre brut, un niveau CECRL et une catégorie suffisent pour déclencher la génération.</div>
        </div>
        <div style="background:rgba(15,26,46,0.8);border:1px solid rgba(42,111,212,0.15);border-radius:16px;padding:28px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#2A6FD4,transparent);"></div>
          <div style="width:44px;height:44px;background:rgba(42,111,212,0.12);border:1px solid rgba(42,111,212,0.3);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:16px;">&#129504;</div>
          <div style="font-size:0.62rem;font-family:monospace;color:#5A9FFF;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Étape 02</div>
          <div style="font-family:Georgia,serif;font-size:1rem;font-weight:700;color:#F0EAD6;margin-bottom:10px;">Génération Claude 3.5</div>
          <div style="font-size:0.78rem;color:#6A8098;line-height:1.6;">L'IA génère : titre accrocheur, 3 objectifs, contenu structuré, 5 quiz interactifs et un Elite Tip.</div>
        </div>
        <div style="background:rgba(15,26,46,0.8);border:1px solid rgba(34,197,94,0.15);border-radius:16px;padding:28px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#22C55E,transparent);"></div>
          <div style="width:44px;height:44px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:16px;">&#9989;</div>
          <div style="font-size:0.62rem;font-family:monospace;color:#22C55E;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Étape 03</div>
          <div style="font-family:Georgia,serif;font-size:1rem;font-weight:700;color:#F0EAD6;margin-bottom:10px;">Validation Pédagogique</div>
          <div style="font-size:0.78rem;color:#6A8098;line-height:1.6;">Parsing JSON strict, vérification des exemples bilingues, validation des quiz et contrôle qualité.</div>
        </div>
        <div style="background:rgba(15,26,46,0.8);border:1px solid rgba(212,160,23,0.25);border-radius:16px;padding:28px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#D4A017,transparent);opacity:0.8;"></div>
          <div style="width:44px;height:44px;background:rgba(212,160,23,0.15);border:1px solid rgba(212,160,23,0.4);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:16px;">&#127942;</div>
          <div style="font-size:0.62rem;font-family:monospace;color:#D4A017;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Étape 04</div>
          <div style="font-family:Georgia,serif;font-size:1rem;font-weight:700;color:#F0EAD6;margin-bottom:10px;">Publication en Base</div>
          <div style="font-size:0.78rem;color:#6A8098;line-height:1.6;">Insertion Supabase, statut Draft &rarr; Review &rarr; Published. Disponible immédiatement dans l'English Corner.</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;background:rgba(6,12,20,0.6);border:1px solid rgba(212,160,23,0.12);border-radius:20px;padding:32px;">
        <div style="text-align:center;">
          <div style="font-family:Georgia,serif;font-size:2.2rem;font-weight:700;background:linear-gradient(135deg,#D4A017,#F0C040);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">100+</div>
          <div style="font-size:0.72rem;color:#6A8098;letter-spacing:0.06em;margin-top:4px;">Modules générés</div>
        </div>
        <div style="text-align:center;border-left:1px solid rgba(255,255,255,0.06);">
          <div style="font-family:Georgia,serif;font-size:2.2rem;font-weight:700;color:#5A9FFF;"><10s</div>
          <div style="font-size:0.72rem;color:#6A8098;letter-spacing:0.06em;margin-top:4px;">Temps de génération</div>
        </div>
        <div style="text-align:center;border-left:1px solid rgba(255,255,255,0.06);">
          <div style="font-family:Georgia,serif;font-size:2.2rem;font-weight:700;color:#22C55E;">5</div>
          <div style="font-size:0.72rem;color:#6A8098;letter-spacing:0.06em;margin-top:4px;">Quiz par module</div>
        </div>
        <div style="text-align:center;border-left:1px solid rgba(255,255,255,0.06);">
          <div style="font-family:Georgia,serif;font-size:2.2rem;font-weight:700;color:#D4A017;">A1&rarr;C1</div>
          <div style="font-size:0.72rem;color:#6A8098;letter-spacing:0.06em;margin-top:4px;">Niveaux couverts</div>
        </div>
        <div style="text-align:center;border-left:1px solid rgba(255,255,255,0.06);">
          <div style="font-family:Georgia,serif;font-size:2.2rem;font-weight:700;color:#F59E0B;">100%</div>
          <div style="font-size:0.72rem;color:#6A8098;letter-spacing:0.06em;margin-top:4px;">Validé par experts</div>
        </div>
      </div>
    </div>
  </section>

'''

with open('index.html', 'rb') as f:
    content = f.read().decode('utf-8', errors='replace')

# Chercher le marqueur footer
markers = [
    '  <!-- FOOTER PROFESSIONNEL -->',
    '  <footer ',
    '<footer ',
]

injected = False
for marker in markers:
    idx = content.find(marker)
    if idx >= 0:
        content = content[:idx] + MOTEUR_IA + content[idx:]
        print(f"Section Moteur IA injectée avant '{marker[:40]}' (pos {idx})")
        injected = True
        break

if not injected:
    print("ERREUR: Aucun marqueur footer trouvé")
else:
    with open('index.html', 'wb') as f:
        f.write(content.encode('utf-8'))
    print("Fichier index.html sauvegarde OK")
    # Verification
    check = open('index.html', 'rb').read().decode('utf-8', errors='replace')
    print("Moteur IA present:", 'Moteur IA' in check)
