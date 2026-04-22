# Lingua Space — Plateforme d'apprentissage des langues avec IA

## 🚀 Vue d'ensemble

Lingua Space est une application web progressive (PWA) pour l'apprentissage des langues, intégrant des modules structurés, un assistant IA, des quiz adaptatifs et un système de certification.

**Stack technique :**
- **Frontend** : React 18 + Vite + Tailwind CSS
- **Backend** : Supabase (Auth, DB, Edge Functions)
- **State** : Zustand
- **Routing** : React Router 6
- **Animations** : Framer Motion
- **Déploiement** : Netlify (CI/CD)

## 📁 Structure de production

```
lingua-space/
├── src/                    # Code source React
│   ├── components/        # Composants UI réutilisables
│   │   ├── ui/           # Micro‑composants (MasterCard, AIWidgets…)
│   │   ├── layout/       # Layouts d'application
│   │   └── chat/         # Composants de chat IA
│   ├── pages/            # Pages de l'application
│   ├── hooks/            # Hooks personnalisés
│   ├── lib/              # Utilitaires (client Supabase, helpers)
│   ├── store/            # State management (Zustand)
│   └── styles/           # Feuilles de style globales
├── public/               # Assets statiques (icônes, images)
├── assets/               # Assets marketing (PDF, visuels)
├── data/                 # Fichiers de données (modules JSON)
├── scripts/              # Scripts d'automatisation
├── supabase/             # Migrations et configurations Supabase
└── dist/                 # Build de production (généré)
```

## 🔧 Configuration initiale

1. **Cloner le dépôt**
   ```bash
   git clone <repo-url>
   cd lingua-space
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   - Copier `.env.example` vers `.env`
   - Remplir les clés Supabase :
     ```
     VITE_SUPABASE_URL=https://<project>.supabase.co
     VITE_SUPABASE_ANON_KEY=<anon-key>
     SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
     ```

4. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

## 📦 Scripts d'automatisation

### Peuplement des modules
Les modules UNI (229 modules A1→C2) sont stockés dans `data/uni_modules.json`. Pour les insérer en base :

```bash
# Validation du fichier (dry‑run)
node scripts/populate_modules.js --dry-run

# Insertion complète
node scripts/populate_modules.js

# Insertion avec un fichier spécifique
node scripts/populate_modules.js --file data/business_english.json
```

### Génération des quiz
Chaque module nécessite un `quiz_json` (quiz pré‑défini). Deux méthodes :

**1. Génération locale (recommandée)**  
Génère des quiz intelligents basés sur le contenu sans appel API :
```bash
node scripts/generate_quizzes_local.js [--dry-run] [--limit N]
```

**2. Génération via Edge Function**  
Utilise l'IA Claude pour des quiz plus riches (nécessite l'authentification Edge Function) :
```bash
node scripts/generate_all_quizzes.js [--dry-run] [--limit N]
```

**Vérification du format** :
```bash
node scripts/verify_quiz_json.js
```

### Base de données Supabase
```bash
# Appliquer les migrations
supabase db push

# Vérifier l'état
supabase status

# Exécuter un script SQL
supabase db execute --file supabase/migrations/<file>.sql
```

### Marketing
Les assets marketing (PDF, visuels sociaux) sont dans `assets/marketing/`. Pour les déployer sur Netlify :

```bash
node scripts/uploadMarketing.js
```

## 🚀 Déploiement

### Netlify (CI/CD)
- **Site ID** : `29cac5f2‑86d7‑45d1‑b816‑5fec92d4aba1`
- **URL** : https://teal‑semolina‑a2e306.netlify.app
- **Dashboard** : https://app.netlify.com/projects/teal‑semolina‑a2e306

Chaque push sur `master` déclenche un déploiement automatique.

### Supabase
- **Projet ID** : `mctcnnmtudksgzuzknjo`
- **Dashboard** : https://supabase.com/dashboard/project/mctcnnmtudksgzuzknjo

### Domaine personnalisé
Configurer `lingua.africaglobaltraining.com` via le dashboard Netlify (Domain settings).

## 🛠 Commandes de développement

```bash
npm run dev          # Démarre Vite dev server (localhost:5173)
npm run build        # Build de production
npm run preview      # Prévisualisation locale du build
```

## 🧪 Vérifications de qualité

Aucun linter/configuré actuellement. Pour valider le code :
- Exécuter `npm run build` (détecte les erreurs de compilation)
- Vérifier manuellement la conformité au Design System

## 📝 Design System

- **Couleurs** : Navy (#0D2D52), Blue (#1B4F8A), Gold (#E8941A)
- **Typographie** : DM Sans (corps), Cormorant Garamond (titres), Space Mono (badges)
- **Composant principal** : `MasterCard` (variants : stat, corner, content, action)
- **Animations** : définies dans `tailwind.config.js` (custom utilities)

## 🔗 Liens utiles

- **Netlify Dashboard** : https://app.netlify.com/projects/teal‑semolina‑a2e306
- **Supabase Dashboard** : https://supabase.com/dashboard/project/mctcnnmtudksgzuzknjo
- **GitHub Repository** : https://github.com/chairmanbamba2‑del/Agtm.academy.linguaspace
- **Documentation Supabase** : https://supabase.com/docs
- **Documentation Tailwind** : https://tailwindcss.com/docs

## 🆘 Support & dépannage

### Problèmes courants
1. **Build échoue** : Vérifier les variables d'environnement (`.env`)
2. **Quiz non affichés** : Exécuter `generate_quizzes_local.js`
3. **Erreurs Supabase** : Vérifier les politiques RLS (`supabase/migrations/`)
4. **Assets manquants** : Copier les fichiers depuis `assets/` vers `public/` si nécessaire

### Contributions
Les contributions sont les bienvenues. Suivre le workflow Git standard :
1. Fork du dépôt
2. Branche feature (`feat/…`)
3. Commit descriptif
4. Pull request vers `master`

---

**Dernière mise à jour** : avril 2026  
**Version** : 1.0.0  
**Maintenu par** : AGTM Academy