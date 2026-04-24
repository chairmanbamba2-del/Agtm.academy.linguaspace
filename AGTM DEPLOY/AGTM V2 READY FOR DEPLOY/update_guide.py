#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Met a jour guide_utilisation.html avec les nouvelles sections :
- PWA (installation multi-appareils)
- Assistante IA Marketing (chatbot Amara)
- Moteur IA Pedagogique
- Avantages concurrentiels
- Mise a jour de la date vers 2026
"""
import sys, re

with open('guide_utilisation.html', 'rb') as f:
    content = f.read().decode('utf-8', errors='replace')

# 1. Mettre a jour la date
content = re.sub(r'2024|2025', '2026', content)
sys.stdout.write('Date mise a jour vers 2026\n')

# 2. Mettre a jour le titre de version
content = content.replace('Guide d\'utilisation', 'Guide d\'utilisation Premium v2026')
content = content.replace("Guide d'utilisation", "Guide d'utilisation Premium v2026")
sys.stdout.write('Titre mis a jour\n')

# 3. Bloc de nouvelles sections a injecter avant </body>
NEW_SECTIONS = """
  <!-- ═══════════════════════════════════════════════════════════
       NOUVELLES SECTIONS 2026 — GUIDE D'UTILISATION PREMIUM
  ═══════════════════════════════════════════════════════════ -->

  <!-- SECTION : APPLICATION PWA -->
  <div class="page" id="pwa-guide" style="background:#fff;max-width:960px;margin:0 auto;padding:50px 60px;page-break-before:always;">
    <div class="page-header" style="background:linear-gradient(135deg,#0D1B2A,#1C2840);color:#fff;border-radius:12px;padding:22px 28px;margin-bottom:32px;display:flex;align-items:center;gap:18px;">
      <div style="width:48px;height:48px;background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.4);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">&#128247;</div>
      <div>
        <div style="font-size:0.72rem;color:#22C55E;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Section Nouvelle 2026</div>
        <div style="font-size:1.2rem;font-weight:900;color:#E8B84B;">Application PWA — Installation Multi-Appareils</div>
      </div>
    </div>

    <div style="background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <div style="font-weight:700;color:#22C55E;margin-bottom:8px;">&#9432; Qu'est-ce que la PWA ?</div>
      <p style="font-size:0.88rem;color:#4A5568;line-height:1.7;">
        AGTM Digital Academy est disponible en tant qu'<strong>Application Web Progressive (PWA)</strong>.
        Cela signifie que vous pouvez l'installer sur votre smartphone, tablette ou ordinateur
        comme une application native — sans passer par un App Store.
      </p>
    </div>

    <h3 style="font-size:1rem;font-weight:700;color:#0D1B2A;margin-bottom:16px;">&#128247; Comment installer l'application ?</h3>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-bottom:24px;">
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:18px;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:8px;">&#128241; Sur Android (Chrome)</div>
        <ol style="font-size:0.82rem;color:#4A5568;line-height:1.8;padding-left:18px;">
          <li>Ouvrez le site dans Chrome</li>
          <li>Appuyez sur les 3 points (&#8942;) en haut</li>
          <li>Sélectionnez "Ajouter à l'écran d'accueil"</li>
          <li>Confirmez l'installation</li>
        </ol>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:18px;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:8px;">&#127822; Sur iPhone/iPad (Safari)</div>
        <ol style="font-size:0.82rem;color:#4A5568;line-height:1.8;padding-left:18px;">
          <li>Ouvrez le site dans Safari</li>
          <li>Appuyez sur l'icône Partager (&#8679;)</li>
          <li>Sélectionnez "Sur l'écran d'accueil"</li>
          <li>Appuyez sur "Ajouter"</li>
        </ol>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:18px;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:8px;">&#128187; Sur PC/Mac (Chrome/Edge)</div>
        <ol style="font-size:0.82rem;color:#4A5568;line-height:1.8;padding-left:18px;">
          <li>Ouvrez le site dans Chrome ou Edge</li>
          <li>Cliquez sur l'icône d'installation (&#8853;) dans la barre d'adresse</li>
          <li>Ou utilisez le bouton "Installer l'App" sur la page</li>
          <li>Confirmez l'installation</li>
        </ol>
      </div>
    </div>

    <div style="background:rgba(212,160,23,0.08);border:1px solid rgba(212,160,23,0.25);border-radius:10px;padding:16px 20px;">
      <div style="font-weight:700;color:#C8960C;margin-bottom:8px;">&#9889; Avantages de la PWA</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;font-size:0.82rem;color:#4A5568;">
        <div>&#10003; Fonctionne hors-ligne (mode avion)</div>
        <div>&#10003; Chargement ultra-rapide</div>
        <div>&#10003; Notifications push</div>
        <div>&#10003; Synchronisation automatique</div>
        <div>&#10003; Mise à jour automatique</div>
        <div>&#10003; Aucun téléchargement App Store</div>
      </div>
    </div>
  </div>

  <!-- SECTION : ASSISTANTE IA MARKETING -->
  <div class="page" id="chatbot-guide" style="background:#fff;max-width:960px;margin:0 auto;padding:50px 60px;page-break-before:always;">
    <div class="page-header" style="background:linear-gradient(135deg,#0D1B2A,#1C2840);color:#fff;border-radius:12px;padding:22px 28px;margin-bottom:32px;display:flex;align-items:center;gap:18px;">
      <div style="width:48px;height:48px;background:rgba(212,160,23,0.2);border:1px solid rgba(212,160,23,0.4);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">&#129302;</div>
      <div>
        <div style="font-size:0.72rem;color:#C8960C;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Section Nouvelle 2026</div>
        <div style="font-size:1.2rem;font-weight:900;color:#E8B84B;">Amara — Assistante IA Marketing</div>
      </div>
    </div>

    <div style="background:rgba(212,160,23,0.06);border:1px solid rgba(212,160,23,0.2);border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <div style="font-weight:700;color:#C8960C;margin-bottom:8px;">&#129302; Qui est Amara ?</div>
      <p style="font-size:0.88rem;color:#4A5568;line-height:1.7;">
        <strong>Amara</strong> est l'assistante IA marketing d'AGTM Digital Academy. Elle est disponible
        24h/24, 7j/7 sur la page d'accueil (vitrine) pour répondre aux questions des visiteurs,
        prospects et clients. Elle peut répondre en quelques secondes sur les formations, tarifs,
        inscriptions et technologies utilisées.
      </p>
    </div>

    <h3 style="font-size:1rem;font-weight:700;color:#0D1B2A;margin-bottom:16px;">&#128172; Comment utiliser Amara ?</h3>
    <ol style="font-size:0.88rem;color:#4A5568;line-height:2;padding-left:20px;margin-bottom:24px;">
      <li>Cliquez sur le bouton doré &#129302; en bas à droite de la page d'accueil</li>
      <li>La fenêtre de chat s'ouvre avec un message de bienvenue</li>
      <li>Utilisez les boutons de réponse rapide ou tapez votre question</li>
      <li>Amara répond en 1-2 secondes avec des informations précises</li>
      <li>Pour fermer, cliquez à nouveau sur le bouton ou sur ✕</li>
    </ol>

    <h3 style="font-size:1rem;font-weight:700;color:#0D1B2A;margin-bottom:12px;">&#128218; Sujets couverts par Amara</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:24px;">
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:12px;font-size:0.82rem;color:#4A5568;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:4px;">&#128218; Formations</div>
        Catalogue, niveaux, durées, objectifs
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:12px;font-size:0.82rem;color:#4A5568;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:4px;">&#128176; Tarifs</div>
        Formules Starter, Premium, Elite
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:12px;font-size:0.82rem;color:#4A5568;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:4px;">&#128221; Inscription</div>
        Processus, test de placement, accès
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:12px;font-size:0.82rem;color:#4A5568;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:4px;">&#129504; Technologie IA</div>
        Moteur IA, modules, quiz adaptatifs
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:12px;font-size:0.82rem;color:#4A5568;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:4px;">&#127942; Certifications</div>
        TOEFL, IELTS, Cambridge, AGTM
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:12px;font-size:0.82rem;color:#4A5568;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:4px;">&#128222; Contact</div>
        Coordonnées, horaires, localisation
      </div>
    </div>

    <div style="background:rgba(42,111,212,0.06);border:1px solid rgba(42,111,212,0.2);border-radius:10px;padding:16px 20px;">
      <div style="font-weight:700;color:#2A6FD4;margin-bottom:8px;">&#128161; Pour les administrateurs</div>
      <p style="font-size:0.82rem;color:#4A5568;line-height:1.7;">
        Les réponses d'Amara peuvent être personnalisées via la section <strong>Marketing</strong> du dashboard.
        Les statistiques (nombre d'étudiants, taux de satisfaction, etc.) sont synchronisées automatiquement
        depuis la base de données Supabase via la table <code style="background:#F1F5F9;padding:2px 6px;border-radius:4px;">marketing_config</code>.
      </p>
    </div>
  </div>

  <!-- SECTION : MOTEUR IA PEDAGOGIQUE -->
  <div class="page" id="moteur-ia-guide" style="background:#fff;max-width:960px;margin:0 auto;padding:50px 60px;page-break-before:always;">
    <div class="page-header" style="background:linear-gradient(135deg,#0D1B2A,#1C2840);color:#fff;border-radius:12px;padding:22px 28px;margin-bottom:32px;display:flex;align-items:center;gap:18px;">
      <div style="width:48px;height:48px;background:rgba(42,111,212,0.2);border:1px solid rgba(42,111,212,0.4);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">&#129504;</div>
      <div>
        <div style="font-size:0.72rem;color:#5A9FFF;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Section Nouvelle 2026</div>
        <div style="font-size:1.2rem;font-weight:900;color:#E8B84B;">Moteur IA Pédagogique — English Corner</div>
      </div>
    </div>

    <p style="font-size:0.88rem;color:#4A5568;line-height:1.7;margin-bottom:24px;">
      Le <strong>Moteur IA Pédagogique</strong> est le coeur technologique d'AGTM Digital Academy.
      Il génère automatiquement des modules d'apprentissage complets en moins de 10 secondes,
      en utilisant Claude 3.5 Sonnet d'Anthropic.
    </p>

    <h3 style="font-size:1rem;font-weight:700;color:#0D1B2A;margin-bottom:16px;">&#9889; Pipeline de génération (4 étapes)</h3>
    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:28px;">
      <div style="display:flex;gap:16px;align-items:flex-start;padding:14px 16px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;">
        <div style="width:32px;height:32px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0;">&#128221;</div>
        <div>
          <div style="font-weight:700;color:#0D1B2A;font-size:0.88rem;">Étape 1 — Saisie du sujet</div>
          <div style="font-size:0.8rem;color:#6A8098;margin-top:4px;">Titre brut + niveau CECRL (A1→C1) + catégorie (Business, Grammar, Vocabulary...)</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;align-items:flex-start;padding:14px 16px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;">
        <div style="width:32px;height:32px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0;">&#129504;</div>
        <div>
          <div style="font-weight:700;color:#0D1B2A;font-size:0.88rem;">Étape 2 — Génération Claude 3.5</div>
          <div style="font-size:0.8rem;color:#6A8098;margin-top:4px;">L'IA génère : titre accrocheur, 3 objectifs, contenu structuré, 5 quiz interactifs, Elite Tip bilingue</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;align-items:flex-start;padding:14px 16px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;">
        <div style="width:32px;height:32px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0;">&#9989;</div>
        <div>
          <div style="font-weight:700;color:#0D1B2A;font-size:0.88rem;">Étape 3 — Validation pédagogique</div>
          <div style="font-size:0.8rem;color:#6A8098;margin-top:4px;">Parsing JSON strict, vérification des exemples bilingues, validation des quiz, contrôle qualité</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;align-items:flex-start;padding:14px 16px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;">
        <div style="width:32px;height:32px;background:rgba(212,160,23,0.1);border:1px solid rgba(212,160,23,0.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0;">&#127942;</div>
        <div>
          <div style="font-weight:700;color:#0D1B2A;font-size:0.88rem;">Étape 4 — Publication Supabase</div>
          <div style="font-size:0.8rem;color:#6A8098;margin-top:4px;">Insertion en base, statut Draft → Review → Published. Disponible immédiatement dans l'English Corner</div>
        </div>
      </div>
    </div>

    <div style="background:rgba(212,160,23,0.08);border:1px solid rgba(212,160,23,0.25);border-radius:10px;padding:16px 20px;">
      <div style="font-weight:700;color:#C8960C;margin-bottom:8px;">&#128202; Statistiques du Moteur IA (2026)</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;font-size:0.82rem;text-align:center;">
        <div><div style="font-size:1.4rem;font-weight:700;color:#C8960C;">100+</div><div style="color:#6A8098;">Modules générés</div></div>
        <div><div style="font-size:1.4rem;font-weight:700;color:#2A6FD4;"><10s</div><div style="color:#6A8098;">Temps de génération</div></div>
        <div><div style="font-size:1.4rem;font-weight:700;color:#22C55E;">5</div><div style="color:#6A8098;">Quiz par module</div></div>
        <div><div style="font-size:1.4rem;font-weight:700;color:#C8960C;">A1→C1</div><div style="color:#6A8098;">Niveaux couverts</div></div>
        <div><div style="font-size:1.4rem;font-weight:700;color:#F59E0B;">100%</div><div style="color:#6A8098;">Validé par experts</div></div>
      </div>
    </div>
  </div>

  <!-- SECTION : AVANTAGES CONCURRENTIELS -->
  <div class="page" id="avantages-guide" style="background:#fff;max-width:960px;margin:0 auto;padding:50px 60px;page-break-before:always;">
    <div class="page-header" style="background:linear-gradient(135deg,#0D1B2A,#1C2840);color:#fff;border-radius:12px;padding:22px 28px;margin-bottom:32px;display:flex;align-items:center;gap:18px;">
      <div style="width:48px;height:48px;background:rgba(212,160,23,0.2);border:1px solid rgba(212,160,23,0.4);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">&#127942;</div>
      <div>
        <div style="font-size:0.72rem;color:#C8960C;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Section Nouvelle 2026</div>
        <div style="font-size:1.2rem;font-weight:900;color:#E8B84B;">Avantages Concurrentiels — Stack Technologique</div>
      </div>
    </div>

    <p style="font-size:0.88rem;color:#4A5568;line-height:1.7;margin-bottom:24px;">
      AGTM Digital Academy utilise une combinaison unique d'outils technologiques de pointe
      qui nous positionnent comme la <strong>plateforme #1 d'apprentissage de l'anglais par IA
      en Afrique francophone</strong>.
    </p>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-bottom:28px;">
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:18px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="font-size:1.2rem;">&#129504;</span>
          <div style="font-weight:700;color:#0D1B2A;font-size:0.9rem;">Claude 3.5 Sonnet (Anthropic)</div>
        </div>
        <p style="font-size:0.8rem;color:#6A8098;line-height:1.6;">Génération de contenu pédagogique de haute qualité. Modèle IA de dernière génération pour la création de modules.</p>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:18px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="font-size:1.2rem;">&#9889;</span>
          <div style="font-weight:700;color:#0D1B2A;font-size:0.9rem;">Supabase PostgreSQL</div>
        </div>
        <p style="font-size:0.8rem;color:#6A8098;line-height:1.6;">Base de données temps réel, authentification sécurisée (RLS), synchronisation multi-appareils instantanée.</p>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:18px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="font-size:1.2rem;">&#128247;</span>
          <div style="font-weight:700;color:#0D1B2A;font-size:0.9rem;">PWA (Progressive Web App)</div>
        </div>
        <p style="font-size:0.8rem;color:#6A8098;line-height:1.6;">Application installable sur tous les appareils. Fonctionne hors-ligne. Notifications push. Expérience native.</p>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:18px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="font-size:1.2rem;">&#127908;</span>
          <div style="font-weight:700;color:#0D1B2A;font-size:0.9rem;">Web Speech API</div>
        </div>
        <p style="font-size:0.8rem;color:#6A8098;line-height:1.6;">Assistante vocale intégrée pour la pratique de la prononciation. Score IA en temps réel, feedback instantané.</p>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:18px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="font-size:1.2rem;">&#127891;</span>
          <div style="font-weight:700;color:#0D1B2A;font-size:0.9rem;">Certificats Vérifiables</div>
        </div>
        <p style="font-size:0.8rem;color:#6A8098;line-height:1.6;">Certificats numériques vérifiables en ligne. Reconnus par les employeurs. Partageables sur LinkedIn.</p>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:18px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="font-size:1.2rem;">&#128202;</span>
          <div style="font-weight:700;color:#0D1B2A;font-size:0.9rem;">Dashboard Analytics</div>
        </div>
        <p style="font-size:0.8rem;color:#6A8098;line-height:1.6;">33 modules de gestion : étudiants, finances, KPIs, rapports pédagogiques, marketing, IA validation.</p>
      </div>
    </div>

    <div style="background:rgba(212,160,23,0.08);border:1px solid rgba(212,160,23,0.25);border-radius:10px;padding:16px 20px;">
      <div style="font-weight:700;color:#C8960C;margin-bottom:12px;">&#128202; Comparaison avec les alternatives</div>
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="background:rgba(212,160,23,0.1);">
            <th style="padding:8px 12px;text-align:left;color:#0D1B2A;border-bottom:1px solid rgba(212,160,23,0.2);">Critère</th>
            <th style="padding:8px 12px;text-align:center;color:#C8960C;border-bottom:1px solid rgba(212,160,23,0.2);">AGTM Academy</th>
            <th style="padding:8px 12px;text-align:center;color:#6A8098;border-bottom:1px solid rgba(212,160,23,0.2);">Concurrents locaux</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding:8px 12px;color:#4A5568;border-bottom:1px solid #F1F5F9;">Modules IA générés</td><td style="padding:8px 12px;text-align:center;color:#22C55E;font-weight:700;">100+</td><td style="padding:8px 12px;text-align:center;color:#EF4444;">0</td></tr>
          <tr><td style="padding:8px 12px;color:#4A5568;border-bottom:1px solid #F1F5F9;">Application PWA</td><td style="padding:8px 12px;text-align:center;color:#22C55E;font-weight:700;">&#10003; Oui</td><td style="padding:8px 12px;text-align:center;color:#EF4444;">&#10007; Non</td></tr>
          <tr><td style="padding:8px 12px;color:#4A5568;border-bottom:1px solid #F1F5F9;">Assistante IA 24/7</td><td style="padding:8px 12px;text-align:center;color:#22C55E;font-weight:700;">&#10003; Oui</td><td style="padding:8px 12px;text-align:center;color:#EF4444;">&#10007; Non</td></tr>
          <tr><td style="padding:8px 12px;color:#4A5568;border-bottom:1px solid #F1F5F9;">Suivi temps réel</td><td style="padding:8px 12px;text-align:center;color:#22C55E;font-weight:700;">&#10003; Supabase</td><td style="padding:8px 12px;text-align:center;color:#EF4444;">&#10007; Non</td></tr>
          <tr><td style="padding:8px 12px;color:#4A5568;">Certificats vérifiables</td><td style="padding:8px 12px;text-align:center;color:#22C55E;font-weight:700;">&#10003; Oui</td><td style="padding:8px 12px;text-align:center;color:#EF4444;">&#10007; Non</td></tr>
        </tbody>
      </table>
    </div>
  </div>

"""

# Injecter avant </body>
if 'PWA' not in content and 'pwa-guide' not in content:
    if '</body>' in content:
        content = content.replace('</body>', NEW_SECTIONS + '</body>')
        sys.stdout.write('Nouvelles sections injectees\n')
    else:
        content += NEW_SECTIONS
        sys.stdout.write('Nouvelles sections ajoutees en fin de fichier\n')
else:
    sys.stdout.write('Sections deja presentes\n')

# Sauvegarder
with open('guide_utilisation.html', 'wb') as f:
    f.write(content.encode('utf-8'))

sys.stdout.write('guide_utilisation.html sauvegarde OK\n')
c2 = open('guide_utilisation.html', 'rb').read().decode('utf-8', errors='replace')
sys.stdout.write('Taille finale: ' + str(len(c2)) + ' chars\n')
sys.stdout.write('PWA section: ' + str('pwa-guide' in c2) + '\n')
sys.stdout.write('Chatbot section: ' + str('chatbot-guide' in c2) + '\n')
sys.stdout.write('Moteur IA section: ' + str('moteur-ia-guide' in c2) + '\n')
sys.stdout.write('Avantages section: ' + str('avantages-guide' in c2) + '\n')
sys.stdout.flush()
