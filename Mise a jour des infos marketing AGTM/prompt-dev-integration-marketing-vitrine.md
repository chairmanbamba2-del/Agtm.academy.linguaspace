# PROMPT DÉVELOPPEUR
## Mission : Intégration Marketing + Refonte Page Vitrine AGTM Digital Academy
### À transmettre tel quel au développeur

---

## CONTEXTE

Les supports marketing ont été finalisés et validés par le Directeur Général **ISSA BAMBA**. Deux missions sont à réaliser :

1. **Intégrer les fichiers marketing** dans l'Espace Marketing de la plateforme AGTM
2. **Refondre la page vitrine** (`index.html` / page publique) en utilisant le contenu marketing validé

Les fichiers de référence transmis avec ce prompt :
- `agtm-brochure-marketing-2026.html` — brochure principale (référence contenu)
- `agtm-visuels-programmes-2026.html` — 6 fiches programmes
- `lingua-space-marketing-2026.html` — brochure LINGUA SPACE
- Les PDFs correspondants
- Les visuels réseaux sociaux (`social-*.jpg`)

---

## MISSION 1 — ESPACE MARKETING (plateforme interne)

### Objectif
Intégrer tous les fichiers dans le module **Espace Marketing** de la plateforme AGTM (`africaglobaltraining.com`), accessible depuis le menu latéral admin.

### Ce qu'il faut faire

**1.1 — Téléchargements directs**

Dans l'Espace Marketing, créer une section **"Supports de communication"** avec des boutons de téléchargement pour chaque fichier :

```
BROCHURES PDF
├── [⬇ Brochure principale AGTM 2026]     → agtm-brochure-marketing-2026.pdf
├── [⬇ Fiches 6 Programmes 2026]          → agtm-visuels-programmes-2026.pdf
└── [⬇ Brochure LINGUA SPACE 2026]        → lingua-space-marketing-2026.pdf

VISUELS RÉSEAUX SOCIAUX
├── AGTM
│   ├── [⬇ Instagram / Facebook Post]     → social-agtm-instagram-1080x1080.jpg
│   ├── [⬇ Instagram Story]               → social-agtm-story-1080x1920.jpg
│   └── [⬇ LinkedIn / Twitter]            → social-agtm-linkedin-1200x627.jpg
└── LINGUA SPACE
    ├── [⬇ Instagram / Facebook Post]     → social-lingua-instagram-1080x1080.jpg
    ├── [⬇ Instagram Story]               → social-lingua-story-1080x1920.jpg
    └── [⬇ LinkedIn / Twitter]            → social-lingua-linkedin-1200x627.jpg
```

**1.2 — Héberger les fichiers**

Uploader tous les fichiers dans Supabase Storage :
```
Bucket : agtm-marketing (créer si inexistant, Public = OUI)
Dossier : /2026/
```

Puis récupérer les URLs publiques et les insérer dans les boutons de téléchargement.

**1.3 — Aperçu intégré**

Pour chaque PDF, afficher un aperçu cliquable (image `*-hero.jpg`) avant le bouton de téléchargement.

**1.4 — Section "Grille tarifaire"**

Ajouter dans l'Espace Marketing un tableau des tarifs directement visible (sans téléchargement) :

| Programme | Niveaux | Durée | Tarif/mois |
|---|---|---|---|
| Anglais Général | A1→C1 | 3–12 mois | 40 000 FCFA |
| Business English | B1→C1 | 2–6 mois | 50 000 FCFA |
| Préparation TOEIC | B1→B2 | 2–3 mois | 70 000 FCFA |
| Préparation TOEFL | B2→C1 | 3–4 mois | 70 000 FCFA |
| Préparation BAC/BEPC | Collège/Lycée | 1–3 mois | 30 000 FCFA |
| Kids & Teens English | 6–17 ans | Annuel | 25 000 FCFA |

Note : −10% inscription trimestrielle · −20% inscription annuelle

---

## MISSION 2 — REFONTE PAGE VITRINE

### Objectif
Remplacer l'actuelle page vitrine par une version **expressive, professionnelle et percutante** qui reflète le niveau de l'institution. Le design doit s'inspirer directement des maquettes HTML transmises.

### Stack technique à respecter
- HTML / CSS / JavaScript vanilla (pas de framework)
- Compatible mobile first (responsive)
- Pas de dépendance externe sauf Google Fonts et Supabase JS si nécessaire

---

### DESIGN SYSTEM À APPLIQUER

