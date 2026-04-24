# LOT TEST "TOP 5" - GUIDE D'EXÉCUTION

## 📋 PRÉREQUIS

### 1. Variables d'environnement
```bash
# Windows (CMD)
set SUPABASE_ANON_KEY=votre_cle_anonyme_supabase

# Windows (PowerShell)
$env:SUPABASE_ANON_KEY="votre_cle_anonyme_supabase"

# Linux/Mac
export SUPABASE_ANON_KEY="votre_cle_anonyme_supabase"
```

### 2. Configuration Supabase
Ouvrez `generate-lot-test-top5.py` et modifiez la ligne 16 :
```python
SUPABASE_URL = "https://votre-project-ref.supabase.co"
```
Remplacez `votre-project-ref` par votre référence de projet Supabase.

### 3. Dépendances Python
```bash
pip install aiohttp
```

## 🚀 EXÉCUTION DU SCRIPT

### Mode 1 : Exécution directe
```bash
python generate-lot-test-top5.py
```

### Mode 2 : Avec variables d'environnement
```bash
# Windows
set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
python generate-lot-test-top5.py

# Linux/Mac
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... python generate-lot-test-top5.py
```

### Mode 3 : Fichier .env
Créez un fichier `.env` :
```env
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://votre-project-ref.supabase.co
```

Puis exécutez :
```bash
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('Clé chargée:', os.getenv('SUPABASE_ANON_KEY')[:20])"
python generate-lot-test-top5.py
```

## 📊 THÈMES DU LOT TEST "TOP 5"

| # | Module ID | Thème | Niveau | Description |
|---|-----------|-------|--------|-------------|
| 1 | `biz_b2_m1` | **Business English: Réussir sa première réunion internationale** | B2 | Module premium pour réunions internationales |
| 2 | `exam_c1_m1` | **TOEFL Prep: Stratégies pour la section 'Speaking'** | C1 | Techniques avancées pour maximiser le score TOEFL |
| 3 | `gram_b2_m1` | **Grammar Pro: Maîtriser les nuances du Present Perfect** | B2 | Approfondissement des cas complexes et exceptions |
| 4 | `biz_b2_m2` | **Professional Writing: Rédiger des emails percutants en 2026** | B2 | Templates modernes optimisés pour l'IA |
| 5 | `tech_b2_m1` | **Technical English: Vocabulaire de l'IA et du développement logiciel** | B2 | Termes techniques pour développeurs et professionnels du numérique |

## 🔧 FONCTIONNEMENT DU SCRIPT

### Étape 1 : Génération via Edge Function
Le script appelle l'Edge Function `generate-module-content` avec :
- `module_id` : Identifiant unique (ex: `biz_b2_m1`)
- `topic` : Thème principal
- `level` : Niveau CECRL (B2, C1)
- `theme` : Catégorie (business, grammaire, vocabulaire, etc.)
- `language` : "fr" (français)

### Étape 2 : Insertion dans la table `seances`
Chaque module généré est inséré avec :
- `statut` : "draft" (pour apparaître dans le Dashboard de Validation)
- `ai_generated_content` : JSON complet du module
- `session_status` : "draft"
- `wizard_step` : 1
- `duration_minutes` : 45
- Date de séance : 7 jours dans le futur

### Étape 3 : Génération du rapport
Un rapport JSON est créé avec :
- Timestamp de l'exécution
- Statut de chaque module (succès/échec)
- Détails des erreurs éventuelles
- Nombre d'insertions réussies

## 📈 SORTIE ATTENDUE

```
============================================================
🚀 LOT TEST 'TOP 5' - GÉNÉRATION ET INSERTION
============================================================

📊 Thèmes à générer: 5
  1. biz_b2_m1: Business English: Réussir sa première réunion internationale
  2. exam_c1_m1: TOEFL Prep: Stratégies pour la section 'Speaking'
  3. gram_b2_m1: Grammar Pro: Maîtriser les nuances du Present Perfect
  4. biz_b2_m2: Professional Writing: Rédiger des emails percutants en 2026
  5. tech_b2_m1: Technical English: Vocabulaire de l'IA et du développement logiciel

🔄 Génération des modules via Edge Function...
🔍 Génération du module: biz_b2_m1 - Business English: Réussir sa première réunion internationale
✅ Module généré: biz_b2_m1 (1250 caractères)
🔍 Génération du module: exam_c1_m1 - TOEFL Prep: Stratégies pour la section 'Speaking'
✅ Module généré: exam_c1_m1 (1180 caractères)
...

📈 RÉSULTATS DE GÉNÉRATION:
  ✅ Succès: 5/5
  ❌ Échecs: 0/5

🔄 Insertion dans la table 'seances'...
✅ Module inséré dans seances: biz_b2_m1 (ID: 123)
✅ Module inséré dans seances: exam_c1_m1 (ID: 124)
...

📈 RÉSULTATS D'INSERTION:
  ✅ Insertions réussies: 5/5

============================================================
📋 RAPPORT FINAL - LOT TEST 'TOP 5'
============================================================
✅ biz_b2_m1: Business English: Réussir sa première réunion internationale
   → Génération: OK | Insertion: OK
✅ exam_c1_m1: TOEFL Prep: Stratégies pour la section 'Speaking'
   → Génération: OK | Insertion: OK
...

📄 Rapport sauvegardé: lot-test-top5-report-20260422-031200.json

🎯 RECOMMANDATIONS:
  • Tous les modules ont été générés avec succès!
  • Vérifiez le Dashboard de Validation IA pour les réviser
  • Publiez les modules après validation pédagogique

🚀 EXÉCUTION TERMINÉE
```

