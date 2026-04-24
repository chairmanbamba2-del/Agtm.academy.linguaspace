/* pedagogy-content.js — AGTM Academy Rich Lesson Content v1.0
 * Static content for all pedagogical modules
 * Loaded by dashboard.html
 */
;(function () {
'use strict'

// ── HTML Helpers ─────────────────────────────────────────────────────────────
function _rule(formula, explanation) {
  return '<div style="background:rgba(74,144,217,0.08);border-left:4px solid #4A90D9;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:8px">'
       + '<div style="font-family:monospace;font-size:.93rem;color:#6BAFDF;font-weight:700;margin-bottom:6px">' + formula + '</div>'
       + '<div style="font-size:.85rem;color:#C0D4E0;line-height:1.65">' + explanation + '</div>'
       + '</div>'
}

function _table(headers, rows) {
  var th = 'padding:8px 12px;text-align:left;font-size:.72rem;color:#C8960C;font-weight:800;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid rgba(200,150,12,0.25);background:rgba(200,150,12,0.06)'
  var td = 'padding:8px 12px;font-size:.83rem;color:#D4C8A0;border-bottom:1px solid rgba(255,255,255,0.04);vertical-align:top'
  var tdA = td + ';background:rgba(200,150,12,0.03)'
  return '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;min-width:280px">'
       + '<thead><tr>' + headers.map(function(h){return '<th style="'+th+'">'+h+'</th>'}).join('') + '</tr></thead>'
       + '<tbody>' + rows.map(function(r,i){return '<tr>' + r.map(function(c){return '<td style="'+(i%2?tdA:td)+'">'+c+'</td>'}).join('') + '</tr>'}).join('') + '</tbody>'
       + '</table></div>'
}

function _ex(pairs) {
  return pairs.map(function(p){
    return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:7px;padding:9px 12px;background:rgba(13,27,42,0.5);border-radius:8px;border:1px solid rgba(255,255,255,0.06)">'
         + '<div style="font-size:.84rem;color:#7FCEEE;line-height:1.5">🇬🇧 <em>'+p[0]+'</em></div>'
         + '<div style="font-size:.84rem;color:#A0C8A0;line-height:1.5">🇫🇷 '+p[1]+'</div>'
         + '</div>'
  }).join('')
}

function _tips(arr) {
  return arr.map(function(t){
    return '<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:7px;padding:9px 12px;background:rgba(200,150,12,0.06);border-radius:8px">'
         + '<span>💡</span><span style="font-size:.84rem;color:#D4C8A0;line-height:1.55">'+t+'</span></div>'
  }).join('')
}

function _err(arr) {
  return arr.map(function(e){
    return '<div style="margin-bottom:9px;padding:10px 13px;background:rgba(224,80,80,0.05);border-radius:8px;border-left:3px solid #E05050">'
         + '<div style="font-size:.82rem;margin-bottom:3px"><span style="color:#E05050">✗</span> <span style="color:#D4A0A0;text-decoration:line-through">'+e[0]+'</span></div>'
         + '<div style="font-size:.82rem;margin-bottom:3px"><span style="color:#4AE090">✓</span> <span style="color:#A0D4B0">'+e[1]+'</span></div>'
         + (e[2]?'<div style="font-size:.78rem;color:#8AAAC0;font-style:italic;margin-top:3px">'+e[2]+'</div>':'')
         + '</div>'
  }).join('')
}

function s(type, titre, html) { return { type: type, titre: titre, html: html } }

var C = window._AP_LESSON_CONTENT = {}

// ═══════════════════════════════════════════════════════════════════════════════
// GRAMMAR MODULES
// ═══════════════════════════════════════════════════════════════════════════════

C['GRAM-A1-001'] = [
  s('rule', '📌 Règle essentielle',
    _rule('Subject + AM / IS / ARE + complement',
      'Le verbe <strong>TO BE</strong> s\'utilise pour exprimer l\'identité, l\'état, la nationalité, la profession et les descriptions. Il ne prend pas de -s, -ed ou -ing comme auxiliaire au présent simple.')),
  s('table', '📊 Conjugaison complète',
    _table(['Pronom','Affirmatif','Négation','Question'],
      [['I','am (I\'m)','am not (I\'m not)','Am I?'],
       ['You','are (you\'re)','are not (aren\'t)','Are you?'],
       ['He / She / It','is (he\'s / she\'s)','is not (isn\'t)','Is he/she/it?'],
       ['We','are (we\'re)','are not (aren\'t)','Are we?'],
       ['They','are (they\'re)','are not (aren\'t)','Are they?']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['I am a teacher at AGTM Academy.','Je suis professeur à AGTM Academy.'],
      ['She is not happy today.','Elle n\'est pas heureuse aujourd\'hui.'],
      ['Are they from Abidjan?','Sont-ils d\'Abidjan ?'],
      ['We are students.','Nous sommes étudiants.'],
      ['It is very hot here.','Il fait très chaud ici.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      '<strong>AM</strong> → uniquement avec <strong>I</strong>. <strong>IS</strong> → he / she / it. <strong>ARE</strong> → you / we / they.',
      'Les contractions (I\'m, she\'s, we\'re) sont très courantes à l\'oral et dans les textes informels.',
      'Pour une question, inversez sujet et verbe : <em>She is → Is she?</em>',
      'En ivoirien familier on dit souvent "I is" — c\'est une erreur classique à éviter absolument en anglais standard.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['He are happy.','He is happy.','"He/She/It" prend toujours "is".'],
      ['I is a student.','I am a student.','"I" prend uniquement "am".'],
      ['Are she your teacher?','Is she your teacher?','"She" → "Is", pas "Are".'],
      ['They is late.','They are late.','"They" prend toujours "are".']]))
]

C['GRAM-A1-002'] = [
  s('rule', '📌 Règle du Présent Simple',
    _rule('Subject + Verb (base form) — He/She/It + Verb + -S',
      'Le <strong>Présent Simple</strong> exprime les habitudes, les routines, les faits permanents et les vérités générales. À la 3e personne du singulier (he, she, it), on ajoute <strong>-s</strong> ou <strong>-es</strong> au verbe. Attention : les verbes irréguliers <em>be, have, do</em> ont des formes spéciales.')),
  s('table', '📊 Formation et règles orthographiques',
    _table(['Règle','Verbe','3e personne sing.'],
      [['Règle générale','work','works'],
       ['Verbe en -s, -sh, -ch, -x, -o','watch / go','watches / goes'],
       ['Verbe en consonne + y → ies','study','studies'],
       ['Verbe en voyelle + y → ys','play','plays'],
       ['Irrégulier','have / be','has / is']])),
  s('table', '📊 Adverbes de fréquence (ordre dans la phrase)',
    _table(['Adverbe','Fréquence','Position'],
      [['always','100%','après "be" / avant autres verbes'],
       ['usually','80%','après "be" / avant autres verbes'],
       ['often','60%','après "be" / avant autres verbes'],
       ['sometimes','40%','début, milieu ou fin de phrase'],
       ['rarely / seldom','15%','après "be" / avant autres verbes'],
       ['never','0%','après "be" / avant autres verbes']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['She works at a bank in Abidjan.','Elle travaille dans une banque à Abidjan.'],
      ['I always drink tea in the morning.','Je bois toujours du thé le matin.'],
      ['He doesn\'t like spicy food.','Il n\'aime pas la nourriture épicée.'],
      ['Do they study English every day?','Étudient-ils l\'anglais chaque jour ?'],
      ['The sun rises in the east.','Le soleil se lève à l\'est.']])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['She go to school every day.','She goes to school every day.','He/she/it → toujours +s/-es.'],
      ['He don\'t like mangoes.','He doesn\'t like mangoes.','3e pers. sing. → doesn\'t (pas don\'t).'],
      ['I am go to work.','I go to work.','Le présent simple n\'utilise pas "be + verbe".'],
      ['Does she works here?','Does she work here?','Après does, le verbe reste à la base (sans -s).']]))
]

C['GRAM-A1-003'] = [
  s('rule', '📌 Règle des Articles',
    _rule('A / AN + singular countable noun (first mention) | THE + specific noun',
      '<strong>A</strong> (devant consonne) et <strong>AN</strong> (devant voyelle ou h muet) sont les articles indéfinis — on parle d\'une chose non spécifique. <strong>THE</strong> est l\'article défini — on parle d\'une chose déjà connue, unique ou précisée. Certains noms n\'ont pas d\'article : les noms propres, les noms indénombrables en général.')),
  s('table', '📊 Quand utiliser A / AN / THE / Ø',
    _table(['Article','Emploi','Exemple'],
      [['A','1ère mention, indéfini singulier','I have a car.'],
       ['AN','Devant voyelle (a,e,i,o,u) ou h muet','She is an engineer. / an hour.'],
       ['THE','Chose déjà mentionnée ou unique','The car is red. / The sun.'],
       ['Ø (zéro)','Noms propres, indénombrables en général, pluriel indéfini','I love music. / Cats are smart.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['I saw a dog. The dog was barking.','J\'ai vu un chien. Le chien aboyait.'],
      ['She is an honest person.','C\'est une personne honnête. (AN + voyelle H)'],
      ['The President of Côte d\'Ivoire gave a speech.','Le Président de Côte d\'Ivoire a prononcé un discours.'],
      ['I drink coffee every morning.','Je bois du café chaque matin. (pas d\'article)'],
      ['He plays the piano.','Il joue du piano. (instruments → THE)']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      '<strong>AN</strong> se détermine par le SON, pas la lettre : <em>an hour</em> (h muet), mais <em>a university</em> (son "you").','<strong>THE</strong> = "le/la/les" en français — mais pas toujours ! "I love the music" (une musique précise) vs "I love music" (la musique en général).','Les noms de pays n\'ont généralement pas d\'article : <em>I live in France</em>. Exceptions : <em>the USA, the UK, the Congo</em>.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['She is a engineer.','She is an engineer.','Devant voyelle → AN.'],
      ['I love the football.','I love football.','Sports et activités en général → pas d\'article.'],
      ['He is the student.','He is a student.','Première mention, non spécifique → A.']]))
]

C['GRAM-A1-004'] = [
  s('rule', '📌 Pronoms Personnels et Possessifs',
    _rule('Subject Pronoun + Verb | Possessive Adjective + Noun | Possessive Pronoun (standalone)',
      'Les <strong>pronoms personnels</strong> remplacent le sujet. Les <strong>adjectifs possessifs</strong> précèdent un nom. Les <strong>pronoms possessifs</strong> remplacent complètement un groupe nominal (nom + adjectif possessif). Les <strong>pronoms compléments</strong> (object pronouns) suivent un verbe ou une préposition.')),
  s('table', '📊 Tableau complet des pronoms',
    _table(['Sujet','Complément','Adj. Possessif','Pronom Possessif','Réfléchi'],
      [['I','me','my','mine','myself'],
       ['You','you','your','yours','yourself'],
       ['He','him','his','his','himself'],
       ['She','her','her','hers','herself'],
       ['It','it','its','—','itself'],
       ['We','us','our','ours','ourselves'],
       ['They','them','their','theirs','themselves']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['This is my book. It is mine.','C\'est mon livre. C\'est le mien.'],
      ['She gave him her number.','Elle lui a donné son numéro.'],
      ['They did it themselves.','Ils l\'ont fait eux-mêmes.'],
      ['Is this your pen? No, it\'s hers.','C\'est ton stylo ? Non, c\'est le sien (à elle).'],
      ['We prepared ourselves for the exam.','Nous nous sommes préparés pour l\'examen.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      '<strong>Its</strong> (adjectif possessif, sans apostrophe) vs <strong>it\'s</strong> (contraction de "it is"). Confusion très fréquente !','Les pronoms réfléchis servent à l\'emphase aussi : <em>I myself cooked this.</em>','En anglais, pas de distinction he/she pour les objets — "it" pour tout ce qui n\'est pas humain.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['Her is my friend.','She is my friend.','Sujet → pronom sujet (she), pas pronom complément (her).'],
      ['The dog lost it\'s bone.','The dog lost its bone.','Possessif → "its" sans apostrophe.'],
      ['This is mines.','This is mine.','Pronom possessif → "mine" (jamais "mines").']]))
]

C['GRAM-A1-005'] = [
  s('rule', '📌 Prépositions de Lieu et de Temps',
    _rule('Preposition + noun/pronoun (no article needed after preposition for time expressions)',
      'Les prépositions de <strong>lieu</strong> précisent l\'emplacement ou la direction. Les prépositions de <strong>temps</strong> situent un événement dans le temps. Les trois plus importantes : <strong>IN</strong> (intérieur, période longue), <strong>ON</strong> (surface, jour), <strong>AT</strong> (point précis, heure).')),
  s('table', '📊 IN / ON / AT — Lieu et Temps',
    _table(['Préposition','Lieu','Temps'],
      [['IN','in a room, in Abidjan, in Africa','in the morning, in January, in 2025'],
       ['ON','on the table, on the wall, on the street','on Monday, on 15 April, on Christmas Day'],
       ['AT','at the door, at school, at home','at 8 o\'clock, at midnight, at the weekend']])),
  s('table', '📊 Autres prépositions de lieu essentielles',
    _table(['Préposition','Sens','Exemple'],
      [['next to / beside','à côté de','The bank is next to the market.'],
       ['in front of','devant','She stood in front of the class.'],
       ['behind','derrière','The garden is behind the house.'],
       ['between','entre (deux)','The shop is between the school and the church.'],
       ['under / below','sous','The cat is under the table.'],
       ['above / over','au-dessus de','The fan is above my head.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['I was born in Abidjan in 1998.','Je suis né à Abidjan en 1998.'],
      ['The meeting is on Friday at 9 a.m.','La réunion est vendredi à 9h.'],
      ['He lives at 12 Rue des Fleurs.','Il habite au 12 rue des Fleurs.'],
      ['Put the bag on the chair.','Pose le sac sur la chaise.'],
      ['She arrived at midnight.','Elle est arrivée à minuit.']])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['I go to school at Monday.','I go to school on Monday.','Jours de la semaine → ON.'],
      ['She was born on 1995.','She was born in 1995.','Années → IN.'],
      ['He arrived in 8 o\'clock.','He arrived at 8 o\'clock.','Heures → AT.']]))
]

C['GRAM-A1-006'] = [
  s('rule', '📌 There is / There are',
    _rule('There is + singular/uncountable noun | There are + plural noun',
      '<strong>There is</strong> et <strong>There are</strong> servent à indiquer l\'existence ou la présence de quelque chose. <strong>There is</strong> s\'utilise avec un nom singulier ou indénombrable, <strong>There are</strong> avec un nom pluriel. La négation se forme avec <em>is not / are not</em>, la question par inversion.')),
  s('table', '📊 Structure complète',
    _table(['Forme','Structure','Exemple'],
      [['Affirmatif sing.','There is (There\'s)','There is a school near here.'],
       ['Affirmatif plur.','There are','There are three students in the room.'],
       ['Négatif sing.','There is not (There isn\'t)','There isn\'t any water left.'],
       ['Négatif plur.','There are not (There aren\'t)','There aren\'t many buses.'],
       ['Question sing.','Is there…?','Is there a bank nearby?'],
       ['Question plur.','Are there…?','Are there any seats available?']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['There is a market near my house.','Il y a un marché près de chez moi.'],
      ['There are many opportunities in Abidjan.','Il y a beaucoup d\'opportunités à Abidjan.'],
      ['Is there a hospital in this town?','Y a-t-il un hôpital dans cette ville ?'],
      ['There isn\'t any milk in the fridge.','Il n\'y a pas de lait dans le réfrigérateur.'],
      ['There are no excuses for being late.','Il n\'y a pas d\'excuses pour être en retard.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Ne confondez pas <strong>There is</strong> (existence) et <strong>It is</strong> (description/identification) : <em>There is a problem.</em> vs <em>It is a big problem.</em>','Avec une liste commençant par un singulier, on utilise "There is" : <em>There is a pen and two books on the table.</em>','<strong>Some</strong> dans les phrases affirmatives, <strong>any</strong> dans les questions et négations : <em>There are some chairs. Are there any chairs?</em>'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['There are a cat in the garden.','There is a cat in the garden.','Singulier → There is.'],
      ['There is many cars.','There are many cars.','Pluriel → There are.'],
      ['Is there any student?','Are there any students?','Pluriel → Are there?']]))
]

C['GRAM-A2-001'] = [
  s('rule', '📌 Le Présent Continu',
    _rule('Subject + AM / IS / ARE + Verb-ING',
      'Le <strong>Présent Continu</strong> (Present Continuous) exprime une action en train de se dérouler au moment où on parle, une action temporaire, ou un futur arrangé. Certains verbes dits "statifs" (states) ne s\'utilisent généralement PAS au continu : know, love, hate, believe, understand, want, seem, have (possession).')),
  s('table', '📊 Formation du -ING',
    _table(['Règle','Verbe','Forme -ING'],
      [['Règle générale','work / play','working / playing'],
       ['Verbe en -e muet → retirer le e','come / write','coming / writing'],
       ['1 syllabe, CVC → doubler la consonne finale','run / sit','running / sitting'],
       ['Verbe en -ie → changer en y','die / lie','dying / lying'],
       ['Verbe en -ee, -oe → garder','see / agree','seeing / agreeing']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['I am studying English right now.','Je suis en train d\'étudier l\'anglais là.'],
      ['She is not listening to the teacher.','Elle n\'écoute pas le professeur (en ce moment).'],
      ['What are you doing this weekend?','Qu\'est-ce que tu fais ce week-end ?'],
      ['They are living in Cocody temporarily.','Ils habitent à Cocody temporairement.'],
      ['He is leaving for France next month.','Il part en France le mois prochain (prévu).']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Signal words du présent continu : <strong>now, right now, at the moment, currently, look!, listen!</strong>','Verbes statifs interdits au continu : <em>I am knowing the answer ✗ → I know the answer ✓</em>','Distinguer habitude (présent simple) et action en cours (présent continu) : <em>She reads every day</em> vs <em>She is reading now</em>.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['I am having a car.','I have a car.','Have (possession) = verbe statif, pas de continu.'],
      ['She is know the answer.','She knows the answer.','Know = verbe statif, pas de continu.'],
      ['They are study English.','They are studying English.','Oublier le -ing après BE.']]))
]

C['GRAM-A2-002'] = [
  s('rule', '📌 Le Passé Simple (Simple Past)',
    _rule('Subject + Verb-ED (regular) | Subject + Irregular form',
      'Le <strong>Passé Simple</strong> exprime une action terminée à un moment précis du passé. Les verbes réguliers prennent <strong>-ed</strong>. Les verbes irréguliers ont des formes à apprendre. La négation utilise <strong>did not (didn\'t)</strong> + verbe base, la question <strong>Did</strong> + sujet + verbe base.')),
  s('table', '📊 Verbes irréguliers essentiels',
    _table(['Infinitif','Passé','Français'],
      [['be','was / were','être'],
       ['go','went','aller'],
       ['have','had','avoir'],
       ['come','came','venir'],
       ['say','said','dire'],
       ['see','saw','voir'],
       ['give','gave','donner'],
       ['take','took','prendre'],
       ['know','knew','savoir/connaître'],
       ['get','got','obtenir/devenir']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['She visited her family last weekend.','Elle a rendu visite à sa famille le week-end dernier.'],
      ['Did you go to school yesterday?','Es-tu allé à l\'école hier ?'],
      ['They didn\'t watch the match.','Ils n\'ont pas regardé le match.'],
      ['He was born in Yamoussoukro in 1990.','Il est né à Yamoussoukro en 1990.'],
      ['We had a great time at the party.','Nous avons passé un bon moment à la fête.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Signal words du passé simple : <strong>yesterday, last week, in 2020, ago, when I was young, in those days</strong>.','Règle orthographique -ED : <em>stop → stopped</em> (CVC), <em>love → loved</em> (-e muet), <em>study → studied</em> (consonne + y).','Négatif et question : on utilise toujours <strong>did</strong> + verbe BASE (sans -ed) : <em>Did she went? ✗ → Did she go? ✓</em>'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['Did she went to the market?','Did she go to the market?','Après did → verbe BASE sans -ed.'],
      ['He didn\'t came.','He didn\'t come.','Après didn\'t → verbe BASE.'],
      ['Yesterday I go to church.','Yesterday I went to church.','Signal word passé → verbe au passé.']]))
]

C['GRAM-A2-003'] = [
  s('rule', '📌 Les Modaux – Can, Must, Should',
    _rule('Subject + Modal (base form) + Verb (base form)',
      'Les <strong>modaux</strong> sont des auxiliaires invariables qui n\'ont pas de -s à la 3e personne et sont toujours suivis d\'un verbe à l\'infinitif sans "to". <strong>CAN</strong> = capacité/permission. <strong>MUST</strong> = obligation forte/déduction. <strong>SHOULD</strong> = conseil/recommandation.')),
  s('table', '📊 Tableau des modaux essentiels',
    _table(['Modal','Sens principal','Exemple','Négatif'],
      [['can','capacité, permission','I can speak English.','can\'t / cannot'],
       ['could','capacité passée, politesse','Could you help me?','couldn\'t'],
       ['must','obligation forte','You must wear a mask.','mustn\'t (interdit!)'],
       ['have to','obligation externe','I have to work on Sunday.','don\'t have to (pas nécessaire)'],
       ['should','conseil','You should study more.','shouldn\'t'],
       ['may / might','possibilité','It may rain today.','may not / might not']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['She can speak three languages.','Elle peut parler trois langues.'],
      ['You must not cheat in the exam.','Vous ne devez pas tricher à l\'examen.'],
      ['You should eat more vegetables.','Tu devrais manger plus de légumes.'],
      ['Could I use your phone, please?','Puis-je utiliser votre téléphone, s\'il vous plaît ?'],
      ['It might be difficult, but try!','Ce sera peut-être difficile, mais essaie !']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      '<strong>Must not</strong> = interdit (ne pas faire). <strong>Don\'t have to</strong> = pas nécessaire (pas obligé). Grande différence !','<strong>Can\'t</strong> exprime aussi une impossibilité logique : <em>That can\'t be right!</em> (C\'est impossible !)','Pour le conseil, <strong>should</strong> est plus doux que <strong>must</strong> : <em>You should see a doctor</em> (conseil bienveillant).'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['She cans swim.','She can swim.','Modaux invariables — jamais de -s !'],
      ['You must to study.','You must study.','Après modal → verbe BASE sans "to".'],
      ['I should went earlier.','I should have gone earlier.','Passé avec modal → modal + have + participe passé.']]))
]

C['GRAM-A2-004'] = [
  s('rule', '📌 Le Futur – Will et Going to',
    _rule('WILL + verb (base) | AM/IS/ARE + GOING TO + verb (base)',
      '<strong>WILL</strong> s\'utilise pour les décisions spontanées, les promesses, les prédictions basées sur une opinion. <strong>GOING TO</strong> s\'utilise pour les intentions préalablement planifiées et les prédictions basées sur une évidence présente. Le futur peut aussi être exprimé avec le présent continu pour les arrangements fixés.')),
  s('table', '📊 Will vs Going to — Comparaison',
    _table(['Contexte','WILL','GOING TO'],
      [['Décision spontanée','I\'ll help you carry that.','—'],
       ['Intention planifiée','—','I\'m going to study medicine.'],
       ['Promesse','I will call you tonight.','—'],
       ['Prédiction (opinion)','I think it will rain.','—'],
       ['Prédiction (évidence)','—','Look at those clouds — it\'s going to rain.'],
       ['Arrangement fixé','—','We\'re meeting at 3 p.m. (present cont.)']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['I will help you — don\'t worry!','Je vais t\'aider — ne t\'inquiète pas !'],
      ['She is going to travel to London next year.','Elle va voyager à Londres l\'année prochaine.'],
      ['Will you come to my wedding?','Viendras-tu à mon mariage ?'],
      ['He won\'t pass if he doesn\'t study.','Il ne réussira pas s\'il n\'étudie pas.'],
      ['Look! He\'s going to fall!','Regarde ! Il va tomber !']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Règle pratique : si tu viens de décider → <strong>will</strong>. Si tu avais déjà prévu → <strong>going to</strong>.','<strong>Won\'t</strong> = will not — très courant à l\'oral pour un refus : <em>She won\'t listen.</em>','Signal words : <em>tomorrow, next week, in the future, soon, in 2030</em>.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['I will to go to the party.','I will go to the party.','Will + verbe BASE (sans "to").'],
      ['She going to study.','She is going to study.','"Going to" nécessite BE (am/is/are).'],
      ['I am going to will travel.','I am going to travel.','Choisir l\'un ou l\'autre, pas les deux.']]))
]

C['GRAM-A2-005'] = [
  s('rule', '📌 Comparatifs et Superlatifs',
    _rule('Short adj: -ER than / THE -EST | Long adj: MORE … than / THE MOST …',
      'Le <strong>comparatif</strong> compare deux éléments. Le <strong>superlatif</strong> désigne l\'élément qui possède la qualité au degré le plus élevé dans un groupe. Adjectifs courts (1-2 syllabes) : ajouter <strong>-er / -est</strong>. Adjectifs longs (2+ syllabes) : utiliser <strong>more / the most</strong>.')),
  s('table', '📊 Formes régulières et irrégulières',
    _table(['Adjectif','Comparatif','Superlatif'],
      [['tall','taller than','the tallest'],
       ['big','bigger than','the biggest'],
       ['happy','happier than','the happiest'],
       ['expensive','more expensive than','the most expensive'],
       ['intelligent','more intelligent than','the most intelligent'],
       ['good','better than','the best'],
       ['bad','worse than','the worst'],
       ['far','farther/further than','the farthest/furthest']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Abidjan is bigger than Bouaké.','Abidjan est plus grande que Bouaké.'],
      ['English is more difficult than French for some.','L\'anglais est plus difficile que le français pour certains.'],
      ['She is the best student in the class.','Elle est la meilleure étudiante de la classe.'],
      ['This phone is cheaper than that one.','Ce téléphone est moins cher que celui-là.'],
      ['The Amazon is the longest river in the world.','L\'Amazone est le plus long fleuve du monde.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Adjectifs à 1 syllabe → -er/-est. Adjectifs à 3 syllabes+ → more/most. Les adjectifs à 2 syllabes sont variables — apprendre au cas par cas.','Doublement de la consonne finale (CVC) : <em>big → bigger, hot → hotter, fat → fatter</em>.','<strong>As … as</strong> pour l\'égalité : <em>She is as tall as her brother.</em>'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['She is more taller.','She is taller.','Ne pas doubler la forme comparative.'],
      ['He is the most best.','He is the best.','Superlatif irrégulier — pas de "most" avec "best".'],
      ['This is more good than that.','This is better than that.','Irrégulier : good → better → best.']]))
]

C['GRAM-A2-006'] = [
  s('rule', '📌 Les Questions – Formation et Types',
    _rule('Yes/No: Aux + Subject + Verb? | Wh-: Wh-word + Aux + Subject + Verb?',
      'En anglais, les questions se forment par <strong>inversion</strong> du sujet et de l\'auxiliaire. Avec le présent/passé simple, on utilise <strong>do/does/did</strong> comme auxiliaire. Les <strong>questions WH-</strong> commencent par un mot interrogatif (What, Where, When, Why, Who, How…). Les <strong>question tags</strong> vérifient une information.')),
  s('table', '📊 Mots interrogatifs WH-',
    _table(['Mot','Traduction','Exemple'],
      [['What','Quoi / Quel','What is your name?'],
       ['Where','Où','Where do you live?'],
       ['When','Quand','When did she arrive?'],
       ['Why','Pourquoi','Why are you late?'],
       ['Who','Qui (sujet)','Who called you?'],
       ['Whom','Qui (objet)','Whom did you see?'],
       ['Which','Lequel','Which bag is yours?'],
       ['How','Comment','How are you?'],
       ['How much/many','Combien','How much does it cost?']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Do you speak English?','Parlez-vous anglais ?'],
      ['What time does the bus leave?','À quelle heure part le bus ?'],
      ['Why didn\'t she come yesterday?','Pourquoi n\'est-elle pas venue hier ?'],
      ['How many students are in your class?','Combien d\'étudiants y a-t-il dans ta classe ?'],
      ['You\'re from Abidjan, aren\'t you?','Tu es d\'Abidjan, n\'est-ce pas ?']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Quand <strong>Who</strong> est sujet de la question, pas besoin d\'auxiliaire : <em>Who came? / Who called?</em>','Question tag : phrase affirmative → tag négatif. Phrase négative → tag positif : <em>It\'s nice, isn\'t it? / She can\'t swim, can she?</em>','<strong>How</strong> se combine avec d\'autres mots : How long? How far? How often? How old?'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['Where she lives?','Where does she live?','Présent simple → auxiliaire do/does.'],
      ['What you did yesterday?','What did you do yesterday?','Passé → did + sujet + verbe BASE.'],
      ['Why you are late?','Why are you late?','Avec BE → inverser be et sujet.']]))
]

C['GRAM-A2-007'] = [
  s('rule', '📌 Adverbes de Fréquence et de Manière',
    _rule('Freq: Subject + Adverb + Verb | Manner: Verb + Adverb (end of clause)',
      'Les <strong>adverbes de fréquence</strong> indiquent la régularité d\'une action. Ils se placent après "be" et avant les autres verbes. Les <strong>adverbes de manière</strong> décrivent la façon dont une action est faite. Ils se forment souvent avec <strong>adjectif + -ly</strong> et se placent généralement après le verbe ou le complément.')),
  s('table', '📊 Formation des adverbes de manière en -ly',
    _table(['Adjectif','Règle','Adverbe'],
      [['slow','+ ly','slowly'],
       ['quick','+ ly','quickly'],
       ['careful','+ ly','carefully'],
       ['easy','y → ily','easily'],
       ['happy','y → ily','happily'],
       ['gentle','e → ly','gently'],
       ['good','irrégulier','well'],
       ['fast','irrégulier (même forme)','fast'],
       ['hard','irrégulier (même forme)','hard']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['She always arrives on time.','Elle arrive toujours à l\'heure.'],
      ['He rarely eats meat.','Il mange rarement de la viande.'],
      ['The student answered correctly.','L\'étudiant a répondu correctement.'],
      ['She speaks English fluently.','Elle parle anglais couramment.'],
      ['Drive carefully — it\'s raining.','Conduis prudemment — il pleut.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      '<strong>Hard</strong> (adjectif et adverbe) vs <strong>hardly</strong> (à peine) : <em>She works hard</em> (dur) ≠ <em>She hardly works</em> (elle travaille à peine).','<strong>Late</strong> (adverbe) vs <strong>lately</strong> (récemment) : <em>He arrived late</em> ≠ <em>I haven\'t seen him lately</em>.','Position des adverbes de manière : jamais entre le verbe et son complément direct — <em>She speaks well English ✗ → She speaks English well ✓</em>.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['She sings beautiful.','She sings beautifully.','Après verbe d\'action → adverbe (-ly).'],
      ['He plays good piano.','He plays the piano well.','"Good" est adjectif — adverbe = "well".'],
      ['I hardworked.','I worked hard.','Hard adverbe = séparé, jamais préfixe.']]))
]

C['GRAM-B1-001'] = [
  s('rule', '📌 Present Perfect vs Passé Simple',
    _rule('Present Perfect: HAVE/HAS + Past Participle | Past Simple: Verb-ED / Irregular',
      'Le <strong>Present Perfect</strong> relie le passé au présent : expériences de vie, actions récentes avec conséquence présente, actions commencées dans le passé et encore vraies. Le <strong>Passé Simple</strong> parle d\'un moment précis et terminé dans le passé. Distinction cruciale absente en français — les deux correspondent souvent au "passé composé" ou "imparfait" en français.')),
  s('table', '📊 Comparaison des emplois',
    _table(['Present Perfect','Passé Simple'],
      [['Expérience de vie (ever, never)','Date précise (in 2020, last year)'],
       ['Action récente (just, recently, lately)','Séquence d\'événements passés'],
       ['Depuis (for, since)','Yesterday, ago, when…'],
       ['Résultat présent d\'action passée','Action terminée sans lien au présent'],
       ['I\'ve lost my keys. (je ne les ai toujours pas)','I lost my keys yesterday. (fait passé)']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['I have never been to London.','Je ne suis jamais allé à Londres.'],
      ['She has just finished her homework.','Elle vient de finir ses devoirs.'],
      ['They moved to Abidjan in 2015.','Ils ont déménagé à Abidjan en 2015.'],
      ['I\'ve lived here for three years.','J\'habite ici depuis trois ans.'],
      ['Did you see that film last week?','As-tu vu ce film la semaine dernière ?']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Signal words Present Perfect : <strong>just, already, yet, ever, never, for, since, recently, lately, so far</strong>.','Signal words Passé Simple : <strong>yesterday, last week/year, in 2020, ago, when, at that time</strong>.','<strong>Yet</strong> dans les questions et négations : <em>Have you eaten yet? / I haven\'t eaten yet.</em>'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['I have seen him yesterday.','I saw him yesterday.','Date précise (yesterday) → Passé Simple.'],
      ['She has gone to Paris in 2022.','She went to Paris in 2022.','Année précise → Passé Simple.'],
      ['Did you ever visit Rome?','Have you ever visited Rome?','Ever dans les questions de vie → Present Perfect.']]))
]

C['GRAM-B1-002'] = [
  s('rule', '📌 La Voix Passive',
    _rule('Object + BE (conjugated) + Past Participle (+ by + Agent)',
      'La <strong>voix passive</strong> met en avant l\'action ou l\'objet plutôt que l\'agent. On l\'utilise quand l\'agent est inconnu, non important ou évident. Elle est très courante dans les textes scientifiques, journalistiques et formels. <strong>By + agent</strong> est optionnel et s\'ajoute seulement quand l\'agent est important.')),
  s('table', '📊 Transformation actif → passif selon les temps',
    _table(['Temps','Actif','Passif'],
      [['Présent simple','They build houses.','Houses are built.'],
       ['Passé simple','She wrote the report.','The report was written.'],
       ['Present Perfect','He has signed the contract.','The contract has been signed.'],
       ['Futur will','They will repair the road.','The road will be repaired.'],
       ['Présent continu','They are filming the scene.','The scene is being filmed.'],
       ['Modal','You must complete the form.','The form must be completed.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['English is spoken all over the world.','L\'anglais est parlé dans le monde entier.'],
      ['The letter was written by the director.','La lettre a été écrite par le directeur.'],
      ['The contract has been signed.','Le contrat a été signé.'],
      ['Cocoa is exported from Côte d\'Ivoire.','Le cacao est exporté de Côte d\'Ivoire.'],
      ['The results will be announced tomorrow.','Les résultats seront annoncés demain.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Formule universelle : <strong>BE + Past Participle</strong>. Accordez "BE" selon le temps voulu.','N\'ajoutez "by + agent" que si l\'information est nécessaire ou surprenante.','La voix passive est fréquente au BAC et TOEIC — maîtrisez les transformations des 6 temps principaux.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['The car was repair.','The car was repaired.','Passif → BE + PARTICIPE PASSÉ complet.'],
      ['The letter is wrote by him.','The letter is written by him.','Participe passé irrégulier de write = written.'],
      ['They were been arrested.','They were arrested.','Passif simple = was/were + pp (pas "been").']]))
]

C['GRAM-B1-003'] = [
  s('rule', '📌 Les Propositions Relatives',
    _rule('Antecedent + WHO (person) / WHICH (thing) / THAT (both) / WHERE (place) / WHOSE (possession)',
      'Les <strong>propositions relatives</strong> apportent des informations supplémentaires sur un nom (l\'antécédent). <strong>Relative définissante</strong> (sans virgules) : l\'information est essentielle. <strong>Relative non définissante</strong> (avec virgules) : l\'information est accessoire. THAT ne s\'utilise pas dans les relatives non définissantes.')),
  s('table', '📊 Pronom relatif selon l\'antécédent',
    _table(['Pronom','Antécédent','Exemple'],
      [['who','personne (sujet)','The student who passed is happy.'],
       ['whom','personne (objet)','The teacher whom I respect…'],
       ['which','chose / animal','The book which I read was great.'],
       ['that','personne ou chose (définissant)','The car that he bought is red.'],
       ['whose','possession','The man whose car was stolen…'],
       ['where','lieu','The city where I was born…'],
       ['when','temps','The day when we met…']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['The woman who lives next door is a doctor.','La femme qui habite à côté est médecin.'],
      ['The book that I borrowed is very interesting.','Le livre que j\'ai emprunté est très intéressant.'],
      ['Abidjan, which is the economic capital, is very dynamic.','Abidjan, qui est la capitale économique, est très dynamique.'],
      ['The student whose phone rang was embarrassed.','L\'étudiant dont le téléphone a sonné était embarrassé.'],
      ['This is the school where I studied for five years.','C\'est l\'école où j\'ai étudié pendant cinq ans.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Relative avec virgules → information non essentielle, on peut la retirer. Sans virgules → information indispensable.','<strong>That</strong> peut souvent remplacer who/which dans les définissantes — mais JAMAIS dans les non-définissantes.','Pronom relatif omis possible (zero relative) quand il est OBJET : <em>The book (that) I read</em>.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['The man which called you is here.','The man who called you is here.','Personne → WHO (pas which).'],
      ['Abidjan, that is a big city, is in CI.','Abidjan, which is a big city, is in CI.','Relative non définissante → WHICH (pas that).'],
      ['The girl who her bag was stolen.','The girl whose bag was stolen.','Possession → WHOSE.']]))
]

C['GRAM-B1-004'] = [
  s('rule', '📌 Gérondif et Infinitif',
    _rule('Gerund: Verb + -ING (as noun) | Infinitive: TO + Verb (base)',
      'Le <strong>gérondif</strong> (-ing) fonctionne comme un nom. Il est sujet ou complément de certains verbes. L\'<strong>infinitif</strong> (to + verbe) suit certains verbes, adjectifs et noms. Certains verbes admettent les deux formes avec un changement de sens. Apprendre les verbes suivis de l\'un ou de l\'autre est essentiel.')),
  s('table', '📊 Verbes suivis de Gérondif ou Infinitif',
    _table(['Gérondif (-ing)','Infinitif (to-)','Les deux (même sens)','Les deux (sens différent)'],
      [['enjoy, avoid, finish','want, need, hope','begin, start, continue','remember, forget, stop, try'],
       ['suggest, recommend','decide, plan, agree','like, love, hate','—'],
       ['keep, practise','refuse, manage','prefer','regret'],
       ['mind, consider','seem, appear','—','—']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['I enjoy learning English.','J\'aime apprendre l\'anglais. (gérondif)'],
      ['She wants to become a doctor.','Elle veut devenir médecin. (infinitif)'],
      ['He stopped to smoke.','Il s\'est arrêté pour fumer. (but)'],
      ['He stopped smoking.','Il a arrêté de fumer. (habitude)'],
      ['I remember meeting her at the conference.','Je me souviens de l\'avoir rencontrée à la conférence.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Après une préposition, TOUJOURS le gérondif : <em>She is good at speaking English. / Thank you for coming.</em>','Sujet de phrase → gérondif : <em>Swimming is healthy. / Learning English opens doors.</em>','<strong>Stop to do</strong> (s\'arrêter pour faire) ≠ <strong>stop doing</strong> (arrêter de faire). Même chose pour remember, forget, regret, try.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['I enjoy to swim.','I enjoy swimming.','"Enjoy" est toujours suivi du gérondif.'],
      ['She suggested to go.','She suggested going.','"Suggest" → gérondif.'],
      ['Thank you for help me.','Thank you for helping me.','Après préposition → -ing.']]))
]

C['GRAM-B1-005'] = [
  s('rule', '📌 Used to / Would / Be used to',
    _rule('USED TO + base verb (past habits) | WOULD + base verb (past repeated actions) | BE USED TO + -ING (accustomed)',
      '<strong>Used to</strong> parle d\'habitudes ou d\'états passés qui n\'existent plus aujourd\'hui. <strong>Would</strong> parle uniquement d\'actions habituelles passées (pas d\'états). <strong>Be used to + -ing</strong> signifie "être habitué à" (présent, passé ou futur). <strong>Get used to + -ing</strong> signifie "s\'habituer à".')),
  s('table', '📊 Comparaison des trois structures',
    _table(['Structure','Sens','Emploi','Exemple'],
      [['used to + base','habitude passée révolue','états ET actions','I used to live in Bouaké.'],
       ['would + base','action répétée passée','actions seulement','He would walk to school.'],
       ['be used to + -ing','être habitué à (maintenant)','tout temps','She is used to working late.'],
       ['get used to + -ing','s\'habituer à (processus)','tout temps','He got used to the heat.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['I used to play football every Saturday.','Je jouais au football chaque samedi (avant).'],
      ['We would visit our grandparents on Sundays.','Nous rendions visite à nos grands-parents le dimanche.'],
      ['She is used to speaking in public.','Elle est habituée à parler en public.'],
      ['It took time, but I got used to driving on the right.','Ça a pris du temps, mais je me suis habitué à conduire à droite.'],
      ['He didn\'t use to like vegetables, but now he does.','Il n\'aimait pas les légumes, mais maintenant si.']])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['I am used to wake up early.','I am used to waking up early.','"Be used to" → toujours + -ING.'],
      ['She would be tall when young.','She used to be tall when young.','"Would" ne s\'utilise pas avec les états (be, have, know…).'],
      ['Did he used to smoke?','Did he use to smoke?','Après did → verbe BASE (use, pas used).']]))
]

C['GRAM-B2-001'] = [
  s('rule', '📌 Les Conditionnels – Types 0 à 3 et Mixed',
    _rule('Type 0: If + present, present | Type 1: If + present, will | Type 2: If + past, would | Type 3: If + past perfect, would have',
      'Les <strong>conditionnels</strong> expriment des situations hypothétiques. <strong>Type 0</strong> : vérités générales. <strong>Type 1</strong> : situations réelles/probables. <strong>Type 2</strong> : situations imaginaires ou peu probables dans le présent/futur. <strong>Type 3</strong> : regrets sur le passé — irréel du passé. <strong>Mixed</strong> : combine type 2 et type 3.')),
  s('table', '📊 Les 4 types de conditionnels',
    _table(['Type','Condition (If)','Résultat','Emploi'],
      [['0','Simple present','Simple present','Vérité générale / scientifique'],
       ['1','Simple present','Will + base','Réel et probable'],
       ['2','Simple past','Would + base','Hypothèse présente irréelle'],
       ['3','Past Perfect','Would have + PP','Hypothèse passée irréelle'],
       ['Mixed','Past Perfect','Would + base','Cause passée, conséquence présente']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['If you heat water to 100°C, it boils.','Si tu chauffes l\'eau à 100°C, elle bout. (type 0)'],
      ['If I study hard, I will pass the BAC.','Si j\'étudie dur, je réussirai le BAC. (type 1)'],
      ['If I were rich, I would travel the world.','Si j\'étais riche, je voyagerais dans le monde. (type 2)'],
      ['If she had studied, she would have passed.','Si elle avait étudié, elle aurait réussi. (type 3)'],
      ['If I had slept well, I would be more alert now.','Si j\'avais bien dormi, je serais plus alerte maintenant. (mixed)']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Type 2 : <strong>If I were</strong> (pas "was") dans le registre formel/écrit — "were" pour tous les sujets.','<strong>Unless</strong> = if… not : <em>Unless you study, you will fail</em> = <em>If you don\'t study…</em>','La clause "if" peut venir en premier ou en second — si elle est en premier, une virgule sépare les deux parties.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['If I will study, I will pass.','If I study, I will pass.','Type 1 : if + présent simple (jamais will dans la condition).'],
      ['If she would have more time, she could help.','If she had more time, she could help.','Type 2 : if + past simple (pas would).'],
      ['If he studied, he will pass.','If he had studied, he would have passed.','Mélange de types — choisir un type cohérent.']]))
]

C['GRAM-B2-002'] = [
  s('rule', '📌 Le Discours Rapporté',
    _rule('Direct: "I am tired," she said. → Reported: She said (that) she was tired.',
      'Le <strong>discours rapporté</strong> (Reported Speech) retranscrit les paroles de quelqu\'un sans les guillemets. Quand le verbe introducteur est au passé, les temps du discours direct reculent d\'un cran ("backshift"). Les pronoms, les expressions de temps et de lieu changent aussi.')),
  s('table', '📊 Correspondance des temps (backshift)',
    _table(['Discours Direct','Discours Rapporté'],
      [['Simple present','Simple past'],
       ['Present continuous','Past continuous'],
       ['Simple past','Past perfect'],
       ['Present perfect','Past perfect'],
       ['Will','Would'],
       ['Can','Could'],
       ['Must / have to','Had to'],
       ['May','Might']])),
  s('table', '📊 Changements de références',
    _table(['Direct','Rapporté'],
      [['today','that day'],
       ['tomorrow','the next day / the following day'],
       ['yesterday','the day before / the previous day'],
       ['here','there'],
       ['this','that'],
       ['now','then'],
       ['last week','the week before']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['"I live in Abidjan," he said.','He said (that) he lived in Abidjan.'],
      ['"We will come tomorrow," they said.','They said they would come the next day.'],
      ['"Did you finish the report?" she asked.','She asked if I had finished the report.'],
      ['"Study harder!" the teacher ordered.','The teacher told us to study harder.'],
      ['"I can\'t understand this," he admitted.','He admitted that he couldn\'t understand that.']])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['She said me she was tired.','She told me she was tired.','SAY → pas de complément direct. TELL → toujours + personne.'],
      ['He said that he will come.','He said that he would come.','Verbe introducteur au passé → backshift will → would.'],
      ['She asked where did he live.','She asked where he lived.','Questions indirectes → ordre sujet + verbe (pas d\'inversion).']]))
]

C['GRAM-B2-003'] = [
  s('rule', '📌 Les Phrasal Verbs Essentiels',
    _rule('Verb + Particle(s) → New meaning (often idiomatic)',
      'Les <strong>phrasal verbs</strong> sont des verbes composés d\'un verbe et d\'une ou deux particules (préposition ou adverbe). Leur sens est souvent idiomatique et imprévisible. Certains sont <strong>séparables</strong> (on peut placer un nom ou pronom entre le verbe et la particule), d\'autres sont <strong>inséparables</strong>.')),
  s('table', '📊 Phrasal verbs essentiels par thème',
    _table(['Phrasal Verb','Sens','Exemple'],
      [['give up','abandonner','Don\'t give up studying!'],
       ['look up','chercher (dans dico)','Look up the word in the dictionary.'],
       ['take off','décoller / enlever','The plane took off at noon.'],
       ['put off','remettre à plus tard','Don\'t put off your work.'],
       ['turn down','refuser / baisser','He turned down the offer.'],
       ['run into','rencontrer par hasard','I ran into my teacher at the market.'],
       ['carry on','continuer','Carry on with your work.'],
       ['find out','découvrir','I found out the truth.'],
       ['get on with','bien s\'entendre avec','She gets on with everyone.'],
       ['bring up','soulever (sujet) / élever (enfant)','He brought up an important point.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['She gave up smoking last year.','Elle a arrêté de fumer l\'année dernière.'],
      ['Look it up if you don\'t know the word.','Cherche-le si tu ne connais pas le mot.'],
      ['The meeting was put off until next week.','La réunion a été reportée à la semaine prochaine.'],
      ['He turned down the job offer.','Il a refusé l\'offre d\'emploi.'],
      ['I found out that she had lied.','J\'ai découvert qu\'elle avait menti.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Séparable : <em>Turn the TV off</em> ou <em>Turn off the TV</em>. Avec pronom, OBLIGATOIREMENT séparé : <em>Turn it off ✓ / Turn off it ✗</em>','Inséparable : <em>run into</em>, <em>get on with</em>, <em>look after</em> — la particule ne peut pas être séparée du verbe.','Apprenez les phrasal verbs en contexte et par famille thématique plutôt que par liste.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['She gave up to smoke.','She gave up smoking.','Give up → gérondif, pas infinitif.'],
      ['Turn off it.','Turn it off.','Séparable + pronom → pronom ENTRE verbe et particule.'],
      ['I ran into him accidentally.','I ran into him.','Run into inclut déjà l\'idée de hasard.']]))
]

C['GRAM-B2-004'] = [
  s('rule', '📌 Subjonctif et Souhaits',
    _rule('WISH + past simple (present wish) | WISH + past perfect (past regret) | WISH + would (future wish)',
      'En anglais, le <strong>subjonctif</strong> survit principalement dans des structures figées et après certains verbes. <strong>WISH</strong> exprime un souhait irréel ou un regret. La structure rappelle les conditionnels : passé simple pour le présent irréel, past perfect pour le passé regretté, would pour les souhaits sur le comportement futur d\'autrui.')),
  s('table', '📊 Structures des souhaits',
    _table(['Structure','Emploi','Exemple'],
      [['wish + past simple','Souhait présent irréel','I wish I spoke French perfectly.'],
       ['wish + past perfect','Regret sur le passé','I wish I had studied harder.'],
       ['wish + would + base','Souhait futur / plainte','I wish he would stop shouting.'],
       ['If only + past/past perf.','Emphase sur souhait/regret','If only I had more time!'],
       ['It\'s time + past simple','Il est temps que…','It\'s time you went to bed.'],
       ['would rather + past simple','préférence irréelle','I\'d rather you stayed.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['I wish I could speak English like a native.','Je souhaite pouvoir parler anglais comme un natif.'],
      ['She wishes she hadn\'t said that.','Elle regrette d\'avoir dit ça.'],
      ['I wish the government would invest in education.','Je souhaite que le gouvernement investisse dans l\'éducation.'],
      ['If only I had listened to my parents!','Si seulement j\'avais écouté mes parents !'],
      ['It\'s time students took their studies seriously.','Il est temps que les étudiants prennent leurs études au sérieux.']])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['I wish I can go.','I wish I could go.','Souhait présent → past simple ou could (pas can).'],
      ['I wish I went yesterday.','I wish I had gone yesterday.','Regret passé → past perfect.'],
      ['I wish he will stop.','I wish he would stop.','Souhait futur → would (pas will).']]))
]

C['GRAM-C1-001'] = [
  s('rule', '📌 Inversions et Emphases',
    _rule('Negative/restrictive adverb at start → Inversion of Aux + Subject | DO/DOES/DID + base for emphasis',
      'L\'<strong>inversion</strong> en anglais avancé s\'utilise quand un adverbe négatif ou restrictif est placé en tête de phrase pour l\'emphase — obligeant une structure de question. L\'<strong>emphase</strong> peut aussi se marquer par "do/does/did" au présent/passé affirmatif, par cleft sentences (it is… that…), ou par "what… is/was".')),
  s('table', '📊 Adverbes déclenchant l\'inversion',
    _table(['Adverbe / Expression','Exemple inversé'],
      [['Never','Never have I seen such a thing.'],
       ['Rarely / Seldom','Rarely does she make mistakes.'],
       ['Not only … but also','Not only did he lie, but he also stole.'],
       ['No sooner … than','No sooner had I left than it rained.'],
       ['Hardly / Scarcely … when','Hardly had she arrived when the phone rang.'],
       ['Under no circumstances','Under no circumstances should you sign.'],
       ['Only then / Only when','Only then did I understand.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Never have I been so proud of my students.','Jamais je n\'ai été aussi fier de mes étudiants.'],
      ['Not only is she intelligent, but she also works hard.','Non seulement elle est intelligente, mais elle travaille aussi dur.'],
      ['It was courage that won the battle.','C\'est le courage qui a remporté la bataille. (cleft)'],
      ['He does speak English well — don\'t doubt it.','Il parle vraiment bien anglais — n\'en doutez pas. (emphase do)'],
      ['What surprised me was her calm reaction.','Ce qui m\'a surpris, c\'était sa réaction calme. (wh-cleft)']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'L\'inversion après adverbe négatif est une marque stylistique de niveau C1/C2 — très valorisée dans les essais et écrits académiques.','Cleft sentence <em>It is/was … that/who</em> = mettre un élément en évidence en le sortant de la proposition principale.','L\'emphase avec <em>do/does/did</em> est surtout orale : <em>I DO care about this!</em>'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['Never I have seen this.','Never have I seen this.','Inversion obligatoire après Never en tête de phrase.'],
      ['Not only she is smart but also works hard.','Not only is she smart but she also works hard.','Inversion du sujet et de l\'auxiliaire requise.'],
      ['It was she that arrived late.','It was she who arrived late.','Cleft avec personne → WHO, pas THAT.']]))
]

C['GRAM-C1-002'] = [
  s('rule', '📌 Les Connecteurs Logiques Avancés',
    _rule('Connector + clause / noun phrase (position varies by connector type)',
      'Les <strong>connecteurs logiques</strong> structurent le discours et expriment les relations entre les idées : addition, opposition, concession, cause, conséquence, illustration. Un bon usage des connecteurs est indispensable pour les essais de niveau C1/C2, le TOEIC, le BAC et tout écrit académique.')),
  s('table', '📊 Connecteurs par fonction',
    _table(['Fonction','Connecteurs','Exemple'],
      [['Addition','furthermore, moreover, in addition, besides','Furthermore, technology has changed education.'],
       ['Opposition','however, nevertheless, on the other hand, yet','The plan is expensive; however, it is necessary.'],
       ['Concession','although, even though, despite, in spite of','Despite the rain, the event continued.'],
       ['Cause','because of, due to, owing to, since, as','Due to heavy traffic, she was late.'],
       ['Conséquence','therefore, consequently, as a result, hence','He studied hard; therefore, he passed.'],
       ['Illustration','for instance, for example, such as, namely','Some countries, such as Japan, invest heavily.'],
       ['Conclusion','in conclusion, to sum up, overall, all in all','In conclusion, education is key.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Despite his busy schedule, he found time to help.','Malgré son emploi du temps chargé, il a trouvé le temps d\'aider.'],
      ['The project failed; consequently, funding was withdrawn.','Le projet a échoué ; par conséquent, le financement a été retiré.'],
      ['Moreover, studies show that reading improves focus.','De plus, des études montrent que la lecture améliore la concentration.'],
      ['Although it was difficult, she succeeded.','Bien que ce soit difficile, elle a réussi.'],
      ['For instance, Abidjan has several international schools.','Par exemple, Abidjan possède plusieurs écoles internationales.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      '<strong>However</strong> et <strong>nevertheless</strong> peuvent être placés en début de phrase ou entre deux virgules à l\'intérieur.','<strong>Despite / In spite of</strong> + nom ou gérondif (PAS de clause). <strong>Although / even though</strong> + clause complète.','Variez vos connecteurs dans les essais — utiliser toujours "but" ou "so" trahit un niveau faible.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['Despite she was tired, she worked.','Despite being tired, she worked.','Despite + gérondif ou nom (pas clause avec sujet).'],
      ['Although the rain, we went out.','Although it rained, we went out.','Although + clause complète (sujet + verbe).'],
      ['He is intelligent. Furthermore he is lazy.','He is intelligent. Furthermore, he is lazy.','Virgule après connecteur en début de phrase.']]))
]

C['GRAM-C1-003'] = [
  s('rule', '📌 Style et Registre en Anglais',
    _rule('Formal: passive, complex nouns, no contractions | Informal: contractions, phrasal verbs, colloquial',
      'Le <strong>registre</strong> désigne le niveau de langue adapté à la situation de communication. L\'anglais distingue principalement le registre <strong>formel</strong> (académique, professionnel, officiel), le registre <strong>neutre</strong> (quotidien standard) et le registre <strong>informel</strong> (familier, conversationnel). La maîtrise du registre est une compétence de niveau C1.')),
  s('table', '📊 Comparaison formel / informel',
    _table(['Informel','Formel','Contexte'],
      [['get','obtain / acquire','rapport / lettre officielle'],
       ['ask for','request','correspondance pro'],
       ['sorry','I apologise','email formel'],
       ['but','however / nevertheless','essai académique'],
       ['so','therefore / consequently','rapport'],
       ['kids','children','contexte officiel'],
       ['a lot of','a great deal of / numerous','écrit académique'],
       ['can\'t','cannot','lettre formelle'],
       ['find out','discover / ascertain','rapport scientifique']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['I\'m writing to ask about the job.','I am writing to enquire about the position. (formel)'],
      ['We need to look into this problem.','This matter requires further investigation. (formel)'],
      ['The thing is, it\'s quite expensive.','The fact of the matter is that it is rather costly. (formel)'],
      ['Let me know what you think.','I would appreciate your feedback at your earliest convenience. (formel)'],
      ['They got rid of old equipment.','The old equipment was disposed of. (formel, passif)']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Registre formel : préférez les noms complexes (nominalisation) aux verbes simples : <em>decide → make a decision, reduce → bring about a reduction</em>.','En anglais académique : évitez les contractions, les phrasal verbs informels et les formules à la première personne.','En email professionnel : <em>Dear Mr/Ms [Name]</em> → <em>Yours sincerely</em> (si nom connu) | <em>Dear Sir/Madam</em> → <em>Yours faithfully</em> (si nom inconnu).'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['I wanna ask you something. (email formel)','I would like to ask you something.','Wanna = très informel, jamais dans un écrit formel.'],
      ['The kids didn\'t attend the ceremony.','The children did not attend the ceremony.','Eviter contractions et vocabulaire familier en contexte formel.'],
      ['We gotta fix this issue ASAP. (rapport)','This issue must be addressed promptly.','ASAP, gotta = argot, inapproprié en contexte professionnel.']]))
]

C['GRAM-C2-001'] = [
  s('rule', '📌 Nuances Idiomatiques et Registres Littéraires',
    _rule('Idiomatic expression = fixed phrase whose meaning ≠ literal sum of words',
      'À niveau C2, la maîtrise des <strong>expressions idiomatiques</strong> et des nuances stylistiques permet une communication authentique et une analyse littéraire fine. Les idiomes enrichissent le discours oral et écrit. Le registre littéraire exploite des procédés rhétoriques comme la métaphore, l\'oxymore, l\'allitération et la litote.')),
  s('table', '📊 Idiomes courants par thème',
    _table(['Idiome','Sens','Exemple'],
      [['bite the bullet','endurer courageusement','I\'ll bite the bullet and take the exam.'],
       ['break the ice','rompre la glace','He told a joke to break the ice.'],
       ['hit the nail on the head','toucher juste','You\'ve hit the nail on the head.'],
       ['spill the beans','révéler un secret','She spilled the beans about the surprise.'],
       ['under the weather','ne pas se sentir bien','I\'m feeling under the weather today.'],
       ['burn bridges','couper les ponts','Don\'t burn bridges with former colleagues.'],
       ['the tip of the iceberg','la partie visible du problème','This scandal is just the tip of the iceberg.'],
       ['a blessing in disguise','un mal pour un bien','Losing that job was a blessing in disguise.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['The poverty we see is just the tip of the iceberg.','La pauvreté que nous voyons n\'est que la partie visible du problème.'],
      ['It was a bittersweet moment — an oxymoron in itself.','C\'était un moment doux-amer — un oxymore en soi.'],
      ['His silence spoke volumes.','Son silence en disait long. (litote / métaphore)'],
      ['She had burning ambition and iron will.','Elle avait une ambition ardente et une volonté de fer. (métaphores)'],
      ['To be or not to be — the ultimate existential idiom.','Être ou ne pas être — l\'idiome existentiel ultime.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Apprenez les idiomes dans leur contexte d\'usage — leur emploi inapproprié est aussi mal perçu que leur ignorance.','Procédés rhétoriques à maîtriser pour l\'analyse littéraire : métaphore, simile, allitération, anaphore, ironie, litote, hyperbole.','Pour les textes authentiques, utilisez un dictionnaire d\'idiomes anglais (ex. Oxford Dictionary of Idioms) — pas de traduction mot à mot !'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['I feel under a weather.','I feel under the weather.','Expression figée — article THE obligatoire.'],
      ['She broke the ice cream.','She broke the ice.','Idiomes → ne pas modifier les mots.'],
      ['He spilled the beans and the secret.','He spilled the beans.','L\'idiome se suffit à lui-même.']]))
]

C['GRAM-C2-002'] = [
  s('rule', '📌 Analyse Grammaticale de Textes Authentiques',
    _rule('Identify structure → Name function → Explain effect in context',
      'L\'<strong>analyse grammaticale</strong> à niveau C2 implique d\'identifier les structures dans des textes authentiques (presse, littérature, discours) et d\'expliquer leur fonction rhétorique ou communicative. Ce n\'est pas seulement nommer une structure, mais en justifier l\'emploi dans le contexte du texte.')),
  s('table', '📊 Grille d\'analyse de structures complexes',
    _table(['Structure','Identification','Effet / Fonction'],
      [['Inversion après adverbe négatif','Never had he felt so lost.','Emphase dramatique, registre soutenu'],
       ['Cleft sentence','It was the truth that set him free.','Focalisation sur un élément clé'],
       ['Passive sans agent','The decision was taken.','Effacement de la responsabilité'],
       ['Conditionnel type 3','Had they known, they would have helped.','Regret, empathie avec le passé'],
       ['Gérondif sujet','Living in poverty shapes one\'s worldview.','Généralisation, ton académique'],
       ['Relative non définissante','The president, who spoke for an hour,…','Information additionnelle, ton formel']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Never before had the nation faced such a crisis.','Jamais auparavant la nation n\'avait fait face à une telle crise. (inversion pour emphase)'],
      ['It is education that transforms societies.','C\'est l\'éducation qui transforme les sociétés. (cleft — focalisation)'],
      ['Mistakes were made. (politique)','Des erreurs ont été commises. (passif sans agent — ambiguïté volontaire)'],
      ['Having completed her degree, she returned home.','Ayant obtenu son diplôme, elle est rentrée chez elle. (participe passé composé)'],
      ['The report, which took six months to compile, revealed shocking findings.','Le rapport, qui a pris six mois à compiler, a révélé des résultats choquants.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Dans l\'analyse : IDENTIFIER la structure + NOMMER le temps/mode/type + EXPLIQUER l\'EFFET dans le contexte = réponse complète.','Les structures passives dans les discours politiques effacent souvent l\'agent intentionnellement — repérez-le.','Les nominalisations (ex. "the destruction" au lieu de "they destroyed") sont caractéristiques du registre formel académique — elles condensent l\'information.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['C\'est un present perfect.','C\'est un present perfect qui exprime un lien avec le présent, suggérant que l\'action a des conséquences actuelles.','L\'analyse doit inclure la FONCTION, pas juste le nom.'],
      ['Passive voice = when we don\'t know who did it.','Passive can also be used for emphasis, formality, or to deliberately obscure agency.','Ne pas réduire le passif à une seule explication.'],
      ['The comma means a pause.','The comma here introduces a non-defining relative clause, adding non-essential information.','Les signes de ponctuation ont des fonctions grammaticales précises.']]))
]

// ═══════════════════════════════════════════════════════════════════════════════
// VOCABULARY MODULES
// ═══════════════════════════════════════════════════════════════════════════════

C['VOCAB-A1-001'] = [
  s('table', '📘 La famille – vocabulaire de base',
    _table(['Anglais','Français','Exemple'],
      [['mother / mum','mère / maman','My mother is a nurse.'],
       ['father / dad','père / papa','His father works in Abidjan.'],
       ['brother','frère','I have two brothers.'],
       ['sister','soeur','She is my older sister.'],
       ['grandmother','grand-mère','My grandma lives in the village.'],
       ['grandfather','grand-père','He visits his grandpa on weekends.'],
       ['uncle','oncle','My uncle is a teacher.'],
       ['aunt','tante','Her aunt lives in Paris.'],
       ['cousin','cousin(e)','I have five cousins.'],
       ['nephew / niece','neveu / nièce','He is my favourite nephew.']])),
  s('table', '📘 Relations et état civil',
    _table(['Anglais','Français','Exemple'],
      [['husband','mari','Her husband is a doctor.'],
       ['wife','femme (épouse)','His wife teaches at the university.'],
       ['son','fils','They have two sons.'],
       ['daughter','fille','Their daughter won a scholarship.'],
       ['parents','parents','My parents are both retired.'],
       ['only child','enfant unique','She is an only child.'],
       ['twins','jumeaux','They are identical twins.'],
       ['in-laws','belle-famille','I get along well with my in-laws.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['I live with my parents and my younger sister.','Je vis avec mes parents et ma petite soeur.'],
      ['My grandparents have six grandchildren.','Mes grands-parents ont six petits-enfants.'],
      ['She is married and has three children.','Elle est mariée et a trois enfants.'],
      ['My uncle and aunt live in Bouaké.','Mon oncle et ma tante habitent à Bouaké.'],
      ['We are a very close-knit family.','Nous sommes une famille très soudée.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      '<strong>In-laws</strong> = belle-famille : <em>mother-in-law</em> (belle-mère), <em>father-in-law</em> (beau-père), <em>brother-in-law</em> (beau-frère).',
      '<strong>Step-</strong> = famille recomposée : <em>stepmother, stepfather, stepsister, stepbrother</em>.',
      '<strong>Elder / older</strong> = aîné(e). <strong>Younger</strong> = cadet(te). <em>My older brother / my younger sister.</em>']))
]

C['VOCAB-A1-002'] = [
  s('table', '📘 Les couleurs',
    _table(['Anglais','Français','Collocation courante'],
      [['red','rouge','a red rose / red traffic light'],
       ['blue','bleu','sky blue / navy blue'],
       ['green','vert','forest green / green vegetables'],
       ['yellow','jaune','bright yellow / yellow sun'],
       ['orange','orange','orange fruit / orange sunset'],
       ['white','blanc','white shirt / snow-white'],
       ['black','noir','black coffee / black market'],
       ['grey','gris','grey sky / grey hair'],
       ['brown','marron/brun','brown earth / brown eyes'],
       ['purple','violet','purple flowers / royal purple'],
       ['pink','rose','light pink / hot pink']])),
  s('table', '📘 Les formes et descriptions',
    _table(['Anglais','Français','Exemple'],
      [['round','rond','a round table'],
       ['square','carré','a square room'],
       ['rectangular','rectangulaire','a rectangular window'],
       ['triangular','triangulaire','a triangular shape'],
       ['oval','ovale','an oval face'],
       ['tall','grand (hauteur)','a tall building'],
       ['wide / broad','large','a wide road'],
       ['narrow','étroit','a narrow alley'],
       ['deep','profond','a deep river'],
       ['flat','plat','a flat surface']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['The Ivorian flag is orange, white and green.','Le drapeau ivoirien est orange, blanc et vert.'],
      ['She wore a long blue dress to the ceremony.','Elle portait une longue robe bleue à la cérémonie.'],
      ['The Basilica of Yamoussoukro has a round dome.','La Basilique de Yamoussoukro a un dôme rond.'],
      ['My school bag is black and rectangular.','Mon cartable est noir et rectangulaire.'],
      ['The sky turns orange and red at sunset.','Le ciel devient orange et rouge au coucher du soleil.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'En anglais, les adjectifs se placent AVANT le nom : <em>a big blue car</em> (pas "une voiture bleue grande").',
      'Ordre des adjectifs : Opinion → Taille → Age → Forme → Couleur → Origine → Matière. Ex: <em>a beautiful large old round red Italian wooden table</em>.',
      '<strong>Light</strong> + couleur = clair : <em>light blue</em>. <strong>Dark</strong> + couleur = foncé : <em>dark green</em>.']))
]

C['VOCAB-A1-003'] = [
  s('table', '📘 Les pronoms en anglais – Partie 1',
    _table(['Type','Pronoms','Emploi','Exemple'],
      [['Sujet','I, you, he, she, it, we, they','Sujet de la phrase','She is my friend.'],
       ['Complément','me, you, him, her, it, us, them','Après verbe ou préposition','Call me later.'],
       ['Possessif adj.','my, your, his, her, its, our, their','Avant un nom','This is my book.'],
       ['Possessif pron.','mine, yours, his, hers, ours, theirs','Standalone','The bag is mine.'],
       ['Réfléchi','myself, yourself, himself, herself, itself, ourselves, themselves','Action réfléchie','She hurt herself.']])),
  s('table', '📘 Pronoms démonstratifs et indéfinis',
    _table(['Pronom','Sens','Exemple'],
      [['this','ceci (proche)','This is my pen.'],
       ['that','cela (éloigné)','That is her car.'],
       ['these','ceux-ci (proche plur.)','These are my friends.'],
       ['those','ceux-là (éloigné plur.)','Those books are expensive.'],
       ['someone / somebody','quelqu\'un','Someone called you.'],
       ['everyone / everybody','tout le monde','Everyone passed the test.'],
       ['no one / nobody','personne','Nobody answered.'],
       ['something','quelque chose','Something is wrong.'],
       ['nothing','rien','There is nothing to eat.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['This is my bag — that one is hers.','C\'est mon sac — celui-là est le sien.'],
      ['Everybody loves a good story.','Tout le monde aime une bonne histoire.'],
      ['Nobody knows the answer.','Personne ne connait la réponse.'],
      ['She introduced herself to the class.','Elle s\'est présentée à la classe.'],
      ['These students are very hardworking.','Ces étudiants sont très travailleurs.']])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['Me and my friend went to school.','My friend and I went to school.','Politesse : l\'autre personne d\'abord, "I" en position sujet.'],
      ['Everyone have their book.','Everyone has their book.','Everyone → verbe singulier (has).'],
      ['I am used to it\'s noise.','I am used to its noise.','Its = possessif (sans apostrophe).']]))
]

C['VOCAB-A1-004'] = [
  s('table', '📘 La nourriture et les boissons',
    _table(['Anglais','Français','Catégorie'],
      [['rice','riz','féculents'],
       ['bread','pain','féculents'],
       ['plantain','banane plantain','fruits/légumes'],
       ['cassava','manioc','féculents'],
       ['yam','igname','féculents'],
       ['chicken','poulet','viandes'],
       ['fish','poisson','protéines'],
       ['beef','boeuf','viandes'],
       ['tomato','tomate','légumes'],
       ['onion','oignon','légumes'],
       ['mango','mangue','fruits'],
       ['pineapple','ananas','fruits'],
       ['water','eau','boissons'],
       ['juice','jus','boissons'],
       ['milk','lait','boissons'],
       ['coffee','café','boissons chaudes']])),
  s('table', '📘 Verbes liés à la nourriture',
    _table(['Anglais','Français','Exemple'],
      [['eat','manger','I eat rice every day.'],
       ['drink','boire','She drinks water after exercise.'],
       ['cook','cuisiner','He cooks on Sundays.'],
       ['taste','goûter','Taste this — it\'s delicious!'],
       ['order','commander','Can I order, please?'],
       ['serve','servir','The waiter served the food quickly.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['My favourite dish is attiéké with grilled fish.','Mon plat préféré est l\'attiéké avec du poisson grillé.'],
      ['Can I have a glass of water, please?','Puis-je avoir un verre d\'eau, s\'il vous plaît ?'],
      ['She is cooking chicken and rice for dinner.','Elle prépare du poulet et du riz pour le dîner.'],
      ['I love fresh mango juice in the morning.','J\'adore le jus de mangue fraîche le matin.'],
      ['Bread and coffee are his usual breakfast.','Le pain et le café sont son petit-déjeuner habituel.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Nourriture indénombrable (uncountable) : <em>rice, bread, water, milk, coffee</em> — on ne dit pas "a rice" mais "some rice" ou "a bowl of rice".',
      '<strong>A piece of</strong> bread/cake | <strong>a glass of</strong> water | <strong>a cup of</strong> coffee | <strong>a bowl of</strong> rice — pour quantifier l\'indénombrable.',
      '<strong>Delicious</strong> = délicieux. <strong>Spicy</strong> = épicé. <strong>Sweet</strong> = sucré. <strong>Bitter</strong> = amer. <strong>Salty</strong> = salé.']))
]

C['VOCAB-A1-005'] = [
  s('table', '📘 Le corps humain',
    _table(['Anglais','Français','Anglais','Français'],
      [['head','tête','neck','cou'],
       ['face','visage','shoulder','épaule'],
       ['eye (eyes)','oeil (yeux)','arm','bras'],
       ['ear','oreille','elbow','coude'],
       ['nose','nez','hand','main'],
       ['mouth','bouche','finger','doigt'],
       ['tooth (teeth)','dent(s)','chest','poitrine'],
       ['hair','cheveux','back','dos'],
       ['leg','jambe','knee','genou'],
       ['foot (feet)','pied(s)','toe','orteil']])),
  s('table', '📘 La santé – vocabulaire essentiel',
    _table(['Anglais','Français','Exemple'],
      [['headache','mal de tête','I have a headache.'],
       ['fever','fièvre','She has a high fever.'],
       ['cough','toux','He has a bad cough.'],
       ['cold','rhume','I caught a cold.'],
       ['stomachache','mal d\'estomac','She has a stomachache.'],
       ['doctor','médecin','I need to see a doctor.'],
       ['nurse','infirmier/infirmière','The nurse checked my blood pressure.'],
       ['hospital','hôpital','He was taken to hospital.'],
       ['medicine','médicament','Take this medicine twice a day.'],
       ['healthy','en bonne santé','Eat well to stay healthy.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['I have a sore throat and a runny nose.','J\'ai mal à la gorge et le nez qui coule.'],
      ['The doctor prescribed medicine for my fever.','Le médecin m\'a prescrit des médicaments pour ma fièvre.'],
      ['She broke her arm during the football match.','Elle s\'est cassé le bras pendant le match de football.'],
      ['Exercise is good for your heart and lungs.','L\'exercice est bon pour le coeur et les poumons.'],
      ['Wash your hands regularly to stay healthy.','Lavez-vous les mains régulièrement pour rester en bonne santé.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Pour une douleur : <strong>I have a + ache</strong> : headache, stomachache, toothache, backache. Ou : <strong>My + body part + hurts / is sore</strong>.',
      '<strong>Ill / sick</strong> = malade. <strong>Feel better</strong> = aller mieux. <strong>Recover</strong> = guérir / se remettre.',
      'Aux urgences : <em>Call an ambulance! / It\'s an emergency! / I need help!</em>']))
]

C['VOCAB-A1-006'] = [
  s('table', '📘 Les nombres cardinaux et ordinaux',
    _table(['Cardinal','Ordinal','Cardinal','Ordinal'],
      [['1 – one','1st – first','11 – eleven','11th – eleventh'],
       ['2 – two','2nd – second','12 – twelve','12th – twelfth'],
       ['3 – three','3rd – third','13 – thirteen','13th – thirteenth'],
       ['4 – four','4th – fourth','20 – twenty','20th – twentieth'],
       ['5 – five','5th – fifth','21 – twenty-one','21st – twenty-first'],
       ['10 – ten','10th – tenth','100 – one hundred','100th – hundredth'],
       ['1,000 – one thousand','1,000th – thousandth','1,000,000 – one million','millionth']])),
  s('table', '📘 Les dates et l\'heure',
    _table(['Concept','Formule','Exemple'],
      [['Date (UK)','Day + Month + Year','15th April 2025'],
       ['Date (US)','Month + Day + Year','April 15, 2025'],
       ['Heure exacte','It\'s … o\'clock','It\'s three o\'clock.'],
       ['Demi-heure','half past …','It\'s half past six. (6h30)'],
       ['Quart','quarter past/to','It\'s quarter past four. (4h15)'],
       ['Minutes avant','… to …','It\'s ten to eight. (7h50)'],
       ['Minutes après','… past …','It\'s twenty past nine. (9h20)']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['My birthday is on the 3rd of March.','Mon anniversaire est le 3 mars.'],
      ['The exam starts at quarter past eight.','L\'examen commence à huit heures et quart.'],
      ['There are about 27 million people in Côte d\'Ivoire.','Il y a environ 27 millions de personnes en Côte d\'Ivoire.'],
      ['She arrived on Monday, 7th January 2025.','Elle est arrivée le lundi 7 janvier 2025.'],
      ['The meeting is at half past two in the afternoon.','La réunion est à deux heures et demie de l\'après-midi.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Les mois s\'écrivent toujours avec une majuscule en anglais : <em>January, February, March, April, May, June, July, August, September, October, November, December</em>.',
      'Les jours aussi : <em>Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday</em>.',
      'Pour l\'heure : en anglais britannique <em>half past six</em> = 6h30 ; en américain on dit souvent <em>six thirty</em>.']))
]

C['VOCAB-A2-001'] = [
  s('table', '📘 Les vêtements',
    _table(['Anglais','Français','Collocation'],
      [['shirt','chemise','a white shirt'],
       ['blouse','chemisier','a silk blouse'],
       ['trousers / pants','pantalon','black trousers'],
       ['jeans','jean','a pair of jeans'],
       ['dress','robe','a long dress'],
       ['skirt','jupe','a short skirt'],
       ['suit','costume/tailleur','a business suit'],
       ['jacket','veste','a leather jacket'],
       ['shoes','chaussures','leather shoes'],
       ['boots','bottes','rain boots'],
       ['sandals','sandales','open-toe sandals'],
       ['hat','chapeau','a straw hat'],
       ['tie','cravate','a silk tie'],
       ['scarf','écharpe','a woollen scarf']])),
  s('table', '📘 Verbes et expressions liés aux vêtements',
    _table(['Expression','Sens','Exemple'],
      [['wear','porter (être habillé)','She wears traditional clothes on Fridays.'],
       ['put on','mettre (action)','Put on your shoes — we\'re leaving.'],
       ['take off','enlever','Take off your jacket, it\'s warm.'],
       ['get dressed','s\'habiller','Get dressed quickly!'],
       ['try on','essayer','Can I try on this dress?'],
       ['fit','aller à la taille','These trousers don\'t fit me.'],
       ['suit','aller (style/couleur)','That colour suits you perfectly.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['She wore a beautiful traditional outfit for the festival.','Elle portait un beau costume traditionnel pour le festival.'],
      ['I need to buy new shoes for the job interview.','J\'ai besoin d\'acheter de nouvelles chaussures pour l\'entretien d\'embauche.'],
      ['What size do you wear?','Quelle taille portez-vous ?'],
      ['That dress suits you — the colour is perfect.','Cette robe te va bien — la couleur est parfaite.'],
      ['He wore a white shirt and a dark tie for the ceremony.','Il portait une chemise blanche et une cravate sombre pour la cérémonie.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      '<strong>Wear</strong> = état (on est habillé). <strong>Put on</strong> = action (on s\'habille). <em>She is wearing a hat</em> vs <em>She is putting on her hat</em>.',
      '<strong>A pair of</strong> → trousers, jeans, shorts, shoes, socks, gloves — toujours au pluriel.',
      'Dress code professionnel : <em>smart casual / business casual / formal attire / business formal</em>.']))
]

C['VOCAB-A2-002'] = [
  s('table', '📘 Les transports',
    _table(['Anglais','Français','Verbe d\'usage'],
      [['bus','bus','take the bus'],
       ['taxi','taxi','call / take a taxi'],
       ['motorbike','moto','ride a motorbike'],
       ['car','voiture','drive a car'],
       ['train','train','catch the train'],
       ['plane / aircraft','avion','take / board the plane'],
       ['boat / ferry','bateau / ferry','cross by ferry'],
       ['bicycle / bike','vélo','ride a bike'],
       ['on foot','à pied','walk on foot']])),
  s('table', '📘 Au transport – expressions et lieux',
    _table(['Anglais','Français','Exemple'],
      [['airport','aéroport','The airport is 40 km away.'],
       ['train station','gare ferroviaire','Meet me at the train station.'],
       ['bus stop','arrêt de bus','Wait at the bus stop.'],
       ['ticket','billet','Buy your ticket online.'],
       ['departure','départ','Departure at 6 a.m.'],
       ['arrival','arrivée','Estimated arrival: 2 p.m.'],
       ['delay','retard','There is a 30-minute delay.'],
       ['boarding pass','carte d\'embarquement','Show your boarding pass.'],
       ['luggage / baggage','bagages','Check in your luggage.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['I take the bus to work every morning.','Je prends le bus pour aller au travail chaque matin.'],
      ['The flight from Abidjan to Paris takes about 6 hours.','Le vol d\'Abidjan à Paris dure environ 6 heures.'],
      ['Could you tell me where the nearest bus stop is?','Pourriez-vous me dire où se trouve l\'arrêt de bus le plus proche ?'],
      ['His flight was delayed by two hours due to bad weather.','Son vol a été retardé de deux heures à cause du mauvais temps.'],
      ['I prefer travelling by train — it\'s more relaxing than flying.','Je préfère voyager en train — c\'est plus relaxant que l\'avion.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Prépositions des transports : <strong>by</strong> + moyen (sans article) : <em>by bus, by car, by plane</em>. Mais <em>on foot</em>, <em>in the car</em> (passager).',
      '<strong>Take / catch</strong> a bus/train/taxi. <strong>Drive</strong> a car. <strong>Ride</strong> a bike/motorbike. <strong>Board</strong> a plane.',
      'Questions pratiques : <em>Where does this bus go? / How much is a ticket to…? / Is this seat taken?</em>']))
]

C['VOCAB-A2-003'] = [
  s('table', '📘 La maison – pièces et mobilier',
    _table(['Pièce (anglais)','Pièce (français)','Mobilier clé'],
      [['living room','salon','sofa, armchair, TV, coffee table'],
       ['bedroom','chambre','bed, wardrobe, desk, lamp'],
       ['kitchen','cuisine','fridge, cooker, sink, cupboard'],
       ['bathroom','salle de bain','shower, bath, mirror, sink'],
       ['dining room','salle à manger','dining table, chairs'],
       ['garden','jardin','plants, lawn, outdoor furniture'],
       ['garage','garage','car, tools, shelves'],
       ['hallway / entrance','entrée / couloir','coat rack, umbrella stand']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Our living room is large with comfortable sofas.','Notre salon est grand avec des canapés confortables.'],
      ['She does her homework at the desk in her bedroom.','Elle fait ses devoirs au bureau dans sa chambre.'],
      ['The kitchen has a modern cooker and a large fridge.','La cuisine a une cuisinière moderne et un grand réfrigérateur.'],
      ['We eat together in the dining room every evening.','Nous mangeons ensemble dans la salle à manger chaque soir.'],
      ['He waters the plants in the garden every morning.','Il arrose les plantes dans le jardin chaque matin.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Prépositions : <em>in the kitchen / in the bedroom</em>. <em>on the sofa / on the bed</em>. <em>at the table / at the desk</em>.',
      '<strong>Home</strong> vs <strong>house</strong> : <em>house</em> = bâtisse physique. <em>home</em> = lieu de vie affectif. <em>I live in a house</em> vs <em>I am going home</em>.',
      'Verbes du quotidien à la maison : <em>vacuum / hoover</em> (aspirer), <em>mop</em> (serpillière), <em>dust</em> (essuyer la poussière), <em>iron</em> (repasser).']))
]

C['VOCAB-A2-004'] = [
  s('table', '📘 Les métiers',
    _table(['Anglais','Français','Secteur'],
      [['teacher','enseignant(e)','éducation'],
       ['doctor','médecin','santé'],
       ['nurse','infirmier/infirmière','santé'],
       ['engineer','ingénieur(e)','technique'],
       ['lawyer','avocat(e)','justice'],
       ['accountant','comptable','finance'],
       ['farmer','agriculteur/trice','agriculture'],
       ['driver','chauffeur','transport'],
       ['police officer','policier/policière','sécurité'],
       ['journalist','journaliste','médias'],
       ['architect','architecte','construction'],
       ['chef / cook','cuisinier/cuisinière','restauration'],
       ['businessman/woman','homme/femme d\'affaires','commerce'],
       ['civil servant','fonctionnaire','administration']])),
  s('table', '📘 Le travail – expressions clés',
    _table(['Expression','Français','Exemple'],
      [['apply for a job','postuler à un emploi','She applied for a teaching job.'],
       ['be hired / get the job','être embauché','He got the job after the interview.'],
       ['be fired / get fired','être licencié','He was fired for misconduct.'],
       ['resign / quit','démissionner','She resigned to start her own business.'],
       ['salary / wage','salaire','The salary is paid monthly.'],
       ['promotion','promotion','He got a promotion last year.'],
       ['colleague','collègue','My colleagues are very supportive.'],
       ['boss / manager','patron / directeur','My manager is strict but fair.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['She is a doctor and works at a hospital in Abidjan.','Elle est médecin et travaille dans un hôpital à Abidjan.'],
      ['He applied for an engineering position and got the job.','Il a postulé à un poste d\'ingénieur et a obtenu le poste.'],
      ['What do you do for a living?','Que faites-vous dans la vie ?'],
      ['She was promoted to Head of Department after five years.','Elle a été promue chef de département après cinq ans.'],
      ['Many young Ivorians are creating their own businesses.','Beaucoup de jeunes Ivoiriens créent leur propre entreprise.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Pour présenter son métier : <em>I am a + métier</em> (sans article) : <em>I am a teacher</em> ✓ / <em>I work as a teacher</em> ✓.',
      '<strong>Job</strong> = emploi spécifique. <strong>Work</strong> = travail en général. <strong>Career</strong> = carrière long terme. <strong>Profession</strong> = métier qualifié.',
      'Attention : <em>I am teacher ✗ → I am a teacher ✓</em> — ne pas oublier l\'article indéfini.']))
]

C['VOCAB-B1-001'] = [
  s('table', '📘 Les pronoms en anglais – Partie 2',
    _table(['Type','Formes','Emploi','Exemple'],
      [['Interrogatifs','who, what, which, whose, whom','Questions directes / indirectes','Who called? / What do you want?'],
       ['Relatifs','who, which, that, whose, where, when','Propositions relatives','The man who helped me…'],
       ['Indéfinis','some, any, no, every + body/one/thing','Personnes/choses indéfinies','Someone called. / Nobody came.'],
       ['Réciproques','each other, one another','Action mutuelle','They love each other.'],
       ['Distributifs','each, every, either, neither, both, all, none','Distribution','Each student got a book.']])),
  s('table', '📘 Some / Any / No / Every — règle d\'emploi',
    _table(['Pronom','Affirmatif','Question','Négation'],
      [['some-','something, someone','—','—'],
       ['any-','—','anything, anyone','not anything, not anyone'],
       ['every-','everything, everyone','—','—'],
       ['no-','—','—','nothing, nobody (sans not)']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Everybody needs somebody to love.','Tout le monde a besoin de quelqu\'un à aimer.'],
      ['Is there anything I can do to help?','Y a-t-il quelque chose que je peux faire pour aider ?'],
      ['Neither of the candidates was perfect.','Aucun des candidats n\'était parfait.'],
      ['They congratulated each other after the game.','Ils se sont félicités mutuellement après le match.'],
      ['Both students passed, but neither got full marks.','Les deux étudiants ont réussi, mais aucun n\'a eu la note maximale.']])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['I didn\'t see nobody.','I didn\'t see anybody.','Une seule négation par phrase en anglais.'],
      ['Each students have a book.','Each student has a book.','Each + singulier + verbe singulier.'],
      ['Neither of them are ready.','Neither of them is ready.','Neither → verbe singulier (registre formel).']]))
]

C['VOCAB-B1-002'] = [
  s('table', '📘 L\'environnement et l\'écologie',
    _table(['Anglais','Français','Collocation'],
      [['climate change','changement climatique','tackle / combat climate change'],
       ['global warming','réchauffement climatique','global warming threatens biodiversity'],
       ['deforestation','déforestation','deforestation destroys ecosystems'],
       ['pollution','pollution','air / water / soil pollution'],
       ['renewable energy','énergie renouvelable','invest in renewable energy'],
       ['biodiversity','biodiversité','protect biodiversity'],
       ['drought','sécheresse','suffer from drought'],
       ['flood','inondation','be hit by floods'],
       ['recycle','recycler','recycle waste / plastic'],
       ['carbon footprint','empreinte carbone','reduce your carbon footprint'],
       ['sustainable','durable','sustainable development'],
       ['greenhouse gas','gaz à effet de serre','reduce greenhouse gas emissions']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Côte d\'Ivoire faces serious deforestation due to cocoa farming.','La Côte d\'Ivoire fait face à une grave déforestation due à la culture du cacao.'],
      ['We need sustainable solutions to combat climate change.','Nous avons besoin de solutions durables pour lutter contre le changement climatique.'],
      ['Renewable energy sources like solar and wind are the future.','Les sources d\'énergie renouvelables comme le solaire et l\'éolien sont l\'avenir.'],
      ['Every citizen must work to reduce their carbon footprint.','Chaque citoyen doit travailler à réduire son empreinte carbone.'],
      ['Floods and droughts are becoming more frequent in West Africa.','Les inondations et sécheresses deviennent plus fréquentes en Afrique de l\'Ouest.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Collocations essentielles : <em>fight against / tackle / combat</em> pollution/climate change. <em>preserve / protect / conserve</em> biodiversity.',
      'Vocabulaire clé pour essais BAC/C1 : <em>fossil fuels, greenhouse effect, carbon dioxide (CO2), ozone layer, habitat loss, endangered species</em>.']))
]

C['VOCAB-B1-003'] = [
  s('table', '📘 La technologie et le monde numérique',
    _table(['Anglais','Français','Exemple'],
      [['smartphone','smartphone','I use my smartphone for everything.'],
       ['internet','internet','Access the internet via Wi-Fi.'],
       ['social media','réseaux sociaux','Social media connects billions.'],
       ['application / app','application','Download the app for free.'],
       ['website','site web','Visit our website for more info.'],
       ['password','mot de passe','Change your password regularly.'],
       ['artificial intelligence','intelligence artificielle','AI is transforming many sectors.'],
       ['database','base de données','The database stores all records.'],
       ['software','logiciel','Update your software.'],
       ['cybersecurity','cybersécurité','Cybersecurity is a growing concern.'],
       ['cloud storage','stockage cloud','Store your files in the cloud.'],
       ['digital','numérique','We live in a digital age.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Mobile internet usage in Africa is growing rapidly.','L\'utilisation d\'internet mobile en Afrique croît rapidement.'],
      ['Young people in Abidjan are very active on social media.','Les jeunes à Abidjan sont très actifs sur les réseaux sociaux.'],
      ['Artificial intelligence is changing how we learn English.','L\'IA change notre façon d\'apprendre l\'anglais.'],
      ['Always use a strong password to protect your accounts.','Utilisez toujours un mot de passe fort pour protéger vos comptes.'],
      ['AGTM Academy uses a digital platform for all its courses.','L\'AGTM Academy utilise une plateforme numérique pour tous ses cours.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Verbes clés du numérique : <em>download, upload, stream, browse, scroll, search, share, post, like, follow, block, log in/out, sign up, hack</em>.',
      '<strong>IT</strong> = Information Technology. <strong>ICT</strong> = Information and Communication Technology.',
      'Nouveau vocabulaire IA : <em>machine learning, algorithm, chatbot, data processing, neural network, prompt</em>.']))
]

C['VOCAB-B1-004'] = [
  s('table', '📘 Les émotions et les sentiments',
    _table(['Anglais','Français','Intensité'],
      [['happy / joyful / elated','heureux / joyeux / ravi','positif (croissant)'],
       ['sad / upset / devastated','triste / bouleversé / anéanti','négatif (croissant)'],
       ['angry / furious / livid','en colère / furieux / hors de soi','négatif (croissant)'],
       ['scared / terrified','effrayé / terrifié','négatif (fort)'],
       ['surprised / astonished','surpris / stupéfait','neutre'],
       ['proud','fier','positif'],
       ['ashamed / embarrassed','honteux / embarrassé','négatif'],
       ['excited / thrilled','excité / enthousiasmé','positif'],
       ['bored','ennuyé','négatif'],
       ['anxious / worried','anxieux / inquiet','négatif'],
       ['relieved','soulagé','positif'],
       ['jealous','jaloux','négatif']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['She felt proud when her son graduated from university.','Elle se sentait fière quand son fils a obtenu son diplôme.'],
      ['I was so excited before the final exam results!','J\'étais tellement excité avant les résultats de l\'examen final !'],
      ['He was disappointed when he didn\'t get the scholarship.','Il était déçu quand il n\'a pas obtenu la bourse.'],
      ['She was relieved to hear that everyone was safe.','Elle était soulagée d\'apprendre que tout le monde était sauf.'],
      ['I feel anxious when I have to speak in front of many people.','Je me sens anxieux quand je dois parler devant beaucoup de personnes.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Adjectifs en <strong>-ed</strong> = ce que VOUS ressentez. Adjectifs en <strong>-ing</strong> = ce qui CAUSE ce sentiment : <em>I am bored</em> (je m\'ennuie) / <em>The class is boring</em> (le cours est ennuyeux).',
      'Collocations : <em>proud OF, jealous OF, scared OF, excited ABOUT, disappointed WITH, worried ABOUT, ashamed OF</em>.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['I am very boring.','I am very bored.','BORING = ennuyeux (la chose). BORED = qui s\'ennuie (la personne).'],
      ['She is very exciting about her results.','She is very excited about her results.','-ED pour la personne qui ressent.'],
      ['He is frightening of dogs.','He is frightened of dogs.','Frightened OF = avoir peur de.']]))
]

C['VOCAB-B1-005'] = [
  s('table', '📘 La santé et le bien-être – vocabulaire avancé',
    _table(['Anglais','Français','Collocation'],
      [['well-being','bien-être','promote well-being'],
       ['mental health','santé mentale','mental health awareness'],
       ['stress','stress','manage / reduce stress'],
       ['anxiety','anxiété','suffer from anxiety'],
       ['depression','dépression','treat depression'],
       ['lifestyle','mode de vie','a healthy / sedentary lifestyle'],
       ['diet','alimentation / régime','a balanced diet'],
       ['exercise','exercice','regular exercise'],
       ['prevention','prévention','prevention campaigns'],
       ['vaccination','vaccination','vaccination programme'],
       ['surgeon','chirurgien(ne)','the surgeon operated'],
       ['prescription','ordonnance','write a prescription']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['A balanced diet and regular exercise improve your well-being.','Une alimentation équilibrée et l\'exercice régulier améliorent votre bien-être.'],
      ['Access to quality healthcare is a fundamental right.','L\'accès à des soins de santé de qualité est un droit fondamental.'],
      ['Mental health awareness is increasing in West Africa.','La sensibilisation à la santé mentale augmente en Afrique de l\'Ouest.'],
      ['She follows a strict diet to manage her diabetes.','Elle suit un régime strict pour gérer son diabète.'],
      ['Prevention campaigns have reduced malaria in rural areas.','Les campagnes de prévention ont réduit le paludisme dans les zones rurales.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Collocations santé : <em>suffer FROM an illness, be diagnosed WITH a disease, recover FROM an operation, be treated FOR a condition</em>.',
      '<strong>Ache</strong> = douleur sourde (headache, stomachache). <strong>Pain</strong> = douleur aiguë. <strong>Sore</strong> = endolori, irrité (sore throat, sore muscles).',
      'Registre médical : <em>symptoms, diagnosis, treatment, prognosis, chronic, acute, infectious, hereditary</em>.']))
]

C['VOCAB-B2-001'] = [
  s('table', '📘 Vocabulaire académique (Academic Word List)',
    _table(['Anglais','Français','Exemple académique'],
      [['analyse','analyser','Analyse the data carefully.'],
       ['approach','approche','A new approach is needed.'],
       ['assess','évaluer','Assess the impact of the policy.'],
       ['concept','concept','The concept of democracy varies.'],
       ['constitute','constituer','Education constitutes a key pillar.'],
       ['define','définir','Define your key terms first.'],
       ['evaluate','évaluer (avec jugement)','Evaluate the effectiveness of the method.'],
       ['identify','identifier','Identify the main issues.'],
       ['indicate','indiquer','The results indicate progress.'],
       ['interpret','interpréter','Interpret the findings correctly.'],
       ['significant','significatif','This is a significant development.'],
       ['structure','structurer','Structure your essay clearly.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['This essay will analyse the causes of youth unemployment in Côte d\'Ivoire.','Cet essai analysera les causes du chômage des jeunes en Côte d\'Ivoire.'],
      ['The study identifies three significant factors influencing performance.','L\'étude identifie trois facteurs significatifs influençant la performance.'],
      ['It is crucial to evaluate both benefits and drawbacks of technology.','Il est crucial d\'évaluer à la fois les avantages et inconvénients de la technologie.'],
      ['The data indicate a clear upward trend over the last decade.','Les données indiquent une tendance à la hausse claire sur la dernière décennie.'],
      ['This concept was derived from earlier theories of behaviourism.','Ce concept a été dérivé des théories antérieures du behaviorisme.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Le vocabulaire académique préfère les <strong>nominalisations</strong> : <em>analyse → analysis, develop → development, evaluate → evaluation</em>.',
      'Reporting verbs variés : <em>argue, claim, suggest, indicate, demonstrate, reveal, contend, state, emphasise, assert, posit</em>.',
      'Evitez le vocabulaire trop familier dans les écrits académiques : <em>big → substantial, lots of → numerous, show → demonstrate</em>.']))
]

C['VOCAB-B2-002'] = [
  s('table', '📘 Les médias et l\'information',
    _table(['Anglais','Français','Collocation'],
      [['newspaper','journal (papier)','read a newspaper'],
       ['broadcast','diffusion / diffuser','broadcast live'],
       ['headline','titre de presse','read the headlines'],
       ['article','article','publish an article'],
       ['journalist','journaliste','investigative journalist'],
       ['editor','rédacteur en chef','the editor approved the story'],
       ['fake news','fausse information','spread fake news'],
       ['censorship','censure','impose censorship'],
       ['press freedom','liberté de la presse','guarantee press freedom'],
       ['social media','réseaux sociaux','social media platform'],
       ['documentary','documentaire','a hard-hitting documentary'],
       ['circulation','tirage','a newspaper with high circulation']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['The journalist\'s investigation revealed widespread corruption.','L\'enquête du journaliste a révélé une corruption généralisée.'],
      ['Fake news spreads faster than verified information on social media.','Les fausses informations se répandent plus vite que les informations vérifiées sur les réseaux sociaux.'],
      ['Press freedom is a cornerstone of democracy.','La liberté de la presse est une pierre angulaire de la démocratie.'],
      ['The documentary on deforestation won an international award.','Le documentaire sur la déforestation a remporté un prix international.'],
      ['Always check multiple sources before sharing a news story.','Vérifiez toujours plusieurs sources avant de partager une information.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Collocations médias : <em>break a story, publish an article, broadcast live, go viral, fact-check, verify sources</em>.',
      '<strong>Bias</strong> (parti pris) = concept clé en analyse médiatique : <em>media bias, biased reporting, balanced coverage</em>.',
      '<strong>Tabloid</strong> (journal populaire/scandale) vs <strong>broadsheet</strong> (journal sérieux) — distinction culturelle anglophone importante.']))
]

C['VOCAB-B2-003'] = [
  s('table', '📘 La justice et les droits',
    _table(['Anglais','Français','Collocation'],
      [['human rights','droits de l\'homme','protect / violate human rights'],
       ['justice','justice','seek justice'],
       ['law','loi / droit','enforce the law'],
       ['crime','crime / délit','commit a crime'],
       ['criminal','criminel','a convicted criminal'],
       ['court','tribunal','appear in court'],
       ['judge','juge','an impartial judge'],
       ['lawyer / attorney','avocat(e)','hire a lawyer'],
       ['verdict','verdict','deliver a verdict'],
       ['sentence','peine','a five-year sentence'],
       ['trial','procès','a fair trial'],
       ['innocent / guilty','innocent / coupable','found not guilty'],
       ['constitution','constitution','the constitution guarantees…'],
       ['equality','égalité','gender equality']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Every citizen has the right to a fair trial.','Chaque citoyen a le droit à un procès équitable.'],
      ['The constitution of Côte d\'Ivoire guarantees freedom of expression.','La constitution de Côte d\'Ivoire garantit la liberté d\'expression.'],
      ['Human rights organisations monitor abuses around the world.','Les organisations de droits de l\'homme surveillent les abus dans le monde.'],
      ['The judge sentenced the accused to three years in prison.','Le juge a condamné l\'accusé à trois ans de prison.'],
      ['Gender equality remains a major challenge in many societies.','L\'égalité des sexes reste un défi majeur dans beaucoup de sociétés.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Collocations : <em>uphold / enforce the law, violate / respect human rights, file charges, deliver a verdict, appeal against a sentence</em>.',
      '<strong>Crime</strong> (indénombrable = la criminalité) vs <strong>a crime</strong> (un acte criminel précis) : <em>Crime is increasing ≠ a crime was committed</em>.']))
]

C['VOCAB-C1-001'] = [
  s('table', '📘 Expressions idiomatiques avancées',
    _table(['Idiome','Sens','Exemple'],
      [['go the extra mile','faire un effort supplémentaire','She always goes the extra mile.'],
       ['bite off more than you can chew','prendre plus que l\'on peut gérer','He bit off more than he could chew.'],
       ['beat around the bush','tourner autour du pot','Stop beating around the bush!'],
       ['read between the lines','lire entre les lignes','Read between the lines of his speech.'],
       ['take with a grain of salt','prendre avec des pincettes','Take those statistics with a grain of salt.'],
       ['the ball is in your court','c\'est à toi de jouer','I\'ve done my part — the ball is in your court.'],
       ['a double-edged sword','arme à double tranchant','Technology is a double-edged sword.'],
       ['cut corners','bâcler / tricher sur la qualité','Don\'t cut corners on safety.'],
       ['on the fence','indécis, hésitant','She\'s on the fence about the proposal.'],
       ['hit the ground running','démarrer sur les chapeaux de roue','The new manager hit the ground running.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Globalisation is a double-edged sword for developing nations.','La mondialisation est une arme à double tranchant pour les nations en développement.'],
      ['If you want to succeed, you must go the extra mile.','Si vous voulez réussir, vous devez faire un effort supplémentaire.'],
      ['He\'s been on the fence about studying abroad for months.','Il hésite depuis des mois à partir étudier à l\'étranger.'],
      ['Don\'t take everything the media says at face value — read between the lines.','Ne prenez pas tout ce que disent les médias pour argent comptant.'],
      ['She hit the ground running in her new role as director.','Elle a démarré sur les chapeaux de roue dans son nouveau rôle de directrice.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Les idiomes s\'apprennent en contexte — ne jamais traduire mot à mot, le sens est toujours figuré.',
      'Certains idiomes sont informels (<em>beat around the bush</em>) — à éviter dans des écrits très formels.',
      'Pour enrichir un essai C1 : utilisez 1-2 idiomes appropriés pour montrer votre maîtrise authentique.']))
]

C['VOCAB-C1-002'] = [
  s('table', '📘 Vocabulaire de la recherche et de l\'argumentation',
    _table(['Anglais','Français','Emploi'],
      [['hypothesis','hypothèse','formulate a hypothesis'],
       ['evidence','preuve / données','provide evidence'],
       ['argument','argument','construct an argument'],
       ['counterargument','contre-argument','address the counterargument'],
       ['thesis statement','thèse','state your thesis clearly'],
       ['claim','affirmation','support your claim with data'],
       ['methodology','méthodologie','describe the methodology'],
       ['findings','résultats','the findings suggest that…'],
       ['implication','implication','the implications of this study'],
       ['paradigm','paradigme','a paradigm shift'],
       ['critique','critique analytique','a constructive critique'],
       ['peer review','évaluation par les pairs','peer-reviewed journal']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['The findings suggest a strong correlation between education and income.','Les résultats suggèrent une forte corrélation entre éducation et revenus.'],
      ['While the hypothesis was initially rejected, further evidence supported it.','Bien que l\'hypothèse ait d\'abord été rejetée, de nouvelles preuves l\'ont soutenue.'],
      ['It is essential to address counterarguments in a well-structured essay.','Il est essentiel de traiter les contre-arguments dans un essai bien structuré.'],
      ['The implications of this policy for youth employment are significant.','Les implications de cette politique pour l\'emploi des jeunes sont significatives.'],
      ['Her methodology combined qualitative and quantitative research methods.','Sa méthodologie combinait des méthodes qualitatives et quantitatives.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Phrases de structure d\'essai : <em>This essay will argue that… / It can be concluded that… / The evidence suggests that… / Contrary to this view…</em>',
      'Reporting verbs de niveau C1 : <em>posit, contend, assert, maintain, acknowledge, refute, concede, emphasise, underscore, highlight</em>.']))
]

C['VOCAB-C2-001'] = [
  s('table', '📘 Nuances lexicales et synonymie avancée',
    _table(['Mot de base','Synonymes gradués (faible → fort)','Nuance'],
      [['happy','content → pleased → joyful → elated → ecstatic','intensité croissante'],
       ['sad','unhappy → sorrowful → miserable → devastated','registre + formel'],
       ['angry','annoyed → irritated → furious → enraged → livid','intensité croissante'],
       ['big','large → substantial → considerable → enormous → colossal','taille / importance'],
       ['say','mention → state → assert → proclaim → declare','niveau de certitude'],
       ['think','believe → consider → assume → presume → contend','nuance épistémique'],
       ['change','alter → modify → transform → revolutionise','ampleur du changement'],
       ['important','significant → crucial → vital → paramount → indispensable','degré d\'importance']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['She was not merely happy — she was absolutely elated.','Elle n\'était pas simplement heureuse — elle était absolument ravie.'],
      ['The scientist asserted, not merely suggested, that the theory was flawed.','Le scientifique a affirmé, pas simplement suggéré, que la théorie était erronée.'],
      ['What began as a modification became a full transformation of the system.','Ce qui a commencé comme une modification est devenu une transformation complète.'],
      ['This is not just important — it is paramount to our success.','Ce n\'est pas juste important — c\'est primordial pour notre succès.'],
      ['He was livid — not just angry, but absolutely incandescent with rage.','Il était hors de lui — pas juste en colère, mais absolument incandescent de rage.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'A niveau C2, chaque synonyme porte une nuance de degré, de registre ou de connotation — le choix des mots n\'est jamais anodin.',
      'Un bon thesaurus (Oxford Thesaurus) est indispensable pour enrichir votre expression.',
      'Collocations figées : <em>heavy rain ✓ / strong rain ✗</em> — vérifiez toujours les collocations dans un dictionnaire.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['She made a considerable discovery.','She made a significant discovery.','Considerable = taille/quantité. Significant = importance.'],
      ['It is very crucial.','It is crucial.','Crucial est déjà un superlatif — ne pas renforcer avec "very".'],
      ['He told a very big lie.','He told a colossal lie.','A niveau C2, remplacez "very + adj" par un synonyme fort.']]))
]

// ═══════════════════════════════════════════════════════════════════════════════
// BUSINESS MODULES
// ═══════════════════════════════════════════════════════════════════════════════

C['BUS-A2-001'] = [
  s('rule', '📌 Se présenter en contexte professionnel',
    _rule('My name is … | I work for / at … | I am responsible for … | Nice to meet you.',
      'En contexte professionnel, une présentation efficace inclut : votre nom, votre entreprise/organisation, votre poste/rôle, et éventuellement un fait mémorable sur votre activité. La poignée de main (handshake) est la norme dans les contextes professionnels anglophones. Restez concis et professionnel.')),
  s('table', '📘 Phrases types de présentation professionnelle',
    _table(['Situation','Formule','Exemple'],
      [['Nom et poste','My name is … and I am…','My name is Koné and I am a marketing manager.'],
       ['Entreprise','I work for / at …','I work for AGTM Digital Academy.'],
       ['Rôle','I am responsible for…','I am responsible for training programmes.'],
       ['Durée','I have been … for … years','I have been in this role for three years.'],
       ['Salutation formelle','Nice/Pleased to meet you.','Pleased to meet you, Mr Diallo.'],
       ['Salutation informelle','Good to meet you / Hey!','Good to meet you!'],
       ['Remise de carte','Here is my business card.','Please take my business card.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Good morning. My name is Amani Brou. I\'m the sales director at TechAfrica.','Bonjour. Je m\'appelle Amani Brou. Je suis directeur commercial chez TechAfrica.'],
      ['I work in the finance department and I handle international transactions.','Je travaille au département financier et je gère les transactions internationales.'],
      ['It\'s a pleasure to meet you. I\'ve heard great things about your company.','C\'est un plaisir de vous rencontrer. J\'ai entendu de très bonnes choses sur votre entreprise.'],
      ['Let me introduce myself — I\'m Fatou Koné, Head of HR at GlobalCorp.','Permettez-moi de me présenter — Je suis Fatou Koné, Directrice des RH chez GlobalCorp.'],
      ['Could you tell me more about your role here?','Pourriez-vous m\'en dire plus sur votre rôle ici ?']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Small talk professionnel en anglais : commencez par une remarque légère (<em>How was your journey? / Did you find the office easily?</em>) avant d\'aborder les affaires.',
      'Titres de politesse : <em>Mr</em> (homme), <em>Ms</em> (femme, neutre), <em>Mrs</em> (femme mariée), <em>Miss</em> (femme célibataire). En anglais professionnel moderne, <em>Ms</em> est préféré.',
      'En anglais, dire son prénom en premier est normal et professionnel — pas familier.']))
]

C['BUS-B1-001'] = [
  s('rule', '📌 La correspondance professionnelle – Emails formels',
    _rule('Dear [Name/Sir/Madam] → Body → Yours sincerely/faithfully → [Signature]',
      'Un email professionnel en anglais suit une structure précise. L\'objet (subject line) doit être clair et concis. La formule d\'ouverture dépend de si vous connaissez le destinataire. Le corps présente le contexte, la demande ou l\'information. La formule de clôture doit correspondre à l\'ouverture.')),
  s('table', '📘 Formules d\'ouverture et de clôture',
    _table(['Situation','Ouverture','Clôture'],
      [['Nom connu, formel','Dear Mr/Ms [Surname],','Yours sincerely,'],
       ['Nom inconnu','Dear Sir/Madam,','Yours faithfully,'],
       ['Prénom connu, semi-formel','Dear [First name],','Kind regards, / Best regards,'],
       ['Très formel / officiel','To Whom It May Concern,','Yours faithfully,'],
       ['Informel (collègue)','Hi [Name],','Best, / Cheers,']])),
  s('table', '📘 Phrases types par fonction',
    _table(['Fonction','Formule'],
      [['Objet de l\'email','I am writing to enquire about… / I am writing with regard to…'],
       ['Référence','Further to our conversation… / As discussed…'],
       ['Demande','Could you please… / I would be grateful if you could…'],
       ['Envoi de document','Please find attached… / I am attaching…'],
       ['Délai','I look forward to hearing from you by [date].'],
       ['Disponibilité','Please do not hesitate to contact me if…'],
       ['Clôture','Thank you for your time and consideration.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Dear Ms Ouattara, I am writing to enquire about the internship position advertised on your website.','Chère Mme Ouattara, Je vous écris pour me renseigner sur le poste de stage annoncé sur votre site.'],
      ['Please find attached my CV and cover letter for your consideration.','Veuillez trouver ci-joints mon CV et ma lettre de motivation pour examen.'],
      ['I would be grateful if you could confirm receipt of this email.','Je vous serais reconnaissant(e) de bien vouloir confirmer la réception de cet email.'],
      ['Should you require any further information, please do not hesitate to contact me.','Si vous avez besoin d\'informations supplémentaires, n\'hésitez pas à me contacter.'],
      ['I look forward to hearing from you at your earliest convenience.','Dans l\'attente de votre réponse dans les meilleurs délais.']])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['Dear Sir Koné,','Dear Mr Koné,','Dear Sir = nom inconnu. Avec nom de famille → Dear Mr/Ms.'],
      ['I am writing to asking about…','I am writing to ask about…','Après "to" (préposition de but) → infinitif BASE.'],
      ['Yours sincerely (après Dear Sir/Madam)','Yours faithfully (après Dear Sir/Madam)','Dear Sir/Madam → Yours faithfully. Nom connu → Yours sincerely.']]))
]

C['BUS-B1-002'] = [
  s('rule', '📌 Les Incoterms – Commerce International',
    _rule('Incoterm = International Commercial Terms (CCI) — defines risk/cost transfer between buyer and seller',
      'Les <strong>Incoterms</strong> sont des règles standardisées publiées par la Chambre de Commerce Internationale (CCI) qui définissent les responsabilités des acheteurs et vendeurs dans les transactions commerciales internationales. Ils précisent qui supporte les coûts de transport, d\'assurance et les risques de perte ou dommage.')),
  s('table', '📘 Incoterms principaux (version 2020)',
    _table(['Incoterm','Nom complet','Sens clé','Transport'],
      [['EXW','Ex Works','Vendeur = livraison usine seulement','Tous modes'],
       ['FOB','Free On Board','Risque passe à bord du navire','Maritime'],
       ['CIF','Cost Insurance Freight','Vendeur paie transport + assurance jusqu\'au port','Maritime'],
       ['CFR','Cost and Freight','Vendeur paie fret, acheteur = assurance','Maritime'],
       ['DAP','Delivered At Place','Vendeur livre au lieu convenu non dédouané','Tous modes'],
       ['DDP','Delivered Duty Paid','Vendeur supporte tout jusqu\'à destination','Tous modes'],
       ['FCA','Free Carrier','Risque passe au transporteur désigné','Tous modes']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['The goods are shipped FOB Abidjan port — risk transfers when loaded.','Les marchandises sont expédiées FOB port d\'Abidjan — le risque passe à l\'embarquement.'],
      ['Under CIF terms, the seller covers insurance and freight to destination.','Selon les termes CIF, le vendeur couvre l\'assurance et le fret jusqu\'à destination.'],
      ['EXW means the buyer is responsible for all transport from the factory.','EXW signifie que l\'acheteur est responsable de tout le transport depuis l\'usine.'],
      ['DDP gives the buyer maximum protection — all costs covered by the seller.','DDP offre à l\'acheteur une protection maximale — tous les coûts sont couverts par le vendeur.'],
      ['We agreed on DAP terms for the delivery to the client\'s warehouse.','Nous avons convenu de termes DAP pour la livraison à l\'entrepôt du client.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Les Incoterms sont inscrits dans les contrats de vente internationale. Les mentions "Incoterms 2020" et le lieu précis doivent toujours accompagner le sigle : <em>FOB Abidjan, Incoterms 2020</em>.',
      'EXW = minimum d\'obligations pour le vendeur. DDP = maximum d\'obligations pour le vendeur.',
      'Les Incoterms ne couvrent PAS le transfert de propriété ni les conditions de paiement — ce sont des aspects distincts du contrat.']))
]

C['BUS-B1-003'] = [
  s('rule', '📌 Les Présentations Orales en Anglais',
    _rule('Opening → Agenda → Content (3 points) → Summary → Q&A → Closing',
      'Une présentation professionnelle efficace suit une structure claire. Commencez par capter l\'attention, annoncez le plan, développez 2-3 points clés, résumez, et terminez avec un appel à l\'action. L\'anglais de présentation utilise des phrases formulaiques spécifiques pour chaque transition.')),
  s('table', '📘 Phrases types de présentation orale',
    _table(['Étape','Formule clé'],
      [['Ouverture','Good morning/afternoon everyone. My name is … and today I\'m going to talk about…'],
       ['Annonce du plan','I\'ve divided my presentation into three parts: first… then… and finally…'],
       ['Transition','Moving on to… / Let\'s now turn to… / That brings me to my next point…'],
       ['Graphique/slide','As you can see from this chart… / This slide shows…'],
       ['Vérification','Are there any questions so far? / Does that make sense?'],
       ['Résumé','To sum up… / In conclusion… / The key points were…'],
       ['Clôture','Thank you for your attention. I\'d be happy to answer any questions.'],
       ['Q&A','That\'s a great question. / Could you clarify what you mean by…?']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Good afternoon. Today I\'m going to present our Q3 sales results.','Bonjour. Aujourd\'hui je vais vous présenter nos résultats de ventes du T3.'],
      ['As you can see from this graph, our revenue increased by 15% this year.','Comme vous pouvez le voir sur ce graphique, notre chiffre d\'affaires a augmenté de 15% cette année.'],
      ['Moving on to our second point — the new market opportunities in West Africa.','Passons à notre deuxième point — les nouvelles opportunités de marché en Afrique de l\'Ouest.'],
      ['To summarise the key takeaways: growth, innovation, and partnership.','Pour résumer les points clés : croissance, innovation et partenariat.'],
      ['I\'d now like to invite your questions and comments.','Je voudrais maintenant vous inviter à poser vos questions et commentaires.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Règle du "Tell them three times" : <em>Tell them what you\'re going to say → Say it → Tell them what you said</em>.',
      'Débit : parlez lentement et articulez clairement. Les auditeurs anglophones non natifs apprécient particulièrement la clarté.',
      'Évitez les "ums" et "errs" — remplacez par une pause silencieuse ou <em>"Let me think about that for a moment."</em>']))
]

C['BUS-B1-004'] = [
  s('table', '📘 Vocabulaire financier et bancaire',
    _table(['Anglais','Français','Exemple'],
      [['invoice','facture','Send the invoice by email.'],
       ['receipt','reçu / quittance','Keep your receipt.'],
       ['budget','budget','Set a monthly budget.'],
       ['profit','bénéfice / profit','The company made a large profit.'],
       ['loss','perte','We recorded a net loss.'],
       ['revenue','chiffre d\'affaires / revenus','Revenue grew by 20%.'],
       ['expenses','dépenses','Cut operating expenses.'],
       ['loan','prêt','Apply for a bank loan.'],
       ['interest rate','taux d\'intérêt','The interest rate is 5%.'],
       ['exchange rate','taux de change','Check the exchange rate.'],
       ['dividend','dividende','Pay a dividend to shareholders.'],
       ['balance sheet','bilan comptable','Review the balance sheet.'],
       ['cash flow','flux de trésorerie','Improve cash flow management.'],
       ['investment','investissement','Make a long-term investment.'],
       ['VAT (Value Added Tax)','TVA','VAT is included in the price.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['The company\'s revenue increased by 25% in the last fiscal year.','Le chiffre d\'affaires de l\'entreprise a augmenté de 25% au cours du dernier exercice fiscal.'],
      ['Our operating expenses are too high — we need to cut costs.','Nos charges d\'exploitation sont trop élevées — nous devons réduire les coûts.'],
      ['The bank approved our loan application last week.','La banque a approuvé notre demande de prêt la semaine dernière.'],
      ['Please issue an invoice for the services rendered.','Veuillez émettre une facture pour les services rendus.'],
      ['Positive cash flow is essential for business sustainability.','Un flux de trésorerie positif est essentiel pour la pérennité de l\'entreprise.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      '<strong>Revenue</strong> (chiffre d\'affaires) ≠ <strong>profit</strong> (bénéfice net après dépenses). Distinction fondamentale en finance.',
      'Sigles financiers courants : <em>ROI</em> (Return on Investment), <em>P&L</em> (Profit and Loss), <em>EBITDA</em> (earnings before interest, taxes, depreciation, amortisation).',
      'En anglais britannique : <em>cheque</em>. En anglais américain : <em>check</em>. Les deux sont acceptés selon le contexte.']))
]

C['BUS-B1-005'] = [
  s('table', '📘 Vocabulaire des Ressources Humaines',
    _table(['Anglais','Français','Exemple'],
      [['recruitment','recrutement','The recruitment process takes 4 weeks.'],
       ['job description','fiche de poste','Read the job description carefully.'],
       ['CV / résumé','CV','Submit your CV online.'],
       ['cover letter','lettre de motivation','A cover letter is required.'],
       ['interview','entretien','She passed the job interview.'],
       ['onboarding','intégration (nouvel employé)','Onboarding takes one week.'],
       ['payroll','paie / gestion des salaires','HR manages the payroll.'],
       ['benefits','avantages sociaux','Benefits include health insurance.'],
       ['performance review','évaluation de performance','Annual performance review.'],
       ['dismissal / redundancy','licenciement / mise à pied','He faced unfair dismissal.'],
       ['maternity leave','congé maternité','She is on maternity leave.'],
       ['overtime','heures supplémentaires','He worked overtime last week.'],
       ['training','formation','Attend the training workshop.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['The HR department is responsible for recruitment and training.','Le département RH est responsable du recrutement et de la formation.'],
      ['After a successful interview, she received a job offer within a week.','Après un entretien réussi, elle a reçu une offre d\'emploi en une semaine.'],
      ['The company offers excellent benefits including health insurance and a pension.','L\'entreprise offre d\'excellents avantages sociaux incluant l\'assurance maladie et une retraite.'],
      ['Employees are required to attend a performance review every six months.','Les employés doivent participer à une évaluation de performance tous les six mois.'],
      ['She took three months of maternity leave after the birth of her daughter.','Elle a pris trois mois de congé maternité après la naissance de sa fille.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      '<strong>Redundancy</strong> = licenciement économique (poste supprimé). <strong>Dismissal</strong> = licenciement pour faute. <strong>Resignation</strong> = démission volontaire.',
      'STAR Method pour les entretiens : <strong>S</strong>ituation, <strong>T</strong>ask, <strong>A</strong>ction, <strong>R</strong>esult — structurez vos réponses comportementales ainsi.',
      'Questions d\'entretien classiques : <em>Tell me about yourself. / What are your strengths and weaknesses? / Why do you want this job? / Where do you see yourself in 5 years?</em>']))
]

C['BUS-B2-001'] = [
  s('rule', '📌 Les Réunions professionnelles en anglais',
    _rule('Chair → Agenda → Discussion → Decision → Action points → AOB → Close',
      'La conduite d\'une réunion en anglais suit un protocole précis. Le <strong>chair</strong> (président de séance) ouvre, présente l\'<strong>agenda</strong>, donne la parole, gère les désaccords, prend les décisions, et résume les <strong>action points</strong> (points d\'action). Les minutes (compte-rendu) sont rédigées et diffusées après la réunion.')),
  s('table', '📘 Phrases types de réunion',
    _table(['Rôle','Formule'],
      [['Ouvrir','Let\'s get started. / Shall we begin? / Welcome everyone.'],
       ['Ordre du jour','The agenda for today\'s meeting is… / We have three items to discuss.'],
       ['Donner la parole','I\'d like to hear from… / [Name], would you like to comment?'],
       ['Interrompre poliment','Sorry to interrupt, but… / Could I just add something here?'],
       ['Exprimer accord','I agree with that point. / Absolutely. / That\'s a good idea.'],
       ['Exprimer désaccord','I\'m not sure about that. / I see it differently. / With respect, I disagree.'],
       ['Prendre une décision','Let\'s go with… / I think we should… / Are we all agreed on…?'],
       ['Points d\'action','So the action point for [Name] is to… by [date].'],
       ['Clôture','That\'s everything on the agenda. / Meeting adjourned. Thank you all.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Let\'s get started — we have three items on today\'s agenda.','Commençons — nous avons trois points à l\'ordre du jour aujourd\'hui.'],
      ['I\'d like to hear your thoughts on the new marketing strategy.','J\'aimerais avoir vos avis sur la nouvelle stratégie marketing.'],
      ['With respect, I think we need more data before making that decision.','Avec respect, je pense que nous avons besoin de plus de données avant de prendre cette décision.'],
      ['So the action point is: Kofi will prepare the report by next Friday.','Donc le point d\'action est : Kofi préparera le rapport d\'ici vendredi prochain.'],
      ['That\'s everything on the agenda. Thank you all for your time.','C\'est tout ce qui était à l\'ordre du jour. Merci à tous pour votre temps.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'AOB = Any Other Business (divers) — dernier point de l\'agenda où l\'on peut soulever des sujets non prévus.',
      'Minutes = compte-rendu officiel de la réunion. Toujours diffuser les minutes dans les 24-48h après la réunion.',
      'Culture anglophone : les réunions doivent commencer et finir à l\'heure. La ponctualité est une marque de professionnalisme.']))
]

C['BUS-B2-002'] = [
  s('rule', '📌 L\'Anglais du Téléphone et de la Vidéoconférence',
    _rule('Identify yourself → State purpose → Handle the call → Confirm/summarise → Close',
      'La communication téléphonique et par vidéoconférence en anglais utilise des formules spécifiques. Il est essentiel de s\'identifier clairement, d\'énoncer le but de l\'appel, de gérer les problèmes techniques et les malentendus avec professionnalisme, et de confirmer les informations importantes.')),
  s('table', '📘 Phrases types téléphone et vidéoconférence',
    _table(['Situation','Formule'],
      [['Décrocher','[Company name], [Your name] speaking. How can I help?'],
       ['S\'identifier (appelant)','This is [Name] calling from [Company]. / My name is… and I\'m calling about…'],
       ['Demander quelqu\'un','Could I speak to Mr/Ms [Name], please?'],
       ['Mettre en attente','Could you hold the line, please? / One moment, please.'],
       ['Prendre un message','I\'m afraid he\'s not available. Can I take a message?'],
       ['Demander de répéter','I\'m sorry, could you repeat that? / I didn\'t quite catch that.'],
       ['Connexion vidéo','Can everyone hear me? / You\'re on mute. / I think you\'re breaking up.'],
       ['Confirmer','So to confirm, we agreed on… / Just to summarise our discussion…'],
       ['Clôture','Thank you for calling. / I\'ll follow up by email. / Goodbye.']
       ])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Good morning, AGTM Academy, Koné speaking. How can I help you?','Bonjour, AGTM Academy, Koné à l\'appareil. En quoi puis-je vous aider ?'],
      ['This is Fatou Traoré calling from GlobalCorp regarding your recent proposal.','Ici Fatou Traoré de chez GlobalCorp, concernant votre récente proposition.'],
      ['I\'m sorry, you\'re breaking up — could you repeat that last point?','Désolé(e), vous êtes en train de vous couper — pourriez-vous répéter ce dernier point ?'],
      ['I\'m afraid Ms Bamba is in a meeting. Can I take a message?','Je crains que Mme Bamba soit en réunion. Puis-je prendre un message ?'],
      ['I\'ll send you a follow-up email with the key action points from our call.','Je vous enverrai un email de suivi avec les points d\'action clés de notre appel.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Au téléphone, parlez plus <strong>lentement</strong> et articulez davantage qu\'en face à face — les nuances visuelles sont absentes.',
      'Pour épeler : utilisez l\'alphabet phonétique NATO si nécessaire : <em>A for Alpha, B for Bravo, C for Charlie…</em>',
      'Vidéoconférence : vérifiez toujours votre micro et caméra AVANT la réunion. Coupez votre micro quand vous ne parlez pas.']))
]

C['BUS-B2-003'] = [
  s('rule', '📌 La Négociation Commerciale en Anglais',
    _rule('Prepare position → Open → Explore → Bargain → Close → Confirm',
      'Une négociation commerciale efficace en anglais suit des étapes claires. Chaque étape utilise un vocabulaire spécifique pour faire des offres, des contre-offres, exprimer des conditions, et parvenir à un accord mutuellement bénéfique. La maîtrise du langage de la négociation est une compétence business essentielle.')),
  s('table', '📘 Phrases types de négociation',
    _table(['Étape','Formule'],
      [['Ouvrir la négociation','We\'d like to propose… / Our initial offer is…'],
       ['Faire une concession','We\'re prepared to… / We could consider… if you…'],
       ['Condition','Provided that… / On the condition that… / Subject to…'],
       ['Contre-offre','That\'s slightly above our budget. Could you consider…?'],
       ['Impasse','We seem to be at an impasse. / Perhaps we can revisit this point.'],
       ['Accord','I think we have a deal. / We\'re agreed on the following terms:'],
       ['Reporter','Could we come back to this point? / Let\'s table that for now.'],
       ['Confirmer','Let me summarise what we\'ve agreed: … / We\'ll put this in writing.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Our initial offer is $50,000, subject to a 30-day payment term.','Notre offre initiale est de 50 000$, sous réserve d\'un délai de paiement de 30 jours.'],
      ['We\'d be willing to lower the price provided the order exceeds 1,000 units.','Nous serions prêts à baisser le prix à condition que la commande dépasse 1 000 unités.'],
      ['That\'s slightly above our budget. Could you consider a 10% discount?','C\'est légèrement au-dessus de notre budget. Pourriez-vous envisager une remise de 10% ?'],
      ['I think we have a deal — let\'s put the final terms in writing.','Je pense que nous avons un accord — mettons les termes finaux par écrit.'],
      ['Let me summarise: you deliver by the 15th and we pay within 45 days.','Résumons : vous livrez avant le 15 et nous payons dans un délai de 45 jours.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'BATNA = <strong>Best Alternative To a Negotiated Agreement</strong> — connaître votre BATNA vous donne de la force en négociation.',
      'Win-win approach : visez un accord mutuellement bénéfique plutôt qu\'une victoire unilatérale. Cela préserve les relations à long terme.',
      'Silence est une tactique de négociation puissante — ne remplissez pas le silence par des concessions inutiles.']))
]

C['BUS-B2-004'] = [
  s('table', '📘 Vocabulaire IT et Tech (contexte business)',
    _table(['Anglais','Français','Contexte d\'usage'],
      [['software','logiciel','enterprise software'],
       ['hardware','matériel informatique','hardware upgrade'],
       ['network','réseau','corporate network'],
       ['server','serveur','cloud server / dedicated server'],
       ['firewall','pare-feu','security firewall'],
       ['bandwidth','bande passante','increase bandwidth'],
       ['interface','interface','user-friendly interface'],
       ['integration','intégration','system integration'],
       ['upgrade','mise à niveau','software upgrade'],
       ['bug / glitch','bug / anomalie','fix a bug / software glitch'],
       ['patch','correctif','install a security patch'],
       ['deployment','déploiement','application deployment'],
       ['API','interface de programmation','connect via API'],
       ['dashboard','tableau de bord','monitor via the dashboard'],
       ['SaaS','logiciel en tant que service','SaaS platform']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['We need to upgrade our software to the latest version for better security.','Nous devons mettre à jour notre logiciel vers la dernière version pour une meilleure sécurité.'],
      ['The IT team is working on integrating the new CRM with our existing systems.','L\'équipe IT travaille sur l\'intégration du nouveau CRM avec nos systèmes existants.'],
      ['Please install the latest security patch on all company computers.','Veuillez installer le dernier correctif de sécurité sur tous les ordinateurs de l\'entreprise.'],
      ['Our SaaS solution allows remote access to all business tools.','Notre solution SaaS permet l\'accès à distance à tous les outils business.'],
      ['There was a glitch in the system — the IT helpdesk is investigating.','Il y avait un bug dans le système — le support informatique enquête.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Acronymes IT essentiels : <em>CRM</em> (Customer Relationship Management), <em>ERP</em> (Enterprise Resource Planning), <em>IT</em> (Information Technology), <em>UX</em> (User Experience).',
      'Verbes IT courants : <em>install, update, upgrade, configure, deploy, debug, troubleshoot, back up, encrypt, authenticate</em>.',
      'En contexte professionnel anglophone, les termes IT sont souvent utilisés tels quels sans traduction, même dans des conversations en d\'autres langues.']))
]

C['BUS-C1-001'] = [
  s('rule', '📌 Leadership et Communication Interculturelle',
    _rule('Adapt communication style to cultural context | High-context vs Low-context cultures',
      'La <strong>communication interculturelle</strong> reconnaît que les styles de communication varient selon les cultures. Les cultures <strong>à contexte faible</strong> (Low-context : USA, UK, Allemagne) privilégient la communication directe et explicite. Les cultures <strong>à contexte élevé</strong> (High-context : Japon, cultures africaines, Middle East) s\'appuient davantage sur le contexte, les relations et le non-dit.')),
  s('table', '📘 Styles de leadership en anglais professionnel',
    _table(['Style','Caractéristiques','Formules types'],
      [['Assertive','Direct, clair, confiant','I believe we should… / My recommendation is…'],
       ['Collaborative','Inclusif, valorise les contributions','What does the team think? / Let\'s hear all perspectives.'],
       ['Diplomatic','Tact, nuance, préserve les relations','With respect… / I see your point, however…'],
       ['Empowering','Délègue, encourage l\'autonomie','I trust you to handle this. / You have full authority on…'],
       ['Visionary','Inspire, oriente vers l\'avenir','Our vision is to… / Imagine a future where…']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['In low-context cultures, it\'s important to be explicit and direct in communication.','Dans les cultures à contexte faible, il est important d\'être explicite et direct dans la communication.'],
      ['A good leader adapts their communication style to their audience.','Un bon leader adapte son style de communication à son auditoire.'],
      ['When working with international teams, cultural sensitivity is a key competency.','Lorsqu\'on travaille avec des équipes internationales, la sensibilité culturelle est une compétence clé.'],
      ['I respect your perspective, and I\'d like to offer an alternative viewpoint.','Je respecte votre point de vue, et j\'aimerais offrir une perspective alternative.'],
      ['Our vision for the next five years is to become the leading EdTech platform in West Africa.','Notre vision pour les cinq prochaines années est de devenir la principale plateforme EdTech en Afrique de l\'Ouest.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      '<strong>Hofstede\'s cultural dimensions</strong> : Power Distance, Individualism/Collectivism, Uncertainty Avoidance — notions clés pour comprendre les différences culturelles en business.',
      'En contexte multiculturel : évitez les idiomes trop locaux, parlez lentement et clairement, reformulez pour confirmer la compréhension.',
      'Feedback constructif en anglais : <em>What you did well is… / One area for development is… / My suggestion would be to…</em>']))
]

// ═══════════════════════════════════════════════════════════════════════════════
// READING MODULES
// ═══════════════════════════════════════════════════════════════════════════════

C['READ-A1-001'] = [
  s('rule', '📌 Lire un texte court – Panneaux et Messages',
    _rule('Skim for overall meaning → Scan for specific information → Infer unknown words from context',
      'La lecture de textes courts (panneaux, affiches, SMS, notes) requiert deux stratégies : le <strong>skimming</strong> (lecture rapide pour saisir le sens général) et le <strong>scanning</strong> (lecture ciblée pour trouver une information précise). A niveau A1, l\'objectif est de comprendre l\'essentiel d\'un message simple.')),
  s('table', '📘 Types de textes courts et leur but',
    _table(['Type de texte','But','Mots-clés typiques'],
      [['Panneau (sign)','Donner une instruction / avertissement','No smoking / Exit / Danger / Open / Closed'],
       ['Affiche (notice)','Informer, annoncer','Opening hours / For sale / Lost: / Wanted:'],
       ['SMS / message court','Communication informelle','See you at… / Don\'t forget… / Call me'],
       ['Etiquette (label)','Instruction d\'usage','Use by / Keep cool / Wash at 30°C'],
       ['Formulaire (form)','Collecter des informations','Name / Date of birth / Address / Signature']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['NO ENTRY – Authorised Personnel Only.','ENTRÉE INTERDITE – Personnel autorisé uniquement.'],
      ['Opening hours: Mon-Fri 8am-6pm. Closed on public holidays.','Heures d\'ouverture : Lun-Ven 8h-18h. Fermé les jours fériés.'],
      ['LOST: Black wallet near the market on Saturday. Please call 07…','PERDU : Portefeuille noir près du marché samedi. Appelez le 07…'],
      ['Hi! Can\'t make it today. See you tomorrow at school?','Salut ! Je ne peux pas venir aujourd\'hui. On se voit demain à l\'école ?'],
      ['Best before: 30 April 2025. Store in a cool, dry place.','A consommer avant le 30 avril 2025. Conserver dans un endroit frais et sec.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Skimming = lecture en diagonale pour le sens général (5-10 secondes). Scanning = lecture ciblée pour un mot, une date, un chiffre précis.',
      'Les mots inconnus : regardez le contexte (images, autres mots autour) pour deviner le sens avant de chercher dans le dictionnaire.',
      'Panneaux courants : <em>PUSH / PULL</em> (pousser/tirer), <em>IN / OUT</em> (entrée/sortie), <em>SALE</em> (soldes), <em>STAFF ONLY</em> (personnel uniquement).']))
]

C['READ-A2-001'] = [
  s('rule', '📌 Lire un Email ou une Annonce',
    _rule('Identify: sender → purpose → key information → required action',
      'Un email ou une annonce contient toujours un expéditeur, un objet, un corps avec les informations clés, et souvent un appel à l\'action. Pour lire efficacement, identifiez d\'abord l\'objet de la communication, puis scannez les informations clés (dates, lieux, noms, prix), puis lisez attentivement pour comprendre ce que vous devez faire ou retenir.')),
  s('table', '📘 Structure d\'un email / annonce',
    _table(['Partie','Contenu typique','Questions à se poser'],
      [['Objet / Titre','Sujet de la communication','De quoi s\'agit-il en général ?'],
       ['Expéditeur / Source','Qui écrit et pourquoi ?','Qui est l\'auteur ? Quelle relation ?'],
       ['Introduction','Contexte / rappel de la situation','Quel est le contexte ?'],
       ['Corps','Informations clés, détails','Quelles sont les informations importantes ?'],
       ['Appel à l\'action','Ce que le lecteur doit faire','Qu\'est-ce qu\'on me demande de faire ?'],
       ['Formule de clôture','Politesse / signature','Qui a signé ? Y a-t-il une deadline ?']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Subject: AGTM English Course — Registration Open!','Objet : Cours d\'anglais AGTM — Inscriptions ouvertes !'],
      ['We are pleased to announce that our new English modules are now available online.','Nous sommes ravis d\'annoncer que nos nouveaux modules d\'anglais sont désormais disponibles en ligne.'],
      ['To register, please click the link below before 30 April 2025.','Pour vous inscrire, veuillez cliquer sur le lien ci-dessous avant le 30 avril 2025.'],
      ['JOB VACANCY: English Teacher needed. Experience required. Apply by 15 May.','POSTE VACANT : Professeur d\'anglais recherché. Expérience requise. Postuler avant le 15 mai.'],
      ['For more information, contact us at info@agtm.academy.','Pour plus d\'informations, contactez-nous à info@agtm.academy.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Lisez d\'abord l\'objet et le dernier paragraphe — ils contiennent souvent l\'essentiel du message.',
      'Les mots en MAJUSCULES, en gras ou soulignés attirent l\'attention sur les informations importantes.',
      'Repérez les dates, heures, lieux et noms propres en premier — ce sont souvent les questions d\'examen.']))
]

C['READ-B1-001'] = [
  s('rule', '📌 Comprendre un Article de Presse',
    _rule('Headline → Lead paragraph (5Ws) → Body → Conclusion/opinion',
      'Un article de presse suit la structure de la <strong>pyramide inversée</strong> : les informations les plus importantes sont en tête. Le <strong>lead</strong> (premier paragraphe) répond aux <strong>5W + H</strong> : Who, What, When, Where, Why + How. Les paragraphes suivants approfondissent et contextualisent.')),
  s('table', '📘 Structure d\'un article de presse',
    _table(['Partie','Fonction','Ce qu\'il faut chercher'],
      [['Headline','Résume / accroche','Sujet principal, ton général'],
       ['Byline / Dateline','Auteur, lieu, date','Crédibilité, contexte géographique/temporel'],
       ['Lead (§1)','Qui? Quoi? Quand? Où? Pourquoi?','Les 5W + H — les faits essentiels'],
       ['Body','Développement, détails, citations','Faits secondaires, contexte, points de vue'],
       ['Quotes','Témoignages directs','Sources, perspectives, crédibilité'],
       ['Conclusion','Perspectives, implications','Conséquences, appel à l\'action']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Headline: AGTM Academy Launches New AI-Powered English Platform.','Titre : AGTM Academy lance une nouvelle plateforme d\'anglais propulsée par l\'IA.'],
      ['Lead: AGTM Digital Academy yesterday unveiled its new online English learning platform, offering over 100 modules to students across Côte d\'Ivoire.','Lead : AGTM Digital Academy a dévoilé hier sa nouvelle plateforme d\'apprentissage de l\'anglais en ligne, offrant plus de 100 modules aux étudiants de toute la Côte d\'Ivoire.'],
      ['"This platform will transform how young Ivorians learn English," said the director.','« Cette plateforme va transformer la façon dont les jeunes Ivoiriens apprennent l\'anglais », a déclaré le directeur.'],
      ['The launch comes amid growing demand for English skills in the job market.','Le lancement intervient dans un contexte de demande croissante de compétences en anglais sur le marché du travail.'],
      ['Students can now access lessons anytime, anywhere via their smartphones.','Les étudiants peuvent désormais accéder aux cours à tout moment et en tout lieu via leurs smartphones.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      '<strong>5W+H</strong> = Who, What, When, Where, Why, How — les six questions fondamentales de toute information journalistique.',
      'Distinguez <strong>faits</strong> (vérifiables objectivement) et <strong>opinions</strong> (points de vue subjectifs) dans un article.',
      'Vocabulaire de la presse : <em>according to, sources say, it is reported that, officials confirmed, witnesses stated</em> — signalent des informations de seconde main.']))
]

C['READ-B1-002'] = [
  s('rule', '📌 Lire un Récit ou une Nouvelle',
    _rule('Characters → Setting → Plot (exposition/conflict/climax/resolution) → Theme → Author\'s style',
      'La lecture d\'un texte narratif (nouvelle, conte, roman) requiert d\'identifier les éléments constitutifs du récit : les <strong>personnages</strong>, le <strong>cadre</strong> (temps et lieu), l\'<strong>intrigue</strong> (conflit, climax, résolution), et les <strong>thèmes</strong>. Le point de vue narratif (1ère, 2e, 3e personne) influence la façon dont l\'histoire est racontée.')),
  s('table', '📘 Eléments narratifs à identifier',
    _table(['Élément','Definition','Questions clés'],
      [['Characters','Protagoniste, antagoniste, secondaires','Who are they? How do they change?'],
       ['Setting','Lieu et époque du récit','Where and when does the story take place?'],
       ['Plot','Structure de l\'intrigue','What happens? What is the conflict?'],
       ['Theme','Idée centrale, message moral','What is the author trying to convey?'],
       ['Narrator / POV','Qui raconte l\'histoire','1st person (I), 3rd limited/omniscient?'],
       ['Tone / Mood','Atmosphère et sentiment','Is it sad, hopeful, ironic, dramatic?']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['The story is set in a small village in the 1960s during the colonial era.','L\'histoire se déroule dans un petit village dans les années 1960 à l\'époque coloniale.'],
      ['The protagonist faces an internal conflict between tradition and modernity.','Le protagoniste est confronté à un conflit interne entre la tradition et la modernité.'],
      ['The climax occurs when she finally decides to leave and pursue her education.','Le climax survient quand elle décide finalement de partir et de poursuivre ses études.'],
      ['The theme of the story is the power of education to transform lives.','Le thème de l\'histoire est le pouvoir de l\'éducation pour transformer les vies.'],
      ['The author uses simple language but powerful imagery to convey his message.','L\'auteur utilise un langage simple mais des images puissantes pour transmettre son message.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Vocabulaire d\'analyse littéraire : <em>foreshadowing</em> (présage), <em>flashback</em>, <em>metaphor</em>, <em>simile</em>, <em>irony</em>, <em>symbolism</em>.',
      'Quand vous lisez un récit, notez les émotions des personnages — elles révèlent leurs motivations et l\'évolution de l\'intrigue.',
      'Textes africains en anglais : <em>Chinua Achebe (Things Fall Apart), Ngugi wa Thiong\'o, Chimamanda Ngozi Adichie</em> — lectures recommandées.']))
]

C['READ-B2-001'] = [
  s('rule', '📌 Analyse d\'un Texte Argumentatif',
    _rule('Thesis → Arguments + Evidence → Counterarguments → Conclusion → Identify stance and bias',
      'Un texte argumentatif cherche à convaincre le lecteur d\'adopter un point de vue. Pour l\'analyser efficacement, identifiez : la <strong>thèse</strong> (position principale), les <strong>arguments</strong> et leur support (exemples, statistiques, citations), les <strong>contre-arguments</strong> éventuels, et la <strong>conclusion</strong>. Évaluez aussi la crédibilité des sources et les éventuels biais.')),
  s('table', '📘 Grille d\'analyse d\'un texte argumentatif',
    _table(['Aspect','Ce qu\'il faut identifier','Exemple de formulation'],
      [['Thèse','Position principale de l\'auteur','The author argues/claims/contends that…'],
       ['Arguments','Raisons soutenant la thèse','The first argument is… Evidence includes…'],
       ['Type de preuve','Statistiques, exemples, anecdotes, autorité','The author supports this with data showing…'],
       ['Connecteurs logiques','Structure du raisonnement','Furthermore… However… As a result…'],
       ['Contre-arguments','Points opposés évoqués','The author acknowledges that… but counters…'],
       ['Biais','Perspective unilatérale ou langage partial','The text shows bias through the use of…'],
       ['Conclusion','Synthèse et appel à l\'action','In conclusion, the author calls for…']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['The author strongly argues that bilingual education produces better academic outcomes.','L\'auteur argue vigoureusement que l\'enseignement bilingue produit de meilleurs résultats académiques.'],
      ['This claim is supported by research from 15 African countries conducted over 10 years.','Cette affirmation est soutenue par des recherches menées dans 15 pays africains sur 10 ans.'],
      ['While the author acknowledges the cost of bilingual programmes, he dismisses this concern too quickly.','Bien que l\'auteur reconnaisse le coût des programmes bilingues, il écarte trop rapidement cette préoccupation.'],
      ['The text shows a clear bias in favour of Western educational models.','Le texte montre un parti pris clair en faveur des modèles éducatifs occidentaux.'],
      ['The conclusion is a strong call to action: invest in language education now.','La conclusion est un appel fort à l\'action : investir maintenant dans l\'enseignement des langues.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'PEEL method : <strong>P</strong>oint → <strong>E</strong>vidence → <strong>E</strong>xplain → <strong>L</strong>ink — pour analyser chaque argument.',
      'Distinguez le <strong>fait</strong> (objectif, vérifiable) de l\'<strong>opinion</strong> (subjective) et du <strong>jugement de valeur</strong> (moral).',
      'Repérez le vocabulaire évaluatif (chargé émotionnellement) — il révèle souvent le biais de l\'auteur : <em>alarming, vital, outrageous, remarkable, shameful</em>.']))
]

C['READ-C1-001'] = [
  s('rule', '📌 Lecture Critique de Textes Académiques',
    _rule('Understand → Analyse → Evaluate → Synthesise → Apply',
      'La lecture critique va au-delà de la compréhension — elle implique d\'évaluer la qualité et la validité d\'un argument, d\'identifier les présuppositions et les limites méthodologiques, de comparer avec d\'autres sources, et d\'intégrer les idées dans sa propre réflexion. C\'est la compétence centrale de la pensée académique.')),
  s('table', '📘 Niveaux de lecture critique',
    _table(['Niveau','Compétence','Question type'],
      [['Compréhension','Saisir le sens littéral','What does the text say?'],
       ['Inférence','Déduire ce qui est implicite','What does the author imply?'],
       ['Analyse','Déconstruire les arguments','How is the argument structured?'],
       ['Evaluation','Juger la validité et la crédibilité','Is the evidence sufficient? Are sources reliable?'],
       ['Synthèse','Connecter avec d\'autres sources','How does this compare with other research?'],
       ['Application','Utiliser les idées dans un nouveau contexte','How can this inform my own argument?']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['The author\'s methodology is sound, but the sample size limits generalisation.','La méthodologie de l\'auteur est solide, mais la taille de l\'échantillon limite la généralisation.'],
      ['While this argument is compelling, it overlooks the socioeconomic dimension.','Bien que cet argument soit convaincant, il ignore la dimension socioéconomique.'],
      ['This study corroborates the findings of Smith (2019) and contradicts those of Brown (2021).','Cette étude corrobore les résultats de Smith (2019) et contredit ceux de Brown (2021).'],
      ['The author\'s use of the word "inevitable" reveals an underlying deterministic assumption.','L\'utilisation du mot "inévitable" par l\'auteur révèle une hypothèse déterministe sous-jacente.'],
      ['Applying these findings to the West African context requires accounting for local variables.','Appliquer ces résultats au contexte ouest-africain nécessite de prendre en compte les variables locales.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Lecture active : annotez le texte, posez des questions en marge, soulignez les affirmations clés et les transitions.',
      'Questions critiques : <em>Who wrote this and why? What assumptions does it make? What is left unsaid? What evidence is used?</em>',
      'Vocabulaire de l\'évaluation critique : <em>credible, valid, reliable, rigorous, flawed, biased, overstated, nuanced, well-substantiated, inconclusive</em>.']))
]

// ═══════════════════════════════════════════════════════════════════════════════
// WRITING MODULES
// ═══════════════════════════════════════════════════════════════════════════════

C['WRITE-A1-001'] = [
  s('rule', '📌 Écrire des Phrases Simples',
    _rule('Subject + Verb + (Object/Complement) + (Adverb)',
      'Une phrase simple en anglais doit contenir au minimum un <strong>sujet</strong> et un <strong>verbe</strong>. La structure de base est SVO (Sujet + Verbe + Objet). On peut l\'enrichir avec un complément de lieu, de temps ou de manière. La majuscule en début de phrase et le point à la fin sont TOUJOURS obligatoires.')),
  s('table', '📘 Structure des phrases simples',
    _table(['Type','Structure','Exemple'],
      [['Affirmative','S + V + O','She reads a book.'],
       ['Négative','S + don\'t/doesn\'t + V + O','She doesn\'t read comics.'],
       ['Interrogative','Do/Does + S + V + O?','Does she read every day?'],
       ['Avec lieu','S + V + O + at/in/on + place','She reads at school.'],
       ['Avec temps','S + V + O + time expression','She reads every evening.'],
       ['Avec manière','S + V + O + adverb','She reads carefully.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['My name is Kouassi. I am 16 years old. I live in Abidjan.','Je m\'appelle Kouassi. J\'ai 16 ans. J\'habite à Abidjan.'],
      ['I have a sister and two brothers. My sister is a nurse.','J\'ai une soeur et deux frères. Ma soeur est infirmière.'],
      ['I go to school by bus. School starts at 7:30 a.m.','Je vais à l\'école en bus. L\'école commence à 7h30.'],
      ['On weekends, I play football with my friends.','Le week-end, je joue au football avec mes amis.'],
      ['I want to be an engineer one day.','Je veux être ingénieur un jour.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Chaque phrase commence par une MAJUSCULE et se termine par un POINT (. ? !).',
      'Connecteurs simples : <em>and</em> (et), <em>but</em> (mais), <em>because</em> (parce que), <em>so</em> (donc), <em>or</em> (ou).',
      'Pour écrire une présentation personnelle : nom → âge → lieu → famille → goûts → projets.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['i am student.','I am a student.','Majuscule pour "I" et article "a" devant le métier.'],
      ['She have a car.','She has a car.','She/He/It → has (pas have).'],
      ['I live in the Abidjan.','I live in Abidjan.','Noms de villes → pas d\'article the.']]))
]

C['WRITE-A2-001'] = [
  s('rule', '📌 Écrire un Message ou un Email Court',
    _rule('Opening greeting → Purpose → Key information → Closing',
      'Un message court ou un email informel comporte une salutation, l\'objet du message, les informations essentielles, et une formule de clôture. Le style peut être semi-formel ou informel selon la relation avec le destinataire. Les contractions sont acceptées dans les messages informels.')),
  s('table', '📘 Structure d\'un email / message informel',
    _table(['Partie','Formule','Exemple'],
      [['Salutation','Hi [name], / Dear [name],','Hi Amina, / Dear Mrs Bako,'],
       ['Objet','I\'m writing to… / Just a quick note to…','I\'m writing to tell you about the party.'],
       ['Corps','Key information in 2-3 sentences','The party is on Saturday at 6 p.m. at my house.'],
       ['Invitation/Demande','Can you…? / Please…','Can you come? Please bring something to eat.'],
       ['Clôture','See you soon / Best wishes / Regards,','See you there! / Best, Kofi']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Hi Mariam! I\'m having a birthday party this Saturday at 5 p.m. Can you come?','Salut Mariam ! Je fais une fête d\'anniversaire samedi à 17h. Tu peux venir ?'],
      ['Dear Mrs Ouattara, I am writing to tell you that I cannot come to class tomorrow.','Chère Mme Ouattara, Je vous écris pour vous informer que je ne pourrai pas venir en classe demain.'],
      ['Could you please send me the homework we have for Monday?','Pourriez-vous s\'il vous plaît m\'envoyer les devoirs que nous avons pour lundi ?'],
      ['The meeting has been moved to Thursday at 10 a.m. Please let me know if that works for you.','La réunion a été déplacée à jeudi à 10h. Faites-moi savoir si cela vous convient.'],
      ['See you tomorrow! Best, Awa.','A demain ! Cordialement, Awa.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Informel → contractions OK (I\'m, can\'t, don\'t). Semi-formel → contractions à limiter. Formel → pas de contractions.',
      'Paragraphe unique pour les messages très courts. Maximum 3-4 paragraphes pour un email plus long.',
      'Relisez toujours avant d\'envoyer : vérifiez la grammaire, l\'orthographe, le ton, et que le destinataire est correct.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['Dear Amina,\nI want tell you...','Dear Amina,\nI want to tell you...','Want + to + infinitif.'],
      ['Looking forward to see you.','Looking forward to seeing you.','"Looking forward to" → gérondif.'],
      ['Yours sincerely (email informel)','Best wishes / Best regards / See you soon','Yours sincerely = trop formel pour un ami.']]))
]

C['WRITE-B1-001'] = [
  s('rule', '📌 Rédiger un Email Formel',
    _rule('Subject line → Opening → Purpose → Details → Action required → Closing → Signature',
      'Un email formel respecte un protocole précis. L\'objet doit être concis et informatif. Le style est poli, direct et impersonnel. On évite les contractions, le vocabulaire familier et les phrasal verbs informels. La structure doit guider le lecteur clairement du contexte à la demande ou à l\'information.')),
  s('table', '📘 Modèle d\'email formel annoté',
    _table(['Ligne','Contenu','Exemple'],
      [['Objet','Clair, concis, 5-8 mots','Re: Job Application – English Teacher Position'],
       ['Salutation','Formelle selon connaissance','Dear Ms Koné, / Dear Sir/Madam,'],
       ['§1 : Contexte','Pourquoi vous écrivez','I am writing with reference to the vacancy advertised on your website.'],
       ['§2 : Corps','Développement / informations','I have five years of experience teaching English at secondary level…'],
       ['§3 : Demande','Ce que vous voulez','I would be grateful if you could provide further information about…'],
       ['§4 : Clôture','Disponibilité + remerciements','I look forward to hearing from you. Thank you for your time.'],
       ['Formule de politesse','Formelle selon salutation','Yours sincerely, / Yours faithfully,'],
       ['Signature','Nom + coordonnées','Abena Mensah | Tel: +225 07 XX XX XX']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Subject: Enquiry Regarding English Language Courses','Objet : Renseignements concernant les cours de langue anglaise'],
      ['I am writing to enquire about the English proficiency courses you offer for adult learners.','Je vous écris pour me renseigner sur les cours de maîtrise de l\'anglais que vous proposez aux apprenants adultes.'],
      ['Please find attached my CV and a brief statement of interest for your consideration.','Veuillez trouver ci-joints mon CV et une brève déclaration d\'intérêt pour examen.'],
      ['I would appreciate confirmation of your availability for a meeting at your earliest convenience.','Je vous serais reconnaissant(e) de confirmer votre disponibilité pour une réunion dès que possible.'],
      ['Yours sincerely, Kofi Antwi — English Language Coordinator, AGTM Digital Academy','Veuillez agréer, Madame / Monsieur, l\'expression de mes salutations distinguées.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Registre formel : remplacez les mots courants par leurs équivalents formels : <em>get → obtain, find out → ascertain, ask → enquire, want → wish to, sorry → apologise</em>.',
      'Paragraphes courts : idéalement 3-5 lignes chacun. Un seul paragraphe = un seul thème.',
      'Phrases de transition formelles : <em>Furthermore, / In addition, / With regard to, / As discussed, / Please note that,</em>']))
]

C['WRITE-B1-002'] = [
  s('rule', '📌 Rédiger un Paragraphe Structuré',
    _rule('Topic sentence → Supporting sentences (evidence + explanation) → Concluding sentence',
      'Un bon paragraphe en anglais commence par une <strong>topic sentence</strong> (phrase directrice qui annonce l\'idée principale), développe avec 2-3 phrases de soutien (exemples, preuves, explications), et se termine par une phrase de conclusion ou de transition. La méthode <strong>PEEL</strong> ou <strong>TEEL</strong> est recommandée.')),
  s('table', '📘 Structure TEEL du paragraphe',
    _table(['Lettre','Élément','Exemple'],
      [['T','Topic sentence – l\'idée principale','Education is the most powerful tool for development.'],
       ['E','Evidence – preuve / exemple concret','According to UNESCO, countries that invest in education see GDP growth of up to 10%.'],
       ['E','Explanation – expliquer le lien','This shows that educated citizens contribute more to the economy.'],
       ['L','Link – relier au sujet général','Therefore, investing in education is essential for Côte d\'Ivoire\'s progress.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Technology has transformed the way students learn English in Africa.','La technologie a transformé la façon dont les étudiants apprennent l\'anglais en Afrique.'],
      ['For instance, mobile applications now allow learners in remote areas to access quality lessons.','Par exemple, les applications mobiles permettent désormais aux apprenants des zones reculées d\'accéder à des cours de qualité.'],
      ['This development is particularly significant in countries like Côte d\'Ivoire where internet access is expanding rapidly.','Ce développement est particulièrement significatif dans des pays comme la Côte d\'Ivoire où l\'accès à Internet se développe rapidement.'],
      ['As a result, the digital divide in English language learning is gradually narrowing.','En conséquence, le fossé numérique dans l\'apprentissage de l\'anglais se réduit progressivement.'],
      ['Consequently, platforms like AGTM Academy are playing a crucial role in democratising English education.','Par conséquent, des plateformes comme AGTM Academy jouent un rôle crucial dans la démocratisation de l\'enseignement de l\'anglais.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Un paragraphe = une seule idée principale. Ne mélangez pas deux thèmes différents dans un même paragraphe.',
      'Topic sentence = la première phrase. Elle doit être suffisamment générale pour que les phrases suivantes la développent.',
      'Phrases de soutien : utilisez des mots comme <em>for example, for instance, such as, according to, research shows that, this suggests that</em>.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['The paragraph has no clear main idea (everything mentioned at once).','Start with a clear topic sentence that states ONE main idea.','Un paragraphe = une idée centrale.'],
      ['I think, in my opinion, I believe technology is good.','Technology offers significant benefits for learners.','En écriture formelle, évitez les formules à la première personne.'],
      ['No evidence or example provided.','Support every claim with specific evidence or an example.','Toujours justifier les affirmations.']]))
]

C['WRITE-B2-001'] = [
  s('rule', '📌 Rédiger un Essai Argumentatif',
    _rule('Introduction (hook + context + thesis) → Body (3 paragraphs) → Conclusion (summary + stance)',
      'L\'<strong>essai argumentatif</strong> prend position sur un sujet et défend cette position avec des arguments étayés. La structure classique est : Introduction (accroche + contexte + thèse), 2-3 paragraphes de corps (argument + preuve + explication), et une conclusion (synthèse + position renforcée + appel à réflexion).')),
  s('table', '📘 Structure de l\'essai argumentatif',
    _table(['Partie','Contenu','Longueur approximative'],
      [['Introduction','Hook / Context / Thesis statement','10-15% de l\'essai'],
       ['Corps §1','Premier argument + preuves + explication','25-30% de l\'essai'],
       ['Corps §2','Deuxième argument + preuves + explication','25-30% de l\'essai'],
       ['Corps §3 (optionnel)','Contre-argument + réfutation','15-20% de l\'essai'],
       ['Conclusion','Synthèse + position finale + ouverture','10-15% de l\'essai']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Hook: "In a world where English is the lingua franca of business and academia, the ability to communicate in English is no longer a luxury — it is a necessity."','Accroche : "Dans un monde où l\'anglais est la lingua franca des affaires et de l\'académie, la capacité à communiquer en anglais n\'est plus un luxe — c\'est une nécessité."'],
      ['Thesis: This essay will argue that investing in English language education in Côte d\'Ivoire is essential for economic growth.','Thèse : Cet essai soutiendra que l\'investissement dans l\'enseignement de l\'anglais en Côte d\'Ivoire est essentiel à la croissance économique.'],
      ['Counter: While some argue that French is sufficient for local business, this view ignores the global dimension of modern commerce.','Contre-argument : Si certains soutiennent que le français suffit pour les affaires locales, ce point de vue ignore la dimension mondiale du commerce moderne.'],
      ['Conclusion: In conclusion, the evidence strongly supports the view that English education should be prioritised at all levels of the Ivorian education system.','Conclusion : En conclusion, les preuves soutiennent fortement que l\'enseignement de l\'anglais devrait être prioritaire à tous les niveaux du système éducatif ivoirien.'],
      ['The future of Côte d\'Ivoire\'s competitiveness depends on the language skills of its young people.','L\'avenir de la compétitivité de la Côte d\'Ivoire dépend des compétences linguistiques de ses jeunes.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'L\'accroche peut être : une citation, une statistique surprenante, une question rhétorique, une anecdote, ou une définition.',
      'La thèse = la position que vous défendez. Elle doit être claire, précise et défendable.',
      'Dans la conclusion : ne pas introduire de nouvelles informations. Synthétisez et ouvrez sur une perspective plus large.']))
]

C['WRITE-B2-002'] = [
  s('rule', '📌 Rédiger un Rapport Professionnel',
    _rule('Title → Executive Summary → Introduction → Findings → Analysis → Recommendations → Conclusion',
      'Le <strong>rapport professionnel</strong> est un document formel qui présente des informations, des analyses et des recommandations sur un sujet précis à un destinataire spécifique. Son style est objectif, factuel et structuré. Les sections sont clairement délimitées et titrées.')),
  s('table', '📘 Structure type d\'un rapport',
    _table(['Section','Contenu','Style'],
      [['Title page','Titre, auteur, date, destinataire','Formel, concis'],
       ['Executive Summary','Résumé de 1 paragraphe','Très concis, complet'],
       ['Introduction','Contexte, objectif, méthode','Factuel, clair'],
       ['Findings','Résultats observés / données','Objectif, neutre'],
       ['Analysis','Interprétation des résultats','Analytique, nuancé'],
       ['Recommendations','Actions proposées (numérotées)','Direct, actionnable'],
       ['Conclusion','Synthèse, perspectives','Synthétique']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['This report examines the current state of English language proficiency among secondary school students in Abidjan.','Ce rapport examine l\'état actuel de la maîtrise de la langue anglaise parmi les lycéens à Abidjan.'],
      ['The findings indicate that 65% of students struggle with spoken English, particularly in professional contexts.','Les résultats indiquent que 65% des élèves ont des difficultés avec l\'anglais oral, particulièrement dans des contextes professionnels.'],
      ['It is recommended that: 1. English lab hours be increased by 20%. 2. Business English modules be introduced from Grade 10.','Il est recommandé que : 1. Les heures de laboratoire d\'anglais soient augmentées de 20%. 2. Des modules d\'anglais des affaires soient introduits dès la Seconde.'],
      ['In conclusion, a coordinated approach involving schools, businesses and government is required to address this challenge.','En conclusion, une approche coordonnée impliquant les écoles, les entreprises et le gouvernement est nécessaire pour relever ce défi.'],
      ['Prepared by: AGTM Research Team | Date: April 2025 | For: Ministry of Education','Préparé par : Équipe de Recherche AGTM | Date : Avril 2025 | Pour : Ministère de l\'Éducation']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Passive voice très présent dans les rapports : <em>It was found that… / Data were collected… / Recommendations are outlined below…</em>',
      'Recommandations = impératif ou conditionnel : <em>We recommend that… / It is recommended to… / The company should…</em>',
      'L\'Executive Summary doit être compréhensible seul (sans lire le rapport entier) — c\'est souvent la seule partie lue par les décideurs.']))
]

C['WRITE-C1-001'] = [
  s('rule', '📌 Rédaction Académique – Articles et Mémoires',
    _rule('Abstract → Introduction → Literature Review → Methodology → Results → Discussion → Conclusion → References',
      'La <strong>rédaction académique</strong> (articles, mémoires, dissertations) suit des conventions strictes. Elle exige objectivité, précision, citations correctes (APA, MLA, Chicago), et cohérence argumentative. Le style est impersonnel, dense et riche en nominalisations. La revue de littérature contextualise la recherche dans le champ existant.')),
  s('table', '📘 Conventions de la rédaction académique',
    _table(['Convention','Description','Exemple'],
      [['Objectivité','Eviter la 1ère personne (ou l\'utiliser prudemment)','It can be argued that… / This study demonstrates…'],
       ['Nominalisation','Préférer les noms aux verbes','the analysis (not: we analysed), the development'],
       ['Citation','Référencer toutes les sources','(Smith, 2023) / Smith (2023) argues that…'],
       ['Hedging','Nuancer les affirmations','This may suggest… / It appears that… / Arguably…'],
       ['Cohérence','Connecteurs logiques entre les sections','Furthermore… However… Consequently… In contrast…'],
       ['Précision','Termes définis, données précises','The sample consisted of 150 participants aged 18-25.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Abstract: This study investigates the impact of digital platforms on English language acquisition among secondary students in Côte d\'Ivoire.','Résumé : Cette étude examine l\'impact des plateformes numériques sur l\'acquisition de la langue anglaise parmi les lycéens en Côte d\'Ivoire.'],
      ['Several scholars have noted the correlation between early bilingual education and cognitive flexibility (Cummins, 2000; Baker, 2011).','Plusieurs chercheurs ont noté la corrélation entre l\'enseignement bilingue précoce et la flexibilité cognitive.'],
      ['The results, whilst promising, must be interpreted with caution given the limited sample size.','Les résultats, bien que prometteurs, doivent être interprétés avec prudence étant donné la taille d\'échantillon limitée.'],
      ['This analysis suggests that a blended learning approach yields significantly better outcomes than traditional instruction alone.','Cette analyse suggère qu\'une approche d\'apprentissage mixte donne des résultats significativement meilleurs que l\'enseignement traditionnel seul.'],
      ['Future research should explore the longitudinal impact of these interventions across different socioeconomic groups.','Les recherches futures devraient explorer l\'impact longitudinal de ces interventions dans différents groupes socioéconomiques.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'APA format citation : (Author, Year, p.XX) — for direct quotes include page number.',
      'Hedging language (langue de la nuance) est essentielle en académique : <em>may, might, could, appears to, seems to, it is suggested that, arguably</em>.',
      'Abstract = résumé complet en 150-250 mots : contexte + objectif + méthode + résultats + conclusion. Ne pas dépasser.']))
]

// ═══════════════════════════════════════════════════════════════════════════════
// ESSAY MODULES
// ═══════════════════════════════════════════════════════════════════════════════

C['ESSAY-B1-001'] = [
  s('rule', '📌 Les Types d\'Essais en Anglais',
    _rule('For/Against | Opinion | Problem/Solution | Discussion | Advantages/Disadvantages',
      'Il existe plusieurs types d\'essais en anglais. Chaque type a une structure et un objectif spécifiques. En comprendre les différences permet de choisir la bonne approche selon la consigne et d\'éviter les hors-sujets — erreur fatale dans les examens comme le BAC et les certifications.')),
  s('table', '📘 Les types d\'essais et leurs caractéristiques',
    _table(['Type d\'essai','Objectif','Structure clé','Exemple de sujet'],
      [['For/Against','Présenter les deux côtés objectivement','Introduction → Arguments FOR → Arguments AGAINST → Balanced Conclusion','Should school uniforms be compulsory?'],
       ['Opinion','Défendre un point de vue personnel','Introduction + Thesis → Arguments + Examples → Conclusion restating view','Technology has more benefits than drawbacks. Discuss.'],
       ['Problem/Solution','Identifier problèmes et proposer solutions','Introduction → Problems → Solutions → Conclusion','How can we reduce youth unemployment?'],
       ['Advantages/Disadvantages','Analyser les avantages et inconvénients','Introduction → Advantages → Disadvantages → Balanced Conclusion','What are the advantages and disadvantages of remote work?'],
       ['Discussion (discursive)','Explorer plusieurs perspectives','Introduction → Multiple perspectives → Conclusion','The role of English in African development.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['For/Against essay: On one hand, school uniforms promote equality. On the other hand, they may limit self-expression.','Pour/Contre : D\'un côté, les uniformes scolaires favorisent l\'égalité. D\'un autre côté, ils peuvent limiter l\'expression personnelle.'],
      ['Opinion essay thesis: I firmly believe that technology, when used wisely, is the most powerful tool for education today.','Thèse d\'essai d\'opinion : Je crois fermement que la technologie, utilisée judicieusement, est l\'outil le plus puissant pour l\'éducation aujourd\'hui.'],
      ['Problem/Solution: Youth unemployment stems from a skills mismatch. One solution is to reform vocational training.','Problème/Solution : Le chômage des jeunes découle d\'un décalage de compétences. Une solution est de réformer la formation professionnelle.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Lisez la consigne attentivement : les mots <em>discuss, argue, consider, analyse</em> indiquent différents types de réponse attendue.',
      'For/Against et Advantages/Disadvantages = objectif (pas de position personnelle affirmée jusqu\'à la conclusion).',
      'Opinion essay = vous prenez position dès l\'introduction et la défendez tout au long de l\'essai.']))
]

C['ESSAY-B2-001'] = [
  s('rule', '📌 Construire une Introduction Percutante',
    _rule('Hook → Background/Context → Thesis statement (+ essay map optional)',
      'L\'<strong>introduction</strong> est la première impression que l\'examinateur a de votre essai. Elle doit capter l\'attention (hook), contextualiser le sujet (background), et annoncer clairement votre position et votre plan (thesis statement). Une bonne introduction représente 10-15% de l\'essai et doit donner envie de lire la suite.')),
  s('table', '📘 Types d\'accroches (hooks)',
    _table(['Type de hook','Description','Exemple'],
      [['Citation','Citer une personnalité célèbre','As Nelson Mandela said, "Education is the most powerful weapon…"'],
       ['Statistique','Chiffre frappant et pertinent','Over 1.5 billion people are currently learning English worldwide.'],
       ['Question rhétorique','Question qui fait réfléchir','Can a country truly develop without mastering the global language of business?'],
       ['Anecdote','Courte histoire illustrative','When Amina failed her English oral exam, she lost her dream job. She is not alone.'],
       ['Fait surprenant','Information contre-intuitive','Despite its colonial past, English is now Africa\'s fastest-growing language.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['Hook: "Over 1.5 billion people worldwide are currently learning English — and for good reason."','Accroche : "Plus de 1,5 milliard de personnes dans le monde apprennent actuellement l\'anglais — et pour cause."'],
      ['Context: In Côte d\'Ivoire, English proficiency has become a key asset in both the public and private sectors.','Contexte : En Côte d\'Ivoire, la maîtrise de l\'anglais est devenue un atout clé dans les secteurs public et privé.'],
      ['Thesis: This essay will argue that investing in English language education is not merely desirable, but absolutely essential for national development.','Thèse : Cet essai soutiendra que l\'investissement dans l\'enseignement de l\'anglais n\'est pas seulement souhaitable, mais absolument essentiel au développement national.'],
      ['Essay map: This will be demonstrated through an examination of economic, educational and social evidence.','Plan : Ceci sera démontré à travers un examen des preuves économiques, éducatives et sociales.'],
      ['Weak hook (avoid): "In this essay, I will talk about English."','Accroche faible (à éviter) : "Dans cet essai, je vais parler de l\'anglais." — jamais en anglais académique !']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'A éviter absolument en introduction : <em>"In this essay, I will…" / "Since the beginning of time…" / "Everyone knows that…"</em> — clichés pénalisés.',
      'La thesis statement doit être précise, défendable et annoncer clairement votre position — pas juste le sujet.',
      'L\'essay map (plan annoncé) est optionnel selon le style — en BAC ivoirien, il est souvent attendu implicitement.']))
]

C['ESSAY-B2-002'] = [
  s('rule', '📌 Développer des Arguments Convaincants',
    _rule('Claim → Warrant → Evidence → Explanation → Link back to thesis',
      'Un argument convaincant ne se contente pas d\'affirmer — il <strong>justifie</strong>, <strong>prouve</strong> et <strong>explique</strong>. La structure CEEL (Claim, Evidence, Explanation, Link) ou la méthode Toulmin (Claim + Warrant + Evidence + Qualifier) garantit des arguments solides et difficiles à réfuter.')),
  s('table', '📘 Structure d\'un argument solide',
    _table(['Élément','Rôle','Exemple'],
      [['Claim (affirmation)','La thèse du paragraphe','English proficiency directly increases employability.'],
       ['Warrant (justification)','Pourquoi c\'est vrai en principe','Multinational companies require English as a condition of employment.'],
       ['Evidence (preuve)','Faits, statistiques, exemples concrets','A 2022 study found that bilingual graduates earn 30% more in Côte d\'Ivoire.'],
       ['Explanation (explication)','Relier la preuve à l\'affirmation','This demonstrates that language skills translate directly into economic advantage.'],
       ['Link (lien)','Raccrocher à la thèse générale','Therefore, promoting English education is essential for economic empowerment.']])),
  s('examples', '💬 Exemples en contexte',
    _ex([
      ['First and foremost, English education enhances career opportunities for Ivorian youth.','Premièrement et avant tout, l\'enseignement de l\'anglais améliore les opportunités de carrière pour la jeunesse ivoirienne.'],
      ['This is evidenced by the growing number of multinational companies based in Abidjan that require English proficiency as a minimum qualification.','Cela est démontré par le nombre croissant d\'entreprises multinationales basées à Abidjan qui exigent la maîtrise de l\'anglais comme qualification minimale.'],
      ['Furthermore, research conducted by the African Development Bank (2023) reveals that bilingual professionals in West Africa earn significantly higher salaries.','De plus, des recherches menées par la Banque Africaine de Développement (2023) révèlent que les professionnels bilingues en Afrique de l\'Ouest gagnent des salaires significativement plus élevés.'],
      ['This clearly illustrates that English is not merely a communication tool, but an economic asset.','Cela illustre clairement que l\'anglais n\'est pas seulement un outil de communication, mais un atout économique.'],
      ['Consequently, any national development strategy that overlooks English language education is fundamentally flawed.','Par conséquent, toute stratégie de développement national qui néglige l\'enseignement de l\'anglais est fondamentalement déficiente.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Signal phrases pour introduire l\'évidence : <em>According to… / Research shows that… / Studies indicate that… / For example, / A survey of…</em>',
      'Signal phrases pour l\'explication : <em>This demonstrates that… / This suggests… / This proves… / In other words, / This means that…</em>',
      'Signal phrases pour le contre-argument : <em>While it may be argued that… / Some critics contend that… / Admittedly… / Although…</em> → puis réfuter.']))
]

// ═══════════════════════════════════════════════════════════════════════════════
// TOEIC MODULES
// ═══════════════════════════════════════════════════════════════════════════════

C['TOEIC-B1-001'] = [
  s('rule', '📌 TOEIC – Grammaire Essentielle : Nouns et Articles',
    _rule('TOEIC Part 5 & 6: identify correct noun form, article, or determiner in context',
      'Le TOEIC (Test of English for International Communication) évalue la compétence en anglais dans des contextes professionnels. Les Parties 5 et 6 testent la grammaire en contexte. Les <strong>noms</strong> (countable/uncountable, singular/plural) et les <strong>articles</strong> (a/an/the/Ø) sont parmi les points les plus fréquemment testés.')),
  s('table', '📘 Points grammaticaux fréquents au TOEIC Part 5',
    _table(['Point testé','Règle essentielle','Exemple TOEIC-style'],
      [['Articles (a/an/the/Ø)','Défini vs indéfini vs absence','The meeting / a decision / information (Ø)'],
       ['Noms dénombrables vs indénombrables','Pluriel vs singulier sans article','furnitures ✗ → furniture ✓'],
       ['Forme du mot (word form)','Nom vs verbe vs adjectif vs adverbe','The _____ of the project. (management ✓)'],
       ['Noms collectifs','Singulier en anglais','The staff IS / The team HAS'],
       ['Quantificateurs','Much/Many, Little/Few, A lot of','Much information / Many employees']])),
  s('table', '📘 Vocabulaire des affaires – TOEIC fréquent',
    _table(['Mot','Sens','Contexte TOEIC'],
      [['headquarters','siège social','The company\'s headquarters are in London.'],
       ['subsidiary','filiale','Our subsidiary in Abidjan handles West Africa.'],
       ['invoice','facture','Please issue an invoice for the services.'],
       ['deadline','date limite','The deadline for submissions is Friday.'],
       ['merchandise','marchandise','All merchandise must be inspected.'],
       ['personnel','personnel (collectif)','Personnel is being restructured.'],
       ['authorization','autorisation','Written authorization is required.']])),
  s('examples', '💬 Exemples TOEIC Part 5',
    _ex([
      ['The _____ of the new product will begin next month. (A) produce (B) producing (C) production (D) productive','Réponse : (C) production — nom attendu après "the".'],
      ['All _____ must be returned to the warehouse by Friday. (A) equipment (B) equipments (C) an equipment','Réponse : (A) equipment — indénombrable, jamais au pluriel.'],
      ['The meeting has been postponed _____ further notice. (A) until (B) during (C) since (D) for','Réponse : (A) until — "until further notice" = expression figée.'],
      ['_____ employees attended the annual conference. (A) Most of the (B) Most of (C) Almost (D) Most','Réponse : (A) Most of the — avec "the" devant un nom défini.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Stratégie Part 5 : lisez toute la phrase d\'abord, identifiez la catégorie grammaticale manquante (nom/verbe/adjectif/adverbe), puis choisissez.',
      'Noms indénombrables piégeux au TOEIC : <em>information, advice, furniture, equipment, luggage, news, staff, personnel, money, research</em> — JAMAIS au pluriel.',
      'Word family très testée : <em>manage → management → manager → managerial → managed</em> — connaissez les 4 formes.']))
]

C['TOEIC-B2-001'] = [
  s('rule', '📌 TOEIC – Temps Verbaux et Structure de Phrase',
    _rule('Identify the correct tense, voice, or sentence structure from context clues',
      'Les temps verbaux et la structure de phrase (actif/passif, subordination, coordination) sont massivement testés dans les Parties 5 et 6 du TOEIC. La clé est de repérer les <strong>marqueurs temporels</strong> et les <strong>connecteurs logiques</strong> qui signalent le temps attendu.')),
  s('table', '📘 Temps verbaux fréquents au TOEIC – marqueurs',
    _table(['Temps','Marqueurs typiques','Structure'],
      [['Present simple','every day, always, usually, currently (état)','She manages the department.'],
       ['Present perfect','already, yet, just, recently, since, for','They have already signed the contract.'],
       ['Simple past','yesterday, last week, in 2022, ago','The project was completed last month.'],
       ['Future will','tomorrow, next week, soon, by 2026','The report will be submitted by Friday.'],
       ['Passive present','—','The application is reviewed by HR.'],
       ['Passive past','—','The order was shipped yesterday.'],
       ['Conditional','if…, provided that…','If approved, the budget will increase.']])),
  s('examples', '💬 Exemples TOEIC Part 5 et 6',
    _ex([
      ['The new policy _____ into effect on 1 May. (A) takes (B) will take (C) has taken (D) took','Réponse : (B) will take — événement futur précis (on 1 May = future scheduled).'],
      ['By the time the auditors arrive, we _____ all the documents. (A) will prepare (B) prepared (C) will have prepared','Réponse : (C) will have prepared — futur antérieur (action complétée avant un futur moment).'],
      ['The shipment _____ three days ago. (A) is delayed (B) was delayed (C) has been delayed (D) will be delayed','Réponse : (B) was delayed — "three days ago" → simple past passif.'],
      ['Employees _____ to submit their timesheets by the end of each week. (A) require (B) are required (C) are requiring','Réponse : (B) are required — passif avec obligation externe.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Part 5 = 1 phrase avec 1 blanc → 30 secondes max par question. Ne restez pas bloqué(e) — passez et revenez.',
      'Part 6 = texte à trous (4 blancs) → lisez TOUT le texte d\'abord pour le contexte avant de choisir.',
      'Score TOEIC : 785+ = niveau B2 reconnu. 945+ = niveau C1. Visez 785+ pour les postes internationaux en Côte d\'Ivoire.']))
]

// ═══════════════════════════════════════════════════════════════════════════════
// BAC MODULES
// ═══════════════════════════════════════════════════════════════════════════════

C['BAC-B1-001'] = [
  s('rule', '📌 BAC Grammaire – Les Essentiels',
    _rule('Maîtriser : temps verbaux, voix passive, modaux, relatives, conditionnels',
      'Le BAC anglais Côte d\'Ivoire teste systématiquement les mêmes structures grammaticales. Les exercices de grammaire comptent pour environ 30-40% des points. Les structures les plus fréquentes sont : les temps verbaux (présent simple/continu, passé simple, present perfect, futur), la voix passive, les modaux, les propositions relatives et les conditionnels types 1 et 2.')),
  s('table', '📘 Structures grammaticales les plus testées au BAC',
    _table(['Structure','Fréquence','Points clés à mémoriser'],
      [['Temps verbaux','Très fréquent','Signal words → bon temps. Passé simple vs Present Perfect.'],
       ['Voix passive','Très fréquent','BE + PP. Transformation actif → passif.'],
       ['Modaux','Fréquent','Can/Could/Must/Should/May/Might + base.'],
       ['Propositions relatives','Fréquent','Who (personne), which (chose), whose (possession), where (lieu).'],
       ['Conditionnel type 1','Fréquent','If + présent → will + base.'],
       ['Conditionnel type 2','Fréquent','If + past → would + base.'],
       ['Discours rapporté','Occasionnel','Backshift des temps. Said/told.'],
       ['Question tags','Occasionnel','Auxiliaire inversé + pronom.']])),
  s('examples', '💬 Exercices types BAC',
    _ex([
      ['Put into the passive: "They built this bridge in 1990."','This bridge was built in 1990. (passif, simple past)'],
      ['Complete: "If she _____ harder, she _____ the exam." (study / pass)','If she studied harder, she would pass the exam. (conditionnel type 2)'],
      ['Add a question tag: "She speaks English well, _____ ?"','She speaks English well, doesn\'t she?'],
      ['Relative: "The man ___ helped me is my teacher."','The man who helped me is my teacher.'],
      ['Reported speech: He said, "I am tired."','He said that he was tired.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'BAC grammaire : lisez toute la phrase avant de compléter — le contexte dicte souvent le temps ou la structure.',
      'Pour la voix passive au BAC : identifiez le temps de l\'actif → conjuguez BE au même temps → ajoutez le participe passé.',
      'Question tags : auxiliaire de la phrase principale (inversé) + pronom sujet. Si affirmatif → tag négatif. Si négatif → tag positif.']))
]

C['BAC-B1-002'] = [
  s('rule', '📌 BAC Thème – Traduction Français → Anglais',
    _rule('Read the French sentence → Identify structure → Translate word group by word group → Review',
      'Le <strong>thème</strong> (traduction du français vers l\'anglais) est une épreuve du BAC série A et de certaines séries scientifiques. Il évalue la maîtrise des structures grammaticales anglaises dans un contexte de traduction. Les erreurs les plus fréquentes viennent des faux-amis, des temps verbaux et des structures idiomatiques.')),
  s('table', '📘 Pièges de traduction FR → EN',
    _table(['Problème','Français','Anglais INCORRECT','Anglais CORRECT'],
      [['Présent en cours','Je suis en train de lire','I am reading (OK!)','I am reading ✓'],
       ['Depuis (durée)','J\'étudie depuis 3 ans','I study since 3 years','I have been studying for 3 years'],
       ['Venir de','Il vient de partir','He comes from leaving','He has just left'],
       ['Faux-ami','actuellement','actually (= en réalité)','currently / at the moment'],
       ['Faux-ami','éventuellement','eventually (= finalement)','possibly / perhaps'],
       ['Futur après si','Si tu viens, je serai content','If you will come…','If you come, I will be happy'],
       ['Négation double','Je ne vois personne','I don\'t see nobody','I don\'t see anybody / I see nobody']])),
  s('examples', '💬 Exercices de thème BAC',
    _ex([
      ['FR: Il a dit qu\'il viendrait le lendemain.','EN: He said (that) he would come the next day.'],
      ['FR: Quand j\'étais enfant, j\'aimais jouer au football.','EN: When I was a child, I liked/used to like playing football.'],
      ['FR: La lettre doit être signée avant vendredi.','EN: The letter must be signed before Friday.'],
      ['FR: Le médecin lui a conseillé de se reposer.','EN: The doctor advised him/her to rest.'],
      ['FR: C\'est la première fois qu\'il visite l\'Afrique.','EN: It is the first time (that) he has visited Africa.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Faux-amis à connaître absolument : <em>eventually</em> (finalement), <em>actually</em> (en réalité), <em>sensible</em> (raisonnable), <em>sympathetic</em> (compatissant), <em>library</em> (bibliothèque).',
      'Depuis + durée → <strong>for</strong> + durée (I have studied for 3 years). Depuis + point de départ → <strong>since</strong> (I have studied since 2020).',
      'Venir de → <strong>have/has just + past participle</strong> : <em>Il vient d\'arriver → He has just arrived.</em>']))
]

C['BAC-B2-001'] = [
  s('rule', '📌 Le BAC Anglais Côte d\'Ivoire – Guide Expert',
    _rule('Comprehension (20pts) + Grammar (20pts) + Expression (20pts) = 60 pts total',
      'Le BAC anglais en Côte d\'Ivoire (toutes séries) comprend trois grandes parties : <strong>1. Compréhension de texte</strong> (vrai/faux, questions ouvertes, résumé), <strong>2. Grammaire</strong> (exercices de transformation, complétion, correction), <strong>3. Expression écrite</strong> (essai, dialogue ou description selon la série). La durée est généralement de 3 heures.')),
  s('table', '📘 Structure détaillée du BAC anglais CI',
    _table(['Partie','Exercices','Points','Stratégie'],
      [['Compréhension','True/False + justification | Questions | Title | Summary','~20 pts','Lire le texte 2 fois. Répondre avec les mots du texte. Justifier chaque T/F.'],
       ['Grammaire','Mise en forme | Transformation | Correction d\'erreurs','~20 pts','Identifier le type d\'exercice → appliquer la règle précise.'],
       ['Expression','Essai | Dialogue | Description','~20 pts','Plan avant d\'écrire. Introduction + 2-3 paragraphes + conclusion. 150-200 mots min.']])),
  s('table', '📘 Méthode True/False avec justification',
    _table(['Étape','Action'],
      [['1. Lire la proposition','Comprendre exactement ce qui est affirmé'],
       ['2. Localiser dans le texte','Trouver le passage correspondant'],
       ['3. Comparer','La proposition = ce que dit le texte ?'],
       ['4. Décider T ou F','True si identique ou synonyme. False si contraire ou absent.'],
       ['5. Citer la justification','Copier l\'extrait exact du texte qui justifie']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'True/False : la justification doit toujours être une citation DIRECTE du texte (entre guillemets). Jamais une paraphrase personnelle.',
      'Pour le résumé : reformulez LES IDÉES avec VOS MOTS. Ne copiez pas de longues phrases du texte. Réduisez à 1/3 ou 1/4 de la longueur originale.',
      'Expression écrite : toujours faire un plan de 3 minutes avant d\'écrire. Introduction claire + développement structuré + conclusion = 3 points assurés de plus.']))
]

C['BAC-B2-002'] = [
  s('rule', '📌 BAC Compréhension de Texte – Méthode',
    _rule('Pre-read questions → Read text twice → Answer in order → Use text vocabulary → Justify',
      'La <strong>compréhension de texte</strong> au BAC demande une méthode rigoureuse. Lisez d\'abord les questions pour savoir ce que vous cherchez. Lisez le texte une première fois globalement, puis une deuxième fois attentivement. Répondez dans l\'ordre du texte. Utilisez les mots du texte autant que possible. Justifiez toujours.')),
  s('table', '📘 Types de questions et stratégies',
    _table(['Type de question','Stratégie','Formulation de la réponse'],
      [['True/False + justif.','Localiser → comparer → citer','True: "…" (ligne X) / False: "…" (ligne X)'],
       ['Question ouverte','Localiser le passage → reformuler','The text says that… / According to the text…'],
       ['Titre du texte','Identifier le thème central + l\'angle','Un bon titre = thème + angle = 4-6 mots'],
       ['Résumé (summary)','Sélectionner idées clés → reformuler','En 80-100 mots, vos propres mots, toutes les idées principales'],
       ['Vocabulaire en contexte','Deviner sens par contexte → trouver équivalent','The word "X" in line Y means…'],
       ['Topic sentence','Identifier l\'idée principale de chaque §','The main idea of paragraph X is…']])),
  s('examples', '💬 Exercices types BAC',
    _ex([
      ['Q: Is it true that technology improves education in Africa? (T/F + justification)','True: "Digital platforms have transformed learning outcomes in many African schools." (line 5-6)'],
      ['Q: What is the author\'s main argument?','The author argues that investing in education is the most effective way to reduce poverty.'],
      ['Q: Give a suitable title for this text.','Suggested title: "Education: Africa\'s Most Powerful Development Tool"'],
      ['Q: In your own words, explain what "digital divide" means in this context.','The "digital divide" refers to the gap between those who have access to technology and those who do not.'],
      ['Q: Find a word in the text that means "necessary" (paragraph 2).','Answer: "essential" (line 8) / "vital" (line 12)']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Pour les questions ouvertes : commencez TOUJOURS par une phrase complète. Jamais de réponse en fragment.',
      'Pour les titres : évitez les titres trop généraux (<em>"Education"</em>) et trop longs. Visez 4-7 mots précis.',
      'Pour le vocabulaire en contexte : regardez les mots voisins, la phrase entière, et le paragraphe pour déduire le sens.']))
]

C['BAC-B2-003'] = [
  s('rule', '📌 BAC Grammaire – Structures Avancées',
    _rule('Transformation exercises: active↔passive, direct↔reported speech, conditional rewriting',
      'Les exercices de grammaire avancée au BAC testent la capacité à transformer des phrases selon des règles précises. Les trois grands types de transformation sont : <strong>actif ↔ passif</strong>, <strong>discours direct ↔ rapporté</strong>, et <strong>réécriture conditionnelle</strong>. La maîtrise de ces transformations garantit des points sûrs.')),
  s('table', '📘 Méthode de transformation – guide pas à pas',
    _table(['Transformation','Étapes','Exemple'],
      [['Actif → Passif','1. Objet → sujet | 2. BE + PP | 3. Sujet → by…','They built it in 1990 → It was built in 1990.'],
       ['Passif → Actif','1. Agent → sujet | 2. Verbe actif au bon temps | 3. Ancien sujet → objet','The letter was written by her → She wrote the letter.'],
       ['Direct → Rapporté','1. Verbe intro au passé | 2. Backshift | 3. Changer pronoms + expressions temps','He said, "I am tired" → He said (that) he was tired.'],
       ['Rapporté → Direct','1. Identifier le temps rapporté | 2. Avancer d\'un cran | 3. Ajouter guillemets','She said she would go → She said, "I will go."'],
       ['Cond. 1 → Cond. 2','Transformer le registre ou la probabilité','If it rains → If it rained, I would stay.']])),
  s('examples', '💬 Exercices BAC Grammaire',
    _ex([
      ['Rewrite in the passive: "The government has launched a new education programme."','A new education programme has been launched by the government.'],
      ['Put into reported speech: She said, "We will finish the project tomorrow."','She said (that) they would finish the project the next day.'],
      ['Complete with the right form: "If students _____ (study) regularly, they _____ (pass) the BAC."','If students studied regularly, they would pass the BAC. (type 2)'],
      ['Add a question tag: "She hasn\'t called yet, _____ ?"','She hasn\'t called yet, has she?'],
      ['Transform: "He must finish before Friday." (passive)','The work must be finished before Friday.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Transformation passif : le temps du verbe actif → BE conjugué au MÊME temps + PP. Ex: built (past simple) → was/were built.',
      'Discours rapporté : présent → passé, will → would, can → could, may → might, must → had to. Les temps reculent d\'un cran.',
      'Conditionnels : type 1 (réel) → type 2 (irréel) : changez if-clause de présent à passé ET result clause de will à would.']))
]

C['BAC-B2-004'] = [
  s('rule', '📌 BAC Dissertation – Méthodologie Complète',
    _rule('Analyse sujet → Plan détaillé → Introduction → Développement (2-3 parties) → Conclusion',
      'La <strong>dissertation</strong> au BAC anglais séries A et certaines séries scientifiques est l\'exercice d\'expression écrite le plus exigeant. Elle requiert un plan rigoureux, une argumentation structurée, des exemples pertinents, et un style soutenu. La méthode dialectique (thèse → antithèse → synthèse) est la plus valorisée.')),
  s('table', '📘 Plan de dissertation dialectique',
    _table(['Partie','Contenu','Points de notation'],
      [['Introduction','Hook + Définition des termes + Problématique + Annonce du plan','Accroche, clarté de la problématique'],
       ['Partie I (Thèse)','Argument 1 + Exemple + Argument 2 + Exemple','Pertinence des arguments, exemples concrets'],
       ['Partie II (Antithèse)','Nuances / Points opposés + Exemples','Capacité à nuancer, prise de recul'],
       ['Partie III (Synthèse)','Dépassement / Position personnelle raisonnée','Maturité intellectuelle, originalité'],
       ['Conclusion','Bilan + Réponse à la problématique + Ouverture','Cohérence, ouverture pertinente']])),
  s('examples', '💬 Exemple de plan détaillé',
    _ex([
      ['Sujet: "Technology is a blessing for education." Discuss.','Sujet : "La technologie est une bénédiction pour l\'éducation." Discutez.'],
      ['Thèse: Technology enhances access to quality education (e-learning, digital resources, distance learning).','Thèse : La technologie améliore l\'accès à une éducation de qualité.'],
      ['Antithèse: Technology creates new challenges (digital divide, distractions, misinformation, inequality).','Antithèse : La technologie crée de nouveaux défis (fracture numérique, distractions, inégalités).'],
      ['Synthèse: Technology\'s impact depends on how it is used — regulated, guided use is key.','Synthèse : L\'impact de la technologie dépend de la façon dont elle est utilisée — une utilisation encadrée est la clé.'],
      ['Conclusion: Technology is neither inherently good nor bad — it is a powerful tool that demands responsible management.','Conclusion : La technologie n\'est ni intrinsèquement bonne ni mauvaise — c\'est un outil puissant qui exige une gestion responsable.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Avant d\'écrire : passez 5-7 minutes à faire votre plan sur brouillon. Un bon plan = une dissertation à moitié réussie.',
      'Longueur minimale : environ 200-250 mots pour la dissertation BAC. Visez 300 mots pour un meilleur score.',
      'Transitions entre parties : <em>However, one must also consider… / On the other hand… / Nonetheless… / Having examined both sides…</em>']))
]

C['BAC-B2-005'] = [
  s('rule', '📌 BAC Dissertation – Sujets Types et Corrigés',
    _rule('Practise with real BAC-style topics → Apply method → Memorise useful phrases',
      'S\'entraîner sur des sujets types est la méthode la plus efficace pour préparer la dissertation BAC. Les sujets portent généralement sur des thèmes de société : <strong>éducation, technologie, environnement, jeunesse, développement, mondialisation</strong>. Pour chaque sujet, appliquez la méthode dialectique et enrichissez votre réponse avec des exemples africains.')),
  s('table', '📘 Sujets types BAC – thèmes récurrents',
    _table(['Thème','Exemple de sujet','Plan en 3 mots'],
      [['Education','Is education the key to development?','Access → Quality → Equity'],
       ['Technologie','Smartphones: a curse or a blessing?','Benefits → Dangers → Balance'],
       ['Environnement','Climate change is Africa\'s greatest challenge. Do you agree?','Evidence → Solutions → Local action'],
       ['Jeunesse','Young people today face more challenges than previous generations. Discuss.','Old challenges → New challenges → Resilience'],
       ['Mondialisation','Globalisation benefits rich countries more than poor ones. Discuss.','Economic gains → Inequalities → Way forward'],
       ['Genre','Gender equality is crucial for Africa\'s development. Discuss.','Situation → Challenges → Progress']])),
  s('examples', '💬 Phrases utiles pour la dissertation BAC',
    _ex([
      ['Introduction: The question of whether… has become one of the most debated issues in contemporary society.','Introduction : La question de savoir si… est devenue l\'une des questions les plus débattues dans la société contemporaine.'],
      ['Thèse: There is no doubt that… / It is undeniable that…','Thèse : Il ne fait aucun doute que… / Il est indéniable que…'],
      ['Antithèse: However, this view must be nuanced. / Nevertheless, there is another side to this argument.','Antithèse : Cependant, ce point de vue doit être nuancé. / Néanmoins, il y a un autre côté à cet argument.'],
      ['Synthèse: Ultimately, the solution lies in finding a balance between… and…','Synthèse : En fin de compte, la solution réside dans la recherche d\'un équilibre entre… et…'],
      ['Conclusion: In conclusion, while… it remains clear that…','Conclusion : En conclusion, bien que… il reste clair que…']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Mémorisez 5-6 connecteurs logiques en anglais et utilisez-les systématiquement : <em>Furthermore, Nevertheless, Consequently, In contrast, As a result, Ultimately</em>.',
      'Exemples africains recommandés : <em>Côte d\'Ivoire, West Africa, the African Union, M-Pesa (Kenya), the COVID pandemic in Africa, Nelson Mandela, Wangari Maathai</em>.',
      'Évitez les clichés comme <em>"Since the dawn of time…"</em> ou <em>"In this world of today…"</em> — les examinateurs les pénalisent.']))
]

C['BAC-B2-006'] = [
  s('rule', '📌 BAC Version – Traduction Anglais → Français',
    _rule('Read → Understand globally → Translate sentence by sentence → Adapt to French idiom → Review',
      'La <strong>version</strong> (traduction de l\'anglais vers le français) est évaluée sur la fidélité au sens, la qualité du français, et la gestion des structures difficiles. On ne traduit pas mot à mot — on cherche l\'équivalent naturel en français. Les structures passives, les idiomes et les temps verbaux sont les principaux défis.')),
  s('table', '📘 Pièges de traduction EN → FR',
    _table(['Difficulté','Anglais','Français INCORRECT','Français CORRECT'],
      [['Passif','The decision was made','La décision était faite','La décision a été prise / On a pris la décision'],
       ['Gérondif sujet','Swimming is healthy','La natation est saine','La natation est bonne pour la santé'],
       ['Phrasal verb','She gave up the job','Elle a donné vers le haut','Elle a renoncé à l\'emploi'],
       ['Present Perfect','He has arrived','Il a arrivé','Il est arrivé / Il vient d\'arriver'],
       ['Idiome','It\'s raining cats and dogs','Il pleut des chats et des chiens','Il pleut des cordes'],
       ['Faux-ami','sensible','sensible (correct ici !)','raisonnable (selon contexte)']])),
  s('examples', '💬 Exercices de version BAC',
    _ex([
      ['EN: The government has decided to invest heavily in education.','FR: Le gouvernement a décidé d\'investir massivement dans l\'éducation.'],
      ['EN: Despite the challenges, young Ivorians remain optimistic about the future.','FR: Malgré les difficultés, les jeunes Ivoiriens restent optimistes quant à l\'avenir.'],
      ['EN: It is high time that African countries took control of their own development.','FR: Il est grand temps que les pays africains prennent en main leur propre développement.'],
      ['EN: Not only did she pass the exam, but she also got the highest mark.','FR: Non seulement elle a réussi l\'examen, mais elle a également obtenu la meilleure note.'],
      ['EN: The number of students learning English has risen sharply over the last decade.','FR: Le nombre d\'étudiants apprenant l\'anglais a fortement augmenté au cours de la dernière décennie.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Traduisez PAR SENS (proposition par proposition), pas mot à mot. L\'objectif est un français naturel et idiomatique.',
      'Relisez votre version en français uniquement — si ça sonne bizarre en français, reformulez.',
      'Structures difficiles : <em>It is high time + past subj → il est grand temps que + subjonctif</em>. <em>Not only… but also → non seulement… mais aussi</em>.']))
]

// ═══════════════════════════════════════════════════════════════════════════════
// BEPC MODULES
// ═══════════════════════════════════════════════════════════════════════════════

C['BEPC-A2-001'] = [
  s('rule', '📌 BEPC Grammaire – Temps de Base',
    _rule('Present Simple | Present Continuous | Simple Past | Future (will / going to)',
      'Le BEPC anglais Côte d\'Ivoire teste principalement les temps de base. La maîtrise du <strong>présent simple</strong>, du <strong>présent continu</strong>, du <strong>passé simple</strong> et du <strong>futur</strong> est indispensable pour réussir la partie grammaire. Les exercices sont de type: complétion, transformation, correction d\'erreurs.')),
  s('table', '📘 Récapitulatif des temps de base',
    _table(['Temps','Structure','Signal word','Exemple'],
      [['Présent simple','S + V(+s/es)','every day, always, usually','She reads every morning.'],
       ['Présent continu','S + am/is/are + V-ing','now, at the moment, look!','She is reading now.'],
       ['Passé simple','S + V-ed / irrégulier','yesterday, last week, ago','She read yesterday.'],
       ['Futur (will)','S + will + base','tomorrow, next week, soon','She will read tomorrow.'],
       ['Going to','S + am/is/are going to + base','(intention/plan/prediction)','She is going to read tonight.']])),
  s('examples', '💬 Exercices types BEPC',
    _ex([
      ['Complete: She _____ (go) to school every day.','She goes to school every day. (présent simple, 3e pers.)'],
      ['Complete: Look! The children _____ (play) in the garden.','Look! The children are playing in the garden. (présent continu)'],
      ['Complete: He _____ (visit) his grandparents last Sunday.','He visited his grandparents last Sunday. (passé simple)'],
      ['Complete: I _____ (call) you tomorrow. (promise)','I will call you tomorrow.'],
      ['Complete: She _____ (travel) to Yamoussoukro next week. (plan)','She is going to travel to Yamoussoukro next week.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Signal words = les indices ! <em>every day/always</em> → présent simple. <em>now/look</em> → présent continu. <em>yesterday/ago</em> → passé simple. <em>tomorrow/next week</em> → futur.',
      '3e personne singulier au présent simple : TOUJOURS -s/-es : <em>She goes ✓ / He goes ✓ / It goes ✓</em>.',
      'Verbes irréguliers essentiels pour le BEPC : <em>go→went, have→had, be→was/were, come→came, see→saw, give→gave, take→took</em>.'])),
  s('errors', '⚠️ Erreurs fréquentes',
    _err([
      ['She go to school every day.','She goes to school every day.','3e pers. sing. → +s/-es.'],
      ['He don\'t like football.','He doesn\'t like football.','3e pers. sing. négatif → doesn\'t.'],
      ['I will to study harder.','I will study harder.','Will + base (sans to).']]))
]

C['BEPC-A2-002'] = [
  s('rule', '📌 BEPC Expression Écrite – La Lettre',
    _rule('Place + Date → Salutation → Body (3 paragraphs) → Closing → Signature',
      'La <strong>lettre</strong> (formelle ou informelle) est l\'exercice d\'expression écrite le plus fréquent au BEPC. Elle doit respecter un format précis : lieu et date en haut à droite, salutation, 2-3 paragraphes structurés, formule de clôture et signature. La lettre informelle à un ami et la lettre formelle à une autorité ont des styles différents.')),
  s('table', '📘 Format de la lettre au BEPC',
    _table(['Élément','Lettre informelle (ami)','Lettre formelle (directeur/autorité)'],
      [['Lieu + Date','Abidjan, 15th April 2025','Abidjan, 15th April 2025'],
       ['Salutation','Dear [First name],','Dear Sir/Madam, / Dear Mr/Ms [Name],'],
       ['§1 Introduction','Hi! How are you? I\'m writing to…','I am writing with regard to… / I wish to inform you that…'],
       ['§2 Corps','Main news / invitation / request','Situation / request / justification'],
       ['§3 Clôture','I hope to hear from you soon.','I would be grateful if you could… / I look forward to your reply.'],
       ['Formule','Your friend, / Best wishes,','Yours sincerely, / Yours faithfully,'],
       ['Signature','[First name]','[Full name]']])),
  s('examples', '💬 Modèle de lettre BEPC',
    _ex([
      ['Informal opening: "Dear Kofi, I hope you are well. I am writing to invite you to my birthday party on Saturday."','Ouverture informelle : "Cher Kofi, J\'espère que tu vas bien. Je t\'écris pour t\'inviter à ma fête d\'anniversaire samedi."'],
      ['Formal opening: "Dear Sir, I am writing to apply for the position of English monitor advertised at your school."','Ouverture formelle : "Monsieur, Je vous écris pour postuler au poste de surveillant d\'anglais annoncé dans votre école."'],
      ['Formal closing: "I would be grateful if you could consider my application. Yours sincerely, Ama Asante."','Clôture formelle : "Je vous serais reconnaissante de bien vouloir considérer ma candidature. Veuillez agréer, Monsieur, mes sincères salutations, Ama Asante."'],
      ['Body example: The party will be held at my house at 4 p.m. Please bring your favourite dish to share.','Corps : La fête aura lieu chez moi à 16h. Veuillez apporter votre plat préféré à partager.'],
      ['Informal closing: "I hope you can come. Write back soon! Your friend, Mariam."','Clôture informelle : "J\'espère que tu peux venir. Réponds vite ! Ton ami(e), Mariam."']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'La date s\'écrit en anglais : <em>15th April 2025</em> (UK) ou <em>April 15, 2025</em> (US). Les deux sont acceptés au BEPC.',
      'Longueur minimale au BEPC : environ 80-120 mots. Comptez vos mots sur brouillon.',
      'Un paragraphe = une idée. Ne mélangez jamais deux sujets différents dans le même paragraphe.']))
]

C['BEPC-B1-001'] = [
  s('rule', '📌 Structure du BEPC Anglais – Guide Côte d\'Ivoire',
    _rule('Comprehension (8-10 pts) + Grammar (8-10 pts) + Expression (8-10 pts) ≈ 30 pts → coefficient 2',
      'Le BEPC anglais Côte d\'Ivoire est une épreuve d\'environ 2h30. Elle comprend trois grandes parties : <strong>compréhension de texte</strong>, <strong>grammaire</strong> et <strong>expression écrite</strong>. La maîtrise des bases (temps verbaux, vocabulaire, structure de la lettre) suffit pour obtenir une bonne note. Les erreurs de grammaire sont pénalisées moins sévèrement qu\'au BAC si le sens est clair.')),
  s('table', '📘 Structure du BEPC anglais CI',
    _table(['Partie','Exercices typiques','Points','Conseils'],
      [['Compréhension','True/False + justif., Questions, Title, Vocabulary','8-10 pts','Lisez 2 fois. Justifiez chaque T/F avec une phrase du texte.'],
       ['Grammaire','Mettre les verbes à la bonne forme, Transformation','8-10 pts','Identifiez les signal words. Vérifiez 3e pers. sing. et auxiliaires.'],
       ['Expression','Lettre (informelle ou formelle), Description, Dialogue','8-10 pts','Plan rapide. Format correct. 80-120 mots minimum.']])),
  s('examples', '💬 Exercices types BEPC',
    _ex([
      ['True/False: "The main character is a young farmer from the north." True/False?','Answer: True / False + "According to the text, \'…(citation)…\'"'],
      ['Grammar: She _____ (not/go) to school last Monday because she was ill.','She didn\'t go to school last Monday because she was ill. (passé simple négatif)'],
      ['Grammar: If it _____ (rain), we _____ (stay) at home. (probable)','If it rains, we will stay at home. (conditionnel type 1)'],
      ['Expression task: Write a letter to your friend inviting him/her to your school\'s end-of-year party.','Lettre informelle : Dear [Name], I hope you are well. I am writing to invite you to our school\'s end-of-year party on 30th June...'],
      ['Vocabulary: Find in the text a word that means "happy" (paragraph 1).','Answer: "joyful" (line 3) / "pleased" (line 7)']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'BEPC : les 5 points de grammaire les plus testés = présent simple (3e pers.), passé simple, futur will, conditionnel type 1, voix passive simple.',
      'Expression : écrivez PROPREMENT et LISIBLEMENT. Un examinateur qui ne peut pas lire votre écriture ne peut pas vous noter.',
      'Vérifiez à la fin : majuscules, points, accords (he/she/it → verbe en -s), et la structure de la lettre.']))
]

C['BEPC-B1-002'] = [
  s('rule', '📌 BEPC Part One – Comprendre un Texte',
    _rule('Read title → Read questions → Read text twice → Answer in order',
      'La partie compréhension du BEPC demande de comprendre un texte court (150-250 mots) et de répondre à des questions ciblées. La méthode : lisez d\'abord les questions pour savoir ce que vous cherchez, puis lisez le texte deux fois (globalement + attentivement), puis répondez dans l\'ordre du texte.')),
  s('table', '📘 Types de questions BEPC – Compréhension',
    _table(['Type','Comment répondre','Formule recommandée'],
      [['True / False + justification','Localiser dans le texte → citer','True: "…" (ligne X). / False: "…" (ligne X).'],
       ['Question ouverte (who, what, when…)','Phrase complète, mots du texte','The text says that… / According to the text…'],
       ['Titre suggéré','Thème général en 3-5 mots','A good title: "Youth and Education in Africa"'],
       ['Vocabulaire en contexte','Chercher équivalent dans le texte','The word "…" means "…" in this context.'],
       ['Résumé (summary)','Reformuler les idées clés en 2-3 phrases','The text is about… It explains that… In conclusion…']])),
  s('examples', '💬 Exemples pratiques BEPC',
    _ex([
      ['Q: What is the text about?','The text is about the importance of education for young Africans.'],
      ['Q: True or False: "The student passed all his exams."','True: According to the text, "he succeeded in all his examinations" (line 6).'],
      ['Q: Find a word in paragraph 2 that means "difficult".','The word "challenging" (line 12) means difficult in this context.'],
      ['Q: Suggest a title for this text.','Suggested title: "Education: The Key to Success"'],
      ['Q: What does the author advise young people to do?','The author advises young people to work hard and stay focused on their studies.']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Ne jamais répondre en un mot seul sauf si demandé explicitement. Toujours une phrase complète avec sujet + verbe.',
      'La justification True/False = copiez exactement la phrase (ou partie de phrase) du texte entre guillemets.',
      'Pour les questions "What / Who / Where / When / Why / How" : trouvez le paragraphe correspondant → reformulez l\'information.']))
]

C['BEPC-B1-003'] = [
  s('rule', '📌 BEPC Grammaire – Structures Complexes',
    _rule('Passive voice | Reported speech | Relative clauses | Conditionals type 1 & 2',
      'Au BEPC niveau B1, la grammaire va au-delà des temps de base et inclut des structures comme la voix passive, le discours rapporté, les propositions relatives et les conditionnels. Ces structures sont souvent présentées sous forme de transformations ou de complétion de phrases.')),
  s('table', '📘 Structures complexes BEPC – aide-mémoire',
    _table(['Structure','Formule','Exemple BEPC'],
      [['Voix passive','BE (bon temps) + PP','The house was built in 1990.'],
       ['Discours rapporté','said that + backshift','She said she was tired.'],
       ['Relative who','personne + who + verbe','The boy who won the prize is happy.'],
       ['Relative which','chose + which + verbe','The book which I read was excellent.'],
       ['Conditionnel 1','If + présent, will + base','If it rains, I will stay home.'],
       ['Conditionnel 2','If + passé, would + base','If I were rich, I would travel.'],
       ['Question tag aff.','phrase affirmative, auxiliaire négatif?','She is kind, isn\'t she?'],
       ['Question tag neg.','phrase négative, auxiliaire positif?','He can\'t swim, can he?']])),
  s('examples', '💬 Exercices types BEPC',
    _ex([
      ['Transformation: "They repair the road every year." (passive)','The road is repaired every year.'],
      ['Discours rapporté: He said, "I will come tomorrow."','He said (that) he would come the next day.'],
      ['Relative: "The girl _____ helped me is my cousin."','The girl who helped me is my cousin.'],
      ['Conditionnel: "If she _____ (have) more time, she _____ (help) us."','If she had more time, she would help us. (type 2)'],
      ['Question tag: "They finished the project on time, _____ ?"','They finished the project on time, didn\'t they?']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Voix passive BEPC : identifiez le temps actif → conjuguez BE au même temps. Présent simple actif → is/are + PP. Passé simple actif → was/were + PP.',
      'Discours rapporté BEPC : said = dit (backshift obligatoire). Told + personne = a dit à quelqu\'un (told me, told her).',
      'Relatifs BEPC : WHO = personne. WHICH = chose. WHOSE = possession. WHERE = lieu. Apprenez ces 4 et ne les mélangez pas.']))
]

C['BEPC-B1-004'] = [
  s('rule', '📌 BEPC Expression Écrite – Le Dialogue et le Commentaire',
    _rule('Dialogue: identify speakers, use direct speech | Commentary: short paragraph responding to a text/image',
      'L\'expression écrite au BEPC peut prendre différentes formes selon le sujet : <strong>lettre</strong> (la plus fréquente), <strong>dialogue</strong> (conversation entre personnages), <strong>description</strong> (d\'une image, d\'un lieu, d\'une personne) ou <strong>commentaire court</strong> (réaction à une citation ou situation). La maîtrise des différents formats est un avantage.')),
  s('table', '📘 Guide par type d\'expression écrite BEPC',
    _table(['Type','Structure','Consigne type'],
      [['Lettre informelle','Date + Salutation + 3§ + Clôture + Signature','Write a letter to your friend about your holidays.'],
       ['Lettre formelle','Date + Salutation formelle + 3§ + Clôture formelle + Signature','Write a letter to the headmaster requesting information.'],
       ['Dialogue','[Name]: "…" / [Name]: "…" (alternance, 6-10 répliques)','Write a dialogue between a student and a teacher about the exam.'],
       ['Description','Introduction + Détails physiques/ambiance + Impression générale','Describe the scene shown in the picture.'],
       ['Commentaire','Opinion + Justification + Exemple + Conclusion','Comment on this statement: "Education is the key to success."']])),
  s('examples', '💬 Exemple de dialogue BEPC',
    _ex([
      ['Akosua: Hello, Kwame! Have you studied for the English exam tomorrow?','Kwame: Not yet. I am really worried about the grammar section.'],
      ['Akosua: Don\'t worry! Let me help you. What do you find most difficult?','Kwame: I always confuse the present perfect and the past simple.'],
      ['Akosua: OK! Remember: use the past simple with specific time expressions like "yesterday" or "last week".','Kwame: Ah, I see! And the present perfect for experiences without a specific time?'],
      ['Akosua: Exactly! You\'ve got it. Shall we practise together?','Kwame: Yes, please! Let\'s start with some exercises.'],
      ['Akosua: Great! I am sure you will do well tomorrow.','Kwame: Thank you so much for your help, Akosua!']])),
  s('tips', '✨ Astuces mémo',
    _tips([
      'Dialogue : chaque réplique sur une nouvelle ligne avec le nom du locuteur suivi de deux points. Minimum 6-8 répliques pour le BEPC.',
      'Description : commencez par situer la scène (où, quand), décrivez les éléments principaux, puis donnez votre impression générale.',
      'Commentaire : évitez de simplement répéter la citation. Prenez position, justifiez, donnez un exemple local (Côte d\'Ivoire, Afrique).']))
]

})()

