# 🚀 Guide de Déploiement Netlify - AGTM Digital Academy

## 📋 Résumé

**Nouvelle vitrine** : `vitrine-new.html` avec design premium et flux d'inscription amélioré  
**Statut** : ✅ Prête pour déploiement  
**Intégrations** : ✅ Vérifiées avec dashboard existant  
**Action requise** : ⚠️ Configurer le lien chatbot réel

---

## 📁 Structure des fichiers

```
WEB_PORTAL AGTM DIGITAL ACADEMY/          ← Dossier à déployer
├── 📄 vitrine-new.html                   ← NOUVELLE VITRINE PRINCIPALE
├── 📄 dashboard.html                     ← Espace apprenant/marketing
├── 📄 inscription.html                   ← Formulaire (888 lignes)
├── 📄 vitrine-old.html                   ← Backup ancienne version
├── 📄 netlify.toml                       ← Configuration Netlify
├── 📄 deployment-guide.md                ← Ce guide
├── 📄 verification-integrations.md       ← Vérifications techniques
├── 📄 preview-integration-dashboard.html ← Prévisualisation intégration
├── 📄 preview-modifications-v2.html      ← Prévisualisation design
├── 📄 test-final.html                    ← Page de test
├── 📄 quick-preview.html                 ← Prévisualisation rapide
├── 📁 Contenu Dashboard/                 ← Fichiers marketing
│   └── 📁 Marketing/                     ← Brochures PDF existantes
└── 📁 assets/                            ← Images, polices (si nécessaire)
```

---

## 🔧 Configuration requise avant déploiement

### 1. ⚠️ **Lien Chatbot** (ACTION REQUISE)
**Problème** : Les boutons chatbot pointent actuellement vers `#` (lien temporaire)  
**Solution** : Remplacer par le lien réel avant déploiement

**Options** :
```html
<!-- Option 1 : Page de contact temporaire -->
<a href="/contact-chatbot.html" class="btn-premium btn-chatbot-premium">

<!-- Option 2 : Widget chatbot externe -->
<a href="https://chat.agtm.com" class="btn-premium btn-chatbot-premium">

<!-- Option 3 : Lien WhatsApp Business -->
<a href="https://wa.me/225XXXXXXXXX" class="btn-premium btn-chatbot-premium">
```

**Fichiers à modifier** :
- `vitrine-new.html` (tous les boutons "💬 Parler à un conseiller")
- `preview-modifications-v2.html`
- `test-final.html`

### 2. ✅ **Vérifications automatiques**
- [x] Tous les liens fonctionnels testés
- [x] Responsive design vérifié
- [x] Intégrations backend validées
- [x] Backup ancienne version créé

---

## 🚀 Méthodes de déploiement Netlify

