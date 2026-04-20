/**
 * ============================================================
 * AGTM LINGUA SPACE — Générateur de logos PNG
 * ============================================================
 * Génère tous les assets PNG nécessaires au projet :
 *   - icon-512.png    → PWA / App Store
 *   - icon-192.png    → PWA Android
 *   - icon-180.png    → Apple Touch Icon (iOS)
 *   - icon-48.png     → Favicon
 *   - favicon.ico     → Favicon navigateur
 *   - logo-main.png   → Logo principal (fond sombre)
 *   - logo-navy.png   → Logo fond navy AGTM
 *   - logo-white.png  → Logo monochrome blanc
 *   - logo-gold.png   → Logo inversé fond or
 *   - logo-navbar.png → Logo compact navbar
 *
 * Installation :
 *   npm install canvas
 *
 * Usage :
 *   node generate-logos.js
 *   Les PNG sont générés dans ./public/icons/
 * ============================================================
 */

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

// ─── Créer le dossier de sortie ────────────────────────────
const OUT = path.join(__dirname, 'public', 'icons')
fs.mkdirSync(OUT, { recursive: true })

// ─── Palette AGTM ──────────────────────────────────────────
const C = {
  navy:    '#0D2D52',
  blue:    '#1B4F8A',
  gold:    '#E8941A',
  goldLt:  '#F5B942',
  dark:    '#080F1A',
  white:   '#FAFAF8',
  muted:   '#8A9AB5',
}

// ─── Utilitaires ───────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function rgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function saveCanvas(canvas, filename) {
  const buffer = canvas.toBuffer('image/png')
  const filepath = path.join(OUT, filename)
  fs.writeFileSync(filepath, buffer)
  console.log(`✅ Généré : ${filepath} (${(buffer.length / 1024).toFixed(1)} KB)`)
}

