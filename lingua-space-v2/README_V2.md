# AGTM LINGUA SPACE — Module v2 : Certification & Finance
## Guide d'intégration pour le développeur

---

## Ce que contient ce package

Ce package complète le projet LINGUA SPACE existant (v1) avec deux nouveaux modules :

### 🎓 Module Certification
- Test de niveau officiel (40 questions, 4 compétences, 45 min)
- Génération automatique des questions par Claude IA
- Calcul du score pondéré selon le CEFR
- Certificat PDF officiel avec QR code de vérification
- Page publique de vérification (sans connexion)
- Historique des tests et certificats

### 💰 Module Finance & Comptabilité
- Génération automatique de reçus à chaque paiement
- Tableau de bord admin (recettes, dépenses, abonnés)
- Suivi de toutes les transactions
- Export CSV mensuel
- Vue consolidée mensuelle

---

## Fichiers à intégrer

### Nouveaux fichiers (à créer dans le projet v1)

```
NOUVELLES PAGES :
src/pages/Certification.jsx       → /certification
src/pages/LevelTest.jsx           → /level-test/:lang
src/pages/CertificateView.jsx     → /certificate/:id
src/pages/CertificateVerify.jsx   → /verify/:code (public)
src/pages/Receipts.jsx            → /receipts
src/pages/admin/AdminDashboard.jsx → /admin
src/pages/admin/Finance.jsx       → /admin/finance

NOUVELLE LIB :
src/lib/certification.js          → Helpers certification & finance

NOUVELLES EDGE FUNCTIONS :
supabase/functions/generate-level-test/index.ts
supabase/functions/generate-certificate/index.ts
supabase/functions/generate-receipt/index.ts
supabase/functions/admin-finance/index.ts

NOUVELLE MIGRATION SQL :
supabase/migrations/002_certification_finance.sql
```

### Fichiers existants à REMPLACER

```
src/App.jsx                          → Version mise à jour (nouvelles routes)
src/components/layout/Sidebar.jsx   → Version mise à jour (nouveaux liens)
supabase/functions/payment-webhook/ → Remplacer par payment-webhook-v2/
```

---

## Étapes d'intégration

### Étape 1 — Base de données

Exécuter dans Supabase SQL Editor (APRÈS 001_lingua_schema.sql) :
```sql
-- Copier-coller le contenu de :
supabase/migrations/002_certification_finance.sql
```

Vérifier que les tables suivantes sont créées :
- `lingua_level_tests`
- `lingua_certificates`
- `lingua_transactions`
- `lingua_expenses`
- Vue `lingua_financial_summary`
- Vue `lingua_active_subscribers`
- Fonctions `generate_certificate_number()`, `generate_receipt_number()`
- Séquences `lingua_certificate_seq`, `lingua_receipt_seq`

### Étape 2 — Supabase Storage

Créer un bucket dans Supabase Dashboard → Storage :
```
Bucket name : lingua-documents
Public : OUI (pour les PDFs de certificats et reçus)
```

### Étape 3 — Edge Functions

Déployer les nouvelles fonctions :
```bash
supabase functions deploy generate-level-test
supabase functions deploy generate-certificate
supabase functions deploy generate-receipt
supabase functions deploy admin-finance

# Remplacer l'ancienne fonction payment-webhook :
supabase functions deploy payment-webhook
# (copier le contenu de payment-webhook-v2/index.ts dans payment-webhook/index.ts)
```

### Étape 4 — Secrets Supabase

Ajouter dans Supabase Dashboard → Edge Functions → Secrets :
```
ADMIN_SECRET_KEY=un_code_secret_fort_pour_ladmin_32chars
```

(Les autres secrets ANTHROPIC_API_KEY, CINETPAY_*, RESEND_API_KEY
sont déjà configurés depuis la v1)

### Étape 5 — Variables d'environnement Netlify

Ajouter :
```
VITE_ADMIN_SECRET_KEY=le_meme_code_secret_que_ci_dessus
```

⚠️  IMPORTANT : Cette clé admin ne doit être utilisée QUE depuis
les pages admin (/admin/*). Elle ne doit jamais être exposée
à des utilisateurs non-administrateurs.

### Étape 6 — Cron Jobs Supabase

Dans Supabase Dashboard → Database → Cron Jobs, ajouter :

```
Nom      : expire_pending_tests
Schedule : 0 * * * *
Command  : SELECT expire_pending_tests();

Nom      : invalidate_expired_certificates
Schedule : 0 3 * * *
Command  : SELECT invalidate_expired_certificates();
```

### Étape 7 — Intégrer les fichiers React

1. Copier tous les nouveaux fichiers `src/pages/` et `src/lib/certification.js`
2. Remplacer `src/App.jsx` par la version v2 fournie
3. Remplacer `src/components/layout/Sidebar.jsx` par la version v2

### Étape 8 — Tester

```bash
npm run dev

# Tester dans l'ordre :
# 1. Se connecter avec un abonnement actif
# 2. Aller sur /certification
# 3. Cliquer "Commencer" pour un test (Anglais)
# 4. Compléter le test (les questions arrivent de Claude)
# 5. Voir le score et générer le certificat
# 6. Aller sur /verify/[CODE] pour vérifier
# 7. Vérifier les reçus sur /receipts
# 8. Accéder au tableau de bord admin sur /admin/finance
```

---

## Architecture des scores CEFR

```
Score global = Oral × 35% + Écrit × 30% + Grammaire × 25% + Expression × 10%

Niveau A1 : score global  0-24%
Niveau A2 : score global 25-44%
Niveau B1 : score global 45-59%
Niveau B2 : score global 60-74%
Niveau C1 : score global 75-89%
Niveau C2 : score global 90-100%

Seuil de certification : 60% (Niveau B2 minimum)
Durée du test : 45 minutes (timer automatique)
```

---

## Tarification intégrée

| Service | Prix | Variable à modifier |
|---------|------|---------------------|
| Test + Certificat | 5 000 FCFA | `CERT_PRICES.test` dans `certification.js` |
| Repassage | 3 000 FCFA | `CERT_PRICES.retake` dans `certification.js` |
| Duplicata PDF | 1 000 FCFA | `CERT_PRICES.duplicate` dans `certification.js` |

---

## Notes importantes

1. **Le certificat est un fichier HTML** stocké dans Supabase Storage.
   Pour un vrai PDF, intégrer une librairie comme `html-pdf-node` ou
   utiliser Puppeteer dans une Edge Function séparée.

2. **La page `/verify/:code` est publique** (pas d'auth requise).
   Elle permet à n'importe qui de vérifier l'authenticité d'un certificat.

3. **Le QR code** dans le template HTML du certificat est un placeholder.
   En production, générer un vrai QR code avec la lib `qrcode` :
   ```bash
   npm install qrcode
   ```

4. **Le module admin** est protégé par `ADMIN_SECRET_KEY`.
   En production, implémenter une vraie gestion des rôles Supabase.

---

*AGTM Digital Academy — Abidjan, Côte d'Ivoire*
*lingua.africaglobaltraining.com · © 2025*
