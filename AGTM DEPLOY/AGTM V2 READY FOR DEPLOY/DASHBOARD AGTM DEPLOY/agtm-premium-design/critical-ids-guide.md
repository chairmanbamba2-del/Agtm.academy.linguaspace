# Guide des IDs Critiques - AGTM Digital Academy
## IDs utilisés par les 33 modules pour le RBAC et les appels Supabase

**⚠️ ATTENTION :** Ces IDs sont utilisés par la logique métier JavaScript pour le système RBAC, les requêtes Supabase, et la navigation. Ils ne doivent **PAS** être modifiés lors de la refonte visuelle Premium.

---

## 🔐 IDs CRITIQUES POUR LA LOGIQUE MÉTIER

### 1. STRUCTURE PRINCIPALE DE L'APPLICATION
| ID | Description | Rôle | Module(s) | Usage JavaScript |
|---|---|---|---|---|
| `app` | Conteneur principal de l'application (affiché après chargement) | Structure | Tous | `document.getElementById('app').style.display = 'block'` |
| `loading` | Écran de chargement initial | UX | Tous | Masqué après authentification |
| `mainSidebar` | Barre latérale de navigation principale | Navigation | Tous | `window._toggleSidebar()` |
| `sidebarOverlay` | Overlay mobile pour fermer sidebar | Mobile | Tous | `window._closeSidebar()` |
| `hamburgerBtn` | Bouton hamburger pour ouvrir/fermer sidebar | Mobile | Tous | `window._toggleSidebar()` |
| `sidebarCloseBtn` | Bouton fermeture sidebar mobile | Mobile | Tous | `window._closeSidebar()` |
| `content` | Zone de contenu principale | Structure | Tous | Injection de contenu dynamique |
| `navList` | Liste des éléments de navigation | Navigation | Tous | `window.buildSidebar()` |
| `pageTitle` | Titre de la page courante | UX | Tous | `document.getElementById('pageTitle').textContent = ...` |
| `navBackBtn` | Bouton retour navigation | Navigation | Tous | `window._navBack()` |

### 2. COMPTE UTILISATEUR & AUTHENTIFICATION
| ID | Description | Rôle | Module(s) | Usage JavaScript |
|---|---|---|---|---|
| `sidebarUser` | Carte utilisateur dans sidebar | Profil | Tous | Mise à jour après login |
| `sidebarUserAvatar` | Avatar utilisateur sidebar | Profil | Tous | `document.getElementById('sidebarUserAvatar').textContent = ...` |
| `sidebarUserName` | Nom utilisateur sidebar | Profil | Tous | Mise à jour dynamique |
| `sidebarUserRole` | Rôle utilisateur sidebar | RBAC | Tous | `profile.role` |
| `sidebarUserEmail` | Email utilisateur sidebar | Profil | Tous | Affichage info |
| `profileWrap` | Conteneur menu profil (topbar) | Profil | Tous | `window._toggleProfile()` |
| `profileAvatar` | Avatar topbar | Profil | Tous | Mise à jour dynamique |
| `profileName` | Nom utilisateur topbar | Profil | Tous | `profile.prenom + ' ' + profile.nom` |
| `profileDrop` | Dropdown menu profil | Profil | Tous | `window._toggleProfile()` |
| `profileDropHeader` | Header dropdown profil | Profil | Tous | Contenu dynamique |

### 3. RECHERCHE & COMMAND PALETTE (Ctrl+K)
| ID | Description | Rôle | Module(s) | Usage JavaScript |
|---|---|---|---|---|
| `searchBarWrap` | Conteneur barre de recherche | Recherche | Tous | `window._globalSearch()` |
| `globalSearchInput` | Champ recherche global | Recherche | Tous | `oninput="window._globalSearch(this.value)"` |
| `searchResults` | Résultats recherche | Recherche | Tous | Affichage dropdown |
| `cmdPalette` | Palette de commandes (Ctrl+K) | Navigation | Tous | `window._openCmd()` |
| `cmdBox` | Boîte palette commandes | Navigation | Tous | `window._closeCmd()` |
| `cmdInput` | Champ saisie commandes | Navigation | Tous | `window._cmdSearch(this.value)` |
| `cmdList` | Liste résultats commandes | Navigation | Tous | Rendu dynamique |

### 4. NOTIFICATIONS & MESSAGERIE
| ID | Description | Rôle | Module(s) | Usage JavaScript |
|---|---|---|---|---|
| `notifWrapper` | Conteneur notifications | Notifs | Tous | `window._toggleNotifPanel()` |
| `notifBtn` | Bouton cloche notifications | Notifs | Tous | `window._toggleNotifPanel()` |
| `notifDot` | Badge notifications non lues | Notifs | Tous | Affichage conditionnel |
| `notifPanel` | Panel dropdown notifications | Notifs | Tous | Rendu dynamique |
| `notifList` | Liste notifications | Notifs | Tous | `window._loadNotifications()` |

