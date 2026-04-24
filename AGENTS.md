# AGENTS.md — Commandes pour Lingua Space

Ce fichier documente les commandes importantes pour le développement et la maintenance du projet.

## Commandes principales

```bash
# Développement
npm run dev          # Lance le serveur de développement (localhost:5173)
npm run build        # Build de production
npm run preview      # Prévisualisation du build

# Base de données & Supabase
supabase db push     # Pousse les migrations vers Supabase
supabase db status   # Statut des migrations
node scripts/populate_modules.js --dry-run  # Validation des modules
node scripts/populate_modules.js            # Insertion des modules
node scripts/seed_toeic_toefl.js --dry-run  # Seed TOEIC (20) + TOEFL (10) — dry-run
node scripts/seed_toeic_toefl.js            # Seed TOEIC/TOEFL en base Supabase

# Scripts d'automatisation
node scripts/apply_migrations.js           # Applique les migrations SQL
node scripts/check_schema.js               # Vérifie le schéma de la base

# Vérifications
npm run build                             # Vérifie la compilation (pas d'erreurs)
# Pas de lint/typecheck configuré actuellement
```

## Workflow de développement

1. **Modification du Design System** : Éditer `tailwind.config.js` pour les animations
2. **Création de composants UI** : Ajouter dans `src/components/ui/`
3. **Refonte de pages** : Mettre à jour les fichiers dans `src/pages/` avec `MasterCard`
4. **Backend** : Ajouter les migrations dans `supabase/migrations/` et exécuter `supabase db push`
5. **Peuplement de données** : Utiliser `scripts/populate_modules.js`

## Structure des modules

Les modules sont stockés dans `lingua_modules` avec les colonnes :
- `slug` : Identifiant unique généré à partir du titre + niveau
- `xp_reward` : Récompense XP calculée (100 + durée_min * 5)
- `content_text` : Markdown de la leçon
- `transcript` : Lexique pour génération de quiz
- `quiz_json` : Quiz prédéfini au format JSON (optionnel, évite les appels Edge Function)
  - Format : `{ "questions": [ { "id": "q1", "question": "...", "options": [...], "correct": "A", "explanation": "..." } ] }`
  - Priorité dans Module.jsx : `quiz_json` > génération IA > fallback

## Script de peuplement

```bash
# Dry-run
node scripts/populate_modules.js --dry-run

# Insertion avec fichier spécifique
node scripts/populate_modules.js --file scripts/business_english.json

# Insertion avec le fichier par défaut (sample_modules.json)
node scripts/populate_modules.js
```

## Vérifications de qualité

Actuellement, aucun linter ou typecheck n'est configuré. Pour vérifier la qualité du code :
- Exécuter `npm run build` pour détecter les erreurs de compilation
- Vérifier manuellement la conformité au Design System

## Notes importantes

- Les clés d'API Supabase sont dans `.env` (ne jamais committer)
- Le Design System utilise Tailwind CSS avec animations custom
- Les micro-composants IA sont dans `src/components/ui/AIWidgets.jsx`
- Le composant `MasterCard` offre 4 variants : stat, corner, content, action

## Automatisation des tâches

### Expiration automatique des abonnements

La base de données inclut une fonction PostgreSQL `expire_subscriptions()` qui marque comme `expired` les abonnements actifs dont la date d'expiration est dépassée.

**Pour configurer l'exécution automatique quotidienne :**

1. Aller dans le **Supabase Dashboard** > **Database** > **Cron Jobs**
2. Cliquer sur **Add New Cron Job**
3. Remplir les champs :
   - **Schedule** : `0 2 * * *` (tous les jours à 2h du matin)
   - **Command** : `SELECT expire_subscriptions();`
   - **Description** : `Expiration quotidienne des abonnements`
4. Sauvegarder

**Vérification manuelle :** L'interface admin (`/admin/subscribers`) inclut un bouton **Expirer abonnements** pour exécuter la fonction manuellement.

### Génération de rapports hebdomadaires

L'Edge Function `weekly-report` peut être déclenchée manuellement depuis l'interface admin (`/admin/reports` – à implémenter) ou via un cron job.

## Gestion des modèles IA et permissions

### Modèles supportés
- **Anthropic (Claude)** : Sonnet 4.5, Haiku 3, Opus 3
- **Groq (Llama/Mixtral)** : Llama 3.1 70B, Llama 3.2 90B, Mixtral 8x7B, Gemma2 9B
- **DeepSeek** : DeepSeek Chat, DeepSeek Coder

### Configuration
- Fichier de configuration : `src/lib/ai-config.js`
- Edge Function : `lingua-ai-enhanced` (multi-fournisseurs)
- Tables de permissions : `lingua_ai_permissions`, `lingua_ai_global_settings`
- Vue consolidée : `lingua_ai_permissions_view`

### Interface admin
- **Route** : `/admin/ai-permissions`
- **Fonctionnalités** :
  - Ajouter/modifier/supprimer des permissions par utilisateur ou plan
  - Définir les modèles par défaut par type de session
  - Configurer les limites de tokens quotidiennes
  - Activer/désactiver la recherche web (Tavily/Brave)

### Scripts de migration
```bash
# Appliquer les permissions IA
supabase db query --linked -f scripts/apply_ai_permissions.sql

# Vérifier les tables
supabase db query --linked "SELECT * FROM lingua_ai_permissions_view LIMIT 5"
```

### Secrets d'API requis
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set GROQ_API_KEY=gsk_...
supabase secrets set DEEPSEEK_API_KEY=sk-...
supabase secrets set TAVILY_API_KEY=tvly-...
supabase secrets set BRAVE_SEARCH_API_KEY=...
supabase secrets set YOUTUBE_API_KEY=...
```

### Logique de priorité
1. Permissions spécifiques à l'utilisateur
2. Permissions par plan (uni/all_access)
3. Paramètres globaux (`lingua_ai_global_settings`)
4. Configuration statique (`ai-config.js`)

## Documentation Admin

### Fichiers de documentation
- `docs/PRESENTATION_LINGUA_SPACE.md` : Présentation complète de la plateforme
- `docs/GUIDE_ADMIN_LINGUA_SPACE.md` : Guide d'administration détaillé
- `public/docs/` : Copies pour accès frontend

### Interface admin
- **Route** : `/admin/docs`
- **Fonctionnalités** :
  - Visualisation des documents en markdown
  - Génération PDF via impression navigateur
  - Téléchargement des guides complets

### Mise à jour des documents
```bash
# Éditer les fichiers markdown dans docs/
# Les copier vers public/docs pour le frontend
cp docs/*.md public/docs/
```

### Création d'un super admin
```bash
# Utiliser le script avec email, password et nom complet
node scripts/create-admin.js email@exemple.com motdepasse "Nom Complet"

# Exemple
node scripts/create-admin.js admin@lingua.space admin123 "Super Admin"
```

## Prochaines améliorations

1. Ajouter ESLint/Prettier
2. Configurer des tests unitaires
3. ~~Ajouter une colonne `quiz_json` pour les quiz prédéfinis~~ ✅ **FAIT**
4. Générer les 100 modules du plan UNI (anglais A1→C2)
5. Optimiser les performances avec lazy loading
6. ~~Modifier Module.jsx pour utiliser `quiz_json` directement~~ ✅ **FAIT**