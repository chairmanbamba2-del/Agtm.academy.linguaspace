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

## Prochaines améliorations

1. Ajouter ESLint/Prettier
2. Configurer des tests unitaires
3. ~~Ajouter une colonne `quiz_json` pour les quiz prédéfinis~~ ✅ **FAIT**
4. Générer les 100 modules du plan UNI (anglais A1→C2)
5. Optimiser les performances avec lazy loading
6. ~~Modifier Module.jsx pour utiliser `quiz_json` directement~~ ✅ **FAIT**