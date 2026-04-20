const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "AGTM LINGUA SPACE — Pitch Investisseurs";
pres.author = "AGTM Digital Academy";

// ─── PALETTE ───────────────────────────────────────────────
const C = {
  navy:     "0D2D52",
  blue:     "1B4F8A",
  gold:     "E8941A",
  goldLt:   "F5B942",
  dark:     "080F1A",
  white:    "FAFAF8",
  muted:    "8A9AB5",
  card:     "132540",
  cardBdr:  "1E3A5F",
  green:    "22C55E",
  light:    "EAF0F8",
  slate:    "94A3B8",
};

// ─── HELPERS ───────────────────────────────────────────────
const makeShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.18 });

function darkSlide(slide) {
  slide.background = { color: C.dark };
}

function addLabel(slide, text, x, y, w) {
  slide.addText(text.toUpperCase(), {
    x, y, w, h: 0.2,
    fontSize: 7, bold: true, charSpacing: 4,
    color: C.gold, fontFace: "Calibri", align: "left",
  });
}

function addCard(slide, x, y, w, h) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: C.card },
    line: { color: C.cardBdr, width: 0.8 },
    shadow: makeShadow(),
  });
}

function goldAccent(slide, x, y, h) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.06, h,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 },
  });
}

// ─── SLIDE 1 : COUVERTURE ──────────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);

  // Background shapes for depth
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: "0A1929" },
    line: { color: "0A1929", width: 0 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: -1.5, y: -1, w: 6, h: 6,
    fill: { color: C.blue, transparency: 82 },
    line: { color: C.blue, width: 0 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 7, y: 2, w: 4, h: 4,
    fill: { color: C.gold, transparency: 90 },
    line: { color: C.gold, width: 0 },
  });

  // Brand
  s.addText("AGTM DIGITAL ACADEMY", {
    x: 1, y: 0.7, w: 8, h: 0.28,
    fontSize: 8, bold: true, charSpacing: 5,
    color: C.muted, fontFace: "Calibri", align: "center",
  });

  // Main title
  s.addText("LINGUA", {
    x: 0.5, y: 1.1, w: 9, h: 1.4,
    fontSize: 88, bold: true, fontFace: "Georgia",
    color: C.white, align: "center",
  });
  s.addText("SPACE", {
    x: 0.5, y: 2.2, w: 9, h: 1.4,
    fontSize: 88, bold: false, fontFace: "Georgia",
    color: C.gold, align: "center", italic: true,
  });

  // Tagline
  s.addText("Apprenez. Pratiquez. Maîtrisez.", {
    x: 1, y: 3.55, w: 8, h: 0.4,
    fontSize: 15, fontFace: "Calibri",
    color: C.muted, align: "center",
  });

  // Lang badges
  const langs = ["🇬🇧 English", "🇪🇸 Español", "🇩🇪 Deutsch", "🇫🇷 Français"];
  langs.forEach((l, i) => {
    const bx = 1.5 + i * 1.85;
    s.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: 4.15, w: 1.65, h: 0.35,
      fill: { color: C.card },
      line: { color: C.cardBdr, width: 0.8 },
    });
    s.addText(l, {
      x: bx, y: 4.15, w: 1.65, h: 0.35,
      fontSize: 8.5, fontFace: "Calibri",
      color: C.white, align: "center", valign: "middle",
    });
  });

  // Bottom line
  s.addText("Pitch Deck Investisseurs · Avril 2025  |  lingua.africaglobaltraining.com", {
    x: 1, y: 5.1, w: 8, h: 0.25,
    fontSize: 7, fontFace: "Calibri", charSpacing: 1,
    color: C.muted, align: "center",
  });
}

// ─── SLIDE 2 : SOMMAIRE ────────────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);

  s.addText("SOMMAIRE", {
    x: 0.6, y: 0.4, w: 4, h: 0.35,
    fontSize: 9, bold: true, charSpacing: 4,
    color: C.gold, fontFace: "Calibri",
  });
  s.addText("Ce que nous allons vous présenter", {
    x: 0.6, y: 0.75, w: 6, h: 0.4,
    fontSize: 22, fontFace: "Georgia", italic: true,
    color: C.white,
  });

  const items = [
    ["01", "Le Problème", "L'accès aux langues en Afrique subsaharienne"],
    ["02", "La Solution", "LINGUA SPACE — Programme 100% digital & IA"],
    ["03", "Le Produit", "Les 4 Corners + 100 modules + Assistant IA"],
    ["04", "Marché & Opportunité", "TAM / SAM / SOM — Afrique francophone"],
    ["05", "Modèle de Revenus", "Abonnements UNI & ALL ACCESS"],
    ["06", "Projections Financières", "Revenus sur 3 ans"],
    ["07", "Roadmap", "MVP → V1 → Scale"],
    ["08", "L'Investissement", "Ce que nous recherchons"],
  ];

  items.forEach(([num, title, sub], i) => {
    const col = i < 4 ? 0 : 1;
    const row = i % 4;
    const x = col === 0 ? 0.6 : 5.3;
    const y = 1.45 + row * 0.95;

    addCard(s, x, y, 4.4, 0.78);
    goldAccent(s, x, y, 0.78);

    s.addText(num, {
      x: x + 0.18, y: y + 0.1, w: 0.5, h: 0.25,
      fontSize: 8, bold: true, charSpacing: 2,
      color: C.gold, fontFace: "Calibri",
    });
    s.addText(title, {
      x: x + 0.18, y: y + 0.3, w: 4, h: 0.22,
      fontSize: 11, bold: true, fontFace: "Calibri",
      color: C.white,
    });
    s.addText(sub, {
      x: x + 0.18, y: y + 0.52, w: 4, h: 0.18,
      fontSize: 8, fontFace: "Calibri",
      color: C.muted,
    });
  });
}