### **Option A : Drag & Drop (Recommandé)**
1. Aller sur [netlify.com](https://netlify.com)
2. Se connecter avec votre compte
3. Glisser-déposer le dossier **"WEB_PORTAL AGTM DIGITAL ACADEMY"**
4. Netlify déploie automatiquement
5. URL générée : `https://[nom-aléatoire].netlify.app`

### **Option B : GitHub/GitLab**
1. Créer un repository avec les fichiers
2. Connecter Netlify au repository
3. Configurer :
   - **Build command** : (laisser vide - site statique)
   - **Publish directory** : `WEB_PORTAL AGTM DIGITAL ACADEMY`
4. Déployer

### **Option C : CLI Netlify**
```bash
# Installation
npm install -g netlify-cli

# Connexion
netlify login

# Déploiement
cd "WEB_PORTAL AGTM DIGITAL ACADEMY"
netlify deploy --prod --dir=.
```

---

## ⚙️ Configuration Netlify

### **Variables d'environnement** (optionnel - si Supabase)
Dans Netlify UI → Site settings → Environment variables :
```
SUPABASE_URL = votre-url-supabase
SUPABASE_ANON_KEY = votre-clé-anonyme
```

### **Domain personnalisé** (optionnel)
1. Netlify UI → Domain settings
2. Ajouter domaine personnalisé
3. Configurer DNS chez votre registrar

### **SSL/HTTPS**
✅ **Automatique** avec Netlify (Let's Encrypt)

---

## 🧪 Tests post-déploiement

### **Test 1 : Accès principal**
```
https://votre-domaine.netlify.app/
→ Doit rediriger vers vitrine-new.html
```

### **Test 2 : Flux d'inscription**
1. Bouton "💬 Parler à un conseiller" (chatbot)
2. Bouton "🎯 Test de placement gratuit" (dashboard.html)
3. Bouton "📝 S'inscrire maintenant" (inscription.html)

### **Test 3 : Intégrations dashboard**
```
https://votre-domaine.netlify.app/dashboard.html?marketing=1
→ Doit ouvrir l'onglet marketing avec brochures PDF
```

### **Test 4 : Responsive mobile**
- Tester sur mobile réel
- Vérifier menu hamburger
- Vérifier tailles de police

### **Test 5 : Performance**
- Google PageSpeed Insights
- WebPageTest.org
- Netlify Analytics (si activé)

---

## 🔄 Rollback Plan (en cas de problème)

### **Étape 1 : Restaurer ancienne version**
```bash
# Renommer les fichiers
mv vitrine-new.html vitrine-v2-backup.html
mv vitrine-old.html vitrine.html

# Mettre à jour netlify.toml
[[redirects]]
  from = "/"
  to = "/vitrine.html"
  status = 200
```

### **Étape 2 : Redéployer**
- Re-uploader les fichiers modifiés
- Ou faire un nouveau commit Git

### **Étape 3 : Vérifier**
- Tester l'ancienne vitrine
- Vérifier que tous les liens fonctionnent

---

## 📊 Monitoring post-déploiement

### **À surveiller les premières 24h**
1. **Erreurs console** : Ouvrir DevTools (F12)
2. **Liens cassés** : Vérifier tous les CTA
3. **Performance** : Temps de chargement
4. **Formulaires** : Test d'inscription complet

### **Outils recommandés**
- **Netlify Analytics** : Traffic et performances
- **Google Analytics** : Comportement utilisateurs
- **Console Netlify** : Logs et erreurs

---

## 🆘 Support et dépannage

### **Problèmes courants**

#### ❌ **Liens ne fonctionnent pas**
**Cause** : Chemins relatifs incorrects  
**Solution** : Vérifier que tous les liens commencent par `/` ou sont relatifs

#### ❌ **Images non chargées**
**Cause** : Chemins incorrects  
**Solution** : Vérifier le dossier `assets/` et les chemins

#### ❌ **Dashboard ne se charge pas**
**Cause** : Problème Supabase CORS  
**Solution** : Vérifier les variables d'environnement Netlify

#### ❌ **Formulaire ne soumet pas**
**Cause** : Configuration Supabase  
**Solution** : Vérifier les credentials et tables

### **Contacts support**
- **Netlify Support** : [support@netlify.com](mailto:support@netlify.com)
- **Développeur backend** : Pour intégrations Supabase
- **Équipe marketing** : Pour validation contenu

---

## ✅ Checklist finale avant déploiement

### **AVANT déploiement**
- [ ] Configurer lien chatbot réel
- [ ] Tester localement tous les liens
- [ ] Vérifier responsive sur 3 devices
- [ ] Sauvegarder ancienne version
- [ ] Préparer rollback plan

### **PENDANT déploiement**
- [ ] Uploader tous les fichiers
- [ ] Configurer redirects Netlify
- [ ] Tester sur domaine staging
- [ ] Valider intégrations

### **APRÈS déploiement**
- [ ] Tester flux complet utilisateur
- [ ] Vérifier performances
- [ ] Monitorer erreurs 24h
- [ ] Mettre à jour bookmarks

---

## 🎯 Résumé technique

### **Améliorations apportées**
1. **Typographie** : Tailles police augmentées, contrastes améliorés
2. **Boutons premium** : Animations, gradients, effets hover
3. **Flux d'inscription** : Chatbot → Test → Inscription
4. **Intégrations** : Dashboard marketing existant réutilisé
5. **Responsive** : Optimisé mobile/tablette/desktop

### **Aucune nouvelle configuration backend nécessaire**
- ✅ Utilise tables Supabase existantes
- ✅ Réutilise fonctions JavaScript du dashboard
- ✅ Pas de nouvelles API à créer
- ✅ Pas de modifications database

### **Statut** : ✅ **PRÊT POUR PRODUCTION**

---

## 📞 Contact et support

**Pour questions techniques** : Référez-vous à `verification-integrations.md`  
**Pour validation marketing** : Voir `preview-integration-dashboard.html`  
**Pour tests** : Utiliser `test-final.html`

**Dernière étape** : Confirmer que le lien chatbot est configuré avant déploiement.

---

**✅ La nouvelle vitrine AGTM Digital Academy est prête à être déployée sur Netlify.**