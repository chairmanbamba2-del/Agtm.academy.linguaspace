# Prochaines étapes pour résoudre l'erreur RLS

## 1. Redémarrer le serveur de développement

Ouvrez un terminal dans le dossier du projet et exécutez :
```bash
npm run dev
```

Le serveur devrait démarrer sur http://localhost:5173

## 2. Exécuter le script SQL de diagnostic dans Supabase

1. Allez sur https://supabase.com/dashboard/project/fglzovvsyloprokmdadx
2. Cliquez sur "SQL Editor" dans le menu de gauche
3. Cliquez sur "New query"
4. Copiez-collez le contenu du fichier `check_current_policies.sql`
5. Exécutez la requête (bouton "Run")

**Partagez les résultats** (capture d'écran ou copiez le tableau) pour que je puisse voir quelles politiques RLS existent.

## 3. Exécuter le script de correction RLS

Dans le même SQL Editor, exécutez le fichier `fix_rls_insert_only.sql`.

Ce script :
- Supprime les politiques INSERT existantes
- Crée une nouvelle politique INSERT qui autorise les utilisateurs authentifiés
- Crée les politiques SELECT/UPDATE/DELETE si elles n'existent pas
- Crée la fonction RPC `create_lingua_user_profile` (bypass RLS)

## 4. Vérifier la configuration CORS dans Supabase

1. Dans le dashboard Supabase, allez dans **Authentication → URL Configuration**
2. Sous "Additional Redirect URLs", ajoutez :
   - `http://localhost:5173`
   - `http://localhost:5173/auth/callback`
3. Sous "Site URL", assurez-vous qu'il y a `http://localhost:5173`
4. Cliquez sur "Save"

## 5. Configurer les secrets Edge Functions (nécessaire pour l'IA)

1. Dans le dashboard Supabase, allez dans **Edge Functions → Secrets**
2. Ajoutez les secrets suivants :
   - `ANTHROPIC_API_KEY` : votre clé API Anthropic (obtenez-la sur console.anthropic.com)
   - `SERVICE_ROLE_KEY` : la clé service role de Supabase (Project Settings → API → `service_role` secret)
   - `RESEND_API_KEY` : (optionnel) pour les emails de rapport
   - `CINETPAY_API_KEY` : (optionnel) pour les paiements
   - `CINETPAY_SITE_ID` : (optionnel) pour les paiements

## 6. Tester l'inscription à nouveau

1. Ouvrez http://localhost:5173 dans votre navigateur
2. Ouvrez la Console DevTools (F12)
3. Allez à la page d'inscription
4. Essayez de créer un compte
5. **Partagez les erreurs** de la console (s'il y en a)

## 7. Déployer les Edge Functions (optionnel pour l'instant)

Si vous voulez tester l'assistant IA et les quiz, vous devez déployer les 5 Edge Functions. Deux options :

### Option A : Avec Supabase CLI (recommandé)
```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Déployer toutes les fonctions
supabase functions deploy lingua-ai --project-ref fglzovvsyloprokmdadx
supabase functions deploy generate-quiz --project-ref fglzovvsyloprokmdadx
supabase functions deploy payment-init --project-ref fglzovvsyloprokmdadx
supabase functions deploy payment-webhook --project-ref fglzovvsyloprokmdadx
supabase functions deploy weekly-report --project-ref fglzovvsyloprokmdadx
```

### Option B : Manuellement via le dashboard
Pour chaque fonction dans `supabase/functions/` :
1. Allez dans **Edge Functions**
2. Cliquez sur "Create new function"
3. Nom : `lingua-ai`
4. Copiez-collez le code de `supabase/functions/lingua-ai/index.ts`
5. Cliquez sur "Deploy"

Répétez pour les 4 autres fonctions.

## Fichiers créés pour vous :

1. `check_current_policies.sql` - Diagnostic des politiques RLS
2. `fix_rls_insert_only.sql` - Correction des politiques INSERT
3. `NEXT_STEPS.md` - Ce fichier

**Commencez par les étapes 1, 2 et 3, puis partagez les résultats.**