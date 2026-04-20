# Déploiement AGTM Lingua Space

## 🌐 **Netlify**
- **Site ID** : `29cac5f2-86d7-45d1-b816-5fec92d4aba1`
- **Nom** : `teal-semolina-a2e306`
- **URL actuelle** : https://teal-semolina-a2e306.netlify.app
- **Dashboard** : https://app.netlify.com/projects/teal-semolina-a2e306

## 🗄️ **Supabase**
- **Projet ID** : `mctcnnmtudksgzuzknjo`
- **URL** : https://mctcnnmtudksgzuzknjo.supabase.co
- **Dashboard** : https://supabase.com/dashboard/project/mctcnnmtudksgzuzknjo
- **Clé Anon (frontend)** : `sb_publishable_Ha62DK2foulS52-zTM-Csg_Sd4_nnL2`

## 🔧 **Configuration terminée**

### ✅ Variables d'environnement Netlify (déjà configurées)
```
VITE_SUPABASE_URL=https://mctcnnmtudksgzuzknjo.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Ha62DK2foulS52-zTM-Csg_Sd4_nnL2
VITE_APP_ENV=production
VITE_APP_URL=https://teal-semolina-a2e306.netlify.app
```

### ✅ Déploiement Supabase
- **Tables** : 6 migrations appliquées (Users, Progress, Subscriptions, Modules, Content, AI Sessions)
- **Fonctions Edge** : 10 fonctions déployées (admin, finance, AI, paiements, certifications, etc.)

## 🎯 **Configuration du domaine personnalisé**

Pour utiliser `lingua.africaglobaltraining.com` :

### 1. Ajouter le domaine dans Netlify
1. Aller sur https://app.netlify.com/projects/teal-semolina-a2e306
2. Cliquer sur **"Domain settings"** dans le menu de gauche
3. Cliquer sur **"Add custom domain"**
4. Entrer `lingua.africaglobaltraining.com`
5. Suivre les instructions de vérification

### 2. Configuration DNS
Ajouter ces enregistrements DNS chez votre fournisseur de domaine (`africaglobaltraining.com`) :

#### Option A : Sous-domaine (recommandé)
```
Type    Nom                          Valeur
----    ---------------------------  ---------------------------------------
A       lingua                       75.2.60.5
CNAME   www.lingua                   teal-semolina-a2e306.netlify.app
```

#### Option B : Configuration Netlify DNS
1. Dans Netlify Domain settings, cliquer sur **"Set up Netlify DNS"**
2. Suivre les instructions pour changer les nameservers

### 3. Mettre à jour l'URL dans Netlify
Après configuration DNS, mettre à jour la variable d'environnement :
```
VITE_APP_URL=https://lingua.africaglobaltraining.com
```

## 🚀 **Déploiement continu (GitHub → Netlify)**

Le projet est configuré pour le déploiement continu :
- **Repo GitHub** : https://github.com/chairmanbamba2-del/Agtm.academy.linguaspace
- **Branch** : `master`
- **Chaque push** déclenche un nouveau déploiement automatique

### Workflow de développement
1. Modifier le code localement
2. `git add .` et `git commit -m "message"`
3. `git push origin master`
4. Netlify build et déploie automatiquement (~2-3 minutes)

## 📱 **PWA (Progressive Web App)**
- ✅ Manifeste configuré (`/manifest.webmanifest`)
- ✅ Service Worker généré automatiquement
- ✅ Balises Apple-specific pour iOS
- ✅ Thème color : `#0D2D52` (bleu marine)
- ✅ Mode `standalone` pour affichage plein écran

## 🔒 **Sécurité**
- **Supabase RLS** : Row Level Security activé sur toutes les tables
- **Clés** : Seule la clé anon (publique) est dans le frontend
- **Headers Netlify** : X-Frame-Options, X-XSS-Protection, etc.
- **HTTPS** : Automatiquement activé sur Netlify

## 📊 **Monitoring**
- **Netlify Analytics** : Dashboard intégré
- **Supabase Logs** : https://supabase.com/dashboard/project/mctcnnmtudksgzuzknjo/logs
- **Fonctions Edge** : Logs disponibles dans le dashboard Supabase

## 🛠️ **Commandes utiles**

### Local development
```bash
npm run dev          # Démarre Vite dev server
npm run build        # Build production
npm run preview      # Preview build local
```

### Déploiement
```bash
# Push vers GitHub (déclenche Netlify)
git push origin master

# Déploiement manuel Netlify
netlify deploy --prod --dir=dist

# Vérifier l'état
netlify status
netlify open         # Ouvrir dashboard
```

### Supabase
```bash
# Déployer migrations
supabase db push

# Déployer fonctions
supabase functions deploy

# Vérifier l'état
supabase status
```

## 🆘 **Support**
- **Netlify Docs** : https://docs.netlify.com
- **Supabase Docs** : https://supabase.com/docs
- **Dashboard Netlify** : https://app.netlify.com/projects/teal-semolina-a2e306
- **Dashboard Supabase** : https://supabase.com/dashboard/project/mctcnnmtudksgzuzknjo