// ═══════════════════════════════════════════════════════════
// FONCTION PRINCIPALE : dessine l'icône constellation
// ═══════════════════════════════════════════════════════════
function drawConstellationIcon(ctx, cx, cy, radius, options = {}) {
  const {
    bgColor       = C.navy,
    ringColor     = C.blue,
    goldColor     = C.gold,
    goldLtColor   = C.goldLt,
    centerColor   = C.blue,
    centerBorder  = C.gold,
    textColor     = C.gold,
    textColor2    = C.goldLt,
    showText      = true,
    cornerRadius  = 0,
    bgFill        = true,
  } = options

  const nodeRadius  = radius * 0.092
  const centerR     = radius * 0.31
  const orbitR      = radius * 0.83
  const innerGlowR  = radius * 0.52

  // ── Fond carré arrondi (pour les app icons) ──────────────
  if (bgFill) {
    if (cornerRadius > 0) {
      ctx.beginPath()
      ctx.moveTo(cx - radius + cornerRadius, cy - radius)
      ctx.lineTo(cx + radius - cornerRadius, cy - radius)
      ctx.arcTo(cx + radius, cy - radius, cx + radius, cy - radius + cornerRadius, cornerRadius)
      ctx.lineTo(cx + radius, cy + radius - cornerRadius)
      ctx.arcTo(cx + radius, cy + radius, cx + radius - cornerRadius, cy + radius, cornerRadius)
      ctx.lineTo(cx - radius + cornerRadius, cy + radius)
      ctx.arcTo(cx - radius, cy + radius, cx - radius, cy + radius - cornerRadius, cornerRadius)
      ctx.lineTo(cx - radius, cy - radius + cornerRadius)
      ctx.arcTo(cx - radius, cy - radius, cx - radius + cornerRadius, cy - radius, cornerRadius)
      ctx.closePath()
      ctx.fillStyle = bgColor
      ctx.fill()
    } else {
      ctx.fillStyle = bgColor
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
    }
  }

  // ── Cercle orbit externe (pointillé) ─────────────────────
  ctx.beginPath()
  ctx.arc(cx, cy, orbitR, 0, Math.PI * 2)
  ctx.strokeStyle = rgba(ringColor, 0.5)
  ctx.lineWidth = radius * 0.016
  ctx.setLineDash([radius * 0.06, radius * 0.09])
  ctx.stroke()
  ctx.setLineDash([])

  // ── Lueur centrale ────────────────────────────────────────
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerGlowR)
  grd.addColorStop(0, rgba(goldColor, 0.12))
  grd.addColorStop(1, rgba(goldColor, 0))
  ctx.beginPath()
  ctx.arc(cx, cy, innerGlowR, 0, Math.PI * 2)
  ctx.fillStyle = grd
  ctx.fill()

  // ── Positions des 4 nœuds (EN haut, ES droite, FR bas, DE gauche) ──
  const nodes = [
    { lang: 'EN', angle: -Math.PI / 2,      color: goldColor  },
    { lang: 'ES', angle: 0,                   color: goldLtColor },
    { lang: 'FR', angle: Math.PI / 2,         color: goldColor  },
    { lang: 'DE', angle: Math.PI,             color: goldLtColor },
  ].map(n => ({
    ...n,
    x: cx + Math.cos(n.angle) * orbitR,
    y: cy + Math.sin(n.angle) * orbitR,
  }))

  // ── Lignes constellation ──────────────────────────────────
  // Losange EN→ES→FR→DE→EN
  for (let i = 0; i < nodes.length; i++) {
    const from = nodes[i]
    const to   = nodes[(i + 1) % nodes.length]
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.strokeStyle = rgba(goldColor, 0.5)
    ctx.lineWidth = radius * 0.013
    ctx.stroke()
  }
  // Diagonales EN→FR et ES→DE
  ctx.beginPath()
  ctx.moveTo(nodes[0].x, nodes[0].y)
  ctx.lineTo(nodes[2].x, nodes[2].y)
  ctx.strokeStyle = rgba(goldColor, 0.22)
  ctx.lineWidth = radius * 0.009
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(nodes[1].x, nodes[1].y)
  ctx.lineTo(nodes[3].x, nodes[3].y)
  ctx.strokeStyle = rgba(goldColor, 0.22)
  ctx.lineWidth = radius * 0.009
  ctx.stroke()

  // ── Nœuds des 4 langues ───────────────────────────────────
  nodes.forEach(n => {
    // Halo
    ctx.beginPath()
    ctx.arc(n.x, n.y, nodeRadius * 1.8, 0, Math.PI * 2)
    ctx.fillStyle = rgba(n.color, 0.12)
    ctx.fill()
    // Cercle
    ctx.beginPath()
    ctx.arc(n.x, n.y, nodeRadius, 0, Math.PI * 2)
    ctx.fillStyle = bgColor
    ctx.fill()
    ctx.strokeStyle = n.color
    ctx.lineWidth = radius * 0.028
    ctx.stroke()
    // Texte code langue
    if (showText && radius >= 60) {
      ctx.fillStyle = n.color
      ctx.font = `bold ${radius * 0.095}px "Space Mono", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(n.lang, n.x, n.y + radius * 0.005)
    }
  })

  // ── Nœud central ─────────────────────────────────────────
  // Fond du cercle central
  ctx.beginPath()
  ctx.arc(cx, cy, centerR, 0, Math.PI * 2)
  ctx.fillStyle = centerColor
  ctx.fill()
  ctx.strokeStyle = centerBorder
  ctx.lineWidth = radius * 0.022
  ctx.stroke()

  // ── Ondes de parole (3 arcs concentriques) ────────────────
  const waveW  = centerR * 0.75   // largeur zone ondes
  const waveH  = centerR * 0.22   // hauteur d'une onde
  const waveY0 = cy - waveH * 1.5 // Y de la première onde

  for (let i = 0; i < 3; i++) {
    const wy    = waveY0 + i * waveH * 1.15
    const alpha = 1 - i * 0.2
    const col   = i % 2 === 0 ? goldColor : goldLtColor

    ctx.beginPath()
    ctx.moveTo(cx - waveW, wy)
    ctx.quadraticCurveTo(cx, wy - waveH, cx + waveW, wy)
    ctx.quadraticCurveTo(cx, wy + waveH * 0.4, cx - waveW, wy)
    ctx.closePath()
    ctx.fillStyle = rgba(col, alpha)
    ctx.fill()
  }
}

// ═══════════════════════════════════════════════════════════
// GÉNÉRATION DES ICÔNES APP
// ═══════════════════════════════════════════════════════════
function generateIcon(size, filename, cornerRadiusFraction = 0.215) {
  const canvas = createCanvas(size, size)
  const ctx    = canvas.getContext('2d')
  const cx     = size / 2
  const radius = size / 2

  drawConstellationIcon(ctx, cx, cx, radius - 2, {
    cornerRadius: size * cornerRadiusFraction,
    showText: size >= 96,
  })

  saveCanvas(canvas, filename)
  return canvas
}

// ── App icon 512×512 ──────────────────────────────────────
generateIcon(512, 'icon-512.png', 0.22)

// ── App icon 192×192 ──────────────────────────────────────
generateIcon(192, 'icon-192.png', 0.22)

// ── Apple touch icon 180×180 ──────────────────────────────
generateIcon(180, 'apple-touch-icon.png', 0.22)

// ── Favicon 48×48 ────────────────────────────────────────
generateIcon(48, 'icon-48.png', 0.20)

// ── Favicon 32×32 ────────────────────────────────────────
generateIcon(32, 'icon-32.png', 0.18)

// ═══════════════════════════════════════════════════════════
// GÉNÉRATION DU LOGO PRINCIPAL (fond sombre, avec texte)
// ═══════════════════════════════════════════════════════════
function generateLogoMain(bgColor, textColor, subColor, tagColor, filename) {
  const W = 960, H = 300
  const canvas = createCanvas(W, H)
  const ctx    = canvas.getContext('2d')

  // Fond
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, W, H)

  // Icône (centré verticalement à gauche)
  const iconSize = 130
  const iconX    = 40 + iconSize
  const iconY    = H / 2

  drawConstellationIcon(ctx, iconX, iconY, iconSize, {
    bgFill: false,
    bgColor,
    showText: true,
    goldColor: bgColor === C.gold ? C.navy : C.gold,
    goldLtColor: bgColor === C.gold ? C.blue : C.goldLt,
    centerColor: bgColor === C.gold ? C.navy : C.blue,
    centerBorder: bgColor === C.gold ? C.blue : C.gold,
  })

  // Ligne séparatrice verticale
  ctx.strokeStyle = rgba(textColor, 0.15)
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(iconX + iconSize + 35, H * 0.2)
  ctx.lineTo(iconX + iconSize + 35, H * 0.8)
  ctx.stroke()

  const textX = iconX + iconSize + 65

  // LINGUA
  ctx.fillStyle = textColor
  ctx.font = `300 ${H * 0.36}px "Cormorant Garamond", Georgia, serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '8px'
  ctx.fillText('LINGUA', textX, H * 0.54)

  // SPACE
  ctx.fillStyle = subColor
  ctx.font = `400 ${H * 0.14}px "Space Mono", monospace`
  ctx.letterSpacing = '18px'
  ctx.fillText('SPACE', textX + 3, H * 0.75)

  // Tagline
  ctx.fillStyle = rgba(tagColor, 0.55)
  ctx.font = `400 ${H * 0.065}px "Space Mono", monospace`
  ctx.letterSpacing = '6px'
  ctx.fillText('BY AGTM DIGITAL ACADEMY', textX + 3, H * 0.90)

  saveCanvas(canvas, filename)
}

// ── Logo dark ──────────────────────────────────────────────
generateLogoMain(C.dark,  C.white, C.gold,  C.white, 'logo-main.png')

// ── Logo navy ──────────────────────────────────────────────
generateLogoMain(C.navy,  C.white, C.gold,  C.white, 'logo-navy.png')

// ── Logo fond gold ────────────────────────────────────────
generateLogoMain(C.gold,  C.navy,  C.navy,  C.navy,  'logo-gold.png')

// ── Logo fond blanc ───────────────────────────────────────
generateLogoMain('#FAFAF8', C.navy, C.gold, C.navy, 'logo-white.png')

// ═══════════════════════════════════════════════════════════
// LOGO NAVBAR COMPACT
// ═══════════════════════════════════════════════════════════
function generateLogoNavbar(bgColor, textColor, subColor, filename) {
  const W = 520, H = 120
  const canvas = createCanvas(W, H)
  const ctx    = canvas.getContext('2d')

  if (bgColor !== 'transparent') {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, W, H)
  }

  // Mini icône
  const iconR = 46
  drawConstellationIcon(ctx, iconR + 8, H / 2, iconR, {
    bgFill: bgColor !== 'transparent',
    bgColor,
    showText: true,
    goldColor: bgColor === '#FAFAF8' ? C.navy : C.gold,
    goldLtColor: bgColor === '#FAFAF8' ? C.blue : C.goldLt,
    centerColor: bgColor === '#FAFAF8' ? C.blue : C.blue,
    centerBorder: bgColor === '#FAFAF8' ? C.navy : C.gold,
  })

  const textX = iconR * 2 + 26

  // LINGUA
  ctx.fillStyle = textColor
  ctx.font = `300 ${H * 0.45}px "Cormorant Garamond", Georgia, serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('LINGUA', textX, H * 0.62)

  // SPACE
  ctx.fillStyle = subColor
  ctx.font = `400 ${H * 0.175}px "Space Mono", monospace`
  ctx.fillText('SPACE', textX + 2, H * 0.88)

  saveCanvas(canvas, filename)
}

generateLogoNavbar(C.dark,    C.white,   C.gold,  'logo-navbar-dark.png')
generateLogoNavbar(C.navy,    C.white,   C.gold,  'logo-navbar-navy.png')
generateLogoNavbar('#FAFAF8', C.navy,    C.gold,  'logo-navbar-white.png')

// ═══════════════════════════════════════════════════════════
// RÉSUMÉ
// ═══════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════')
console.log('  AGTM LINGUA SPACE — Logos générés')
console.log('══════════════════════════════════════════════')
console.log('\n📱 Icônes PWA :')
console.log('  public/icons/icon-512.png         → PWA / App Store (512×512)')
console.log('  public/icons/icon-192.png         → PWA Android (192×192)')
console.log('  public/icons/apple-touch-icon.png → iOS (180×180)')
console.log('  public/icons/icon-48.png          → Favicon (48×48)')
console.log('  public/icons/icon-32.png          → Favicon (32×32)')
console.log('\n🖼️  Logos :')
console.log('  public/icons/logo-main.png        → Fond sombre (960×300)')
console.log('  public/icons/logo-navy.png        → Fond navy AGTM (960×300)')
console.log('  public/icons/logo-gold.png        → Fond gold inversé (960×300)')
console.log('  public/icons/logo-white.png       → Fond blanc (960×300)')
console.log('  public/icons/logo-navbar-dark.png → Navbar dark (520×120)')
console.log('  public/icons/logo-navbar-navy.png → Navbar navy (520×120)')
console.log('  public/icons/logo-navbar-white.png→ Navbar blanc (520×120)')
console.log('\n📋 Utilisation dans le projet :')
console.log('  vite.config.js → icons: icon-192.png + icon-512.png')
console.log('  index.html     → apple-touch-icon.png + icon-32.png (favicon)')
console.log('  Navbar.jsx     → logo-navbar-dark.png OU SVG inline')
console.log('  Landing.jsx    → logo-main.png OU SVG inline')
console.log('\n✅ Terminé !\n')
