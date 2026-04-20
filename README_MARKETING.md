# Intégration Marketing AGTM Digital Academy

## Mission accomplie

### 1. Espace Marketing (plateforme interne)
- **Page créée** : `/src/pages/admin/Marketing.jsx`
- **Route** : `/admin/marketing` (accessible aux administrateurs uniquement)
- **Lien ajouté** dans la sidebar admin (icône 📢)
- **Contenu intégré** :
  - Section "Brochures PDF" avec aperçu cliquable et boutons de téléchargement
  - Section "Visuels réseaux sociaux" pour AGTM et LINGUA SPACE
  - Section "Grille tarifaire officielle 2026" avec tableau des 6 programmes

### 2. Refonte Page Vitrine
- **Page Landing complètement refondue** : `/src/pages/Landing.jsx`
- **Design system appliqué** :
  - Polices Google Fonts (Cormorant Garamond, DM Sans, Space Mono)
  - Variables CSS étendues (couleurs, bordures)
  - Structure en 9 sections conformes au cahier des charges
- **Fonctionnalités implémentées** :
  - Navbar fixe avec effet glassmorphism
  - Hero plein écran avec grille animée et stats séparées
  - Ticker d'annonces défilantes
  - Sections Technologie & IA, English Corner, 6 Programmes, Espaces Utilisateurs, Modes de Formation
  - CTA final avec contact du Directeur Général ISSA BAMBA
  - Footer complet avec liens
  - Bouton flottant "💬 Parler à un conseiller"
  - Animations fade-in au scroll
  - Responsive mobile (burger menu, adaptations)

### 3. Assets marketing
- **Fichiers copiés** dans `/public/marketing/2026/` pour un accès direct
- **URLs utilisées** : `/marketing/2026/[nom-fichier].pdf/.jpg`
- **Liste des fichiers disponibles** :
  - `agtm-brochure-marketing-2026.pdf` (et hero.jpg)
  - `agtm-visuels-programmes-2026.pdf` (et hero.jpg)
  - `lingua-space-marketing-2026.pdf` (et hero.jpg)
  - 6 visuels réseaux sociaux (Instagram, LinkedIn, Story)

## Prochaines étapes recommandées

### 1. Upload vers Supabase Storage (Optionnel)
Les fichiers sont actuellement servis statiquement depuis le dossier `public/`. Pour une gestion centralisée, vous pouvez les uploader dans un bucket Supabase :

1. **Créer le bucket** `agtm-marketing` (public) dans Supabase Dashboard
2. **Uploader les fichiers** dans le dossier `/2026/`
3. **Récupérer les URLs publiques** et mettre à jour les constantes dans `Marketing.jsx`

Un script d'upload est disponible : `uploadMarketing.js` (nécessite la clé `SUPABASE_SERVICE_ROLE_KEY` dans `.env`).

### 2. Tests de validation
- [ ] Vérifier que la page marketing est accessible aux administrateurs
- [ ] Tester les téléchargements PDF et images
- [ ] Valider la page vitrine sur mobile (375px) et desktop
- [ ] Vérifier les liens externes (Google Meet, africaglobaltraining.com)
- [ ] Confirmer que les animations fonctionnent correctement

### 3. Déploiement
- Exécuter `npm run build` pour vérifier l'absence d'erreurs
- Déployer sur votre hébergement (Netlify, Vercel, etc.)
- Mettre à jour les URLs de production si nécessaire

## Contacts à ne jamais oublier
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

## Fichiers modifiés
- `src/pages/admin/Marketing.jsx` (nouveau)
- `src/pages/Landing.jsx` (refondu)
- `src/App.jsx` (ajout route marketing)
- `src/components/layout/Sidebar.jsx` (ajout lien marketing)
- `src/index.css` (styles étendus)
- `index.html` (polices Google Fonts)
- `public/marketing/2026/` (fichiers assets)

## Notes techniques
- **Stack** : React 18 + Vite + Tailwind CSS
- **Responsive** : Mobile-first avec media queries
- **Animations** : CSS keyframes + Intersection Observer
- **Compatibilité** : Chrome, Firefox, Safari, Edge

---
**Document transmis par Chairman Bamba · AGTM Digital Academy · © 2026**