// ─── SLIDE 3 : LE PROBLÈME ─────────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);

  addLabel(s, "01 · Le Problème", 0.6, 0.35, 5);
  s.addText("Un marché linguistique\nmal desservi en Afrique", {
    x: 0.6, y: 0.6, w: 8.5, h: 1.0,
    fontSize: 28, fontFace: "Georgia", italic: false, bold: false,
    color: C.white,
  });

  const problems = [
    { icon: "💰", title: "Coût prohibitif", desc: "Les plateformes internationales (Babbel, Rosetta Stone) sont inaccessibles financièrement pour la majorité des Africains." },
    { icon: "🌍", title: "Pas de contenu africain", desc: "Duolingo et Babbel ignorent les accents, contextes culturels et réalités du quotidien en Afrique subsaharienne." },
    { icon: "📵", title: "Peu adapté mobile", desc: "Les solutions existantes nécessitent une connexion stable et sont pensées pour un marché occidental." },
    { icon: "🤖", title: "Aucune pratique IA réelle", desc: "Pas d'assistant IA multilingue intégré permettant de pratiquer le speaking et le listening en temps réel." },
  ];

  problems.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.6 : 5.3;
    const y = 1.75 + row * 1.55;

    addCard(s, x, y, 4.4, 1.3);
    s.addText(p.icon, {
      x: x + 0.2, y: y + 0.15, w: 0.55, h: 0.55,
      fontSize: 22, fontFace: "Calibri",
    });
    s.addText(p.title, {
      x: x + 0.85, y: y + 0.15, w: 3.35, h: 0.28,
      fontSize: 12, bold: true, fontFace: "Calibri", color: C.gold,
    });
    s.addText(p.desc, {
      x: x + 0.2, y: y + 0.52, w: 4.0, h: 0.65,
      fontSize: 9, fontFace: "Calibri", color: C.muted,
    });
  });
}

// ─── SLIDE 4 : LA SOLUTION ─────────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 4.2, h: 5.625,
    fill: { color: C.navy },
    line: { color: C.navy, width: 0 },
  });

  addLabel(s, "02 · La Solution", 4.4, 0.35, 5);
  s.addText("LINGUA SPACE", {
    x: 4.4, y: 0.6, w: 5.2, h: 0.7,
    fontSize: 32, bold: true, fontFace: "Georgia",
    color: C.gold,
  });
  s.addText("Un programme 100% digital\nd'apprentissage des langues\npropulsé par l'IA.", {
    x: 4.4, y: 1.3, w: 5.0, h: 1.1,
    fontSize: 14, fontFace: "Calibri",
    color: C.white,
  });

  const pillars = [
    "4 langues : Anglais, Espagnol, Allemand, Français",
    "100 modules structurés par langue (A1 → C2)",
    "Flux audio/vidéo + quiz IA automatiques",
    "Assistant IA multilingue Claude Sonnet & Opus",
    "PWA installable — accès mobile sans Play Store",
    "Paiement Mobile Money (Orange, Wave, MTN)",
  ];

  pillars.forEach((p, i) => {
    s.addShape(pres.shapes.OVAL, {
      x: 4.35, y: 2.6 + i * 0.45, w: 0.22, h: 0.22,
      fill: { color: C.gold },
      line: { color: C.gold, width: 0 },
    });
    s.addText(p, {
      x: 4.7, y: 2.58 + i * 0.45, w: 4.9, h: 0.28,
      fontSize: 9.5, fontFace: "Calibri", color: C.white,
    });
  });

  // Left panel content
  s.addText("AGTM\nLINGUA\nSPACE", {
    x: 0.2, y: 1.2, w: 3.8, h: 2.0,
    fontSize: 42, bold: true, fontFace: "Georgia", italic: true,
    color: C.gold, align: "center",
  });

  s.addText("lingua.africaglobaltraining.com", {
    x: 0.2, y: 3.4, w: 3.8, h: 0.3,
    fontSize: 7.5, fontFace: "Calibri",
    color: C.muted, align: "center",
  });

  const langs2 = ["🇬🇧", "🇪🇸", "🇩🇪", "🇫🇷"];
  langs2.forEach((flag, i) => {
    s.addText(flag, {
      x: 0.5 + i * 0.8, y: 3.9, w: 0.7, h: 0.7,
      fontSize: 28, align: "center",
    });
  });
}