**Polices (Google Fonts — copier dans `<head>`) :**
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,600&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

**Variables CSS (coller dans `:root`) :**
```css
:root {
  --navy:    #0D2D52;
  --blue:    #1B4F8A;
  --gold:    #E8941A;
  --gold-lt: #F5B942;
  --dark:    #080F1A;
  --card:    #132540;
  --bdr:     #1E3A5F;
  --white:   #FAFAF8;
  --muted:   #8A9AB5;
  --green:   #22C55E;
}

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--dark);
  color: var(--white);
  -webkit-font-smoothing: antialiased;
}

/* Titres → Cormorant Garamond (serif) */
h1, h2, h3, .serif { font-family: 'Cormorant Garamond', Georgia, serif; }

/* Labels, badges, codes → Space Mono */
.mono, .badge, .label { font-family: 'Space Mono', monospace; }
```

**Règle typographique :**
- Titres principaux → `Cormorant Garamond` (serif, 300–600)
- Corps de texte → `DM Sans` (sans-serif)
- Labels, prix, codes, badges → `Space Mono` (monospace)
- Accent or → `color: #E8941A` ou `font-style: italic`

---

### STRUCTURE DE LA PAGE VITRINE

La page est découpée en **9 sections dans cet ordre exact** :

---

#### SECTION 1 — NAVBAR fixe

```html
<nav class="navbar">
  <!-- Logo AGTM + nom -->
  <a href="/" class="nav-brand">
    <div class="nav-logo">AG</div>
    <div>
      <span class="brand-name">AGTM Digital Academy</span>
      <span class="brand-sub">EIP English In Practice · Abidjan 🇨🇮</span>
    </div>
  </a>

  <!-- Liens desktop -->
  <ul class="nav-links">
    <li><a href="#formations">Formations</a></li>
    <li><a href="#technologie">Technologie</a></li>
    <li><a href="#corner">English Corner</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>

  <!-- CTA -->
  <a href="/login" class="btn-gold">🔑 Se connecter</a>
</nav>
```

CSS clé :
```css
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 2.5rem;
  background: rgba(8,15,26,0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(232,148,26,0.12);
}
.nav-logo {
  width: 40px; height: 40px; background: #E8941A; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Space Mono', monospace; font-weight: 700; color: #080F1A;
}
.brand-name { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; color: #FAFAF8; }
.brand-sub  { font-family: 'Space Mono', monospace; font-size: .5rem; color: #8A9AB5; letter-spacing: .2em; text-transform: uppercase; }
```

---

#### SECTION 2 — HERO (plein écran, impact maximum)

Contenu :
- Badge pill : `✦ Abidjan, Côte d'Ivoire · Depuis 2020 ✦`
- Label : `AGTM GLOBAL ACADEMY · EIP ENGLISH IN PRACTICE`
- Titre H1 (grand, serif) : `L'anglais qui` + `transforme votre avenir` (en or italique)
- Sous-titre : description courte
- **4 stats séparées par des lignes verticales** : `6 Programmes` | `100 Modules A1→C2` | `2 000+ Ressources/jour` | `5 Espaces dédiés`
- 2 CTA : bouton or `🎓 Séance découverte GRATUITE` + bouton outline `Découvrir la plateforme →`

CSS clé :
```css
.hero {
  min-height: 100vh;
  background: linear-gradient(135deg, #080F1A 0%, #0D2D52 50%, #1B4F8A 100%);
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; padding: 8rem 2rem 4rem;
  position: relative; overflow: hidden;
}
/* Fond grille animée */
.hero::before {
  content: '';
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(232,148,26,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(232,148,26,.04) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: gridMove 20s linear infinite;
}
@keyframes gridMove { 0% { transform: translateY(0); } 100% { transform: translateY(60px); } }

/* Glow radial */
.hero::after {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 65% 55% at 50% 0%, rgba(27,79,138,.35) 0%, transparent 70%);
}

/* H1 */
.hero h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 300; line-height: .95;
  position: relative; z-index: 10;
}
.hero h1 em { color: #E8941A; font-style: italic; display: block; }

/* Stats — IMPORTANT : séparateurs verticaux entre chaque stat */
.hero-stats {
  display: flex; justify-content: center;
  position: relative; z-index: 10;
  margin-top: 2.5rem;
}
.h-stat {
  padding: 1.5rem 3rem; text-align: center; position: relative;
}
.h-stat:not(:last-child)::after {
  content: '';
  position: absolute; right: 0; top: 50%; transform: translateY(-50%);
  height: 48px; width: 1px;
  background: rgba(232,148,26,.3);
}
.h-stat-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 3.5rem; font-weight: 700; color: #E8941A;
  display: block; line-height: 1;
}
.h-stat-lbl {
  font-family: 'Space Mono', monospace;
  font-size: .58rem; letter-spacing: .2em; text-transform: uppercase;
  color: rgba(255,255,255,.4); display: block; margin-top: .5rem;
}
```

