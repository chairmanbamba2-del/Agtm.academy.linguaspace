# AGTM Digital Academy - Plateforme d'apprentissage d'anglais

Plateforme complète d'apprentissage d'anglais avec vitrine marketing dynamique, English Corner interactif, dashboard étudiant et intégrations IA.

## 🎯 Fonctionnalités principales

### 🏠 Vitrine Marketing
- Design responsive avec palette AGTM (navy, gold, white)
- Sections dynamiques : Pourquoi choisir AGTM, Témoignages, Formations
- **Prix en temps réel** via Supabase `marketing_config`
- Chatbot marketing avec simulation IA
- Animations progressives (JavaScript enhancement)

### 🎓 English Corner (EIP English In Practice)
- **794+ vidéos** organisées par niveau (A1 → C2)
- **Quiz IA** générés via Claude AI (Anthropic)
- Grammaire interactive (18 leçons)
- Vocabulaire thématique (140+ mots)
- Ateliers d'écriture avec feedback IA
- Podcasts et compréhension orale
- **Classe virtuelle** en temps réel (Supabase Realtime + Google Meet)

### 📊 Dashboard Étudiant
- Espace personnel avec progression
- Quiz tracking et statistiques
- Accès aux ressources pédagogiques
- Interface rôle-based (étudiant, formateur, admin)

### 🤖 Intégrations IA
- **Claude AI** (Anthropic) : Génération de quiz, feedback écrit
- **YouTube API** : Catalogage de vidéos éducatives
- **Listen Notes** : Podcasts pour la compréhension orale
- **Supabase** : Base de données temps réel et authentification

## 🛠️ Architecture technique

### Frontend
- HTML5, CSS3 avec variables CSS personnalisées
- JavaScript vanilla (ES6+ modules)
- Design system AGTM (`--agtm-navy`, `--agtm-gold`, etc.)
- Progressive enhancement (fonctionne sans JS)

### Backend Serverless
- **Netlify Functions** : API proxy (YouTube, Claude AI, Listen Notes)
- **Supabase** : PostgreSQL + Realtime + Auth
- **Cache** : Supabase tables (24h TTL)

### APIs externes
- YouTube Data API v3
- Claude AI (Anthropic) API
- Listen Notes Podcast API
- Merriam-Webster Dictionary API
- News API

## 📁 Structure du projet

```
WEB_PORTAL AGTM DIGITAL ACADEMY/
├── index.html                    # Vitrine principale
├── english_corner.html          # English Corner (5423 lignes)
├── dashboard.html               # Dashboard étudiant/formateur
├── assistante-ia-chatbot.html   # Interface IA Claude
├── netlify.toml                 # Configuration Netlify
├── netlify/
│   └── functions/
│       ├── english-corner-api.js # API proxy multi-services
│       ├── ai-chat.js           # Assistant IA Claude
│       └── vitrine-chat.js      # Chatbot marketing
├── Contenu Dashboard/
│   ├── Marketing/              # Brochures et visuels
│   ├── AGTM new Design/       # Système de design
│   └── Qontenu pedagogique/   # Ressources pédagogiques
├── Migration SQL Supabase/    # Scripts de migration
└── .gitignore
```

## 🚀 Déploiement rapide

### Option 1 : Netlify + GitHub (Recommandé)
1. **Connectez Netlify à ce dépôt** : https://app.netlify.com
2. **Ajoutez les variables d'environnement** (voir DEPLOYMENT.md)
3. **Déploiement automatique** à chaque push sur `main`

### Option 2 : Déploiement manuel
```bash
# 1. Téléchargez le ZIP
# 2. Upload sur Netlify Drag & Drop
# 3. Configurez les variables d'environnement
```

### Variables d'environnement requises
```bash
SUPABASE_URL=https://fglzovvsyloprokmdadx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=sk-ant-...
YOUTUBE_API_KEY=AIza...
LISTEN_NOTES_KEY=...
```

## 🔧 Développement local

### Prérequis
- Node.js 18+
- Comptes API (YouTube, Claude AI, etc.)

### Installation
```bash
# Clonez le dépôt
git clone https://github.com/chairmanbamba2-del/agtmdigitaltraining

# Accédez au dossier
cd "WEB_PORTAL AGTM DIGITAL ACADEMY"

# Installez les dépendances des fonctions
cd netlify/functions
npm install
```

### Test local avec Netlify CLI
```bash
# Installez Netlify CLI globalement
npm install -g netlify-cli

# Authentifiez-vous
netlify login

# Démarrez le serveur local
netlify dev
```

## 📖 Documentation détaillée

- [DEPLOYMENT.md](DEPLOYMENT.md) - Guide complet de déploiement
- [TEST_INSTRUCTIONS.md](TEST_INSTRUCTIONS.md) - Instructions de test
- [verification-integrations.md](verification-integrations.md) - Vérification des intégrations

## 🧪 Tests à effectuer avant déploiement

1. **Vitrine** : `index.html` - Vérifiez les prix dynamiques
2. **Dashboard marketing** : `dashboard.html?marketing=1`
3. **English Corner** : `english_corner.html` - Quiz IA et vidéos
4. **Fonctions API** : `/.netlify/functions/english-corner-api?service=youtube`
5. **Responsive design** : Mobile, tablette, desktop

## 🔒 Sécurité

- **Authentification** : Supabase Auth avec RLS (Row Level Security)
- **Clés API** : Jamais exposées côté client (uniquement dans Netlify env vars)
- **CORS** : Configuré via `netlify.toml`
- **HTTPS** : Forcé par Netlify

## 📞 Support

- **Issues GitHub** : https://github.com/chairmanbamba2-del/agtmdigitaltraining/issues
- **Documentation Supabase** : https://supabase.com/docs
- **Documentation Netlify** : https://docs.netlify.com

## 📄 Licence

Propriétaire - AGTM Digital Academy © 2026

---

**Dernière mise à jour** : 2026-04-21  
**Version** : 1.0.0  
**Statut** : Prêt pour déploiement de production
