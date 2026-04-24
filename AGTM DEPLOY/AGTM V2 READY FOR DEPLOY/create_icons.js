// AGTM Academy — Génération icônes PNG pour PWA desktop
// Usage : node create_icons.js
// Génère : icons/icon-192.png  icons/icon-512.png  icons/icon-maskable-192.png  icons/icon-maskable-512.png

const zlib = require('zlib')
const fs   = require('fs')
const path = require('path')

// ── CRC32 ─────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xff]
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  t.copy(out, 4)
  data.copy(out, 8)
  out.writeUInt32BE(crc32(Buffer.concat([t, data])), 8 + data.length)
  return out
}

// ── Génère un PNG RGBA ─────────────────────────────────────────
function makePNG(size, drawFn) {
  // Pixels RGBA
  const pixels = new Uint8Array(size * size * 4)
  drawFn(pixels, size)

  // Raw scanlines : filtre 0 + RGBA row
  const raw = Buffer.alloc(size * (1 + size * 4))
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0  // filter None
    for (let x = 0; x < size; x++) {
      const pi = (y * size + x) * 4
      const ri = y * (1 + size * 4) + 1 + x * 4
      raw[ri]   = pixels[pi]
      raw[ri+1] = pixels[pi+1]
      raw[ri+2] = pixels[pi+2]
      raw[ri+3] = pixels[pi+3]
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 6   // RGBA

  const idat = zlib.deflateSync(raw, { level: 9 })

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0))
  ])
}

// ── Fonctions de dessin ────────────────────────────────────────
// Couleurs AGTM
const NAVY  = [0x0D, 0x1B, 0x2A, 255]  // #0D1B2A
const GOLD  = [0xC8, 0x96, 0x0C, 255]  // #C8960C
const GOLDL = [0xE8, 0xB8, 0x4B, 255]  // #E8B84B (gold clair)
const WHITE = [0xFF, 0xFF, 0xFF, 255]
const TRANS = [0, 0, 0, 0]

function setPixel(pixels, size, x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) return
  const i = (y * size + x) * 4
  pixels[i]   = color[0]
  pixels[i+1] = color[1]
  pixels[i+2] = color[2]
  pixels[i+3] = color[3]
}

function fillRect(pixels, size, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++)
      setPixel(pixels, size, x, y, color)
}

function fillRoundRect(pixels, size, x0, y0, w, h, r, color) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      // Coins arrondis
      const inCorner = (
        (x < x0 + r && y < y0 + r && Math.hypot(x - (x0+r), y - (y0+r)) > r) ||
        (x >= x0+w-r && y < y0+r   && Math.hypot(x - (x0+w-r-1), y - (y0+r)) > r) ||
        (x < x0+r   && y >= y0+h-r && Math.hypot(x - (x0+r), y - (y0+h-r-1)) > r) ||
        (x >= x0+w-r && y >= y0+h-r && Math.hypot(x - (x0+w-r-1), y - (y0+h-r-1)) > r)
      )
      if (!inCorner) setPixel(pixels, size, x, y, color)
    }
  }
}

// Dessine la lettre "A" en pixels bitmap (grille 5x7 → scalée)
const LETTER_A = [
  [0,0,1,0,0],
  [0,1,0,1,0],
  [1,0,0,0,1],
  [1,1,1,1,1],
  [1,0,0,0,1],
  [1,0,0,0,1],
  [1,0,0,0,1],
]

function drawLetterA(pixels, size, cx, cy, cellSize, color) {
  const cols = 5, rows = 7
  const ox = cx - Math.floor(cols * cellSize / 2)
  const oy = cy - Math.floor(rows * cellSize / 2)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (LETTER_A[r][c]) {
        fillRect(pixels, size, ox + c * cellSize, oy + r * cellSize, cellSize, cellSize, color)
      }
    }
  }
}

// ── Icône principale (fond navy, badge gold arrondi, "A" blanc) ──
function drawIcon(pixels, size, maskable) {
  const pad = maskable ? 0 : 0  // maskable → fond plein jusqu'aux bords
  // Fond transparent ou navy selon type
  fillRect(pixels, size, 0, 0, size, size, maskable ? NAVY : TRANS)

  if (!maskable) {
    // Fond navy avec coins arrondis
    const r = Math.round(size * 0.18)
    fillRoundRect(pixels, size, 0, 0, size, size, r, NAVY)
  }

  // Badge gold centré
  const badgeSize = Math.round(size * 0.62)
  const badgeX = Math.round((size - badgeSize) / 2)
  const badgeY = Math.round((size - badgeSize) / 2)
  const badgeR = Math.round(badgeSize * 0.22)
  fillRoundRect(pixels, size, badgeX, badgeY, badgeSize, badgeSize, badgeR, GOLD)

  // Lettre A en blanc au centre
  const cellSize = Math.max(1, Math.round(size * 0.07))
  drawLetterA(pixels, size, size / 2, size / 2, cellSize, WHITE)
}

// ── Génération ────────────────────────────────────────────────
const outDir = path.join(__dirname, 'icons')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)

const icons = [
  { file: 'icon-192.png',          size: 192, maskable: false },
  { file: 'icon-512.png',          size: 512, maskable: false },
  { file: 'icon-maskable-192.png', size: 192, maskable: true  },
  { file: 'icon-maskable-512.png', size: 512, maskable: true  },
]

for (const { file, size, maskable } of icons) {
  const png = makePNG(size, (p, s) => drawIcon(p, s, maskable))
  fs.writeFileSync(path.join(outDir, file), png)
  console.log(`✅ icons/${file}  (${size}×${size})`)
}

console.log('\n✅ Icônes PNG générées avec succès !')