---

#### SECTION 3 — BARRE TICKER (annonces défilantes)

```css
.ticker {
  background: rgba(232,148,26,.08);
  border-top: 1px solid rgba(232,148,26,.15);
  border-bottom: 1px solid rgba(232,148,26,.15);
  padding: .45rem 0; overflow: hidden; white-space: nowrap;
}
.ticker-inner {
  display: inline-flex; animation: ticker 20s linear infinite;
}
@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.ticker-item {
  font-family: 'Space Mono', monospace;
  font-size: .62rem; letter-spacing: .15em; color: #E8941A;
  text-transform: uppercase; padding: 0 2.5rem;
}
```

Contenu ticker :
`📚 Inscriptions ouvertes · 📞 Contactez-nous dès aujourd'hui · 🏆 Niveaux A1 → C1 CECRL · 💻 Cours en ligne & présentiel · 🤖 Assistant IA Claude intégré · 🎓 Première séance GRATUITE`

---

#### SECTION 4 — TECHNOLOGIE & IA (fond semi-sombre)

Titre : `La pédagogie réinventée par l'IA`

Présenter **6 cartes** en grille 3×2 :

| Icône | Titre | Description |
|---|---|---|
| 🤖 | Assistant IA Claude 24h/24 | Coach personnel IA avec reconnaissance vocale, correction d'écrits et score de prononciation. 3 tiers : Essentiel, Recommandé, Premium |
| 🎥 | Live Class intégrée | Google Meet synchronisé, quiz formateur en direct, pointage automatique, enregistrement mobile |
| 📊 | Dashboard temps réel | Notes, assiduité, progression, bulletins PDF — visible par l'apprenant et ses parents |
| 📱 | Application PWA mobile | Installable sans App Store sur Android et iPhone. L'académie dans votre poche |
| 📋 | Pointage QR Code | Présences 100% numériques, alertes absences automatiques, zéro papier |
| 📄 | Génération PDF automatique | Certificats, bulletins, contrats, brochures — générés en un clic à en-tête officielle |

CSS pour les cartes :
```css
.inno-card {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 4px; padding: 2rem;
  transition: all .3s;
}
.inno-card:hover {
  border-color: rgba(232,148,26,.3);
  transform: translateY(-4px);
}
/* Ligne or en haut au hover */
.inno-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #E8941A, transparent);
  opacity: 0; transition: opacity .3s;
}
.inno-card:hover::before { opacity: 1; }
```

---

#### SECTION 5 — ENGLISH CORNER (mise en valeur forte)

Titre : `2 000+ ressources renouvelées chaque jour`

Layout 2 colonnes :
- **Gauche** : aperçu visuel du Corner (carte sombre avec les compteurs et les skill chips colorés)
- **Droite** : liste des 5 points forts

Skill chips colorés (conserver les couleurs distinctives) :
```css
.chip-video    { background: rgba(232,148,26,.12); border: 1px solid rgba(232,148,26,.3); color: #E8941A; }
.chip-listen   { background: rgba(20,184,166,.12);  border: 1px solid rgba(20,184,166,.3);  color: #2DD4BF; }
.chip-read     { background: rgba(59,130,246,.12);  border: 1px solid rgba(59,130,246,.3);  color: #93C5FD; }
.chip-grammar  { background: rgba(245,158,11,.12);  border: 1px solid rgba(245,158,11,.3);  color: #FCD34D; }
.chip-vocab    { background: rgba(139,92,246,.12);  border: 1px solid rgba(139,92,246,.3);  color: #A78BFA; }
.chip-writing  { background: rgba(236,72,153,.12);  border: 1px solid rgba(236,72,153,.3);  color: #F9A8D4; }
```

Compteurs affichés :
- **794+** Playlists vidéo
- **2 706** Épisodes audio
- **140+** Thèmes vocabulaire

---

#### SECTION 6 — NOS 6 PROGRAMMES

Titre : `Une formation pour chaque objectif`