// ─── SLIDE 5 : LE PRODUIT — LES CORNERS ───────────────────
{
  const s = pres.addSlide();
  darkSlide(s);

  addLabel(s, "03 · Le Produit", 0.6, 0.35, 5);
  s.addText("Les 4 Language Corners", {
    x: 0.6, y: 0.6, w: 7, h: 0.5,
    fontSize: 26, fontFace: "Georgia", color: C.white,
  });
  s.addText("Chaque Corner = Espace d'immersion | Flux audio/vidéo | Quiz IA | 100 modules A1→C2 | Coach IA", {
    x: 0.6, y: 1.1, w: 8.8, h: 0.3,
    fontSize: 9, fontFace: "Calibri", color: C.muted,
  });

  const corners = [
    { flag: "🇬🇧", name: "English Corner", tag: "British & American English", color: "C8102E",
      items: ["VOA Learning English", "Business & IELTS Prep", "News & Podcasts BBC"] },
    { flag: "🇪🇸", name: "Rincón Español", tag: "Español Internacional", color: "F1BF00",
      items: ["Radio Exterior España", "Espagnol des affaires", "Préparation DELE"] },
    { flag: "🇩🇪", name: "Deutsche Ecke", tag: "Deutsch für alle", color: "94A3B8",
      items: ["Deutsche Welle intégré", "Allemand professionnel", "Goethe / TestDaF"] },
    { flag: "🇫🇷", name: "Espace Francophone", tag: "Francophonie mondiale", color: "4A7FBF",
      items: ["RFI Savoirs & culture", "Français des affaires", "Préparation DELF/DALF"] },
  ];

  corners.forEach((c, i) => {
    const x = 0.6 + i * 2.25;
    addCard(s, x, 1.55, 2.1, 3.75);

    // Top accent
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.55, w: 2.1, h: 0.12,
      fill: { color: c.color },
      line: { color: c.color, width: 0 },
    });

    s.addText(c.flag, {
      x: x + 0.1, y: 1.72, w: 1.9, h: 0.6,
      fontSize: 28, align: "center",
    });
    s.addText(c.name, {
      x: x + 0.1, y: 2.32, w: 1.9, h: 0.35,
      fontSize: 10.5, bold: true, fontFace: "Calibri",
      color: C.white, align: "center",
    });
    s.addText(c.tag, {
      x: x + 0.1, y: 2.65, w: 1.9, h: 0.25,
      fontSize: 7.5, fontFace: "Calibri",
      color: C.muted, align: "center",
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.25, y: 3.0, w: 1.6, h: 0.8,
      fill: { color: "FFFFFF", transparency: 96 },
      line: { color: C.cardBdr, width: 0.5 },
    });

    c.items.forEach((item, j) => {
      s.addText("→  " + item, {
        x: x + 0.15, y: 2.98 + j * 0.27, w: 1.85, h: 0.25,
        fontSize: 7.5, fontFace: "Calibri", color: C.muted,
      });
    });

    s.addText("100 modules A1 → C2", {
      x: x + 0.1, y: 4.9, w: 1.9, h: 0.25,
      fontSize: 7.5, bold: true, fontFace: "Calibri",
      color: C.gold, align: "center",
    });
  });
}

