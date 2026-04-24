# LINGUA SPACE — Plateforme d'Apprentissage des Langues Intelligente

## Présentation Générale

**LINGUA SPACE** est une plateforme d'apprentissage des langues nouvelle génération, conçue spécifiquement pour les apprenants africains. Elle combine l'intelligence artificielle avancée, un design immersif et une pédagogie adaptative pour offrir une expérience d'apprentissage personnalisée et efficace.

**Vision** : Rendre l'apprentissage des langues accessible, engageant et efficace pour tous les Africains, en tirant parti des dernières technologies d'IA.

**Mission** : Fournir un environnement d'apprentissage complet qui s'adapte au niveau, aux objectifs et au contexte culturel de chaque apprenant.

---

## Fonctionnalités Principales

### 1. **Tutor IA Multilingue**
- **Conversations naturelles** avec des modèles IA spécialisés (Claude, Llama, DeepSeek)
- **Correction en temps réel** de la grammaire, prononciation et vocabulaire
- **Adaptation au niveau** (A1 à C2) et aux objectifs de l'apprenant
- **Modes spécialisés** :
  - **Free Talk** : Conversation libre
  - **Business** : Anglais/Français professionnel
  - **Grammar** : Explications et exercices
  - **Exam Prep** : Préparation aux certifications (IELTS, TOEFL, DELF, DELE)
  - **Role Play** : Scénarios de la vie réelle
  - **Research** : Recherche web intégrée

### 2. **Modules de Cours Structurés**
- **6 niveaux** (A1, A2, B1, B2, C1, C2) pour 4 langues (Anglais, Français, Espagnol, Allemand)
- **Contenu multimédia** : vidéos, audio, textes, exercices interactifs
- **Progression adaptative** basée sur les performances
- **Quiz intelligents** générés par IA à partir du contenu

### 3. **Système de Certification**
- **Tests de niveau** complets avec évaluation détaillée
- **Certificats officiels** LINGUA SPACE (niveaux A1-C2)
- **Vérification en ligne** des certificats via code unique
- **Préparation aux examens** internationaux