6 cartes en grille 3×2 (mobile : 1 colonne) :

Chaque carte contient :
- Icône emoji + Nom du programme + Niveaux CECRL
- Description courte
- Liste de 4 avantages (avec flèches `→` en or)
- Prix mis en évidence + mode (Présentiel / En ligne / Hybride)
- Lien vers Google Meet pour séance découverte

Données des 6 programmes :
```
🌍 Anglais Général      | A1→C1 | 3–12 mois | 40 000 FCFA/mois
💼 Business English     | B1→C1 | 2–6 mois  | 50 000 FCFA/mois
🏆 Préparation TOEIC    | B1→B2 | 2–3 mois  | 70 000 FCFA/mois
🎓 Préparation TOEFL    | B2→C1 | 3–4 mois  | 70 000 FCFA/mois
📚 Préparation BAC/BEPC | Collège/Lycée | 1–3 mois | 30 000 FCFA/mois
⭐ Kids & Teens English  | 6–17 ans | Annuel | 25 000 FCFA/mois
```

Note tarifaire (bloc info en bas) :
`−10% pour les inscriptions trimestrielles · −20% pour les inscriptions annuelles`

---

#### SECTION 7 — ESPACES UTILISATEURS

Titre : `Un compte personnel pour chaque acteur`

4 cartes :
```
👑 Administrateur → Gestion complète : étudiants, finance, RH, paramètres, marketing
👨‍🏫 Formateur     → Planning, présences, rapports PDF, tests, honoraires temps réel
🎓 Apprenant      → Notes, quiz, emploi du temps, English Corner, IA Coach, messagerie
📋 Secrétaire     → Inscriptions, classes, emplois du temps, messagerie administrative
```

---

#### SECTION 8 — MODES DE FORMATION

Titre : `Apprenez selon votre rythme`

4 cartes en grille 2×2 :
```
💻 100% En Ligne   → Cours via Zoom & Google Meet depuis chez vous
🏫 Présentiel      → En classe à Abidjan avec formateurs certifiés
🔄 Hybride         → Combinez en ligne et présentiel selon votre agenda
🤖 IA Coaching     → Pratique 24h/24 avec l'assistant IA Claude
```

---

#### SECTION 9 — CTA FINAL + CONTACT DG

**Bloc CTA :**
```
Titre : Votre première séance est offerte
Sous-titre : 45 minutes avec un formateur certifié + accès à la plateforme + diagnostic de niveau — GRATUIT, sans engagement
CTA 1 (or) : 🎓 Réserver ma séance gratuite → https://meet.google.com/ouv-jemj-kbp
CTA 2 (outline) : Découvrir la plateforme → africaglobaltraining.com
```

**Bloc contact Directeur Général** (visible et bien mis en valeur) :
```
DIRECTEUR GÉNÉRAL
ISSA BAMBA
📞 07 07 96 72 50
✉ contact.eipservices@gmail.com
✉ chairmanbamba2@gmail.com
🌐 africaglobaltraining.com
📍 Abidjan, Côte d'Ivoire 🇨🇮
```

CSS pour ce bloc :
```css
.contact-dg {
  background: rgba(232,148,26,.06);
  border: 1px solid rgba(232,148,26,.2);
  border-radius: 8px; padding: 2rem;
  text-align: center;
}
.contact-dg .dg-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem; color: #FAFAF8;
}
.contact-dg .dg-title {
  font-family: 'Space Mono', monospace;
  font-size: .65rem; letter-spacing: .25em;
  color: #E8941A; text-transform: uppercase;
  margin-bottom: 1rem;
}
.contact-dg .dg-phone {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem; color: #E8941A;
  font-weight: 700;
}
.contact-dg .dg-email {
  font-size: .85rem; color: rgba(255,255,255,.55);
  margin-top: .25rem;
}
```

---

#### FOOTER

```html
<footer>
  <div>
    <div class="footer-brand">AGTM Digital Academy · EIP English In Practice</div>
    <div class="footer-sub">Propriété de ISSA BAMBA · Abidjan, Côte d'Ivoire</div>
  </div>
  <div class="footer-links">
    <a href="#formations">Formations</a>
    <a href="#technologie">Technologie</a>
    <a href="/login">Espace membres</a>
    <a href="https://lingua.africaglobaltraining.com">LINGUA SPACE</a>
  </div>
  <div class="footer-copy">© 2026 · Tous droits réservés</div>
</footer>
```

---

### ANIMATIONS À IMPLÉMENTER

