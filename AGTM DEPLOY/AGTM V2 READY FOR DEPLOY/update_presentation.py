#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Met a jour presentation_agtm_digital_academy.html avec les nouvelles sections 2026"""
import sys, re

with open('presentation_agtm_digital_academy.html', 'rb') as f:
    content = f.read().decode('utf-8', errors='replace')

# 1. Mettre a jour la date
content = re.sub(r'2024|2025', '2026', content)
sys.stdout.write('Date mise a jour vers 2026\n')

# 2. Nouvelles sections a injecter
NEW_SECTIONS = """
  <!-- ═══════════════════════════════════════════════════════════
       NOUVELLES SECTIONS 2026 — PRESENTATION OFFICIELLE AGTM
  ═══════════════════════════════════════════════════════════ -->

  <!-- SECTION : STACK TECHNOLOGIQUE 2026 -->
  <div id="tech-stack-2026" style="background:#fff;max-width:960px;margin:0 auto;padding:50px 60px;page-break-before:always;">
    <div style="background:linear-gradient(135deg,#0D1B2A,#1C2840);color:#fff;border-radius:12px;padding:22px 28px;margin-bottom:32px;">
      <div style="font-size:0.72rem;color:#C8960C;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Innovation Technologique 2026</div>
      <div style="font-size:1.4rem;font-weight:900;color:#E8B84B;">Notre Stack Technologique de Pointe</div>
      <div style="font-size:0.88rem;color:#8AAAC0;margin-top:6px;">La combinaison unique qui nous positionne comme leader en Afrique francophone</div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-bottom:28px;">
      <div style="background:linear-gradient(135deg,rgba(212,160,23,0.06),rgba(255,255,255,0));border:1px solid rgba(212,160,23,0.2);border-radius:12px;padding:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <div style="width:40px;height:40px;background:rgba(212,160,23,0.12);border:1px solid rgba(212,160,23,0.3);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">&#129504;</div>
          <div>
            <div style="font-weight:700;color:#0D1B2A;font-size:0.9rem;">Claude 3.5 Sonnet</div>
            <div style="font-size:0.68rem;color:#C8960C;font-family:monospace;">Anthropic AI</div>
          </div>
        </div>
        <p style="font-size:0.8rem;color:#4A5568;line-height:1.6;">Moteur de generation de modules pedagogiques. Produit 100+ contenus valides en moins de 10 secondes chacun.</p>
        <div style="margin-top:10px;font-size:0.72rem;color:#C8960C;font-weight:700;">100+ modules generes</div>
      </div>

      <div style="background:linear-gradient(135deg,rgba(42,111,212,0.06),rgba(255,255,255,0));border:1px solid rgba(42,111,212,0.2);border-radius:12px;padding:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <div style="width:40px;height:40px;background:rgba(42,111,212,0.12);border:1px solid rgba(42,111,212,0.3);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">&#9889;</div>
          <div>
            <div style="font-weight:700;color:#0D1B2A;font-size:0.9rem;">Supabase PostgreSQL</div>
            <div style="font-size:0.68rem;color:#2A6FD4;font-family:monospace;">Real-time Database</div>
          </div>
        </div>
        <p style="font-size:0.8rem;color:#4A5568;line-height:1.6;">Base de donnees temps reel avec securite RLS enterprise-grade. Synchronisation instantanee multi-appareils.</p>
        <div style="margin-top:10px;font-size:0.72rem;color:#2A6FD4;font-weight:700;">44+ migrations SQL</div>
      </div>

      <div style="background:linear-gradient(135deg,rgba(34,197,94,0.06),rgba(255,255,255,0));border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <div style="width:40px;height:40px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">&#128247;</div>
          <div>
            <div style="font-weight:700;color:#0D1B2A;font-size:0.9rem;">PWA Multi-Appareils</div>
            <div style="font-size:0.68rem;color:#22C55E;font-family:monospace;">iOS · Android · Desktop</div>
          </div>
        </div>
        <p style="font-size:0.8rem;color:#4A5568;line-height:1.6;">Application installable sur tous les appareils. Fonctionne hors-ligne. Notifications push. Experience native.</p>
        <div style="margin-top:10px;font-size:0.72rem;color:#22C55E;font-weight:700;">100% cross-platform</div>
      </div>

      <div style="background:linear-gradient(135deg,rgba(168,85,247,0.06),rgba(255,255,255,0));border:1px solid rgba(168,85,247,0.2);border-radius:12px;padding:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <div style="width:40px;height:40px;background:rgba(168,85,247,0.12);border:1px solid rgba(168,85,247,0.3);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">&#127908;</div>
          <div>
            <div style="font-weight:700;color:#0D1B2A;font-size:0.9rem;">Assistante Vocale IA</div>
            <div style="font-size:0.68rem;color:#A855F7;font-family:monospace;">Web Speech API</div>
          </div>
        </div>
        <p style="font-size:0.8rem;color:#4A5568;line-height:1.6;">Pratique de la prononciation avec analyse IA en temps reel. Score de prononciation et feedback instantane.</p>
        <div style="margin-top:10px;font-size:0.72rem;color:#A855F7;font-weight:700;">Score IA temps reel</div>
      </div>

      <div style="background:linear-gradient(135deg,rgba(212,160,23,0.06),rgba(255,255,255,0));border:1px solid rgba(212,160,23,0.2);border-radius:12px;padding:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <div style="width:40px;height:40px;background:rgba(212,160,23,0.12);border:1px solid rgba(212,160,23,0.3);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">&#129302;</div>
          <div>
            <div style="font-weight:700;color:#0D1B2A;font-size:0.9rem;">Assistante IA Marketing</div>
            <div style="font-size:0.68rem;color:#C8960C;font-family:monospace;">Amara — 24/7</div>
          </div>
        </div>
        <p style="font-size:0.8rem;color:#4A5568;line-height:1.6;">Chatbot IA sur la page vitrine pour repondre aux prospects 24h/24. Synchronise avec la base marketing Supabase.</p>
        <div style="margin-top:10px;font-size:0.72rem;color:#C8960C;font-weight:700;">Disponible 24h/24</div>
      </div>

      <div style="background:linear-gradient(135deg,rgba(245,158,11,0.06),rgba(255,255,255,0));border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <div style="width:40px;height:40px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">&#128202;</div>
          <div>
            <div style="font-weight:700;color:#0D1B2A;font-size:0.9rem;">Dashboard 33 Modules</div>
            <div style="font-size:0.68rem;color:#F59E0B;font-family:monospace;">Gestion Complete</div>
          </div>
        </div>
        <p style="font-size:0.8rem;color:#4A5568;line-height:1.6;">33 modules de gestion : etudiants, finances, KPIs, rapports pedagogiques, marketing, IA validation, calendrier.</p>
        <div style="margin-top:10px;font-size:0.72rem;color:#F59E0B;font-weight:700;">33 modules integres</div>
      </div>
    </div>
  </div>

  <!-- SECTION : PROPOSITION DE VALEUR INVESTISSEUR -->
  <div id="investisseur-2026" style="background:#fff;max-width:960px;margin:0 auto;padding:50px 60px;page-break-before:always;">
    <div style="background:linear-gradient(135deg,#0D1B2A,#1C2840);color:#fff;border-radius:12px;padding:22px 28px;margin-bottom:32px;">
      <div style="font-size:0.72rem;color:#C8960C;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Pour les Investisseurs</div>
      <div style="font-size:1.4rem;font-weight:900;color:#E8B84B;">Proposition de Valeur — Opportunite de Marche 2026</div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:28px;">
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:2rem;font-weight:900;color:#C8960C;font-family:Georgia,serif;">500M+</div>
        <div style="font-size:0.78rem;color:#6A8098;margin-top:4px;">Francophones en Afrique</div>
        <div style="font-size:0.68rem;color:#4A5568;margin-top:6px;line-height:1.5;">Marche adressable total pour l'apprentissage de l'anglais</div>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:2rem;font-weight:900;color:#2A6FD4;font-family:Georgia,serif;">96%</div>
        <div style="font-size:0.78rem;color:#6A8098;margin-top:4px;">Taux de satisfaction</div>
        <div style="font-size:0.68rem;color:#4A5568;margin-top:6px;line-height:1.5;">Apprenants satisfaits de la plateforme en 2026</div>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:2rem;font-weight:900;color:#22C55E;font-family:Georgia,serif;">10x</div>
        <div style="font-size:0.78rem;color:#6A8098;margin-top:4px;">Plus de contenu IA</div>
        <div style="font-size:0.68rem;color:#4A5568;margin-top:6px;line-height:1.5;">Vs concurrents locaux sans IA</div>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:2rem;font-weight:900;color:#F59E0B;font-family:Georgia,serif;">#1</div>
        <div style="font-size:0.78rem;color:#6A8098;margin-top:4px;">Plateforme IA anglais</div>
        <div style="font-size:0.68rem;color:#4A5568;margin-top:6px;line-height:1.5;">En Afrique francophone (2026)</div>
      </div>
    </div>

    <div style="background:rgba(212,160,23,0.06);border:1px solid rgba(212,160,23,0.2);border-radius:12px;padding:24px;margin-bottom:20px;">
      <div style="font-weight:700;color:#C8960C;font-size:1rem;margin-bottom:16px;">Avantages Concurrentiels Defensibles</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <div style="color:#22C55E;font-size:1rem;flex-shrink:0;">&#10003;</div>
          <div>
            <div style="font-weight:700;color:#0D1B2A;font-size:0.85rem;">Propriete intellectuelle IA</div>
            <div style="font-size:0.78rem;color:#6A8098;">Pipeline de generation exclusif Claude 3.5</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <div style="color:#22C55E;font-size:1rem;flex-shrink:0;">&#10003;</div>
          <div>
            <div style="font-weight:700;color:#0D1B2A;font-size:0.85rem;">Base de donnees propriete</div>
            <div style="font-size:0.78rem;color:#6A8098;">100+ modules valides, 44+ migrations SQL</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <div style="color:#22C55E;font-size:1rem;flex-shrink:0;">&#10003;</div>
          <div>
            <div style="font-weight:700;color:#0D1B2A;font-size:0.85rem;">Formateurs certifies CELTA/DELTA</div>
            <div style="font-size:0.78rem;color:#6A8098;">8+ experts pedagogiques dedies</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <div style="color:#22C55E;font-size:1rem;flex-shrink:0;">&#10003;</div>
          <div>
            <div style="font-weight:700;color:#0D1B2A;font-size:0.85rem;">Infrastructure scalable</div>
            <div style="font-size:0.78rem;color:#6A8098;">Supabase + Netlify + PWA = 0 serveur a gerer</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <div style="color:#22C55E;font-size:1rem;flex-shrink:0;">&#10003;</div>
          <div>
            <div style="font-weight:700;color:#0D1B2A;font-size:0.85rem;">Modele SaaS recurrent</div>
            <div style="font-size:0.78rem;color:#6A8098;">Abonnements Starter / Premium / Elite</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <div style="color:#22C55E;font-size:1rem;flex-shrink:0;">&#10003;</div>
          <div>
            <div style="font-weight:700;color:#0D1B2A;font-size:0.85rem;">Marque etablie Abidjan</div>
            <div style="font-size:0.78rem;color:#6A8098;">Reputation et reseau local solides</div>
          </div>
        </div>
      </div>
    </div>

    <div style="background:rgba(42,111,212,0.06);border:1px solid rgba(42,111,212,0.2);border-radius:12px;padding:20px;">
      <div style="font-weight:700;color:#2A6FD4;margin-bottom:12px;">Modele de Revenus</div>
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <tr style="background:rgba(42,111,212,0.08);">
          <th style="padding:10px;text-align:left;color:#0D1B2A;">Formule</th>
          <th style="padding:10px;text-align:center;color:#0D1B2A;">Acces</th>
          <th style="padding:10px;text-align:center;color:#0D1B2A;">Cible</th>
          <th style="padding:10px;text-align:center;color:#0D1B2A;">Potentiel</th>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:10px;font-weight:700;color:#C8960C;">Starter</td>
          <td style="padding:10px;text-align:center;color:#4A5568;">10 modules/mois</td>
          <td style="padding:10px;text-align:center;color:#4A5568;">Particuliers</td>
          <td style="padding:10px;text-align:center;color:#22C55E;">Volume</td>
        </tr>
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:10px;font-weight:700;color:#2A6FD4;">Premium</td>
          <td style="padding:10px;text-align:center;color:#4A5568;">Illimite + formateur</td>
          <td style="padding:10px;text-align:center;color:#4A5568;">Professionnels</td>
          <td style="padding:10px;text-align:center;color:#22C55E;">Marge elevee</td>
        </tr>
        <tr>
          <td style="padding:10px;font-weight:700;color:#22C55E;">Elite</td>
          <td style="padding:10px;text-align:center;color:#4A5568;">1-to-1 + certificat</td>
          <td style="padding:10px;text-align:center;color:#4A5568;">Entreprises / B2B</td>
          <td style="padding:10px;text-align:center;color:#22C55E;">Premium</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- SECTION : FEUILLE DE ROUTE 2026-2027 -->
  <div id="roadmap-2026" style="background:#fff;max-width:960px;margin:0 auto;padding:50px 60px;page-break-before:always;">
    <div style="background:linear-gradient(135deg,#0D1B2A,#1C2840);color:#fff;border-radius:12px;padding:22px 28px;margin-bottom:32px;">
      <div style="font-size:0.72rem;color:#C8960C;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Vision Strategique</div>
      <div style="font-size:1.4rem;font-weight:900;color:#E8B84B;">Feuille de Route 2026-2027</div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px;margin-bottom:28px;">
      <div style="display:flex;gap:16px;align-items:flex-start;">
        <div style="min-width:100px;padding:6px 12px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:99px;text-align:center;font-size:0.72rem;font-weight:700;color:#22C55E;">Q1-Q2 2026</div>
        <div style="flex:1;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
          <div style="font-weight:700;color:#0D1B2A;margin-bottom:6px;">Consolidation Premium</div>
          <div style="font-size:0.8rem;color:#4A5568;line-height:1.6;">Finalisation des 33 modules dashboard, deploiement PWA, lancement Assistante IA Amara, 100+ modules English Corner</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;align-items:flex-start;">
        <div style="min-width:100px;padding:6px 12px;background:rgba(212,160,23,0.1);border:1px solid rgba(212,160,23,0.3);border-radius:99px;text-align:center;font-size:0.72rem;font-weight:700;color:#C8960C;">Q3-Q4 2026</div>
        <div style="flex:1;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
          <div style="font-weight:700;color:#0D1B2A;margin-bottom:6px;">Expansion Regionale</div>
          <div style="font-size:0.8rem;color:#4A5568;line-height:1.6;">Ouverture Dakar et Douala, partenariats entreprises B2B, lancement formules Elite, 500+ apprenants actifs</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;align-items:flex-start;">
        <div style="min-width:100px;padding:6px 12px;background:rgba(42,111,212,0.1);border:1px solid rgba(42,111,212,0.3);border-radius:99px;text-align:center;font-size:0.72rem;font-weight:700;color:#2A6FD4;">2027</div>
        <div style="flex:1;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
          <div style="font-weight:700;color:#0D1B2A;margin-bottom:6px;">Leadership Continental</div>
          <div style="font-size:0.8rem;color:#4A5568;line-height:1.6;">Presence dans 5 pays francophones, 2000+ apprenants, plateforme SaaS B2B pour ecoles et entreprises</div>
        </div>
      </div>
    </div>

    <div style="background:rgba(212,160,23,0.08);border:1px solid rgba(212,160,23,0.25);border-radius:12px;padding:20px;text-align:center;">
      <div style="font-family:Georgia,serif;font-size:1.2rem;font-weight:700;color:#C8960C;margin-bottom:8px;">
        "L'anglais est la cle de l'economie mondiale.<br>AGTM Digital Academy est la cle de l'anglais."
      </div>
      <div style="font-size:0.78rem;color:#6A8098;">AGTM Digital Academy — Excellence · Innovation · Resultats</div>
      <div style="margin-top:16px;display:flex;justify-content:center;gap:20px;flex-wrap:wrap;font-size:0.78rem;color:#4A5568;">
        <span>&#128231; contact.eipservices@gmail.com</span>
        <span>&#128241; +225 07 123 45 67</span>
        <span>&#127970; Abidjan, Cote d'Ivoire</span>
      </div>
    </div>
  </div>
"""

# Injecter avant </html>
if 'tech-stack-2026' not in content:
    if '</html>' in content:
        content = content.replace('</html>', NEW_SECTIONS + '\n</html>')
    elif '</body>' in content:
        content = content.replace('</body>', NEW_SECTIONS + '\n</body>')
    else:
        content += NEW_SECTIONS
    sys.stdout.write('Nouvelles sections injectees\n')
else:
    sys.stdout.write('Sections deja presentes\n')

with open('presentation_agtm_digital_academy.html', 'wb') as f:
    f.write(content.encode('utf-8'))

c2 = open('presentation_agtm_digital_academy.html', 'rb').read().decode('utf-8', errors='replace')
sys.stdout.write('Taille finale: ' + str(len(c2)) + ' chars\n')
sys.stdout.write('tech-stack-2026: ' + str('tech-stack-2026' in c2) + '\n')
sys.stdout.write('investisseur-2026: ' + str('investisseur-2026' in c2) + '\n')
sys.stdout.write('roadmap-2026: ' + str('roadmap-2026' in c2) + '\n')
sys.stdout.write('Date 2026: ' + str('2026' in c2) + '\n')
sys.stdout.flush()