### 5. MODALS & OVERLAYS SYSTÈME
| ID | Description | Rôle | Module(s) | Usage JavaScript |
|---|---|---|---|---|
| `rdvModal` | Modal prise de rendez-vous | Contact | Tous | `window._openRdv()` |
| `rdvPrenom` | Champ prénom rendez-vous | Contact | Tous | Validation formulaire |
| `rdvNom` | Champ nom rendez-vous | Contact | Tous | Validation formulaire |
| `rdvTel` | Champ téléphone rendez-vous | Contact | Tous | Validation formulaire |
| `rdvEmail` | Champ email rendez-vous | Contact | Tous | Validation formulaire |
| `rdvSujet` | Sélecteur sujet rendez-vous | Contact | Tous | Options dynamiques |
| `rdvMessage` | Message rendez-vous | Contact | Tous | Validation formulaire |
| `rdvBtn` | Bouton soumission rendez-vous | Contact | Tous | `window._submitRdv()` |
| `rdvMsg` | Message feedback rendez-vous | Contact | Tous | Affichage succès/erreur |

### 6. SÉCURITÉ & GESTION DES MOTS DE PASSE
| ID | Description | Rôle | Module(s) | Usage JavaScript |
|---|---|---|---|---|
| `newPwd1` | Nouveau mot de passe (1) | Sécurité | Tous | Validation mot de passe |
| `newPwd2` | Confirmation mot de passe | Sécurité | Tous | Vérification correspondance |
| `pwdErrMsg` | Message erreur mot de passe | Sécurité | Tous | Affichage erreurs |
| `fpCodeInput` | Code d'accès finance (6 chiffres) | Sécurité | Finance | `window._fpVerifyCode()` |
| `fpCodeErr` | Message erreur code finance | Sécurité | Finance | Affichage erreur |

---

## 🧩 IDs PAR MODULE FONCTIONNEL

### MODULE ADMIN - Tableau de bord
| ID | Description | Usage JavaScript |
|---|---|---|
| `chartOvw` | Canvas graphique revenus | `new Chart(document.getElementById('chartOvw'), ...)` |
| `riskContainer` | Conteneur risques financiers | Rendu dynamique risques |
| `cohortContainer` | Conteneur cohortes étudiants | Rendu dynamique cohortes |
| `agendaTodayDate` | Date agenda du jour | Formatage date |
| `agendaTodayContainer` | Conteneur agenda du jour | Rendu événements |

### MODULE ÉTUDIANTS - Gestion apprenants
| ID | Description | Usage JavaScript |
|---|---|---|
| `etudBody` | Corps tableau étudiants | `window._loadEtudiants()` |
| `eaFor` | Sélecteur formation (ajout étudiant) | Options dynamiques |
| `eaQuo` | Champ quota séances | Validation numérique |
| `eaFreq` | Sélecteur fréquence hebdo | Options prédéfinies |
| `eaDeb` | Date début contrat | Validation date |
| `eaFin` | Date fin contrat estimée | Calcul automatique |
| `eaNts` | Notes/observations étudiant | Texte libre |
| `eQuo` | Édition quota séances | Mise à jour étudiant |
| `eFreq` | Édition fréquence/semaine | Mise à jour étudiant |
| `eDeb` | Édition date début contrat | Mise à jour étudiant |
| `eFin` | Édition date fin contrat | Mise à jour étudiant |
| `eNts` | Édition notes étudiant | Mise à jour étudiant |

### MODULE PÉDAGOGIE - Planning & Séances
| ID | Description | Usage JavaScript |
|---|---|---|
| `fcCalendar` | Conteneur calendrier FullCalendar | `new FullCalendar.Calendar(document.getElementById('fcCalendar'), ...)` |
| `edtForm` | Formulaire édition séance | `window._edtOpenSeance(id)` |
| `edtDate` | Date séance | Validation date |
| `edtHeure` | Heure début séance | Validation heure |
| `edtHeureFin` | Heure fin séance | Validation heure |
| `edtStatut` | Statut séance | Options: Planifiée/Réalisée/Annulée |
| `edtProgramme` | Programme/Préparation | Options dynamiques |
| `edtFormat` | Format du cours | Toggle champ lien Meet |
| `edtClasse` | Classe/groupe | Options dynamiques |
| `edtIndividuelBlock` | Bloc étudiant individuel | Affiché si format = Individuel |
| `edtEtudiant` | Étudiant cours individuel | Options dynamiques |
| `edtMeetBlock` | Bloc lien visioconférence | Affiché si format en ligne |
| `edtLien` | Lien Google Meet | Validation URL |
| `edtSeanceId` | ID séance caché | `document.getElementById('edtSeanceId').value = id` |

