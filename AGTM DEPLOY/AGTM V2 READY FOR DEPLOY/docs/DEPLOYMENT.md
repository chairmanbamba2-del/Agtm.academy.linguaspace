# Déploiement AGTM Digital Academy sur Netlify

## 📋 Prérequis
- Compte GitHub avec dépôt: https://github.com/chairmanbamba2-del/agtmdigitaltraining
- Compte Netlify (gratuit) : https://app.netlify.com

## 🚀 Étape 1: Connecter Netlify à GitHub

1. **Connectez-vous à Netlify** : https://app.netlify.com
2. Cliquez sur **"Add new site"** → **"Import an existing project"**
3. Choisissez **"GitHub"** comme fournisseur Git
4. Autorisez Netlify à accéder à votre compte GitHub
5. Sélectionnez le dépôt : **`chairmanbamba2-del/agtmdigitaltraining`**

## ⚙️ Étape 2: Configuration du déploiement

Netlify détectera automatiquement le fichier `netlify.toml` avec cette configuration :

```toml
[build]
  publish = "."  # Dossier racine
  functions = "functions"
```

**Paramètres de build :**
- **Build command** : (laisser vide - site statique)
- **Publish directory** : `.` (racine)
- **Node version** : `18` (configuré automatiquement)

## 🔐 Étape 3: Variables d'environnement (CRITIQUE)

Ajoutez ces variables dans **Site settings → Build & deploy → Environment variables** :

| Variable | Description | Où l'obtenir |
|----------|-------------|--------------|
| `SUPABASE_URL` | URL de votre projet Supabase | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Clé publique anonyme | Supabase Dashboard → Settings → API → `anon` public key |
| `SUPABASE_SERVICE_KEY` | Clé de service (pour cache) | Supabase Dashboard → Settings → API → `service_role` key |
| `ANTHROPIC_API_KEY` | Clé API Claude AI (quiz) | https://console.anthropic.com |
| `YOUTUBE_API_KEY` | Clé API YouTube (vidéos) | Google Cloud Console |
| `LISTEN_NOTES_KEY` | Clé API Listen Notes (podcasts) | https://www.listennotes.com/api |
| `NEWS_API_KEY` | Clé API News (articles) | https://newsapi.org |
| `MERRIAM_WEBSTER_KEY` | Clé API dictionnaire | https://dictionaryapi.com |

**Variables déjà présentes dans le code :**
- `SUPABASE_URL` = `https://fglzovvsyloprokmdadx.supabase.co`
- `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (déjà dans index.html)

## 📁 Étape 4: Structure des fonctions Netlify

Le dossier `netlify/functions/` contient :

1. **`english-corner-api.js`** : API proxy pour YouTube, Claude AI, Listen Notes
2. **`ai-chat.js`** : Assistant IA Claude pour le chatbot
3. **`vitrine-chat.js`** : Chatbot marketing (optionnel)

**Vérification des fonctions :**
- Toutes les fonctions utilisent `require('https')` (pas besoin de dépendances)
- Le fichier `package.json` dans `netlify/functions/` contient `pg` et `rss-parser` (déjà installés)

## 🌐 Étape 5: Déploiement et vérification

1. **Déploiement automatique** : Netlify déploie automatiquement à chaque push sur `main`
2. **URL du site** : `https://agtmdigitaltraining.netlify.app` (ou nom personnalisé)
3. **Vérifications post-déploiement** :

   ```bash
   # 1. Accédez à la vitrine
   https://votre-site.netlify.app/

   # 2. Vérifiez les fonctions API
   https://votre-site.netlify.app/.netlify/functions/english-corner-api?service=youtube

   # 3. Testez l'English Corner (nécessite login)
   https://votre-site.netlify.app/english_corner.html

   # 4. Testez le dashboard marketing
   https://votre-site.netlify.app/dashboard.html?marketing=1
   ```

## 🐛 Résolution des problèmes courants

### Erreur "Function failed during execution"
- Vérifiez que toutes les variables d'environnement sont définies
- Les clés API YouTube/Claude peuvent avoir des quotas dépassés

### Erreur CORS dans le navigateur
- Netlify gère automatiquement les headers CORS via `netlify.toml`
- Vérifiez que la fonction retourne les headers `Access-Control-Allow-Origin: *`

### Videos YouTube ne chargent pas
- Vérifiez que `YOUTUBE_API_KEY` est valide et a les quotas suffisants
- Le site utilise YouTube en embed (pas d'API nécessaire pour la lecture)

### Quiz AI ne se génère pas
- Claude API nécessite une clé valide avec crédits
- Fallback activé : affiche des questions statiques si API échoue

## 🔧 Configuration avancée

### Domaine personnalisé
1. Netlify → Site settings → Domain management
2. Ajoutez votre domaine (ex: `agtm-digital-academy.com`)
3. Suivez les instructions DNS

### HTTPS automatique
- Netlify fournit SSL gratuit via Let's Encrypt
- Activation automatique sous 24h

### Cache Netlify
- Les fichiers statiques sont mis en cache via `Cache-Control` headers
- Les fonctions serverless ont un timeout de 10s par défaut

## 📞 Support

- **Documentation Netlify** : https://docs.netlify.com
- **Dashboard Supabase** : https://app.supabase.com
- **Problèmes GitHub** : https://github.com/chairmanbamba2-del/agtmdigitaltraining/issues

## ✅ Checklist finale

- [ ] Netlify connecté à GitHub
- [ ] Variables d'environnement configurées
- [ ] Premier déploiement réussi
- [ ] Vitrine accessible (`index.html`)
- [ ] Dashboard marketing accessible (`?marketing=1`)
- [ ] Fonctions API répondent (test avec `?service=youtube`)
- [ ] English Corner se charge (redirige vers login si non authentifié)
- [ ] Chatbot marketing fonctionnel
- [ ] Prix dynamiques chargés depuis Supabase
