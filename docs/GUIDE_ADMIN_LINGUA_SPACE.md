# Guide d'Administration LINGUA SPACE

## Introduction

Ce guide décrit l'ensemble des fonctionnalités d'administration de la plateforme LINGUA SPACE. Il est destiné aux administrateurs et super-administrateurs chargés de gérer la plateforme, les utilisateurs, les abonnements, les permissions IA et la comptabilité.

**Accès admin** : `/admin` (nécessite un compte avec rôle `admin` ou `super_admin`)

---

## Table des Matières

1. [Tableau de Bord Admin](#tableau-de-dash-admin)
2. [Gestion des Utilisateurs](#gestion-des-utilisateurs)
3. [Gestion des Abonnements](#gestion-des-abonnements)
4. [Permissions IA](#permissions-ia)
5. [Finance & Comptabilité](#finance--comptabilité)
6. [Marketing & Communications](#marketing--communications)
7. [Certifications & Tests](#certifications--tests)
8. [Configuration Système](#configuration-système)
9. [Dépannage](#dépannage)
10. [Sécurité](#sécurité)

---

## Tableau de Dash Admin

### Accès
- **URL** : `https://votre-domaine.space/admin`
- **Authentification** : Connexion avec un compte ayant le rôle `admin` ou `super_admin`
- **Sécurité** : Vérification automatique des permissions via RLS

### KPIs (Indicateurs Clés)
- **Abonnés actifs** : Nombre d'abonnements avec statut `active`
- **Tests passés** : Nombre total de tests de niveau complétés
- **Certificats émis** : Nombre de certificats générés
- **Recettes du mois** : Somme des transactions `income` du mois en cours

### Modules Admin
1. **Finance & Comptabilité** : Gestion des transactions, reçus, exports CSV
2. **Gestion abonnés** : Abonnements actifs, résiliations, historique
3. **Permissions IA** : Contrôle d'accès aux modèles IA
4. **Gestion utilisateurs** : Création, suspension, réactivation
5. **Marketing** : Campagnes, promotions, communications
6. **Rapport hebdomadaire** : Déclenchement des emails de rapport

---

## Gestion des Utilisateurs

### Liste des Utilisateurs
- **Accès** : `/admin/users`
- **Fonctionnalités** :
  - Voir tous les utilisateurs inscrits
  - Filtrer par rôle, statut, date
  - Rechercher par email ou nom
  - Pagination (20 utilisateurs/page)

### Création d'Utilisateur
1. **Formulaire manuel** :
   - Email (obligatoire)
   - Mot de passe (obligatoire)
   - Nom complet
   - Téléphone
   - Pays (défaut : CI)
   - Rôle (user, admin, super_admin)

2. **Création avec abonnement** :
   - Sélectionner un plan (UNI ou All Access)
   - Choisir la langue (pour UNI)
   - Définir la durée (1 mois, 3 mois, 12 mois)
   - Paiement manuel (sans transaction réelle)

### Actions sur Utilisateur
- **Suspension** : Désactive le compte (ne supprime pas les données)
- **Réactivation** : Rétablit l'accès
- **Changement de rôle** : user ↔ admin ↔ super_admin
- **Réinitialisation mot de passe** : Via email automatique

### Données Utilisateur
- **Profil** : Informations de base, photo, préférences
- **Progression** : Niveau par langue, XP, badges
- **Activité** : Dernière connexion, sessions IA, modules complétés
- **Abonnements** : Historique des abonnements

---

## Gestion des Abonnements

### Liste des Abonnements
- **Accès** : `/admin/subscribers`
- **Fonctionnalités** :
  - Voir tous les abonnements (actifs, expirés, en attente)
  - Filtrer par plan, statut, date d'expiration
  - Rechercher par email utilisateur
  - Tri par date de création/expiration

### Création d'Abonnement
1. **Sélection utilisateur** : Choisir parmi les utilisateurs existants
2. **Configuration** :
   - Plan : UNI (1 langue) ou All Access (toutes langues)
   - Langue : Pour UNI seulement (en, fr, es, de)
   - Durée : 1 à 12 mois
   - Montant : 15 000 FCFA (UNI) ou 25 000 FCFA (All Access)
   - Méthode de paiement : Manuel (admin), Orange Money, Wave, MTN, carte
3. **Validation** :
   - Vérifier la cohérence plan/langue
   - Générer un numéro de référence
   - Créer la transaction associée

### Actions sur Abonnement
- **Renouvellement** : Extension de la durée
- **Mise à niveau** : UNI → All Access
- **Rétrogradation** : All Access → UNI (avec ajustement financier)
- **Résiliation** : Fin anticipée avec ou sans remboursement
- **Expiration manuelle** : Marquer comme expiré immédiatement

### Expiration Automatique
- **Fonction PostgreSQL** : `expire_subscriptions()`
- **Cron Job** : Exécution quotidienne à 2h du matin
- **Configuration** :
  ```sql
  -- Dans Supabase Dashboard > Database > Cron Jobs
  Schedule: 0 2 * * *
  Command: SELECT expire_subscriptions();
  ```

### Abonnements en Attente
- **Paiement en attente** : Transaction non confirmée
- **Actions** :
  - Relancer l'utilisateur
  - Annuler après X jours
  - Convertir en abonnement manuel

---

## Permissions IA

### Présentation
Le système de permissions IA permet de contrôler finement quels modèles d'IA sont accessibles à quels utilisateurs, avec quelles limites.

### Accès
- **URL** : `/admin/ai-permissions`
- **Onglets** :
  1. **Permissions** : Gestion des permissions par utilisateur/plan
  2. **Paramètres globaux** : Configuration système
  3. **Statistiques** : Utilisation des modèles IA

### Fournisseurs IA Supportés
1. **Anthropic (Claude)**
   - `claude-sonnet-4-5` : Équilibre performance/coût
   - `claude-haiku-3` : Rapide et économique
   - `claude-opus-3` : Plus puissant, plus cher

2. **Groq (Llama/Mixtral)**
   - `llama-3.1-70b-versatile` : Puissant et rapide
   - `llama-3.2-90b-vision-preview` : Vision + texte
   - `mixtral-8x7b-32768` : Expert mixture
   - `gemma2-9b-it` : Léger et efficace

3. **DeepSeek**
   - `deepseek-chat` : Modèle principal
   - `deepseek-coder` : Spécialisé code

### Types de Permissions
1. **Utilisateur spécifique** : Appliqué à un utilisateur particulier
2. **Plan spécifique** : Appliqué à tous les utilisateurs d'un plan (UNI/All Access)
3. **Utilisateur + Plan** : Combinaison des deux (prioritaire)

### Ajout d'une Permission
1. **Cible** :
   - Utilisateur (optionnel) : Sélectionner dans la liste
   - Plan (optionnel) : UNI ou All Access
   *Note* : Au moins un des deux doit être sélectionné

2. **Configuration IA** :
   - Fournisseur : Anthropic, Groq ou DeepSeek
   - Modèle : Choisir parmi les modèles du fournisseur
   - Accès autorisé : ✓ pour autoriser, ✗ pour bloquer
   - Modèle par défaut : ★ Ce modèle sera utilisé par défaut

3. **Limites** :
   - Tokens/jour : Limite quotidienne (ex: 10 000)
   - Priorité : 1-100 (plus bas = plus prioritaire)

### Paramètres Globaux
- **Modèles par défaut** :
  - Fournisseur par défaut : `anthropic`
  - Modèle par défaut : `claude-sonnet-4-5`
  - Par type de session : free_talk, business, grammar, research

- **Limites** :
  - Tokens/jour (Free) : 10 000
  - Tokens/jour (Premium) : 50 000

- **Recherche web** :
  - Activée : `true`/`false`
  - Fournisseur : `tavily` ou `brave`

### Logique de Priorité
1. **Permissions utilisateur** (priorité haute)
2. **Permissions plan** (priorité moyenne)
3. **Paramètres globaux** (priorité basse)
4. **Configuration statique** (`ai-config.js`) (fallback)

### Surveillance d'Utilisation
- **Sessions IA** : Table `lingua_ai_sessions`
- **Métriques** :
  - Tokens utilisés (input/output)
  - Modèle utilisé
  - Durée de la session
  - Recherche web utilisée
- **Alertes** : Dépassement des limites quotidiennes

---

## Finance & Comptabilité

### Transactions
- **Accès** : `/admin/finance`
- **Types** :
  - `income` : Recettes (abonnements)
  - `expense` : Dépenses (frais, salaires)
  - `refund` : Remboursements
  - `adjustment` : Ajustements comptables

### Ajout de Transaction Manuelle
1. **Utilisateur** : Lier à un utilisateur (optionnel)
2. **Détails** :
   - Type : income, expense, refund, adjustment
   - Catégorie : subscription, salary, marketing, other
   - Montant (FCFA) : Positif pour income, négatif pour expense
   - Description : Détails de la transaction
   - Date : Date de la transaction
3. **Référence** :
   - Numéro de reçu auto-généré
   - Référence externe (optionnel)

### Reçus
- **Génération automatique** : Pour chaque transaction `income`
- **Format** : PDF avec logo et détails
- **Envoi** : Email automatique à l'utilisateur
- **Téléchargement** : Depuis l'interface admin ou utilisateur

### Exports
- **CSV** : Toutes les transactions (filtrables par date)
- **Excel** : Rapport mensuel formaté
- **PDF** : Rapport financier mensuel

### Rapports
- **Mensuel** : Recettes, dépenses, bénéfice
- **Par plan** : Répartition UNI vs All Access
- **Par langue** : Popularité des langues
- **Par méthode de paiement** : Mobile Money vs cartes

---

## Marketing & Communications

### Campagnes
- **Email** : Newsletter, promotions, rappels
- **Notifications in-app** : Nouvelles fonctionnalités, événements
- **SMS** : Pour les utilisateurs avec téléphone

### Promotions
- **Codes promo** : Réduction en pourcentage ou montant fixe
- **Offres limitées** : Black Friday, rentrée scolaire
- **Parrainage** : Système de recommandation

### Analytics
- **Acquisition** : Source des nouveaux utilisateurs
- **Rétention** : Taux de renouvellement
- **Engagement** : Temps moyen sur la plateforme
- **Conversion** : Taux d'inscription → abonnement

---

## Certifications & Tests

### Tests de Niveau
- **Génération** : IA crée des tests adaptés au niveau
- **Correction** : Automatique avec feedback détaillé
- **Historique** : Tous les tests passés par utilisateur

### Certificats
- **Génération** : PDF personnalisé avec nom, niveau, date
- **Vérification** : Code unique accessible via `/verify/:code`
- **Statistiques** : Nombre de certificats par niveau/langue

### Préparation aux Examens
- **Contenu spécifique** : IELTS, TOEFL, DELF, DALF, DELE, Goethe
- **Simulations** : Tests blancs avec conditions réelles
- **Feedback** : Points forts/faibles avec recommandations

---

## Configuration Système

### Variables d'Environnement
- **Frontend** (`.env`) :
  ```
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_ANON_KEY=sb_publishable_xxx
  VITE_APP_ENV=development|production
  VITE_APP_URL=http://localhost:5173|https://votre-domaine.space
  VITE_YOUTUBE_API_KEY=xxx
  ```

- **Backend** (Supabase Secrets) :
  ```
  ANTHROPIC_API_KEY=sk-ant-xxx
  GROQ_API_KEY=gsk_xxx
  DEEPSEEK_API_KEY=sk-xxx
  TAVILY_API_KEY=tvly-xxx
  BRAVE_SEARCH_API_KEY=xxx
  CINETPAY_API_KEY=xxx
  CINETPAY_SITE_ID=xxx
  SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
  ```

### Base de Données
- **Migrations** : `supabase/migrations/*.sql`
- **Application** : `supabase db push`
- **Vérification** : `supabase db status`

### Edge Functions
- **Liste** : `supabase functions list`
- **Déploiement** : `supabase functions deploy <name>`
- **Logs** : Supabase Dashboard > Edge Functions

### Cron Jobs
- **Expiration abonnements** : Quotidien à 2h
- **Rapports hebdomadaires** : Lundi à 9h
- **Backups** : Quotidien à 3h

---

## Dépannage

### Problèmes Courants

#### 1. **Utilisateur ne peut pas accéder à l'IA**
- **Vérifier** :
  - Abonnement actif (`lingua_subscriptions.status = 'active'`)
  - Permissions IA (`lingua_ai_permissions.is_allowed = true`)
  - Limites de tokens non dépassées
- **Solution** :
  - Créer/modifier l'abonnement
  - Ajouter une permission IA
  - Réinitialiser les compteurs quotidiens

#### 2. **Paiement échoué**
- **Vérifier** :
  - Clés CinetPay configurées
  - Solde suffisant sur le compte marchand
  - Statut de la transaction dans `lingua_transactions`
- **Solution** :
  - Vérifier les logs CinetPay
  - Créer une transaction manuelle
  - Contacter le support CinetPay

#### 3. **Certificat non généré**
- **Vérifier** :
  - Test de niveau complété (`lingua_level_tests`)
  - Score minimum atteint
  - Edge Function `generate-certificate` déployée
- **Solution** :
  - Relancer la génération manuellement
  - Vérifier les logs Edge Function
  - Regénérer le test

#### 4. **Performances IA lentes**
- **Vérifier** :
  - Modèle IA utilisé (certains sont plus lents)
  - Charge du fournisseur (Groq souvent plus rapide)
  - Connexion internet
- **Solution** :
  - Changer de fournisseur dans les permissions
  - Activer les modèles plus rapides (Haiku, Llama 70B)
  - Surveiller les temps de réponse dans `lingua_ai_sessions`

### Logs
- **Frontend** : Console du navigateur
- **Backend** : Supabase Dashboard > Logs
- **Edge Functions** : Supabase Dashboard > Edge Functions > Logs
- **Base de données** : `SELECT * FROM lingua_ai_sessions ORDER BY created_at DESC LIMIT 10`

### Support Technique
- **Email** : tech@lingua.space
- **Urgences** : +225 XX XX XX XX
- **Documentation** : `/docs` (ce guide)

---

## Sécurité

### Bonnes Pratiques
1. **Rôles** :
   - `user` : Accès standard
   - `admin` : Accès admin limité
   - `super_admin` : Accès complet

2. **Mots de passe** :
   - Longueur minimum : 8 caractères
   - Complexité : majuscules, minuscules, chiffres
   - Expiration : 90 jours (recommandé)
   - Historique : 5 derniers mots de passe

3. **Sessions** :
   - Expiration : 24 heures d'inactivité
   - Unique : Une session par appareil
   - Revocation : Possible depuis l'admin

4. **API Keys** :
   - Jamais dans le code frontend
   - Rotation régulière (90 jours)
   - Accès limité par IP (si possible)

### Audit
- **Logs de connexion** : `auth.sessions`
- **Actions admin** : Table `admin_audit_log` (à implémenter)
- **Modifications données** : Triggers de logging

### Conformité
- **RGPD** : Consentement, droit à l'oubli, portabilité
- **Paiements** : Conformité PCI DSS (via CinetPay)
- **Données personnelles** : Chiffrement au repos et en transit

---

## Conclusion

Ce guide couvre l'ensemble des fonctionnalités d'administration de LINGUA SPACE. Pour toute question supplémentaire ou problème non couvert, contactez l'équipe technique.

**Rappel** : Avec de grands pouvoirs viennent de grandes responsabilités. Utilisez les fonctionnalités admin avec discernement et respect pour la vie privée des utilisateurs.

*Dernière mise à jour : 22 avril 2026*