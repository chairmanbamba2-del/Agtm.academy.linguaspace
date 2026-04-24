-- ═══════════════════════════════════════════════════════════════
--  MIGRATION v36 — Virtual Classroom Quiz Triggers
--  Ajoute trigger_time + video_id à la table quizzes
--  + RLS lecture anonyme pour apprenants English Corner
-- ═══════════════════════════════════════════════════════════════

-- 1. Nouvelles colonnes sur quizzes
-- ─────────────────────────────────
ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS trigger_time  NUMERIC(8,2),  -- secondes dans la vidéo YT
  ADD COLUMN IF NOT EXISTS video_id      TEXT,           -- ID YouTube (11 chars)
  ADD COLUMN IF NOT EXISTS level         TEXT DEFAULT 'B1'; -- CEFR A1→C2

COMMENT ON COLUMN quizzes.trigger_time IS 'Timestamp (s) dans la vidéo YouTube où le quiz se déclenche côté apprenant.';
COMMENT ON COLUMN quizzes.video_id     IS 'ID de la vidéo YouTube (11 caractères) associée à ce quiz trigger.';
COMMENT ON COLUMN quizzes.level        IS 'Niveau CEFR du quiz : A1, A2, B1, B2, C1, C2.';

-- 2. Index pour la requête principale (video_id + trigger_time)
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_quizzes_video_trigger
  ON quizzes (video_id, trigger_time)
  WHERE is_active = TRUE AND trigger_time IS NOT NULL;

-- 3. RLS — lecture anonyme (apprenants via clé anon Supabase)
-- ────────────────────────────────────────────────────────────
ALTER TABLE quizzes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_options  ENABLE ROW LEVEL SECURITY;

-- Lecture publique des quizzes VC actifs (avec trigger_time)
DROP POLICY IF EXISTS "vc_quiz_public_read" ON quizzes;
CREATE POLICY "vc_quiz_public_read" ON quizzes
  FOR SELECT USING (is_active = TRUE);

-- Lecture publique des questions liées
DROP POLICY IF EXISTS "vc_questions_public_read" ON questions;
CREATE POLICY "vc_questions_public_read" ON questions
  FOR SELECT USING (is_active = TRUE);

-- Lecture publique des options de réponse
DROP POLICY IF EXISTS "vc_answer_options_public_read" ON answer_options;
CREATE POLICY "vc_answer_options_public_read" ON answer_options
  FOR SELECT USING (TRUE);

-- 4. Données de démonstration — Quiz triggers pour une vidéo BBC
-- ──────────────────────────────────────────────────────────────
-- Vidéo : "6 Minute English — Artificial Intelligence" (BBC Learning English)
-- YouTube ID : KOiMt65IQCA

-- Quiz 1 — déclenché à 1:30 (90s)
WITH inserted_quiz AS (
  INSERT INTO quizzes (title, description, video_id, trigger_time, level, pass_score, is_active)
  VALUES (
    'AI Vocabulary Check',
    'Vérification du vocabulaire sur l''intelligence artificielle.',
    'KOiMt65IQCA',
    90.0,
    'B1',
    60,
    TRUE
  )
  RETURNING id
),
inserted_q AS (
  INSERT INTO questions (quiz_id, question_type, question_text, explanation, sort_order, is_active)
  SELECT id, 'mcq',
    'In this context, what does "AI" stand for?',
    'AI stands for Artificial Intelligence — the simulation of human intelligence by machines.',
    1, TRUE
  FROM inserted_quiz
  RETURNING id
)
INSERT INTO answer_options (question_id, option_text, is_correct, sort_order)
SELECT id, option_text, is_correct, sort_order FROM inserted_q,
(VALUES
  ('A. Automated Input',        FALSE, 1),
  ('B. Artificial Intelligence',TRUE,  2),
  ('C. Advanced Internet',      FALSE, 3),
  ('D. Audio Interaction',      FALSE, 4)
) AS opts(option_text, is_correct, sort_order);

-- Quiz 2 — déclenché à 3:00 (180s)
WITH inserted_quiz2 AS (
  INSERT INTO quizzes (title, description, video_id, trigger_time, level, pass_score, is_active)
  VALUES (
    'Comprehension — Robots & Jobs',
    'Compréhension sur l''impact de l''IA sur l''emploi.',
    'KOiMt65IQCA',
    180.0,
    'B1',
    60,
    TRUE
  )
  RETURNING id
),
inserted_q2 AS (
  INSERT INTO questions (quiz_id, question_type, question_text, explanation, sort_order, is_active)
  SELECT id, 'mcq',
    'According to the programme, which jobs are MOST at risk from AI automation?',
    'Routine and repetitive tasks are most easily automated. Creative and social jobs are harder to replace.',
    1, TRUE
  FROM inserted_quiz2
  RETURNING id
)
INSERT INTO answer_options (question_id, option_text, is_correct, sort_order)
SELECT id, option_text, is_correct, sort_order FROM inserted_q2,
(VALUES
  ('A. Creative and artistic jobs', FALSE, 1),
  ('B. Routine repetitive tasks',   TRUE,  2),
  ('C. Medical surgery',            FALSE, 3),
  ('D. Teaching and coaching',      FALSE, 4)
) AS opts(option_text, is_correct, sort_order);

-- Quiz 3 — déclenché à 5:00 (300s) — question ouverte
WITH inserted_quiz3 AS (
  INSERT INTO quizzes (title, description, video_id, trigger_time, level, pass_score, is_active)
  VALUES (
    'Open Reflection — AI in your life',
    'Réflexion personnelle sur l''IA.',
    'KOiMt65IQCA',
    300.0,
    'B1',
    60,
    TRUE
  )
  RETURNING id
)
INSERT INTO questions (quiz_id, question_type, question_text, explanation, sort_order, is_active)
SELECT id, 'open_short',
  'Give ONE example of artificial intelligence you use in your daily life and explain how it helps you.',
  'Model answer: "I use AI every day through my smartphone''s voice assistant (Siri/Google Assistant). It helps me set reminders, answer questions quickly, and navigate without looking at a map."',
  1, TRUE
FROM inserted_quiz3;

-- ═══════════════════════════════════════════════════════════════
--  VÉRIFICATION RAPIDE
-- ═══════════════════════════════════════════════════════════════
SELECT
  q.id,
  q.title,
  q.video_id,
  q.trigger_time,
  q.level,
  COUNT(qu.id) AS nb_questions
FROM quizzes q
LEFT JOIN questions qu ON qu.quiz_id = q.id
WHERE q.video_id = 'KOiMt65IQCA'
GROUP BY q.id, q.title, q.video_id, q.trigger_time, q.level
ORDER BY q.trigger_time;