### MODULE POINTAGE - Présences
| ID | Description | Usage JavaScript |
|---|---|---|
| `presSeance` | Sélecteur séance pour pointage | `window._loadFeuillePresence()` |
| `feuilleContent` | Contenu feuille présence | Rendu dynamique étudiants |
| `presenceRows` | Ligne tableau présences | Rendu dynamique |
| `justif_{etudiant_id}` | Sélecteur justification absence | `window._savePresence()` |
| `ptg_{etudiant_id}` | Checkbox présence étudiant | `window._ptgToggleMotif(id)` |
| `ptg_justif_{etudiant_id}` | Checkbox absence justifiée | Toggle champ motif |
| `ptg_motif_{etudiant_id}` | Champ motif absence | Saisie texte |

### MODULE FINANCE - Facturation & Paiements
| ID | Description | Usage JavaScript |
|---|---|---|
| `chartFin` | Canvas graphique finances | `new Chart(document.getElementById('chartFin'), ...)` |
| `pfEtud` | Sélecteur client/étudiant | `window._pfFill()` |
| `pfLignes` | Conteneur lignes prestations | Rendu dynamique |
| `pfAppliquertVA` | Checkbox TVA | `window._pfCalc()` |
| `pfTvaInfo` | Info TVA | Affichage conditionnel |
| `pfTotal` | Total facture proforma | Calcul automatique |
| `plnE` | Sélecteur étudiant plan de paiement | Options dynamiques |
| `_echDate` | Date échéance paiement | Validation date |
| `_echMont` | Montant échéance | Validation numérique |

### MODULE RAPPORTS - Suivi pédagogique
| ID | Description | Usage JavaScript |
|---|---|---|
| `rC` | Contenu séance rapport | Validation texte |
| `rsObj` | Objectifs atteints | Validation texte |
| `rprog_Bonne`, `rprog_Moyenne`, `rprog_À_améliorer` | Boutons progression | `window._rsSetProg('valeur')` |
| `rsObs` | Observations complémentaires | Texte libre |
| `rchDateMin`, `rchDateMax` | Dates recherche | Validation période |
| `rchTheme` | Thème recherche | Filtrage texte |
| `rchEtudiant` | Étudiant recherche | Filtrage texte |
| `rchStatut` | Statut recherche | Options dynamiques |
| `rchResults` | Résultats recherche | Rendu dynamique |

### MODULE IA - Assistant conversationnel
| ID | Description | Usage JavaScript |
|---|---|---|
| `aiSidebar` | Sidebar historique conversations | Navigation historique |
| `aiChatBox` | Zone messages chat | `window._renderMsgs(messages)` |
| `aiTypingIndicator` | Indicateur écriture IA | Affichage pendant génération |
| `aiDots` | Points animation écriture | Animation JavaScript |
| `aiVoiceLiveBar` | Barre dictée vocale active | Affichage pendant enregistrement |
| `aiVoiceLiveText` | Texte dictée en cours | Mise à jour en temps réel |
| `aiClarityBadge` | Badge clarté dictée | Score reconnaissance vocale |
| `aiMicBtn` | Bouton microphone | `window._aiMicToggle()` |
| `aiLangBtn` | Bouton langue vocale | `window._aiToggleLang()` |
| `aiMsgInput` | Champ saisie message | `window._aiSendMsg()` |
| `aiTTSBtn` | Bouton lecture vocale | `window._aiToggleTTS()` |
| `aiTTSRateCtrl` | Contrôle vitesse TTS | `window._aiSetTTSRate()` |
| `aiTTSRateLbl` | Label vitesse TTS | Affichage valeur |
| `aiSendBtn` | Bouton envoyer message | `window._aiSendMsg()` |

### MODULE ENGLISH CORNER - Évaluations & Quiz
| ID | Description | Usage JavaScript |
|---|---|---|
| `eqa_{i}` | Champ réponse texte libre (question i) | Validation réponse |
| `evalQContainer` | Conteneur questions évaluation | Rendu dynamique quiz |
| `evErr` | Message erreur évaluation | Affichage validation |
| `_apEvalTimer` | Timer évaluation | Format mm:ss |
| `_evOpts` | Options QCM évaluation | `window._apModEvalPick(i)` |
| `_evo_{i}` | Bouton option i évaluation | Sélection réponse |
| `_ptOpts` | Options test placement | `window._apPlacementPick(i)` |
| `_pto_{i}` | Bouton option i placement | Sélection réponse |
| `_apPTimer` | Timer test placement | Format mm:ss |
| `_certBtn` | Bouton génération certificat | `window._apPrintCert(...)` |
| `_dlCertBtn` | Bouton téléchargement certificat | Export HTML |

