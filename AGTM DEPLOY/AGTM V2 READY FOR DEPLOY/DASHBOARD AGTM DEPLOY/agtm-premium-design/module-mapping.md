# Mapping des Modules à Transformer - AGTM Digital Academy

## Modules Déjà Transformés (3/33)
1. ✅ **Administration - Étudiants** (`modules-transformed.html` lignes 1-84)
2. ✅ **Pédagogie - Catalogue** (`modules-transformed.html` lignes 86-195)
3. ✅ **Finance - Encaissements** (`modules-transformed.html` lignes 197-322)

## Modules Identifiés dans dashboard.html (30 restants)

### 📊 **Module 4: Tableau de bord Admin (KPIs)**
- **Localisation**: Commentaire `<!-- ── KPIs ────────────────────────────────────────────── -->`
- **IDs critiques**: `chartOvw`, `riskContainer`, `cohortContainer`, `agendaTodayContainer`
- **Structure**: Grille de 4 cartes KPI + graphiques

### 📅 **Module 5: Agenda du jour**
- **Localisation**: Commentaire `<!-- ── AGENDA DU JOUR ──────────────────────────────────── -->`
- **IDs critiques**: `agendaTodayDate`, `agendaTodayContainer`

### 👨‍🏫 **Module 6: Formateurs & RH**
- **Localisation**: Commentaire `<!-- ── Dossiers Formateurs ─────────────────────────────── -->`
- **IDs critiques**: Cartes formateurs avec `onclick="navigateTo('rh')"`

### 📈 **Module 7: Graphique revenus**
- **Localisation**: Commentaire `<!-- ── Graphique revenus ─────────────────────────────────── -->`
- **IDs critiques**: `chartOvw` (canvas)

### ⚠️ **Module 8: Étudiants à risque**
- **Localisation**: Commentaire `<!-- ── Étudiants à risque ─────────────────────────────── -->`
- **IDs critiques**: `riskContainer`

### 👥 **Module 9: Progression des Cohortes**
- **Localisation**: Commentaire `<!-- ── Progression des Cohortes ───────────────────────── -->`
- **IDs critiques**: `cohortContainer`

### 🎓 **Module 10: Pédagogie - Planning formateur**
- **Localisation**: Section formateur avec `<!-- Formateur identity card -->`
- **IDs critiques**: Cartes spécifiques formateur

### 📋 **Module 11: Planification séance (formulaire)**
- **Localisation**: Commentaire `<!-- ════ PLANIFIER UNE SÉANCE ════ -->`
- **IDs critiques**: `edtForm`, `edtDate`, `edtHeure`, `edtStatut`, etc.

### 👨‍🎓 **Module 12: Mes Classes & Étudiants (formateur)**
- **Localisation**: Commentaire `<!-- ════ MES CLASSES & ÉTUDIANTS ════ -->`

### 🧪 **Module 13: English Corner - Évaluations**
- **Localisation**: Section avec `evalQContainer`, `evErr`
- **IDs critiques**: `evalQContainer`, `evErr`, `_apEvalTimer`, `_certBtn`

### 📝 **Module 14: Rapports pédagogiques**
- **Localisation**: Commentaire `<!-- ── Rapports de séances (formateurs) + honoraires ── -->`
- **IDs critiques**: `rC`, `rsObj`, `rprog_*`, `rsObs`

### 💰 **Module 15: Finance - Facturation proforma**
- **Localisation**: Section avec `pfEtud`, `pfLignes`, `pfTotal`
- **IDs critiques**: `pfEtud`, `pfLignes`, `pfAppliquertVA`, `pfTotal`

### 🏦 **Module 16: Finance - Échéancier**
- **Localisation**: Commentaire `finTabBar('echeancier')`
- **IDs critiques**: `plnE`, `_echDate`, `_echMont`

### 📊 **Module 17: Finance - Dépenses**
- **Localisation**: Section `finTabBar('depenses')`
- **Structure**: Formulaire dépense + liste

### 📋 **Module 18: Pointage - Feuille présence**
- **Localisation**: Commentaire `<!-- FEUILLE DE PRÉSENCE INTERACTIVE -->`
- **IDs critiques**: `presSeance`, `feuilleContent`, `presenceRows`

### 👤 **Module 19: Profil étudiant (détail)**
- **Localisation**: Section avec `<!-- Infos étudiant -->`
- **Structure**: Carte détaillée étudiant

### 📚 **Module 20: Catalogue pédagogique (étudiant)**
- **Localisation**: Commentaire `<!-- Filtres par niveau -->` + `pedaCatList`
- **IDs critiques**: `pedaCatList`

### 🎯 **Module 21: Test de placement**
- **Localisation**: Section "Test de Placement AGTM — Vedette"
- **IDs critiques**: `_ptOpts`, `_pto_{i}`, `_apPTimer`

### 🤖 **Module 22: Assistant IA conversationnel**
- **Localisation**: Commentaire `<!-- SIDEBAR HISTORIQUE -->` + `<!-- ZONE CHAT -->`
- **IDs critiques**: `aiSidebar`, `aiChatBox`, `aiMicBtn`, `aiMsgInput`, etc.

### ⚙️ **Module 23: Paramètres IA**
- **Localisation**: Sections configuration IA
- **IDs critiques**: `cfgAiActif`, `cfgExternalSearch`, `cfg_*`, `aiUsersList`

### 📱 **Module 24: Marketing - Landing interne**
- **Localisation**: Section avec `<!-- ── HERO + STATS EN UNE LIGNE ── -->`
- **Structure**: Vitrine marketing interne