// ─── SLIDE 6 : L'IA AU CŒUR ───────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);

  addLabel(s, "03 · Le Produit — IA Coach", 0.6, 0.35, 6);
  s.addText("L'Assistant IA Multilingue", {
    x: 0.6, y: 0.6, w: 8, h: 0.5,
    fontSize: 26, fontFace: "Georgia", color: C.white,
  });

  // Left: features
  const features = [
    { icon: "🗣️", title: "Speaking & Listening", desc: "Web Speech API → Claude → TTS. L'utilisateur parle, l'IA corrige et répond." },
    { icon: "✏️", title: "Correction bienveillante", desc: "Chaque erreur corrigée avec explication grammaticale adaptée au niveau CEFR." },
    { icon: "🎭", title: "Role Play & Scénarios", desc: "Entretien d'embauche, voyage, business... Simulations de situations réelles." },
    { icon: "🎯", title: "Exam Prep", desc: "Préparation IELTS, DELF, DELE, TestDaF avec feedback détaillé (plan Premium)." },
  ];

  features.forEach((f, i) => {
    addCard(s, 0.6, 1.3 + i * 1.05, 4.5, 0.88);
    goldAccent(s, 0.6, 1.3 + i * 1.05, 0.88);
    s.addText(f.icon, {
      x: 0.75, y: 1.35 + i * 1.05, w: 0.55, h: 0.55,
      fontSize: 20, fontFace: "Calibri",
    });
    s.addText(f.title, {
      x: 1.4, y: 1.35 + i * 1.05, w: 3.5, h: 0.28,
      fontSize: 11, bold: true, fontFace: "Calibri", color: C.gold,
    });
    s.addText(f.desc, {
      x: 1.4, y: 1.63 + i * 1.05, w: 3.5, h: 0.42,
      fontSize: 8.5, fontFace: "Calibri", color: C.muted,
    });
  });

  // Right: model comparison
  addCard(s, 5.3, 1.3, 4.3, 3.95);
  s.addText("Modèles IA selon l'abonnement", {
    x: 5.5, y: 1.45, w: 3.9, h: 0.3,
    fontSize: 10, bold: true, fontFace: "Calibri", color: C.gold,
  });

  // Standard box
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.5, y: 1.9, w: 3.9, h: 1.45,
    fill: { color: "1A3050" },
    line: { color: C.gold, width: 0.8 },
  });
  s.addText("🟡  LINGUA UNI — Standard", {
    x: 5.65, y: 2.0, w: 3.6, h: 0.28,
    fontSize: 10, bold: true, fontFace: "Calibri", color: C.gold,
  });
  s.addText("Claude Sonnet", {
    x: 5.65, y: 2.28, w: 3.6, h: 0.28,
    fontSize: 18, bold: true, fontFace: "Georgia", color: C.white,
  });
  s.addText("30 sessions IA / mois · Free Talk · Business · Travel", {
    x: 5.65, y: 2.58, w: 3.6, h: 0.5,
    fontSize: 8, fontFace: "Calibri", color: C.muted,
  });

  // Premium box
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.5, y: 3.5, w: 3.9, h: 1.45,
    fill: { color: "1B3A6B" },
    line: { color: "93C5FD", width: 0.8 },
  });
  s.addText("🔵  LINGUA ALL ACCESS — Premium", {
    x: 5.65, y: 3.6, w: 3.6, h: 0.28,
    fontSize: 10, bold: true, fontFace: "Calibri", color: "93C5FD",
  });
  s.addText("Claude Opus", {
    x: 5.65, y: 3.88, w: 3.6, h: 0.28,
    fontSize: 18, bold: true, fontFace: "Georgia", color: C.white,
  });
  s.addText("Sessions illimitées · Role Play · Exam Prep · 4 langues", {
    x: 5.65, y: 4.18, w: 3.6, h: 0.5,
    fontSize: 8, fontFace: "Calibri", color: C.muted,
  });
}

// ─── SLIDE 7 : MARCHÉ ─────────────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);

  addLabel(s, "04 · Marché & Opportunité", 0.6, 0.35, 6);
  s.addText("Une opportunité massive\nen Afrique francophone", {
    x: 0.6, y: 0.58, w: 8, h: 0.85,
    fontSize: 24, fontFace: "Georgia", color: C.white,
  });

  // TAM/SAM/SOM concentric circles (via rectangles as visual proxy)
  const circles = [
    { label: "TAM", sub: "Marché total", value: "850M$", desc: "EdTech Afrique subsaharienne", size: 3.5, bg: "1B4F8A" },
    { label: "SAM", sub: "Marché adressable", value: "120M$", desc: "Apprentissage des langues en ligne", size: 2.5, bg: "1B6070" },
    { label: "SOM", sub: "Marché capturable", value: "8M$", desc: "Afrique francophone · CI, SN, CM, BF", size: 1.5, bg: "E8941A" },
  ];

  circles.forEach((c, i) => {
    const cx = 2.8, cy = 2.8;
    const offset = c.size / 2;
    s.addShape(pres.shapes.OVAL, {
      x: cx - offset, y: cy - offset, w: c.size, h: c.size,
      fill: { color: c.bg, transparency: i === 2 ? 10 : 65 },
      line: { color: C.cardBdr, width: 0.8 },
    });
  });

  // Labels for circles
  [
    { x: 0.5, y: 1.7, label: "TAM", value: "850M$", desc: "EdTech Afrique sub-saharienne" },
    { x: 0.5, y: 2.9, label: "SAM", value: "120M$", desc: "Langues en ligne Afrique" },
    { x: 0.5, y: 4.1, label: "SOM", value: "8M$", desc: "Cible initiale CI + voisins" },
  ].forEach(item => {
    s.addShape(pres.shapes.OVAL, {
      x: item.x, y: item.y + 0.05, w: 0.12, h: 0.12,
      fill: { color: C.gold }, line: { color: C.gold, width: 0 },
    });
    s.addText(item.label, {
      x: item.x + 0.2, y: item.y, w: 0.6, h: 0.25,
      fontSize: 9, bold: true, fontFace: "Calibri", color: C.gold,
    });
    s.addText(item.value, {
      x: item.x + 0.2, y: item.y + 0.22, w: 1.0, h: 0.28,
      fontSize: 14, bold: true, fontFace: "Georgia", color: C.white,
    });
    s.addText(item.desc, {
      x: item.x + 0.2, y: item.y + 0.5, w: 1.8, h: 0.22,
      fontSize: 7.5, fontFace: "Calibri", color: C.muted,
    });
  });

  // Right: key stats
  const stats = [
    { val: "700M+", label: "Personnes en Afrique sub-saharienne" },
    { val: "60%", label: "Population de moins de 25 ans" },
    { val: "72M", label: "Apprenants de langues étrangères estimés" },
    { val: "3ème", label: "Région mondiale à la croissance EdTech la plus rapide" },
  ];

  stats.forEach((st, i) => {
    addCard(s, 5.8, 1.45 + i * 1.05, 3.8, 0.85);
    s.addText(st.val, {
      x: 6.0, y: 1.52 + i * 1.05, w: 1.4, h: 0.5,
      fontSize: 26, bold: true, fontFace: "Georgia", color: C.gold,
    });
    s.addText(st.label, {
      x: 7.4, y: 1.58 + i * 1.05, w: 2.0, h: 0.5,
      fontSize: 9, fontFace: "Calibri", color: C.muted, valign: "middle",
    });
  });
}