### MODULE PARAMÈTRES - Administration système
| ID | Description | Usage JavaScript |
|---|---|---|
| `cfgAiActif` | Checkbox activation IA | `window._saveAiConfig()` |
| `cfgExternalSearch` | Checkbox recherche externe | `window._saveAiConfig()` |
| `cfg_{key}` | Sélecteurs configuration IA (claude, groq, etc.) | Options modèles |
| `cfgTierDefaut` | Tier IA par défaut | Sélection legacy |
| `cfgMaxTokens` | Max tokens par réponse | Validation numérique |
| `cfgSearchUser` | Recherche utilisateur configuration | `window._cfgSearchUser()` |
| `cfgUserTierResult` | Résultats recherche utilisateur | Rendu dynamique |
| `aiUserFilter` | Filtre utilisateurs IA | `window._aiFilterUsers()` |
| `aiUsersList` | Liste utilisateurs configuration | Rendu dynamique |
| `uov_tier_{id}` | Sélecteur tier utilisateur | `window._saveUserOverride(id)` |
| `uov_search_{id}` | Sélecteur recherche web utilisateur | `window._saveUserOverride(id)` |
| `uov_max_{id}` | Champ max messages/mois utilisateur | Validation numérique |
| `uov_images_{id}` | Checkbox génération images utilisateur | Toggle permission |
| `aiInstrTextarea` | Instructions personnalisées IA | `window._saveAiInstructions()` |
| `aiKnowledgeList` | Liste base connaissances | Rendu dynamique |

---

## 🎯 DATA-ATTRIBUTES CRITIQUES

### Navigation & RBAC
- `data-id` sur les boutons navigation : `nav_${item.id}` - utilisé par `window.navigateTo()`
- `data-etud-id` sur les checkboxes étudiants : utilisé pour les sélections groupe
- `data-etud-nom` sur les checkboxes étudiants : affichage nom
- `data-etud-ndossier` sur les checkboxes étudiants : numéro dossier

### Formulaires & Validation
- `data-rid` sur les lignes étudiants : ID temporaire pour gestion
- `data-seance-id` sur les événements calendrier : ID séance pour édition

---

## ⚠️ RÈGLES DE PRÉSERVATION POUR LA REFONTE PREMIUM

### 1. **NE PAS MODIFIER**
- Les valeurs des attributs `id` listés ci-dessus
- Les `data-attributes` utilisés par la logique JavaScript
- Les noms de classes CSS avec préfixe `nav-`, `cmd-`, `ai-`, `pf-`, `ptg-`, `edt-`

### 2. **PEUT ÊTRE STYLISÉ**
- Les styles visuels (couleurs, bordures, ombres, animations)
- Les tailles et espacements (avec précaution pour le responsive)
- Les polices (garder la lisibilité)

### 3. **DOIT RESTER FONCTIONNEL**
- La structure HTML des conteneurs listés
- L'ordre des éléments dans les formulaires critiques
- Les types d'input (text, date, time, number, etc.)
- Les événements JavaScript (`onclick`, `oninput`, `onchange`)

### 4. **TEST OBLIGATOIRE APRÈS MODIFICATION**
- Navigation entre tous les modules
- Soumission des formulaires principaux
- Système RBAC (changement de rôle)
- Responsive mobile/tablette
- Accessibilité (tabindex, aria-labels)

---

## 🔧 FICHIERS DE CONFIGURATION ASSOCIÉS

### JavaScript Modules (à préserver)
- `dashboard.html` (logique inline ~2000 lignes)
- `pedagogy-content.js` (contenu pédagogique)
- `sw.js` (Service Worker - PWA)

### CSS Existant (à migrer)
- Styles inline dans `dashboard.html`
- Variables CSS `:root` (déjà extraites dans `design-tokens.css`)
- Classes utilitaires Tailwind (config dans `<script>`)

### Base de données Supabase (schéma)
- Tables : `profiles`, `etudiants`, `seances`, `presences`, `rapports`, `ai_sessions`, etc.
- RLS Policies (Row Level Security)
- Functions & Triggers

---

**Dernière mise à jour :** 21/04/2026  
**Responsable intégration :** Architecte Logiciel AGTM  
**Version :** 1.0 (Audit initial)