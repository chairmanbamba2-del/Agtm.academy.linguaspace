#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Force l'injection des nouvelles sections dans guide_utilisation.html"""
import sys, re

with open('guide_utilisation.html', 'rb') as f:
    content = f.read().decode('utf-8', errors='replace')

# Mettre a jour la date
content = re.sub(r'2024|2025', '2026', content)

NEW_SECTIONS = """
  <!-- NOUVELLES SECTIONS 2026 -->
  <div id="pwa-guide" style="background:#fff;max-width:960px;margin:0 auto;padding:50px 60px;page-break-before:always;">
    <div style="background:linear-gradient(135deg,#0D1B2A,#1C2840);color:#fff;border-radius:12px;padding:22px 28px;margin-bottom:32px;">
      <div style="font-size:1.2rem;font-weight:900;color:#E8B84B;">&#128247; Application PWA — Installation Multi-Appareils</div>
      <div style="font-size:0.72rem;color:#22C55E;margin-top:4px;">Section Nouvelle 2026</div>
    </div>
    <p style="font-size:0.88rem;color:#4A5568;line-height:1.7;margin-bottom:20px;">
      AGTM Digital Academy est disponible en tant qu'<strong>Application Web Progressive (PWA)</strong>.
      Installez-la sur votre smartphone, tablette ou ordinateur comme une application native, sans App Store.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-bottom:20px;">
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:8px;">&#128241; Android (Chrome)</div>
        <ol style="font-size:0.82rem;color:#4A5568;line-height:1.8;padding-left:18px;">
          <li>Ouvrez le site dans Chrome</li><li>Menu 3 points > "Ajouter a l'ecran d'accueil"</li><li>Confirmez</li>
        </ol>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:8px;">&#127822; iPhone/iPad (Safari)</div>
        <ol style="font-size:0.82rem;color:#4A5568;line-height:1.8;padding-left:18px;">
          <li>Ouvrez dans Safari</li><li>Icone Partager > "Sur l'ecran d'accueil"</li><li>Appuyez "Ajouter"</li>
        </ol>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:8px;">&#128187; PC/Mac (Chrome/Edge)</div>
        <ol style="font-size:0.82rem;color:#4A5568;line-height:1.8;padding-left:18px;">
          <li>Icone installation dans la barre d'adresse</li><li>Ou bouton "Installer l'App" sur la page</li><li>Confirmez</li>
        </ol>
      </div>
    </div>
    <div style="background:rgba(212,160,23,0.08);border:1px solid rgba(212,160,23,0.25);border-radius:10px;padding:14px 18px;">
      <div style="font-weight:700;color:#C8960C;margin-bottom:8px;">Avantages PWA</div>
      <div style="font-size:0.82rem;color:#4A5568;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:6px;">
        <div>&#10003; Fonctionne hors-ligne</div><div>&#10003; Chargement rapide</div>
        <div>&#10003; Notifications push</div><div>&#10003; Sync automatique</div>
        <div>&#10003; Mise a jour auto</div><div>&#10003; Sans App Store</div>
      </div>
    </div>
  </div>

  <div id="chatbot-guide" style="background:#fff;max-width:960px;margin:0 auto;padding:50px 60px;page-break-before:always;">
    <div style="background:linear-gradient(135deg,#0D1B2A,#1C2840);color:#fff;border-radius:12px;padding:22px 28px;margin-bottom:32px;">
      <div style="font-size:1.2rem;font-weight:900;color:#E8B84B;">&#129302; Amara — Assistante IA Marketing</div>
      <div style="font-size:0.72rem;color:#C8960C;margin-top:4px;">Section Nouvelle 2026</div>
    </div>
    <p style="font-size:0.88rem;color:#4A5568;line-height:1.7;margin-bottom:20px;">
      <strong>Amara</strong> est l'assistante IA marketing d'AGTM Digital Academy. Disponible 24h/24, 7j/7
      sur la page d'accueil pour repondre aux visiteurs, prospects et clients sur les formations, tarifs et inscriptions.
    </p>
    <h3 style="font-size:1rem;font-weight:700;color:#0D1B2A;margin-bottom:12px;">Comment utiliser Amara ?</h3>
    <ol style="font-size:0.88rem;color:#4A5568;line-height:2;padding-left:20px;margin-bottom:20px;">
      <li>Cliquez sur le bouton dore en bas a droite de la page d'accueil</li>
      <li>La fenetre de chat s'ouvre avec un message de bienvenue</li>
      <li>Utilisez les boutons de reponse rapide ou tapez votre question</li>
      <li>Amara repond en 1-2 secondes avec des informations precises</li>
    </ol>
    <div style="background:rgba(42,111,212,0.06);border:1px solid rgba(42,111,212,0.2);border-radius:10px;padding:14px 18px;">
      <div style="font-weight:700;color:#2A6FD4;margin-bottom:8px;">Pour les administrateurs</div>
      <p style="font-size:0.82rem;color:#4A5568;line-height:1.7;">
        Les reponses d'Amara sont personnalisables via la section Marketing du dashboard.
        Les statistiques sont synchronisees depuis Supabase via la table <code>marketing_config</code>.
      </p>
    </div>
  </div>

  <div id="moteur-ia-guide" style="background:#fff;max-width:960px;margin:0 auto;padding:50px 60px;page-break-before:always;">
    <div style="background:linear-gradient(135deg,#0D1B2A,#1C2840);color:#fff;border-radius:12px;padding:22px 28px;margin-bottom:32px;">
      <div style="font-size:1.2rem;font-weight:900;color:#E8B84B;">&#129504; Moteur IA Pedagogique — English Corner</div>
      <div style="font-size:0.72rem;color:#5A9FFF;margin-top:4px;">Section Nouvelle 2026</div>
    </div>
    <p style="font-size:0.88rem;color:#4A5568;line-height:1.7;margin-bottom:20px;">
      Le <strong>Moteur IA Pedagogique</strong> genere automatiquement des modules d'apprentissage complets
      en moins de 10 secondes via Claude 3.5 Sonnet d'Anthropic.
    </p>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
      <div style="display:flex;gap:14px;padding:12px 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;">
        <div style="font-weight:700;color:#EF4444;min-width:80px;">Etape 1</div>
        <div style="font-size:0.82rem;color:#4A5568;">Saisie du sujet : titre brut + niveau CECRL (A1-C1) + categorie</div>
      </div>
      <div style="display:flex;gap:14px;padding:12px 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;">
        <div style="font-weight:700;color:#F59E0B;min-width:80px;">Etape 2</div>
        <div style="font-size:0.82rem;color:#4A5568;">Generation Claude 3.5 : titre, 3 objectifs, contenu, 5 quiz, Elite Tip bilingue</div>
      </div>
      <div style="display:flex;gap:14px;padding:12px 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;">
        <div style="font-weight:700;color:#22C55E;min-width:80px;">Etape 3</div>
        <div style="font-size:0.82rem;color:#4A5568;">Validation : parsing JSON, exemples bilingues, quiz, controle qualite</div>
      </div>
      <div style="display:flex;gap:14px;padding:12px 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;">
        <div style="font-weight:700;color:#C8960C;min-width:80px;">Etape 4</div>
        <div style="font-size:0.82rem;color:#4A5568;">Publication Supabase : Draft > Review > Published. Disponible dans l'English Corner</div>
      </div>
    </div>
    <div style="background:rgba(212,160,23,0.08);border:1px solid rgba(212,160,23,0.25);border-radius:10px;padding:14px 18px;">
      <div style="font-weight:700;color:#C8960C;margin-bottom:10px;">Statistiques 2026</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;text-align:center;font-size:0.82rem;">
        <div><div style="font-size:1.3rem;font-weight:700;color:#C8960C;">100+</div><div style="color:#6A8098;">Modules</div></div>
        <div><div style="font-size:1.3rem;font-weight:700;color:#2A6FD4;"><10s</div><div style="color:#6A8098;">Generation</div></div>
        <div><div style="font-size:1.3rem;font-weight:700;color:#22C55E;">5</div><div style="color:#6A8098;">Quiz/module</div></div>
        <div><div style="font-size:1.3rem;font-weight:700;color:#C8960C;">A1-C1</div><div style="color:#6A8098;">Niveaux</div></div>
        <div><div style="font-size:1.3rem;font-weight:700;color:#F59E0B;">100%</div><div style="color:#6A8098;">Valide</div></div>
      </div>
    </div>
  </div>

  <div id="avantages-guide" style="background:#fff;max-width:960px;margin:0 auto;padding:50px 60px;page-break-before:always;">
    <div style="background:linear-gradient(135deg,#0D1B2A,#1C2840);color:#fff;border-radius:12px;padding:22px 28px;margin-bottom:32px;">
      <div style="font-size:1.2rem;font-weight:900;color:#E8B84B;">&#127942; Avantages Concurrentiels — Stack Technologique</div>
      <div style="font-size:0.72rem;color:#C8960C;margin-top:4px;">Section Nouvelle 2026</div>
    </div>
    <p style="font-size:0.88rem;color:#4A5568;line-height:1.7;margin-bottom:20px;">
      AGTM Digital Academy est la <strong>plateforme #1 d'apprentissage de l'anglais par IA en Afrique francophone</strong>,
      grace a une combinaison unique d'outils technologiques de pointe.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-bottom:20px;">
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:6px;">&#129504; Claude 3.5 Sonnet</div>
        <p style="font-size:0.8rem;color:#6A8098;">Generation de contenu pedagogique haute qualite. Modele IA derniere generation.</p>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:6px;">&#9889; Supabase PostgreSQL</div>
        <p style="font-size:0.8rem;color:#6A8098;">Base de donnees temps reel, auth securisee (RLS), sync multi-appareils.</p>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:6px;">&#128247; PWA Installable</div>
        <p style="font-size:0.8rem;color:#6A8098;">App sur tous appareils. Hors-ligne. Notifications push. Experience native.</p>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:6px;">&#127908; Assistante Vocale IA</div>
        <p style="font-size:0.8rem;color:#6A8098;">Pratique prononciation. Score IA temps reel. Feedback instantane.</p>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:6px;">&#127891; Certificats Verifiables</div>
        <p style="font-size:0.8rem;color:#6A8098;">Numeriques, verifiables en ligne. Reconnus employeurs. LinkedIn.</p>
      </div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px;">
        <div style="font-weight:700;color:#0D1B2A;margin-bottom:6px;">&#128202; Dashboard 33 Modules</div>
        <p style="font-size:0.8rem;color:#6A8098;">Etudiants, finances, KPIs, rapports, marketing, IA validation.</p>
      </div>
    </div>
    <div style="background:rgba(212,160,23,0.08);border:1px solid rgba(212,160,23,0.25);border-radius:10px;padding:14px 18px;">
      <div style="font-weight:700;color:#C8960C;margin-bottom:10px;">Comparaison concurrentielle</div>
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <tr style="background:rgba(212,160,23,0.1);">
          <th style="padding:8px;text-align:left;color:#0D1B2A;">Critere</th>
          <th style="padding:8px;text-align:center;color:#C8960C;">AGTM Academy</th>
          <th style="padding:8px;text-align:center;color:#6A8098;">Concurrents</th>
        </tr>
        <tr><td style="padding:8px;color:#4A5568;">Modules IA</td><td style="padding:8px;text-align:center;color:#22C55E;font-weight:700;">100+</td><td style="padding:8px;text-align:center;color:#EF4444;">0</td></tr>
        <tr><td style="padding:8px;color:#4A5568;">PWA</td><td style="padding:8px;text-align:center;color:#22C55E;font-weight:700;">Oui</td><td style="padding:8px;text-align:center;color:#EF4444;">Non</td></tr>
        <tr><td style="padding:8px;color:#4A5568;">Assistante IA 24/7</td><td style="padding:8px;text-align:center;color:#22C55E;font-weight:700;">Oui</td><td style="padding:8px;text-align:center;color:#EF4444;">Non</td></tr>
        <tr><td style="padding:8px;color:#4A5568;">Suivi temps reel</td><td style="padding:8px;text-align:center;color:#22C55E;font-weight:700;">Supabase</td><td style="padding:8px;text-align:center;color:#EF4444;">Non</td></tr>
        <tr><td style="padding:8px;color:#4A5568;">Certificats</td><td style="padding:8px;text-align:center;color:#22C55E;font-weight:700;">Oui</td><td style="padding:8px;text-align:center;color:#EF4444;">Non</td></tr>
      </table>
    </div>
  </div>
"""

# Forcer l'injection avant </html>
if 'pwa-guide' not in content:
    if '</html>' in content:
        content = content.replace('</html>', NEW_SECTIONS + '\n</html>')
    elif '</body>' in content:
        content = content.replace('</body>', NEW_SECTIONS + '\n</body>')
    else:
        content += NEW_SECTIONS
    sys.stdout.write('Sections injectees\n')
else:
    sys.stdout.write('Sections deja presentes\n')

with open('guide_utilisation.html', 'wb') as f:
    f.write(content.encode('utf-8'))

c2 = open('guide_utilisation.html', 'rb').read().decode('utf-8', errors='replace')
sys.stdout.write('Taille: ' + str(len(c2)) + '\n')
sys.stdout.write('pwa-guide: ' + str('pwa-guide' in c2) + '\n')
sys.stdout.write('chatbot-guide: ' + str('chatbot-guide' in c2) + '\n')
sys.stdout.write('moteur-ia-guide: ' + str('moteur-ia-guide' in c2) + '\n')
sys.stdout.write('avantages-guide: ' + str('avantages-guide' in c2) + '\n')
sys.stdout.flush()
