# 📋 Instructions de Test - Nouvelle Vitrine AGTM

## 🚀 Démarrage Rapide

### Option 1 : Script Batch (Recommandé)
1. Double-cliquez sur `test-vitrine.bat`
2. Suivez les instructions à l'écran
3. Le navigateur s'ouvrira automatiquement

### Option 2 : PowerShell
1. Ouvrez PowerShell dans ce dossier
2. Exécutez : `.\start-test-server.ps1`
3. Suivez les instructions à l'écran

### Option 3 : Manuel
1. Ouvrez un terminal dans ce dossier
2. Exécutez : `python -m http.server 8000`
3. Ouvrez : http://localhost:8000/test-preview.html

## 🌐 URLs de Test

| URL | Description |
|-----|-------------|
| **http://localhost:8000/test-preview.html** | Page de test principale |
| **http://localhost:8000/vitrine-new.html** | Nouvelle vitrine complète |
| **http://localhost:8000/vitrine-preview.html** | Prévisualisation structure |
| **http://localhost:8000/vitrine-old.html** | Ancienne version (backup) |
| **http://localhost:8000/dashboard.html?marketing=1** | Dashboard marketing |

## 🎯 Points à Vérifier

### 1. Design System
- [ ] Polices : Cormorant Garamond (titres), DM Sans (corps), Space Mono (badges)
- [ ] Couleurs : #C8960C (or), #0A1520 (navy), #E2D8C0 (texte), #8AAAC0 (muted)
- [ ] Contrastes : Lisibilité sur tous les fonds

### 2. Responsive Design
- [ ] Desktop (> 1024px) : Grilles 3-4 colonnes
- [ ] Tablette (768px-1024px) : Grilles 2 colonnes
- [ ] Mobile (< 768px) : 1 colonne, menu hamburger
- [ ] Test sur différentes tailles d'écran

### 3. Navigation
- [ ] Menu fixe fonctionnel
- [ ] Liens d'ancrage (#formations, #avantages, etc.)
- [ ] Menu mobile (fenêtre < 768px)
- [ ] Scroll smooth activé

### 4. Intégration Dashboard
- [ ] Liens vers `dashboard.html` fonctionnels
- [ ] Liens vers `dashboard.html?marketing=1` fonctionnels
- [ ] Boutons "S'inscrire" pointent vers dashboard
- [ ] Bouton "Brochure" ouvre l'espace marketing

### 5. Animations & Interactions
- [ ] Stats animées (compteurs)
- [ ] Cartes au survol (hover effects)
- [ ] Slider témoignages (animation automatique)
- [ ] Transitions fluides

### 6. Performance
- [ ] Temps de chargement acceptable
- [ ] Images/icons optimisées
- [ ] Polices Google chargées correctement
- [ ] Pas d'erreurs console

### 7. Contenu
- [ ] 9 sections présentes et complètes
- [ ] 6 formations détaillées
- [ ] Grille tarifaire visible
- [ ] Assistant IA (3 tiers)
- [ ] Témoignages réels
- [ ] Footer complet avec contacts

## 🔧 Tests Techniques

### Console Navigateur
1. Ouvrir DevTools (F12)
2. Vérifier les erreurs dans Console
3. Vérifier les warnings

### Network Analysis
1. Onglet Network dans DevTools
2. Vérifier temps de chargement
3. Vérifier statut HTTP (200 OK)

### Mobile Testing
1. Outils développeur > Toggle Device Toolbar
2. Tester différents devices (iPhone, iPad, Android)
3. Tester orientations portrait/paysage

### Accessibilité
1. Outils développeur > Lighthouse
2. Exécuter audit accessibilité
3. Vérifier contrastes couleurs

## 📊 Checklist Validation

### Section 1 : Navigation
- [ ] Logo AGTM visible
- [ ] Menu de navigation complet
- [ ] Boutons CTA "Brochure" et "Espace Apprenant"
- [ ] Menu mobile fonctionnel

### Section 2 : Hero
- [ ] Titre accrocheur présent
- [ ] Badge "Excellence académique"
- [ ] 4 stats animées
- [ ] 3 boutons d'action

### Section 3 : Formations (6 programmes)
- [ ] Anglais Général (35 000 FCFA)
- [ ] Business English (50 000 FCFA)
- [ ] Préparation TOEIC (60 000 FCFA)
- [ ] Préparation TOEFL (65 000 FCFA)
- [ ] Anglais Junior (25 000 FCFA)
- [ ] Cours Particuliers (75 000 FCFA)

### Section 4 : Avantages AGTM
- [ ] Pédagogie sur mesure
- [ ] Technologie IA avancée
- [ ] Modes de formation flexibles

### Section 5 : Tarifs
- [ ] Tableau tarifaire complet
- [ ] 6 programmes avec prix
- [ ] Réductions indiquées

### Section 6 : Assistant IA
- [ ] 3 tiers (Essentiel, Recommandé, Entreprise)
- [ ] Fonctionnalités détaillées
- [ ] Prix clairs

### Section 7 : Témoignages
- [ ] 5 témoignages minimum
- [ ] Photos/avatars
- [ ] Citations complètes

### Section 8 : CTA Final
- [ ] Titre motivant
- [ ] 3 boutons d'action
- [ ] Garanties mentionnées

### Section 9 : Footer
- [ ] 4 colonnes d'informations
- [ ] Coordonnées complètes
- [ ] Liens vers formations
- [ ] Mentions légales

## 🐛 Dépannage

### Serveur ne démarre pas
```bash
# Vérifier Python
python --version

# Vérifier port 8000
netstat -ano | findstr :8000

# Libérer port
taskkill /F /PID [PID]
```

### Pages ne se chargent pas
1. Vérifier console navigateur
2. Vérifier URL (http://localhost:8000/)
3. Actualiser (Ctrl+F5)
4. Tester autre navigateur

### Polices non chargées
1. Vérifier connexion internet
2. Vérifier console pour erreurs Google Fonts
3. Tester en local sans polices externes

### Liens non fonctionnels
1. Vérifier URLs dans code source
2. Tester en cliquant directement
3. Vérifier console pour erreurs 404

## ✅ Validation Finale

Avant déploiement, vérifier que :
- [ ] Tous les tests ci-dessus sont OK
- [ ] Aucune erreur console
- [ ] Design conforme aux spécifications
- [ ] Responsive fonctionnel sur tous devices
- [ ] Performance acceptable
- [ ] Contenu complet et correct

## 📞 Support

En cas de problème :
1. Consulter ce fichier TEST_INSTRUCTIONS.md
2. Vérifier console navigateur
3. Tester avec script batch
4. Documenter le problème rencontré

---

**Date du test :** 20/04/2026  
**Version testée :** Nouvelle vitrine AGTM v1.0  
**Testeur :** [Votre nom]  
**Statut :** ✅ Prêt pour validation / ⚠️ Corrections nécessaires