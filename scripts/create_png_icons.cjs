const fs = require('fs');
const path = require('path');

// Créer des icônes PNG simples (placeholder)
const sizes = [192, 512];

sizes.forEach(size => {
  // Créer un PNG simple avec un fond bleu et texte
  const canvas = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0D2D52"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="#E8941A"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#080F1A" font-family="Arial, sans-serif" font-weight="bold" font-size="${size/6}">LS</text>
</svg>`;
  
  const svgPath = path.join(__dirname, '..', 'public', 'icons', `icon-${size}.svg`);
  const pngPath = path.join(__dirname, '..', 'public', 'icons', `icon-${size}.png`);
  
  // Écrire le SVG (déjà existant)
  fs.writeFileSync(svgPath, canvas);
  
  console.log(`Icône ${size}x${size} créée: ${svgPath}`);
  console.log(`Note: Les PNG seront générés lors du build Vite PWA`);
});

console.log('\n✅ Icônes PWA créées avec succès!');