// ─── SLIDE 8 : ABONNEMENTS ─────────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);

  addLabel(s, "05 · Modèle de Revenus", 0.6, 0.35, 5);
  s.addText("Deux forfaits. Une logique simple.", {
    x: 0.6, y: 0.6, w: 8, h: 0.5,
    fontSize: 26, fontFace: "Georgia", color: C.white,
  });

  // UNI Card
  addCard(s, 0.6, 1.3, 4.2, 3.9);
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 1.3, w: 4.2, h: 0.1,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 },
  });

  s.addText("🟡", { x: 0.8, y: 1.5, w: 0.5, h: 0.45, fontSize: 22 });
  s.addText("LINGUA UNI", {
    x: 1.4, y: 1.52, w: 3, h: 0.35,
    fontSize: 16, bold: true, fontFace: "Calibri", color: C.white,
  });
  s.addText("10 000 FCFA / mois", {
    x: 0.8, y: 1.95, w: 3.8, h: 0.55,
    fontSize: 26, bold: true, fontFace: "Georgia", color: C.gold,
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 2.6, w: 3.8, h: 0.8,
    fill: { color: "FFFFFF", transparency: 96 },
    line: { color: C.cardBdr, width: 0.5 },
  });
  s.addText("1 LANGUE AU CHOIX", {
    x: 0.85, y: 2.65, w: 3.7, h: 0.3,
    fontSize: 9, bold: true, charSpacing: 2, fontFace: "Calibri", color: C.gold,
  });
  s.addText("Anglais OU Espagnol OU Allemand OU Français", {
    x: 0.85, y: 2.9, w: 3.7, h: 0.4,
    fontSize: 8, fontFace: "Calibri", color: C.muted,
  });

  const uniFeats = ["1 Corner (langue choisie)", "100 modules A1 → C2", "Flux audio/vidéo + Quiz IA", "Claude Sonnet — 30 sessions/mois", "Test de niveau inclus"];
  uniFeats.forEach((f, i) => {
    s.addText("✓  " + f, {
      x: 0.85, y: 3.58 + i * 0.33, w: 3.8, h: 0.28,
      fontSize: 9, fontFace: "Calibri", color: C.white,
    });
  });

  // ALL ACCESS Card
  addCard(s, 5.1, 1.3, 4.5, 3.9);
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.3, w: 4.5, h: 0.1,
    fill: { color: "93C5FD" },
    line: { color: "93C5FD", width: 0 },
  });

  s.addText("🔵", { x: 5.3, y: 1.5, w: 0.5, h: 0.45, fontSize: 22 });
  s.addText("LINGUA ALL ACCESS", {
    x: 5.9, y: 1.52, w: 3.5, h: 0.35,
    fontSize: 16, bold: true, fontFace: "Calibri", color: C.white,
  });
  s.addText("15 000 FCFA / mois", {
    x: 5.3, y: 1.95, w: 4.1, h: 0.55,
    fontSize: 26, bold: true, fontFace: "Georgia", color: "93C5FD",
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.3, y: 2.6, w: 4.1, h: 0.8,
    fill: { color: "FFFFFF", transparency: 96 },
    line: { color: C.cardBdr, width: 0.5 },
  });
  s.addText("LES 4 LANGUES INCLUSES", {
    x: 5.35, y: 2.65, w: 4.0, h: 0.3,
    fontSize: 9, bold: true, charSpacing: 2, fontFace: "Calibri", color: "93C5FD",
  });
  s.addText("🇬🇧 Anglais · 🇪🇸 Espagnol · 🇩🇪 Allemand · 🇫🇷 Français", {
    x: 5.35, y: 2.9, w: 4.0, h: 0.4,
    fontSize: 8, fontFace: "Calibri", color: C.muted,
  });

  const allFeats = ["Les 4 Corners inclus", "400 modules A1 → C2 (4 langues)", "Flux illimité + Quiz IA", "Claude Opus — Sessions illimitées", "Role Play & Exam Prep inclus", "Rapport de progression détaillé"];
  allFeats.forEach((f, i) => {
    s.addText("✓  " + f, {
      x: 5.35, y: 3.58 + i * 0.28, w: 4.1, h: 0.26,
      fontSize: 9, fontFace: "Calibri", color: C.white,
    });
  });

  // Payment row
  s.addText("Paiements acceptés :", {
    x: 0.6, y: 5.15, w: 2, h: 0.25,
    fontSize: 8, fontFace: "Calibri", color: C.muted,
  });
  const pays = ["🟠 Orange Money", "🔵 Wave", "🟡 MTN MoMo", "💳 Carte"];
  pays.forEach((p, i) => {
    s.addText(p, {
      x: 2.6 + i * 1.7, y: 5.15, w: 1.6, h: 0.25,
      fontSize: 8, fontFace: "Calibri", color: C.white,
    });
  });
}

