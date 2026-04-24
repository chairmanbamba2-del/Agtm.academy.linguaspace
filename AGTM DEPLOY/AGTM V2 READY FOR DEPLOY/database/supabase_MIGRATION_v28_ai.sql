-- ============================================================
--  MIGRATION v28 — Assistant IA AGTM
--  Tables : ai_config, ai_knowledge, ai_conversations
--  Colonne : utilisateurs.ai_tier
-- ============================================================

-- ── 1. COLONNE ai_tier SUR UTILISATEURS ─────────────────────
ALTER TABLE utilisateurs
  ADD COLUMN IF NOT EXISTS ai_tier text NOT NULL DEFAULT 'essentiel'
  CHECK (ai_tier IN ('essentiel','recommande','premium'));

-- ── 2. TABLE ai_config (configuration globale IA) ────────────
CREATE TABLE IF NOT EXISTS ai_config (
  id           bigserial PRIMARY KEY,
  cle          text UNIQUE NOT NULL,
  valeur       text NOT NULL,
  description  text,
  updated_by   text,
  updated_at   timestamptz DEFAULT now()
);

-- ── 3. TABLE ai_knowledge (base de connaissances) ────────────
CREATE TABLE IF NOT EXISTS ai_knowledge (
  id          bigserial PRIMARY KEY,
  categorie   text NOT NULL
    CHECK (categorie IN ('programme','tarifs','reglement','pedagogie','infos_ecole','exercices','faq')),
  niveau      text CHECK (niveau IN ('A1','A2','B1','B2','C1','all')),
  titre       text NOT NULL,
  contenu     text NOT NULL,
  actif       boolean NOT NULL DEFAULT true,
  priorite    int NOT NULL DEFAULT 5,
  updated_by  text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_knowledge_categorie ON ai_knowledge(categorie);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_niveau    ON ai_knowledge(niveau);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_actif     ON ai_knowledge(actif);

-- ── 4. TABLE ai_conversations (historique) ───────────────────
CREATE TABLE IF NOT EXISTS ai_conversations (
  id           bigserial PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id   text NOT NULL DEFAULT gen_random_uuid()::text,
  role         text NOT NULL CHECK (role IN ('user','assistant')),
  content      text NOT NULL,
  model_used   text,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_conv_user    ON ai_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conv_session ON ai_conversations(session_id);

-- ── 5. RLS ───────────────────────────────────────────────────
ALTER TABLE ai_config        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- ai_config : tous les authentifiés peuvent lire, admin écrit
DROP POLICY IF EXISTS "ai_config_read"  ON ai_config;
DROP POLICY IF EXISTS "ai_config_admin" ON ai_config;
CREATE POLICY "ai_config_read"  ON ai_config FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ai_config_admin" ON ai_config FOR ALL
  USING (public.urol() = 'admin') WITH CHECK (public.urol() = 'admin');

-- ai_knowledge : tous authentifiés lisent, admin écrit
DROP POLICY IF EXISTS "ai_knowledge_read"  ON ai_knowledge;
DROP POLICY IF EXISTS "ai_knowledge_admin" ON ai_knowledge;
CREATE POLICY "ai_knowledge_read"  ON ai_knowledge FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ai_knowledge_admin" ON ai_knowledge FOR ALL
  USING (public.urol() = 'admin') WITH CHECK (public.urol() = 'admin');

-- ai_conversations : chaque utilisateur voit uniquement ses messages
DROP POLICY IF EXISTS "ai_conv_own" ON ai_conversations;
CREATE POLICY "ai_conv_own" ON ai_conversations FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
-- Admin peut voir tout
DROP POLICY IF EXISTS "ai_conv_admin" ON ai_conversations;
CREATE POLICY "ai_conv_admin" ON ai_conversations FOR SELECT
  USING (public.urol() IN ('admin','directeur_pedagogique'));

-- ── 6. SEED — Configuration IA par défaut ────────────────────
INSERT INTO ai_config (cle, valeur, description) VALUES
  ('modele_essentiel',  'claude-haiku-4-5-20251001',    'Modèle niveau Essentiel (abordable)'),
  ('modele_recommande', 'claude-sonnet-4-6',             'Modèle niveau Recommandé (équilibré)'),
  ('modele_premium',    'claude-opus-4-6',               'Modèle niveau Premium (le plus performant)'),
  ('ai_actif',          'true',                          'Activer/désactiver l''IA globalement'),
  ('tier_defaut',       'essentiel',                     'Niveau IA par défaut pour nouveaux étudiants'),
  ('max_tokens',        '1024',                          'Longueur maximale des réponses IA'),
  ('instructions_admin','',                              'Instructions spécifiques admin injectées dans tous les prompts')
ON CONFLICT (cle) DO NOTHING;

-- ── 7. SEED — Base de connaissances pédagogiques AGTM ────────

-- ── INFOS ÉCOLE ──
INSERT INTO ai_knowledge (categorie, niveau, titre, contenu, priorite) VALUES
('infos_ecole', 'all', 'AGTM Academy — Présentation', $$
AGTM Digital Academy est une école de langues spécialisée dans l'enseignement de l'anglais en présentiel et en ligne. Elle forme des apprenants de tous niveaux, du débutant absolu (A1) au niveau avancé (C1), avec un accent particulier sur l'anglais professionnel et le Business English.

MISSION : Rendre l'anglais accessible à tous en combinant pédagogie communicative, technologie et suivi personnalisé.

VALEURS : Excellence pédagogique, bienveillance, persévérance, professionnalisme.

OFFRES : Cours individuels, cours en groupe (max 8 étudiants), formation intensive, Business English, préparation aux certifications (TOEIC, IELTS, TOEFL).

FORMAT : Séances de 1h à 1h30, fréquence 2 à 3 fois/semaine. Supports numériques fournis.

CERTIFICATIONS PRÉPARÉES : TOEIC (Listening & Reading), IELTS Academic, TOEFL iBT, Cambridge (B2 First, C1 Advanced).
$$, 10),

('infos_ecole', 'all', 'Règles et fonctionnement AGTM', $$
PONCTUALITÉ : Les séances commencent à l'heure précise. Un retard de plus de 15 minutes est considéré comme une absence.

ABSENCES : Toute absence doit être signalée avant la séance. Les absences justifiées (certificat médical) peuvent être rattrapées dans les 2 semaines.

DEVOIRS : Les exercices donnés par le formateur sont obligatoires. Ils font partie intégrante de la progression.

PROGRESSION : Une évaluation est réalisée toutes les 4 séances pour mesurer la progression et adapter le programme.

MATÉRIEL : Un accès numérique aux supports de cours est fourni à chaque étudiant via le portail AGTM.

RESPECT : Un environnement d'apprentissage respectueux est exigé. La langue anglaise est encouragée dès le niveau A2 en classe.

PAIEMENT : Les frais de formation sont payables en début de mois. Des plans de paiement en plusieurs échéances sont disponibles.
$$, 9);

-- ── MÉTHODE PÉDAGOGIQUE ──
INSERT INTO ai_knowledge (categorie, niveau, titre, contenu, priorite) VALUES
('pedagogie', 'all', 'Méthode pédagogique AGTM — Approche communicative', $$
L'AGTM Academy utilise l'APPROCHE COMMUNICATIVE combinée au TASK-BASED LEARNING.

PRINCIPES FONDAMENTAUX :
1. L'apprenant est acteur de son apprentissage — on le fait parler dès le 1er cours
2. L'erreur est une étape normale et constructive — jamais sanctionnée
3. La grammaire est outil, pas but — on apprend les règles pour communiquer
4. 4 compétences développées en parallèle : Listening, Speaking, Reading, Writing

STRUCTURE D'UNE SÉANCE TYPE (1h30) :
- 10 min : Warm-up (révision + activation)
- 20 min : Présentation nouveau contenu (grammaire/vocabulaire)
- 30 min : Practice (exercices guidés → semi-guidés)
- 25 min : Production libre (conversation, writing, roleplay)
- 5 min : Wrap-up + devoir

NIVEAUX CEFR UTILISÉS :
A1 (Débutant) → A2 (Élémentaire) → B1 (Intermédiaire) → B2 (Intermédiaire avancé) → C1 (Avancé) → C2 (Maîtrise)

ÉVALUATION CONTINUE : Tests courts toutes les 4 séances (20 min). Évaluation formative, pas punitive.

OUTILS NUMÉRIQUES : Supports PDF, quiz interactifs, vidéos, podcasts adaptés au niveau.
$$, 10);

-- ── PROGRAMME A1 ──
INSERT INTO ai_knowledge (categorie, niveau, titre, contenu, priorite) VALUES
('programme', 'A1', 'Programme A1 — Débutant (6 semaines)', $$
NIVEAU A1 — DÉBUTANT COMPLET
Durée : 6 semaines (12 séances de 1h30)
Objectif : Communiquer dans des situations très simples du quotidien

SEMAINE 1-2 : BASES ABSOLUES
- Alphabet anglais et phonétique de base (sons /æ/, /ɪ/, /ʌ/, /ɒ/)
- Salutations : Hello/Hi, Good morning/afternoon/evening, Goodbye/Bye
- Se présenter : My name is..., I am from..., I live in..., I am X years old
- Chiffres 1-100, lettres et épellation
- Articles : a, an, the

SEMAINE 3-4 : STRUCTURES DE BASE
- Pronom sujets : I, you, he, she, it, we, they
- Verbe BE au présent : I am, you are, he/she/it is, we are, they are
- Questions simples : Are you...? Is he/she...? What is your name?
- Vocabulaire thématique : famille (mother, father, brother, sister, son, daughter), couleurs (red, blue, green...), jours de la semaine, mois

SEMAINE 5-6 : COMMUNICATION BASIQUE
- Present Simple (verbes courants) : I like, I have, I work, I live
- Verbes courants : have, like, want, need, go, come, eat, drink, work, study
- Vocabulaire : nourriture et boissons, vêtements, corps humain
- Phrases négatives : I don't like, He doesn't work
- Questions : Do you like...? Does she have...?

EXERCICES TYPES A1 :
- Compléter des phrases avec le bon pronom
- Exercices de substitution (remplacement de mots)
- Écrire des phrases simples sur soi-même
- Dialogues guidés : salutations, se présenter
- Écoute de dialogues simples et répondre à des questions basiques

VOCABULAIRE CÉ A1 : 300 mots essentiels (maison, famille, nourriture, ville, transports, météo basique)
$$, 10),

-- ── PROGRAMME A2 ──
('programme', 'A2', 'Programme A2 — Élémentaire (8 semaines)', $$
NIVEAU A2 — ÉLÉMENTAIRE
Durée : 8 semaines (16 séances de 1h30)
Prérequis : Niveau A1 validé
Objectif : Comprendre des expressions familières, communiquer sur des sujets connus

SEMAINE 1-2 : RÉVISION A1 + EXTENSION
- Past Simple (verbes réguliers et irréguliers courants) : walked, went, saw, had, was/were
- Événements passés : Yesterday I went to..., Last week she visited...
- Négation passé : I didn't go, He didn't see
- Questions passé : Did you go? What did she do?
- Verbes irréguliers courants (50 essentiels) : go/went, have/had, see/saw, come/came...

SEMAINE 3-4 : LE FUTUR
- Future avec "going to" : I am going to travel next month
- Future avec "will" : I think it will rain. I'll help you.
- Différence going to vs will
- Vocabulaire : voyages et transports, pays et nationalités

SEMAINE 5-6 : COMPARATIFS ET SUPERLATIFS
- Comparatifs : bigger, more expensive, better, worse
- Superlatifs : the biggest, the most expensive, the best
- Adverbes de fréquence : always, usually, often, sometimes, rarely, never
- Vocabulaire : shopping, prix, vêtements, descriptions physiques

SEMAINE 7-8 : COMMUNICATION PRATIQUE
- Modaux simples : can/can't (capacité), must/mustn't (obligation), should/shouldn't (conseil)
- Prepositions de temps et de lieu : at, in, on, under, next to, between, behind
- Vocabulaire : la maison, les pièces, les meubles
- Communication : donner des directions, demander son chemin
- Roleplay : à la gare, à l'hôtel, au restaurant

EXERCICES TYPES A2 :
- Écrire un paragraphe sur ses vacances (past simple)
- Décrire ses projets de week-end (going to / will)
- Comparer deux objets ou deux personnes
- Dialogues : à l'aéroport, au restaurant, chez le médecin
- Écoute : instructions et directions

VOCABULAIRE CLE A2 : 800 mots (professions, voyages, shopping, activités de loisirs, corps humain)
$$, 10),

-- ── PROGRAMME B1 ──
('programme', 'B1', 'Programme B1 — Intermédiaire (12 semaines)', $$
NIVEAU B1 — INTERMÉDIAIRE
Durée : 12 semaines (24 séances de 1h30)
Prérequis : Niveau A2 validé
Objectif : Comprendre l'essentiel sur des sujets courants, voyager sans difficulté, s'exprimer sur des sujets familiers

SEMAINE 1-3 : PRESENT PERFECT
- Forme : have/has + past participle
- Usages : expérience de vie (Have you ever...?), actions récentes (I have just...), résultats présents (She has lost her keys)
- Marqueurs : ever, never, already, yet, just, since, for
- Différence Present Perfect vs Past Simple
- Exercice : interview sur les expériences de vie

SEMAINE 4-5 : CONDITIONALS
- Zero Conditional (vérité générale) : If water reaches 100°C, it boils.
- First Conditional (futur réel) : If it rains, I will stay home.
- Vocabulaire : météo, problèmes quotidiens, conseils

SEMAINE 6-7 : VOIX PASSIVE
- Passive simple : The letter is written. The cake was eaten.
- Usages : quand l'agent est inconnu ou sans importance
- Passive dans les médias et actualités
- Vocabulaire : actualités, société, environnement

SEMAINE 8-9 : MODAUX AVANCÉS
- Would (conditionnel, politesse) : I would like to..., Would you mind...?
- Could (possibilité passée, politesse) : Could you help me?
- Might/May (possibilité) : It might rain. She may be late.
- Had to / Didn't have to (obligation passée)
- Vocabulaire : travail, emploi, entretien d'embauche

SEMAINE 10-12 : COMMUNICATION AVANCÉE
- Reported Speech basique : She said that she was tired.
- Discours indirect (questions et ordres) : He asked if I was ready.
- Phrasal verbs courants (50) : look up, give up, turn on/off, find out, carry on...
- Vocabulaire : technologie, médias, culture, opinion
- Écriture : emails semi-formels, descriptions détaillées
- Speaking : débats simples, donner son opinion, argumenter

EXERCICES TYPES B1 :
- Raconter une expérience en utilisant le Present Perfect + Past Simple
- Écrire un email semi-formel (invitation, réclamation simple)
- Jeux de rôle : entretien d'embauche, négociation simple
- Transformer des phrases actives en passives
- Discussion : "What would you do if...?"

VOCABULAIRE CLÉ B1 : 1500 mots (politique, environnement, technologie, médias, travail)
$$, 10),

-- ── PROGRAMME B2 ──
('programme', 'B2', 'Programme B2 — Intermédiaire avancé (16 semaines)', $$
NIVEAU B2 — INTERMÉDIAIRE AVANCÉ
Durée : 16 semaines (32 séances de 1h30)
Prérequis : Niveau B1 validé — TOEIC 550+ ou Cambridge PET
Objectif : Comprendre des textes complexes, s'exprimer avec spontanéité, communiquer de façon efficace dans un contexte professionnel

SEMAINE 1-3 : CONDITIONALS AVANCÉS
- Second Conditional (hypothèse présente/future) : If I were you, I would...
- Third Conditional (regret/critique passée) : If she had studied, she would have passed.
- Mixed Conditionals : If I had taken that job, I would be rich now.
- Nuances : wish, if only, should have, could have, might have

SEMAINE 4-5 : REPORTED SPEECH AVANCÉ
- Backshift complet des temps
- Verbes introducteurs variés : admit, deny, suggest, insist, refuse, promise
- Reported questions et orders
- Pratique : transformer des discours (interviews, débats)

SEMAINE 6-7 : GRAMMAR AVANCÉE
- Inversions pour emphase : Never have I seen..., Not only did he..., Hardly had she...
- Clauses relatives (defining vs non-defining) : The man who called, My brother, who lives in Paris,...
- Participle clauses : Having finished the work, he left.
- Cleft sentences : It was John who broke the window.

SEMAINE 8-10 : BUSINESS ENGLISH B2
- Emails professionnels formels (demande, réclamation, proposition)
- Réunions et conférences : présenter, interrompre poliment, résumer, conclure
- Négociation basique : faire une offre, contre-proposer, accepter/refuser
- Vocabulaire business : finance basique, ressources humaines, marketing
- Présentation professionnelle (structure, langage formel, transitions)

SEMAINE 11-13 : NUANCES ET STYLE
- Phrasal verbs avancés (100+) avec nuances de sens
- Collocations fortes : make a decision, take responsibility, carry out research
- Registres : formel vs informel, neutre vs académique
- Euphémismes et indirect language du monde des affaires
- Expressions idiomatiques professionnelles : hit the ground running, think outside the box

SEMAINE 14-16 : PRÉPARATION CERTIFICATIONS
- Structure TOEIC / IELTS / TOEFL
- Stratégies : listening (repérer mots clés), reading (skimming & scanning)
- Writing task : essay argument, report, lettre formelle
- Speaking : IELTS Part 2 (2-min talk), Part 3 (discussion)
- Mock tests et debriefs

EXERCICES TYPES B2 :
- Essays argumentatifs (For & Against, Problem & Solution)
- Simulation de réunion en anglais
- Analyse d'un texte économique avec questions de compréhension
- Résumé d'un podcast business (150 mots)
- Jeu de rôle : négociation commerciale

VOCABULAIRE CLÉ B2 : 3000 mots (économie, droit, santé, politique internationale, littérature)
$$, 10),

-- ── PROGRAMME C1 ──
('programme', 'C1', 'Programme C1 — Avancé (20 semaines)', $$
NIVEAU C1 — AVANCÉ
Durée : 20 semaines (40 séances de 1h30)
Prérequis : Niveau B2 validé — TOEIC 785+ ou Cambridge FCE
Objectif : S'exprimer spontanément, fluidement, de façon précise sur des sujets complexes, professionnels et académiques

SEMAINE 1-4 : MAÎTRISE GRAMMATICALE
- Subjunctive (formel) : I suggest that he be informed. It is vital that she attend.
- Advanced passive constructions : It is believed that..., He is thought to be...
- Nominal clauses complexes : What matters is that..., The fact that...
- Emphasis structures : Do + infinitive, fronting, pseudo-cleft (What I want is...)
- Ellipsis et substitution dans le discours naturel

SEMAINE 5-8 : LEXIQUE DE PRÉCISION
- Synonymes nuancés : voir vs observe vs witness vs notice
- Préfixes et suffixes avancés : hyper-, pseudo-, quasi-, -esque, -ish
- False friends français-anglais (150 pièges courants)
- Register shifting : parler en C-suite, parler à un client, parler en académique
- Métaphores conceptuelles du business anglais

SEMAINE 9-12 : COMMUNICATION PROFESSIONNELLE C1
- Négociation avancée : stratégies, tactiques, language of persuasion
- Présentations TED-style : structure narrative, storytelling, impact
- Leadership communication : donner du feedback, gérer le conflit, motiver
- Writing C1 : rapports complexes, propositions, policy documents
- Interview C-level en anglais : STAR method, competency-based questions

SEMAINE 13-16 : ANGLAIS ACADÉMIQUE ET MÉDIAS
- Academic writing : thesis statement, topic sentences, coherence & cohesion
- Critical reading : identifier bias, assumptions, logical fallacies
- Media literacy : comprendre accents variés (UK, US, Australian, Indian English)
- Lecture de textes authentiques : The Economist, Harvard Business Review, BBC
- Résumé analytique (executive summary)

SEMAINE 17-20 : PRÉPARATION CERTIFICATION C1
- Cambridge C1 Advanced (CAE) — toutes parties
- IELTS Academic band 7.0+
- TOEFL iBT 100+
- Mock exams complets avec correction détaillée
- Plan de progression personnalisé post-cours

EXERCICES TYPES C1 :
- Rédiger un rapport d'analyse (400 mots) sur un sujet économique
- Débat contradictoire de 20 min sur un sujet d'actualité
- Présentation formelle de 10 min avec Q&A
- Résumé en 200 mots d'un article académique de 1500 mots
- Interview simulée en anglais pour un poste de manager

VOCABULAIRE CLÉ C1 : 6000+ mots (diplomatique, scientifique, juridique, littéraire, médiatique)
$$, 10);

-- ── GRAMMAIRE RÉFÉRENCE ──
INSERT INTO ai_knowledge (categorie, niveau, titre, contenu, priorite) VALUES
('pedagogie', 'all', 'Référence grammaire — Points clés et erreurs courantes', $$
ERREURS LES PLUS FRÉQUENTES DES FRANCOPHONES EN ANGLAIS :

1. MAKE vs DO
   - MAKE : créer, produire → make a decision, make money, make a mistake, make a bed, make a call
   - DO : activité, travail → do homework, do business, do sport, do your best, do a favor

2. SAY vs TELL
   - SAY : + discours direct → He said "I'm tired." / He said that he was tired.
   - TELL : + personne → She told me that..., Tell me the truth, Tell him to stop.

3. SINCE vs FOR
   - SINCE : point de départ précis → I've lived here since 2010 / since January / since I was a child
   - FOR : durée → I've lived here for 5 years / for a long time / for months

4. PRESENT PERFECT vs PAST SIMPLE
   - Present Perfect : lien avec le présent → I've lost my keys (je les ai encore perdues)
   - Past Simple : passé révolu → I lost my keys yesterday (histoire terminée)

5. WILL vs GOING TO
   - Will : décision spontanée, prédiction sans preuve → I'll help you. It will rain.
   - Going to : intention planifiée, preuve visible → I'm going to visit Paris next week. Look at those clouds, it's going to rain.

6. ARTICLES (LE PLUS DIFFICILE POUR LES FRANCOPHONES)
   - A/AN : première mention, profession → She is a doctor. I saw a film.
   - THE : déjà mentionné, unique, connu des deux → The film I saw was good. The sun.
   - Ø (pas d'article) : noms propres, pluriels généraux, matières → I love music. Dogs are friendly.

7. ADJECTIFS : jamais de pluriel en anglais → beautiful women (PAS beautifuls)

8. FAUX AMIS COURANTS :
   - Actually = En réalité (PAS actuellement = currently)
   - Eventually = Finalement (PAS éventuellement = possibly)
   - Library = Bibliothèque (PAS librairie = bookshop)
   - Sympathetic = Compatissant (PAS sympathique = nice)
   - Sensible = Raisonnable (PAS sensible = sensitive)
$$, 10),

('pedagogie', 'all', 'Business English — Expressions et phrases clés', $$
RÉUNIONS ET PRÉSENTATIONS :
- Ouvrir : "Let's get started." / "Thank you all for coming." / "The purpose of today's meeting is..."
- Donner la parole : "I'd like to hand over to..." / "What do you think, [name]?"
- Interrompre poliment : "Sorry to interrupt, but..." / "If I may add something here..."
- Résumer : "To sum up..." / "In a nutshell..." / "The key takeaway is..."
- Clore : "We'll wrap up here." / "Let's pick this up at our next meeting."

EMAILS PROFESSIONNELS :
- Ouverture formelle : "I hope this email finds you well." / "I am writing with regard to..."
- Faire une demande : "I would be grateful if you could..." / "Could you please..."
- Envoyer des documents : "Please find attached..." / "I am enclosing..."
- Relancer : "I wanted to follow up on my previous email..." / "I look forward to hearing from you."
- Clôture formelle : "Yours sincerely," (nom connu) / "Yours faithfully," (nom inconnu) / "Best regards,"

NÉGOCIATION :
- Faire une offre : "We are prepared to offer..." / "Our initial proposal is..."
- Contre-offre : "That's a starting point. However, we would need..." / "We could consider that if..."
- Accepter : "That works for us." / "We have a deal." / "I think we can move forward on that basis."
- Refuser poliment : "I'm afraid that's not workable for us." / "We'd need to revisit those terms."

TÉLÉPHONE / VISIOCONFÉRENCE :
- Décrocher pro : "Good morning, [name] speaking. How can I help?"
- Mettre en attente : "Could you hold for a moment?" / "Bear with me."
- Ne pas comprendre : "I'm sorry, could you repeat that?" / "Could you speak a little slower, please?"
- Connexion problème : "You're breaking up." / "I think there's a lag." / "Could you say that again?"

VOCABULAIRE FINANCE DE BASE :
- Revenue / Turnover = Chiffre d'affaires
- Profit / Net income = Bénéfice net
- Budget = Budget / Operating costs = Charges d'exploitation
- ROI (Return on Investment) = Retour sur investissement
- Cash flow = Trésorerie / Forecast = Prévision / Target = Objectif
- KPI (Key Performance Indicator) = Indicateur clé de performance
$$, 9),

('exercices', 'A1', 'Exercices types A1 — Avec corrigés', $$
EXERCICE 1 — Complétez avec am/is/are :
1. I ___ a student. (am)
2. She ___ from France. (is)
3. They ___ at school. (are)
4. We ___ happy. (are)
5. He ___ a doctor. (is)

EXERCICE 2 — Traduire ces phrases en anglais :
1. Je m'appelle Marie. → My name is Marie.
2. J'ai 25 ans. → I am 25 years old.
3. J'habite à Paris. → I live in Paris.
4. J'aime le café. → I like coffee.
5. Il ne travaille pas le lundi. → He doesn't work on Mondays.

EXERCICE 3 — Questions avec DO/DOES :
1. (you / like / chocolate ?) → Do you like chocolate?
2. (she / speak / English ?) → Does she speak English?
3. (they / live / in London ?) → Do they live in London?
4. (he / work / on weekends ?) → Does he work on weekends?

EXERCICE 4 — Vocabulaire famille : Reliez anglais-français :
mother=mère, father=père, brother=frère, sister=sœur, son=fils, daughter=fille, husband=mari, wife=femme, grandfather=grand-père, grandmother=grand-mère
$$, 8),

('exercices', 'B1', 'Exercices types B1 — Present Perfect vs Past Simple', $$
RÈGLE RAPPEL :
- Present Perfect → lien avec le présent, expérience de vie, résultat actuel
- Past Simple → action terminée dans le passé, date/heure précise

EXERCICE 1 — Choisissez le bon temps :
1. I (have seen / saw) that movie last night. → saw
2. She (has never eaten / never ate) sushi before. → has never eaten
3. We (have visited / visited) Rome in 2019. → visited
4. He (has just arrived / just arrived). → has just arrived
5. They (have lived / lived) here since 2015. → have lived

EXERCICE 2 — Transformez en questions :
1. She has finished her homework. → Has she finished her homework?
2. They visited Paris last year. → Did they visit Paris last year?
3. He has already eaten. → Has he already eaten?

EXERCICE 3 — Complétez avec since/for :
1. I've studied English ___ three years. → for
2. She has worked here ___ January. → since
3. We haven't seen him ___ a long time. → for
4. He has been sick ___ last Monday. → since

EXERCICE 4 — Mini-rédaction (100 mots) :
"Describe three things you have done in your life that you are proud of. Use the Present Perfect."
Exemple : I have learned to speak French fluently. I have visited five countries in Africa. I have passed my university entrance exam with honors.
$$, 8),

('faq', 'all', 'Questions fréquentes des étudiants AGTM', $$
Q: Combien de temps faut-il pour passer du niveau A1 au B2 ?
R: En suivant 2 à 3 séances par semaine et en faisant les devoirs régulièrement, le parcours A1→B2 prend entre 18 et 24 mois. Cela représente environ 150 à 200 heures d'apprentissage guidé, plus le travail personnel.

Q: Comment savoir si je suis prêt(e) à passer au niveau supérieur ?
R: Une évaluation est réalisée toutes les 4 séances. Le passage au niveau supérieur se fait quand vous atteignez 70% de réussite sur les compétences du niveau actuel. Votre formateur vous guidera.

Q: Puis-je rattraper une séance manquée ?
R: Oui, si l'absence est justifiée (certificat médical, raison professionnelle sérieuse), vous pouvez rattraper dans les 2 semaines suivantes, selon les disponibilités du formateur.

Q: Comment se passe la préparation au TOEIC ?
R: La préparation TOEIC commence à partir du niveau B1. Elle comprend des sessions dédiées à la structure du test, des exercices de listening (Parts 1-4) et de reading (Parts 5-7), ainsi que 3 mock tests complets avec debriefs.

Q: Que faire si je ne comprends pas un point de grammaire expliqué en classe ?
R: Demandez toujours à votre formateur de reformuler — c'est votre droit ! Vous pouvez aussi utiliser l'Assistant IA AGTM pour poser vos questions entre les séances, à tout moment.

Q: L'anglais du cours est-il différent de l'anglais américain ?
R: AGTM enseigne un anglais international standard, compréhensible partout. Les différences UK/US (vocabulary, spelling) sont expliquées. Le TOEIC utilise des accents variés (US, UK, Australian, Canadian) — on s'y prépare.
$$, 9);

-- ── VÉRIFICATION ─────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM ai_config) AS nb_config,
  (SELECT COUNT(*) FROM ai_knowledge WHERE actif=true) AS nb_knowledge,
  (SELECT COUNT(DISTINCT niveau) FROM ai_knowledge) AS nb_niveaux;