## 🔍 VÉRIFICATION DANS SUPABASE

### 1. Vérifiez les modules générés
```sql
SELECT id, sujet, statut, module_id, created_at 
FROM seances 
WHERE programme = 'AGTM Digital Academy - Lot Test Top 5'
ORDER BY created_at DESC;
```

### 2. Vérifiez le contenu IA
```sql
SELECT id, sujet, ai_generated_content->>'Focus_Title' as title
FROM seances 
WHERE ai_generated_content IS NOT NULL
AND statut = 'draft';
```

### 3. Vérifiez le Dashboard de Validation
Ouvrez `agtm-premium-design/ai-validation-dashboard.html` dans votre navigateur.

Les 5 nouveaux modules doivent apparaître dans la liste avec le statut **"Draft"**.

## 🛠 DÉPANNAGE

### Problème 1 : Clé API non définie
```
❌ ERREUR: SUPABASE_ANON_KEY non définie dans les variables d'environnement
```

**Solution :**
```bash
# Vérifiez la clé
echo %SUPABASE_ANON_KEY%  # Windows
echo $SUPABASE_ANON_KEY   # Linux/Mac

# Définissez-la
set SUPABASE_ANON_KEY=votre_cle  # Windows
export SUPABASE_ANON_KEY=votre_cle  # Linux/Mac
```

### Problème 2 : URL Supabase incorrecte
```
❌ Erreur génération biz_b2_m1: 404 - Not Found
```

**Solution :** Modifiez `SUPABASE_URL` dans le script avec votre URL correcte.

### Problème 3 : Erreur de connexion
```
❌ Exception génération biz_b2_m1: Cannot connect to host...
```

**Solution :** Vérifiez votre connexion internet et les pare-feux.

### Problème 4 : Erreur d'insertion RLS
```
❌ Erreur insertion biz_b2_m1: 401 - Unauthorized
```

**Solution :** Vérifiez que votre clé anon a les permissions d'insertion sur la table `seances`.

## 📁 FICHIERS GÉNÉRÉS

### 1. `generate-lot-test-top5.py`
Script principal d'exécution.

### 2. `lot-test-top5-report-YYYYMMDD-HHMMSS.json`
Rapport JSON avec les résultats détaillés.

### 3. Logs dans la console
Sortie détaillée avec icônes et couleurs.

## 🔗 INTÉGRATION AVEC LE DASHBOARD

### Flux de données :
```
Edge Function → JSON Module → Table seances → Dashboard de Validation IA
```

### Champs mappés :
| Dashboard | Table seances | Description |
|-----------|---------------|-------------|
| Focus_Title | `sujet` | Titre principal du module |
| Learning_Objectives | `ai_generated_content->'Learning_Objectives'` | Objectifs d'apprentissage |
| Quiz_Data | `ai_generated_content->'Quiz_Data'` | Questions et réponses |
| Elite_Tip | `ai_generated_content->'Elite_Tip'` | Conseil premium |
| Statut | `statut` | "draft", "review", "published" |

## 🚀 PROCHAINES ÉTAPES APRÈS EXÉCUTION

1. **Ouvrez le Dashboard de Validation IA**
   ```bash
   start agtm-premium-design/ai-validation-dashboard.html
   ```

2. **Vérifiez les 5 nouveaux modules**
   - Ils doivent apparaître avec le badge "Draft"
   - Cliquez sur chaque module pour prévisualiser

3. **Validez le contenu généré**
   - Vérifiez la qualité pédagogique
   - Corrigez si nécessaire avec l'édition inline
   - Utilisez "Approuver & Publier" pour changer le statut

4. **Passez à la production**
   - Une fois validés, les modules sont prêts pour les étudiants
   - Intégrez-les dans le planning des formateurs
   - Ajoutez-les aux parcours d'apprentissage

## 📞 SUPPORT

En cas de problème :
1. Consultez les logs du script
2. Vérifiez la console du navigateur (F12)
3. Consultez les logs Supabase
4. Contactez l'équipe technique AGTM

---

*Document généré le 22/04/2026 - AGTM Digital Academy*