// ─── SLIDE 9 : PROJECTIONS FINANCIÈRES ────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);

  addLabel(s, "06 · Projections Financières", 0.6, 0.35, 6);
  s.addText("Revenus prévisionnels — 3 ans", {
    x: 0.6, y: 0.58, w: 7, h: 0.5,
    fontSize: 26, fontFace: "Georgia", color: C.white,
  });

  // Key numbers
  const kpis = [
    { val: "500", label: "Abonnés cible\nAn 1", sub: "" },
    { val: "2 500", label: "Abonnés cible\nAn 2", sub: "" },
    { val: "8 000", label: "Abonnés cible\nAn 3", sub: "" },
  ];

  kpis.forEach((k, i) => {
    addCard(s, 0.6 + i * 3.1, 1.2, 2.8, 1.1);
    goldAccent(s, 0.6 + i * 3.1, 1.2, 1.1);
    s.addText(k.val, {
      x: 0.85 + i * 3.1, y: 1.25, w: 2.3, h: 0.55,
      fontSize: 34, bold: true, fontFace: "Georgia", color: C.gold,
    });
    s.addText(k.label, {
      x: 0.85 + i * 3.1, y: 1.78, w: 2.3, h: 0.42,
      fontSize: 9, fontFace: "Calibri", color: C.muted,
    });
  });

  // Bar chart — Monthly recurring revenue (FCFA millions)
  s.addChart(pres.charts.BAR, [{
    name: "Revenus annuels (FCFA millions)",
    labels: ["An 1", "An 2", "An 3"],
    values: [65, 365, 1120],
  }], {
    x: 0.5, y: 2.5, w: 5.8, h: 2.8,
    barDir: "col",
    barGrouping: "clustered",
    chartColors: [C.gold],
    chartArea: { fill: { color: C.card }, roundedCorners: true },
    catAxisLabelColor: C.muted,
    valAxisLabelColor: C.muted,
    valGridLine: { color: C.cardBdr, size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelPosition: "outEnd",
    dataLabelColor: C.gold,
    dataLabelFontSize: 11,
    showLegend: false,
    valAxisMinVal: 0,
  });

  // Hypothèses
  addCard(s, 6.5, 2.5, 3.1, 2.8);
  s.addText("Hypothèses clés", {
    x: 6.65, y: 2.65, w: 2.8, h: 0.3,
    fontSize: 10, bold: true, fontFace: "Calibri", color: C.gold,
  });

  const hyps = [
    "Mix 60% UNI · 40% ALL ACCESS",
    "ARPU moyen : 12 000 FCFA/mois",
    "Churn mensuel estimé : 8%",
    "Croissance organique + académie AGTM",
    "Marché initial : Côte d'Ivoire",
    "Extension : SN, CM, BF, ML (An 2)",
  ];
  hyps.forEach((h, i) => {
    s.addText("→  " + h, {
      x: 6.65, y: 3.05 + i * 0.38, w: 2.8, h: 0.3,
      fontSize: 8.5, fontFace: "Calibri", color: C.muted,
    });
  });
}

// ─── SLIDE 10 : ARCHITECTURE TECHNIQUE ────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);

  addLabel(s, "07 · Architecture Technique", 0.6, 0.35, 6);
  s.addText("Stack robuste. Évolutive. Sécurisée.", {
    x: 0.6, y: 0.6, w: 8, h: 0.5,
    fontSize: 26, fontFace: "Georgia", color: C.white,
  });

  const stack = [
    { icon: "⚛️", label: "Frontend", tech: "React 18 + Vite", desc: "PWA installable · Mobile-first" },
    { icon: "🗄️", label: "Base de données", tech: "Supabase / PostgreSQL", desc: "Même instance AGTM · Schema lingua_*" },
    { icon: "🤖", label: "Intelligence Artificielle", tech: "Anthropic Claude API", desc: "Sonnet (Standard) · Opus (Premium)" },
    { icon: "💳", label: "Paiement", tech: "CinetPay + Flutterwave", desc: "Orange Money · Wave · MTN · Carte" },
    { icon: "☁️", label: "Hébergement", tech: "Netlify + Cloudflare", desc: "lingua.africaglobaltraining.com" },
    { icon: "🔒", label: "Sécurité", tech: "Row Level Security", desc: "Edge Functions · Clés côté serveur" },
  ];

  stack.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.55 + col * 3.15;
    const y = 1.3 + row * 2.05;

    addCard(s, x, y, 2.9, 1.8);
    s.addText(item.icon, {
      x: x + 0.15, y: y + 0.15, w: 0.55, h: 0.55,
      fontSize: 22,
    });
    s.addText(item.label.toUpperCase(), {
      x: x + 0.15, y: y + 0.75, w: 2.6, h: 0.22,
      fontSize: 6.5, bold: true, charSpacing: 2,
      fontFace: "Calibri", color: C.muted,
    });
    s.addText(item.tech, {
      x: x + 0.15, y: y + 0.95, w: 2.6, h: 0.3,
      fontSize: 11, bold: true, fontFace: "Calibri", color: C.gold,
    });
    s.addText(item.desc, {
      x: x + 0.15, y: y + 1.28, w: 2.6, h: 0.35,
      fontSize: 8, fontFace: "Calibri", color: C.muted,
    });
  });
}