### 📧 **Module 25: WhatsApp Manager**
- **Localisation**: Section `waComposeBox`, `destCheckList`
- **IDs critiques**: `waComposeBox`, `destCheckList`

### 👑 **Module 26: Tableau de bord Étudiant (gamifié)**
- **Localisation**: Commentaire `<!-- ── Hero Banner gamifié ─────────────────────────────── -->`
- **Structure**: XP Bar, trophées, KPIs étudiant

### 💼 **Module 27: Tableau de bord Investisseur**
- **Localisation**: Commentaire `<!-- Header investisseur -->`

### 🎓 **Module 28: Tableau de bord Direction Pédagogique**
- **Localisation**: Commentaire `<!-- En-tête Direction -->`

### 📄 **Module 29: Certificats & Diplômes**
- **Localisation**: Section `<!-- Certificat de Niveau -->`

### 📊 **Module 30: Statistiques & Analytics**
- **Localisation**: Diverses sections stats

### 👥 **Module 31: Gestion utilisateurs**
- **Localisation**: Section `<!-- Liste des utilisateurs -->` avec filtres RBAC

### 📅 **Module 32: Calendrier FullCalendar**
- **Localisation**: Commentaire `<!-- FullCalendar dynamique -->`
- **IDs critiques**: `fcCalendar`

### 🛠️ **Module 33: Paramètres système**
- **Localisation**: Sections paramètres, thème, notifications

## Structure de Transformation

### Pattern à appliquer:
```html
<div class="agtm-card premium-card" style="margin-bottom: 1.5rem;">
  <div class="premium-card-header">
    <div>
      <div class="premium-card-title">TITRE DU MODULE</div>
      <div class="premium-card-subtitle">Sous-titre descriptif</div>
    </div>
    <div class="agtm-btn-group">
      <!-- Boutons d'action -->
    </div>
  </div>
  
  <div class="premium-card-body">
    <!-- Contenu du module -->
  </div>
  
  <div class="premium-card-footer">
    <!-- Footer avec stats/actions -->
  </div>
</div>
```

### Classes CSS à utiliser:
- `.agtm-card.premium-card` - conteneur principal
- `.premium-card-header` - en-tête avec titre
- `.premium-card-title` - titre principal
- `.premium-card-subtitle` - sous-titre
- `.premium-card-body` - corps du contenu
- `.premium-card-footer` - pied de carte
- `.agtm-btn-group` - groupe de boutons
- `.agtm-btn` - bouton de base
- `.agtm-btn-primary` - bouton primaire (or)
- `.agtm-btn-secondary` - bouton secondaire
- `.agtm-btn-danger` - bouton danger
- `.agtm-btn-success` - bouton succès
- `.agtm-btn-ghost` - bouton ghost
- `.agtm-btn-sm` - petite taille
- `.agtm-table` - tableaux
- `.agtm-badge` - badges
- `.agtm-badge-gold` - badge or
- `.agtm-badge-blue` - badge bleu
- `.agtm-badge-green` - badge vert
- `.agtm-badge-red` - badge rouge
- `.agtm-input`, `.agtm-select`, `.agtm-textarea` - champs formulaire
- `.agtm-field` - groupe de champ
- `.agtm-label` - label de champ

### Règles critiques:
1. **NE PAS modifier** les `id`, `data-attributes`, `onclick`
2. **Préserver** la structure HTML et l'ordre des éléments
3. **Appliquer** uniquement les classes CSS `.agtm-*` et `.premium-*`
4. **Tester** chaque module après transformation

## Plan d'exécution par Lots

### Lot 1: Modules Administratifs Core (4-9)
- Module 4: Tableau de bord Admin (KPIs)
- Module 5: Agenda du jour
- Module 6: Formateurs & RH
- Module 7: Graphique revenus
- Module 8: Étudiants à risque
- Module 9: Progression des Cohortes

### Lot 2: Modules Pédagogiques (10-14)
- Module 10: Planning formateur
- Module 11: Planification séance
- Module 12: Mes Classes & Étudiants
- Module 13: English Corner
- Module 14: Rapports pédagogiques

### Lot 3: Modules Finance (15-17)
- Module 15: Facturation proforma
- Module 16: Échéancier
- Module 17: Dépenses

### Lot 4: Modules Opérationnels (18-22)
- Module 18: Pointage
- Module 19: Profil étudiant
- Module 20: Catalogue pédagogique
- Module 21: Test de placement
- Module 22: Assistant IA

### Lot 5: Modules Spéciaux (23-28)
- Module 23: Paramètres IA
- Module 24: Marketing
- Module 25: WhatsApp Manager
- Module 26: Dashboard Étudiant
- Module 27: Dashboard Investisseur
- Module 28: Dashboard Direction

### Lot 6: Modules Techniques (29-33)
- Module 29: Certificats
- Module 30: Statistiques
- Module 31: Gestion utilisateurs
- Module 32: Calendrier
- Module 33: Paramètres système

## Fichiers de Support
- `design-tokens.css` - Variables de design
- `components.css` - Composants premium
- `critical-ids-guide.md` - Guide des IDs critiques
- `modules-transformed.html` - Exemples transformés

## Validation
Après chaque lot:
1. Vérifier que tous les IDs critiques sont présents
2. Tester la fonctionnalité JavaScript
3. Vérifier le responsive design
4. Confirmer la compatibilité RBAC