```javascript
// Fade-in au scroll — coller en bas de page
const observer = new IntersectionObserver(entries => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.classList.add('visible')
      observer.unobserve(el.target)
    }
  })
}, { threshold: 0.1 })

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
```

CSS :
```css
.fade-in {
  opacity: 0; transform: translateY(20px);
  transition: opacity .6s ease, transform .6s ease;
}
.fade-in.visible { opacity: 1; transform: translateY(0); }
/* Délais échelonnés */
.fade-in:nth-child(2) { transition-delay: .1s; }
.fade-in:nth-child(3) { transition-delay: .2s; }
.fade-in:nth-child(4) { transition-delay: .3s; }
```

Ajouter la classe `.fade-in` sur :
- Chaque carte programme
- Chaque carte technologie
- Les sections entières (eyebrow + titre)

---

### BOUTON FLOTTANT (fixe en bas à droite)

```html
<a href="https://meet.google.com/ouv-jemj-kbp"
   class="float-cta" title="Parler à un conseiller">
  💬 Parler à un conseiller
</a>
```

```css
.float-cta {
  position: fixed; bottom: 2rem; right: 2rem; z-index: 90;
  background: #E8941A; color: #080F1A;
  padding: .85rem 1.5rem; border-radius: 100px;
  font-family: 'DM Sans', sans-serif;
  font-size: .82rem; font-weight: 700;
  box-shadow: 0 8px 30px rgba(232,148,26,.4);
  text-decoration: none;
  transition: all .3s;
}
.float-cta:hover {
  background: #F5B942;
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(232,148,26,.5);
}
```

---

## NAVIGATION MOBILE

```html
<!-- Burger menu mobile -->
<button class="burger" onclick="toggleMenu()">☰</button>

<!-- Sidebar mobile -->
<div class="mobile-menu" id="mobileMenu">
  <button onclick="closeMenu()">✕</button>
  <nav>
    <a href="#formations" onclick="closeMenu()">Formations</a>
    <a href="#technologie" onclick="closeMenu()">Technologie</a>
    <a href="#corner" onclick="closeMenu()">English Corner</a>
    <a href="#contact" onclick="closeMenu()">Contact</a>
    <a href="/login" class="btn-gold">🔑 Se connecter</a>
  </nav>
</div>
```

```css
@media (max-width: 768px) {
  .nav-links { display: none; }
  .burger { display: block; }

  .hero h1 { font-size: clamp(2.5rem, 10vw, 4rem); }
  .hero-stats { flex-wrap: wrap; }
  .h-stat { padding: 1rem 1.5rem; }
  .h-stat:not(:last-child)::after { display: none; }

  .grid-3 { grid-template-columns: 1fr; }
  .grid-2 { grid-template-columns: 1fr; }
}
```

---

## CHECKLIST DE VALIDATION

Avant livraison, vérifier :

- [ ] La navbar est fixe et transparente avec effet glassmorphism
- [ ] Le hero occupe 100% de la hauteur écran
- [ ] Les **4 stats sont séparées par des lignes verticales** (pas collées ensemble)
- [ ] Les titres utilisent `Cormorant Garamond` (serif)
- [ ] Les labels/badges utilisent `Space Mono` (monospace)
- [ ] Le fond est `#080F1A` (sombre) sur toute la page
- [ ] Les cartes programmes ont le survol avec bordure or
- [ ] Le ticker d'annonces défile en boucle
- [ ] Les animations fade-in fonctionnent au scroll
- [ ] Le bouton flottant `💬 Parler à un conseiller` est visible
- [ ] La section contact DG est visible avec téléphone et emails
- [ ] Le site est responsive mobile (tester sur 375px de large)
- [ ] Les liens Google Meet et africaglobaltraining.com sont corrects
- [ ] Le footer contient ISSA BAMBA + contact + copyright

---

## CONTACTS À NE JAMAIS OUBLIER

```
Directeur Général : ISSA BAMBA
Téléphone        : 07 07 96 72 50
Email 1          : contact.eipservices@gmail.com
Email 2          : chairmanbamba2@gmail.com
Plateforme       : africaglobaltraining.com
LINGUA SPACE     : lingua.africaglobaltraining.com
Google Meet      : meet.google.com/ouv-jemj-kbp
Localisation     : Abidjan, Côte d'Ivoire 🇨🇮
```

---

*Document transmis par Chairman Bamba · AGTM Digital Academy · © 2026*