// ─── SLIDE 11 : ROADMAP ────────────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);

  addLabel(s, "07 · Feuille de Route", 0.6, 0.35, 5);
  s.addText("De l'idée au marché en 6 mois", {
    x: 0.6, y: 0.6, w: 7, h: 0.5,
    fontSize: 26, fontFace: "Georgia", color: C.white,
  });

  const phases = [
    {
      phase: "PHASE 1", label: "MVP", duration: "6 semaines",
      color: C.gold,
      items: ["Setup Netlify + DNS sous-domaine", "Supabase : tables + RLS + Edge Functions", "Auth inscription / connexion", "CinetPay : Orange Money & Wave", "English Corner : flux + quiz IA", "Assistant IA Claude Sonnet (Free Talk)", "PWA : manifest + service worker"],
    },
    {
      phase: "PHASE 2", label: "Beta", duration: "4 semaines",
      color: "93C5FD",
      items: ["3 autres Corners (ES, DE, FR)", "100 modules Anglais (10 premiers)", "Système XP + streak + badges", "Rapport hebdo automatique (email)", "50 bêta-testeurs"],
    },
    {
      phase: "PHASE 3", label: "V1 Complète", duration: "8 semaines",
      color: C.green,
      items: ["400 modules (4 langues)", "Mode Opus : Role Play & Exam Prep", "Leaderboard mensuel", "MTN + Flutterwave (carte)", "Dashboard admin", "Extension SN, CM, BF"],
    },
  ];

  phases.forEach((p, i) => {
    const x = 0.55 + i * 3.15;
    addCard(s, x, 1.3, 2.9, 4.0);

    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.3, w: 2.9, h: 0.12,
      fill: { color: p.color },
      line: { color: p.color, width: 0 },
    });

    s.addText(p.phase, {
      x: x + 0.15, y: 1.5, w: 1.5, h: 0.22,
      fontSize: 7.5, bold: true, charSpacing: 2,
      fontFace: "Calibri", color: p.color,
    });
    s.addText(p.label, {
      x: x + 0.15, y: 1.68, w: 2.6, h: 0.38,
      fontSize: 18, bold: true, fontFace: "Georgia", color: C.white,
    });
    s.addText(p.duration, {
      x: x + 0.15, y: 2.05, w: 2.6, h: 0.25,
      fontSize: 8.5, fontFace: "Calibri", color: C.muted,
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.08, y: 2.38, w: 2.74, h: 0.8,
      fill: { color: "FFFFFF", transparency: 97 },
      line: { color: C.cardBdr, width: 0.5 },
    });

    p.items.forEach((item, j) => {
      if (j >= 6) return;
      s.addText("→  " + item, {
        x: x + 0.18, y: 2.42 + j * 0.41, w: 2.6, h: 0.35,
        fontSize: 7.5, fontFace: "Calibri", color: C.muted,
      });
    });
  });
}

