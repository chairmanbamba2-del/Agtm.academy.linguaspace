# Déploiement sur Netlify

## Prérequis
1. Un compte [Netlify](https://netlify.com) (gratuit)
2. Un compte [GitHub](https://github.com) (gratuit)
3. Git installé localement

## Étapes de déploiement

### 1. Créer un dépôt GitHub
```bash
# Créer un nouveau dépôt sur GitHub.com
# Ne pas initialiser avec README, .gitignore, ou licence
```

### 2. Configurer le dépôt distant
```bash
# Ajouter le dépôt distant
git remote add origin https://github.com/[votre-username]/[nom-depot].git

# Pousser le code
git push -u origin master
```

### 3. Déployer sur Netlify
1. **Se connecter** à [app.netlify.com](https://app.netlify.com)
2. Cliquer sur **"Add new site"** → **"Import an existing project"**
3. Choisir **GitHub** et autoriser l'accès
4. Sélectionner votre dépôt
5. **Paramètres de build** (pré-remplis par `netlify.toml`) :
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Cliquer sur **"Deploy site"**

### 4. Variables d'environnement (⚠️ **OBLIGATOIRE** ⚠️)
**L'application échouera avec l'erreur "Variables Supabase manquantes" si ces variables ne sont pas définies.**

Dans les paramètres du site Netlify :
- **Site settings** → **Build & Deploy** → **Environment variables** → **Add variable**
- Ajouter les variables **exactement comme ci-dessous** :
  ```
  VITE_SUPABASE_URL = https://mctcnnmtudksgzuzknjo.supabase.co
  VITE_SUPABASE_ANON_KEY = sb_publishable_Ha62DK2foulS52-zTM-Csg_Sd4_nnL2 
  VITE_APP_ENV = production
  VITE_APP_URL = https://lingua.africaglobaltraining.com
  ```

**Important** : Après avoir ajouté/modifié les variables, **redéployez manuellement** le site :
1. Allez dans **Deploys**
2. Cliquez sur **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Attendez la fin du déploiement (2-3 minutes)

### 5. Domaine personnalisé (optionnel)
- **Site settings** → **Domain management**
- Ajouter un domaine personnalisé (ex: `lingua.africaglobaltraining.com`)
- Configurer les DNS selon les instructions Netlify

## Vérification post-déploiement

### ✅ Page vitrine
- [ ] Accéder à `https://[votre-site].netlify.app`
- [ ] Vérifier que la navbar est fixe et transparente
- [ ] Vérifier que le hero occupe 100% de la hauteur écran
- [ ] Vérifier que les 4 stats sont séparées par des lignes verticales
- [ ] Vérifier que le ticker d'annonces défile
- [ ] Vérifier que les animations fade-in fonctionnent
- [ ] Tester le responsive mobile (burger menu)

### ✅ Espace Marketing
- [ ] Se connecter en tant qu'admin (`/login`)
- [ ] Accéder à `/admin/marketing`
- [ ] Vérifier le téléchargement des PDFs
- [ ] Vérifier l'affichage de la grille tarifaire

### ✅ Fichiers marketing
- [ ] Vérifier l'accès aux PDFs : `https://[votre-site].netlify.app/marketing/2026/agtm-brochure-marketing-2026.pdf`
- [ ] Vérifier l'accès aux images sociales

## Résolution des problèmes courants

### ❌ Build échoue sur Netlify
**Cause possible** : Variables d'environnement manquantes
**Solution** : Ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans les variables d'environnement Netlify

### ❌ Les PDFs ne se téléchargent pas
**Cause possible** : MIME types incorrects
**Solution** : Netlify sert automatiquement les fichiers statiques du dossier `public/`

### ❌ Le site ne se recharge pas correctement (SPA)
**Solution** : La configuration `netlify.toml` inclut déjà les redirects pour le routing SPA

### ❌ Problèmes de CORS avec Supabase
**Solution** : Ajouter l'URL Netlify dans les CORS de Supabase Dashboard :
1. Aller sur [supabase.com/dashboard/project/mctcnnmtudksgzuzknjo/settings/api](https://supabase.com/dashboard)
2. Dans "Site URL", ajouter `https://[votre-site].netlify.app`
3. Sauvegarder

### ✅ ADMIN : Migration déjà exécutée
**Statut** : La migration SQL a été exécutée avec succès le 20/04/2026.
**Compte admin** : `chairmanbamba2@gmail.com` (Issa Bamba) est maintenant `super_admin`.

**Pour vérifier** :
1. Connectez-vous à Supabase Dashboard → Table Editor → `lingua_users`
2. Vérifiez que la colonne `role` existe et que votre compte a `super_admin`

**Pour accéder à l'Espace Admin** :
1. Connectez-vous à l'application avec `chairmanbamba2@gmail.com`
2. Les liens d'administration apparaîtront dans la sidebar (🔧 Administration)
3. L'Espace Marketing est accessible via `/admin/marketing`

### ❌ Build échoue à cause de dépendances
**Solution** : Les versions des dépendances sont maintenant figées pour compatibilité Netlify. 
Si le build échoue toujours, vérifiez les logs Netlify et assurez-vous que :
- Les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont définies
- La commande de build utilise `--legacy-peer-deps` (déjà configuré dans `netlify.toml`)

### ⚠️ Erreur PWA "Download error or resource isn't a valid image"
**Cause** : Les icônes PNG référencées dans le manifeste n'existaient pas.
**Solution appliquée** : Les icônes ont été remplacées par des SVG (supporté par tous les navigateurs modernes).
**Si l'erreur persiste** : Elle est non bloquante et n'empêche pas l'application de fonctionner.

## Configuration avancée

### Déploiement continu
Chaque push sur la branche `master` déclenchera automatiquement un nouveau déploiement.

### Branches de preview
Netlify crée automatiquement des previews pour chaque Pull Request.

### Fonctions Edge (Supabase)
Les fonctions Supabase Edge sont déjà configurées dans `/supabase/functions/` et déployées séparément via Supabase Dashboard.

## Support
- **Netlify Docs** : [docs.netlify.com](https://docs.netlify.com)
- **Supabase Docs** : [supabase.com/docs](https://supabase.com/docs)
- **Contact AGTM** : 
  - ISSA BAMBA : 07 07 96 72 50
  - contact.eipservices@gmail.com

---
**Application prête pour le déploiement**  
*Dernière mise à jour : avril 2026*  
*AGTM Digital Academy · EIP English In Practice*