### 4. **Gamification & Motivation**
- **Système de points XP** et récompenses
- **Classements** hebdomadaires et mensuels
- **Badges** de compétence par langue
- **Streaks** (jours consécutifs d'apprentissage)

### 5. **Administration Complète**
- **Tableau de bord admin** avec statistiques détaillées
- **Gestion des abonnements** et paiements
- **Contrôle des permissions IA** par utilisateur/plan
- **Génération de rapports** financiers et pédagogiques
- **Interface de support** aux utilisateurs

---

## Architecture Technique

### Stack Technologique
- **Frontend** : React 18 + Vite + Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **IA** : Edge Functions avec multi-fournisseurs (Anthropic, Groq, DeepSeek)
- **Paiements** : CinetPay (Orange Money, Wave, MTN, cartes)
- **Déploiement** : Vercel/Netlify (frontend) + Supabase (backend)

### Base de Données
- **Utilisateurs** : `lingua_users` avec rôles (user, admin, super_admin)
- **Abonnements** : `lingua_subscriptions` avec plans UNI (1 langue) et All Access
- **Progression** : `lingua_progress` par langue et utilisateur
- **Modules** : `lingua_modules` avec contenu structuré
- **Sessions IA** : `lingua_ai_sessions` pour le monitoring
- **Transactions** : `lingua_transactions` pour la comptabilité
- **Permissions IA** : `lingua_ai_permissions` pour le contrôle d'accès

### Sécurité
- **Authentification** : Supabase Auth avec JWT
- **Autorisations** : RLS (Row Level Security) sur toutes les tables
- **API Keys** : Stockées dans les secrets Supabase (jamais dans le frontend)
- **Paiements** : Tokens sécurisés via CinetPay

---

## Modèles IA Intégrés

### Fournisseurs Supportés
1. **Anthropic (Claude)**
   - Claude Sonnet 4.5 : Équilibre performance/coût
   - Claude Haiku 3 : Rapide et économique
   - Claude Opus 3 : Plus puissant, plus cher

2. **Groq (Llama/Mixtral)**
   - Llama 3.1 70B : Puissant et rapide
   - Llama 3.2 90B : Vision + texte
   - Mixtral 8x7B : Expert mixture
   - Gemma2 9B : Léger et efficace

3. **DeepSeek**
   - DeepSeek Chat : Modèle principal
   - DeepSeek Coder : Spécialisé code

### Recherche Web
- **Tavily** : Recherche sémantique pour contenu éducatif
- **Brave Search** : Alternative avec protection de la vie privée
- **YouTube API** : Contenu vidéo éducatif

### Système de Permissions
- **Contrôle granulaire** des modèles accessibles par utilisateur
- **Limites de tokens** quotidiennes configurables
- **Priorités** : Utilisateur > Plan > Global
- **Interface admin** complète pour la gestion

---

## Plans d'Abonnement

### 1. **UNI** (15 000 FCFA/mois)
- **1 langue** au choix (Anglais, Français, Espagnol, Allemand)
- **Accès complet** aux modules (A1 à C2)
- **Tutor IA** avec modèles de base
- **Certifications** incluses
- **Support** par email

### 2. **All Access** (25 000 FCFA/mois)
- **Toutes les langues** (4 langues)
- **Modèles IA premium** (Claude Opus, Llama 90B)
- **Recherche web** intégrée
- **Certifications premium**
- **Support prioritaire**

### Paiements
- **Mobile Money** : Orange Money, Wave, MTN
- **Cartes bancaires** : Visa, Mastercard
- **Flutterwave** : Paiements en ligne
- **Renouvellement** automatique optionnel

---

## Interface Utilisateur

### Design System
- **Thème sombre** avec accents dorés
- **Animations fluides** avec Framer Motion
- **Composants modulaires** réutilisables
- **Responsive** mobile-first
- **PWA** installable (Progressive Web App)

### Navigation
- **Landing page** avec présentation des fonctionnalités
- **Dashboard** personnalisé avec progression
- **Corner** par langue avec modules et exercices
- **Assistant IA** avec interface conversationnelle
- **Admin** avec tableau de bord complet

### Accessibilité
- **Contraste élevé** pour une meilleure lisibilité
- **Navigation au clavier** supportée
- **Textes alternatifs** pour les images
- **Taille de texte** ajustable

---

## Administration

### Tableau de Bord Admin
- **Statistiques** en temps réel (abonnés, revenus, activité)
- **Gestion utilisateurs** : création, suspension, réactivation
- **Gestion abonnements** : création manuelle, expiration automatique
- **Finance** : transactions, reçus, export CSV
- **Permissions IA** : contrôle d'accès aux modèles

### Automatisation
- **Expiration automatique** des abonnements (cron job quotidien)
- **Rapports hebdomadaires** par email aux abonnés
- **Notifications** de renouvellement
- **Backups** automatiques de la base de données

### Support
- **Interface de support** intégrée
- **Génération de reçus** automatique
- **Certificats** personnalisables
- **Logs d'activité** détaillés

---

## Déploiement & Maintenance

### Environnements
- **Développement** : localhost:5173 avec hot reload
- **Staging** : prévisualisation des builds
- **Production** : déploiement automatique via Git

### Monitoring
- **Logs d'erreurs** : Sentry (à intégrer)
- **Performances** : Core Web Vitals
- **Utilisation IA** : tokens, coûts, modèles
- **Base de données** : requêtes lentes, index

### Scaling
- **Frontend** : CDN pour les assets statiques
- **Backend** : Supabase auto-scaling
- **IA** : load balancing entre fournisseurs
- **Base de données** : réplication read-only pour les rapports

---

## Roadmap & Évolutions Futures

### Court Terme (Q2 2026)
1. **Application mobile** React Native
2. **Intégration WhatsApp** pour notifications
3. **Communauté** avec forums et groupes
4. **Contenu généré par les utilisateurs**

### Moyen Terme (Q3-Q4 2026)
1. **Reconnaissance vocale** avancée
2. **Réalité augmentée** pour l'immersion
3. **Marché de tuteurs** humains
4. **Intégration écoles** et entreprises

### Long Terme (2027+)
1. **Apprentissage par la pratique** (simulations)
2. **IA personnelle** qui évolue avec l'utilisateur
3. **Certifications reconnues** internationalement
4. **Expansion** à 10+ langues africaines

---

## Équipe & Contact

### Développement
- **Lead Developer** : [Nom]
- **Design UI/UX** : [Nom]
- **IA & Backend** : [Nom]
- **Marketing** : [Nom]

### Support
- **Email** : support@lingua.space
- **Téléphone** : +225 XX XX XX XX
- **Adresse** : Abidjan, Côte d'Ivoire

### Réseaux Sociaux
- **LinkedIn** : [lien]
- **Twitter/X** : [lien]
- **Facebook** : [lien]
- **Instagram** : [lien]

---

## Conclusion

**LINGUA SPACE** représente l'avenir de l'apprentissage des langues en Afrique. En combinant l'intelligence artificielle de pointe avec une pédagogie adaptative et une interface utilisateur immersive, la plateforme offre une solution complète pour les apprenants de tous niveaux.

Avec son architecture scalable, son système de permissions IA avancé et son administration complète, LINGUA SPACE est prête à évoluer avec les besoins de ses utilisateurs et à s'imposer comme la référence en matière d'apprentissage des langues en Afrique.

*"Apprendre une langue n'a jamais été aussi personnel, engageant et efficace."*