// ─── SLIDE 12 : L'INVESTISSEMENT ──────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);

  addLabel(s, "08 · L'Investissement", 0.6, 0.35, 5);
  s.addText("Ce que nous recherchons", {
    x: 0.6, y: 0.6, w: 8, h: 0.5,
    fontSize: 26, fontFace: "Georgia", color: C.white,
  });

  // Left: allocation
  addCard(s, 0.6, 1.3, 4.5, 3.9);
  s.addText("Allocation des fonds", {
    x: 0.8, y: 1.45, w: 4.1, h: 0.3,
    fontSize: 11, bold: true, fontFace: "Calibri", color: C.gold,
  });

  const allocs = [
    { label: "Développement technique", pct: 40, color: C.gold },
    { label: "Contenu & modules (4 langues)", pct: 25, color: "93C5FD" },
    { label: "Marketing & acquisition", pct: 20, color: C.green },
    { label: "Opérations & infrastructure", pct: 15, color: C.muted },
  ];

  allocs.forEach((a, i) => {
    const barW = (a.pct / 100) * 3.6;
    s.addText(a.label, {
      x: 0.8, y: 1.9 + i * 0.78, w: 3.5, h: 0.22,
      fontSize: 9, fontFace: "Calibri", color: C.white,
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 2.13 + i * 0.78, w: 3.6, h: 0.22,
      fill: { color: C.cardBdr },
      line: { color: C.cardBdr, width: 0 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 2.13 + i * 0.78, w: barW, h: 0.22,
      fill: { color: a.color },
      line: { color: a.color, width: 0 },
    });
    s.addText(a.pct + "%", {
      x: 4.45, y: 2.13 + i * 0.78, w: 0.5, h: 0.22,
      fontSize: 9, bold: true, fontFace: "Calibri", color: a.color,
    });
  });

  // Right: what we offer
  addCard(s, 5.3, 1.3, 4.3, 3.9);
  s.addText("Ce que nous offrons", {
    x: 5.5, y: 1.45, w: 3.9, h: 0.3,
    fontSize: 11, bold: true, fontFace: "Calibri", color: C.gold,
  });

  const offers = [
    { icon: "📈", label: "Participation au capital", desc: "Quote-part négociable selon l'apport" },
    { icon: "🏆", label: "Position de pionnier", desc: "Premier acteur IA multilingue en Afrique francophone" },
    { icon: "🔄", label: "Revenus récurrents", desc: "Modèle SaaS : abonnements mensuels prévisibles" },
    { icon: "🌍", label: "Potentiel d'expansion", desc: "15 pays francophones africains à terme" },
    { icon: "🤝", label: "Synergie AGTM", desc: "Base clients existante + marque établie" },
  ];

  offers.forEach((o, i) => {
    s.addText(o.icon, {
      x: 5.45, y: 1.92 + i * 0.72, w: 0.45, h: 0.45,
      fontSize: 18, fontFace: "Calibri",
    });
    s.addText(o.label, {
      x: 6.0, y: 1.92 + i * 0.72, w: 3.4, h: 0.25,
      fontSize: 9.5, bold: true, fontFace: "Calibri", color: C.white,
    });
    s.addText(o.desc, {
      x: 6.0, y: 2.17 + i * 0.72, w: 3.4, h: 0.3,
      fontSize: 8, fontFace: "Calibri", color: C.muted,
    });
  });
}

// ─── SLIDE 13 : CONCLUSION ─────────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: "081525" },
    line: { color: "081525", width: 0 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: -2, y: -1, w: 7, h: 7,
    fill: { color: C.navy, transparency: 70 },
    line: { color: C.navy, width: 0 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 6, y: 1, w: 5, h: 5,
    fill: { color: C.gold, transparency: 88 },
    line: { color: C.gold, width: 0 },
  });

  s.addText("L'Afrique parle le monde.", {
    x: 0.5, y: 0.8, w: 9, h: 1.0,
    fontSize: 44, fontFace: "Georgia", italic: true,
    color: C.gold, align: "center",
  });

  s.addText("AGTM LINGUA SPACE positionne l'AGTM Digital Academy\ncomme le leader de l'apprentissage des langues assisté par IA\nen Afrique francophone.", {
    x: 1, y: 1.95, w: 8, h: 1.0,
    fontSize: 13, fontFace: "Calibri",
    color: C.white, align: "center",
  });

  const bullets = [
    "✦  Marché de 72M+ apprenants potentiels",
    "✦  Technologie IA différenciante (Claude Opus & Sonnet)",
    "✦  Modèle SaaS à revenus récurrents en FCFA",
    "✦  Paiement Mobile Money adapté au marché africain",
  ];
  bullets.forEach((b, i) => {
    s.addText(b, {
      x: 2.5, y: 3.1 + i * 0.33, w: 5, h: 0.28,
      fontSize: 10, fontFace: "Calibri",
      color: C.muted, align: "left",
    });
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 3.2, y: 4.6, w: 3.6, h: 0.6,
    fill: { color: C.gold },
    line: { color: C.gold, width: 0 },
    shadow: makeShadow(),
  });
  s.addText("Rejoignez l'aventure LINGUA SPACE", {
    x: 3.2, y: 4.6, w: 3.6, h: 0.6,
    fontSize: 10, bold: true, fontFace: "Calibri",
    color: C.dark, align: "center", valign: "middle",
  });

  s.addText("lingua.africaglobaltraining.com  ·  AGTM Digital Academy  ·  Abidjan, Côte d'Ivoire", {
    x: 1, y: 5.3, w: 8, h: 0.22,
    fontSize: 7, fontFace: "Calibri", charSpacing: 1,
    color: C.muted, align: "center",
  });
}

// ─── EXPORT ───────────────────────────────────────────────
pres.writeFile({ fileName: "/mnt/user-data/outputs/AGTM_LINGUA_SPACE_Pitch_Investisseurs.pptx" })
  .then(() => console.log("✅ PPTX généré avec succès."))
  .catch(e => console.error("❌ Erreur:", e));
