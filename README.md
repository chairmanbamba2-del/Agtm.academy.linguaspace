# AGTM LINGUA SPACE

> Programme 100% digital d'apprentissage des langues propulsé par l'IA  
> **lingua.africaglobaltraining.com**

---

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend  | React 18 + Vite + Tailwind CSS |
| PWA       | vite-plugin-pwa (installable Android/iOS) |
| Backend   | Supabase (Auth + PostgreSQL + Storage) |
| IA        | Anthropic Claude API (Sonnet + Opus) |
| Paiement  | CinetPay (Orange Money, Wave, MTN, Carte) |
| Hébergement | Netlify |
| Domaine   | lingua.africaglobaltraining.com |

---

## Structure du projet

```
lingua-space/
├── src/
│   ├── pages/           # Toutes les pages React
│   ├── components/      # Composants réutilisables
│   ├── hooks/           # Hooks personnalisés
│   ├── lib/             # Supabase, Auth, IA, Constantes
│   └── store/           # Zustand (état global)
├── supabase/
│   ├── functions/       # Edge Functions (IA, Paiement)
│   └── migrations/      # Schéma SQL complet
├── public/              # Assets statiques + icons PWA
├── .env.example         # Variables d'environnement
├── vite.config.js       # Config Vite + PWA
├── netlify.toml         # Config déploiement Netlify
└── tailwind.config.js
```

---

## Installation

```bash
# 1. Cloner le repo
git clone https://github.com/AGTM/lingua-space.git
cd lingua-space

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Remplir les valeurs dans .env

# 4. Lancer en développement
npm run dev
```

---

## Dépannage

**Problème** : `Cannot find module 'tailwindcss'` lors du build  
**Solution** : Assurez-vous que les dépendances sont installées avec `npm install --legacy-peer-deps`. Si le chemin du projet contient des espaces, déplacez-le dans un répertoire sans espaces.

**Problème** : Les scripts npm (`npm run dev`) ne trouvent pas `vite`  
**Solution** : Exécutez `node node_modules/vite/bin/vite.js` directement, ou modifiez les scripts dans `package.json` comme déjà fait.

**Problème** : Edge Functions ne se déploient pas  
**Solution** : Vérifiez que la Supabase CLI est installée et que vous êtes connecté avec `supabase login`.

---

## Configuration DNS (obligatoire en premier)

Dans le gestionnaire DNS de `africaglobaltraining.com`, ajouter :

```
Type  : CNAME
Nom   : lingua
Valeur: [nom-du-projet].netlify.app
TTL   : 3600
```

Puis dans Netlify : Domain settings → Add custom domain → `lingua.africaglobaltraining.com`

---

## Base de données Supabase

1. Aller dans **Supabase Dashboard → SQL Editor**
2. Exécuter le fichier `supabase/migrations/001_lingua_schema.sql`
3. Vérifier que les 7 tables sont créées et que RLS est activé

---

## Edge Functions Supabase

Déployer les 5 fonctions :

```bash
# Installer Supabase CLI
npm install -g supabase

# Login
supabase login

# Lier au projet
supabase link --project-ref VOTRE_REF_PROJET

# Déployer toutes les fonctions
supabase functions deploy lingua-ai
supabase functions deploy generate-quiz
supabase functions deploy payment-init
supabase functions deploy payment-webhook
supabase functions deploy weekly-report
```

Configurer les secrets dans Supabase Dashboard → Settings → Edge Functions :

```
ANTHROPIC_API_KEY=sk-ant-...
CINETPAY_API_KEY=...
CINETPAY_SITE_ID=...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
APP_URL=https://lingua.africaglobaltraining.com
```

---

## Variables d'environnement Netlify

Dans Netlify → Site settings → Environment variables :

```
VITE_SUPABASE_URL=https://VOTRE_PROJET.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_ENV=production
VITE_APP_URL=https://lingua.africaglobaltraining.com
```

---

## Déploiement Netlify

1. Pousser le code sur GitHub
2. Connecter le repo à Netlify
3. Build command : `npm run build`
4. Publish directory : `dist`
5. Ajouter les variables d'environnement
6. Déployer

---

## Forfaits

| Plan | Prix | Langues | IA |
|------|------|---------|-----|
| LINGUA UNI | 10 000 FCFA/mois | 1 langue au choix | Claude Sonnet — 30 sessions |
| LINGUA ALL ACCESS | 15 000 FCFA/mois | 4 langues | Claude Opus — Illimité |

---

## Sécurité — Points critiques

- ⚠️ Les clés Claude et CinetPay ne doivent **JAMAIS** être dans le frontend
- Tous les appels IA passent par les **Supabase Edge Functions**
- RLS activé sur toutes les tables — chaque user accède uniquement à ses données
- La clé `VITE_SUPABASE_ANON_KEY` est publique mais protégée par RLS

---

## Cron Job — Expiration des abonnements

Dans Supabase Dashboard → Database → Cron Jobs :
- **Name** : expire-subscriptions
- **Schedule** : `0 2 * * *` (tous les jours à 2h)
- **Command** : `SELECT expire_subscriptions();`

---

*AGTM Digital Academy — Abidjan, Côte d'Ivoire*  
*© 2025 AGTM. Tous droits réservés.*
