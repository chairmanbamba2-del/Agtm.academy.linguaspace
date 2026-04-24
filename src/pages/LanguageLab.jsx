import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useSubscription } from '../hooks/useSubscription'
import { LANGUAGES, CEFR_LEVELS, CEFR_LABELS } from '../lib/constants'
import MasterCard, { LevelBadge, MasterCardSkeleton } from '../components/ui/MasterCard'

const LAB_SECTIONS = [
  { id: 'reading',  icon: '📖', label: { en: 'Reading', fr: 'Lecture', es: 'Lectura', de: 'Lesen' },
    desc: { en: 'Comprehension exercises with articles, stories, and academic texts',
            fr: 'Exercices de compréhension avec articles, histoires et textes académiques',
            es: 'Ejercicios de comprensión con artículos, historias y textos académicos',
            de: 'Verständnisübungen mit Artikeln, Geschichten und akademischen Texten' } },
  { id: 'writing',  icon: '✍️',  label: { en: 'Writing', fr: 'Écriture', es: 'Escritura', de: 'Schreiben' },
    desc: { en: 'Practice writing essays, emails, and creative texts with AI feedback',
            fr: 'Pratiquez la rédaction d\'essais, emails et textes créatifs avec retour IA',
            es: 'Practica escribir ensayos, correos y textos creativos con retroalimentación IA',
            de: 'Übe das Schreiben von Aufsätzen, E-Mails und kreativen Texten mit KI-Feedback' } },
  { id: 'listening', icon: '🎧', label: { en: 'Listening', fr: 'Compréhension orale', es: 'Comprensión auditiva', de: 'Hörverstehen' },
    desc: { en: 'Audio exercises with native speakers at different speeds',
            fr: 'Exercices audio avec locuteurs natifs à différentes vitesses',
            es: 'Ejercicios de audio con hablantes nativos a diferentes velocidades',
            de: 'Audio-Übungen mit Muttersprachlern in verschiedenen Geschwindigkeiten' } },
  { id: 'speaking', icon: '🎤', label: { en: 'Speaking', fr: 'Expression orale', es: 'Expresión oral', de: 'Sprechen' },
    desc: { en: 'Pronunciation drills, dialogues, and speech practice',
            fr: 'Exercices de prononciation, dialogues et pratique orale',
            es: 'Ejercicios de pronunciación, diálogos y práctica oral',
            de: 'Ausspracheübungen, Dialoge und Sprechpraxis' } },
  { id: 'podcasts', icon: '🎙️', label: { en: 'Podcasts', fr: 'Podcasts', es: 'Podcasts', de: 'Podcasts' },
    desc: { en: 'Curated podcasts with transcripts and comprehension quizzes',
            fr: 'Podcasts organisés avec transcriptions et quiz de compréhension',
            es: 'Podcasts seleccionados con transcripciones y cuestionarios',
            de: 'Kuratierte Podcasts mit Transkriptionen und Verständnisquiz' } },
]

function getLocalized(obj, lang, fallback = 'en') {
  return obj[lang] || obj[fallback]
}

export default function LanguageLab() {
  const { lang } = useParams()
  const { can } = useSubscription()
  const language = LANGUAGES[lang]

  const [activeSection, setActiveSection] = useState('reading')
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState('all')
  const [search, setSearch] = useState('')

  const langLabel = getLocalized({ en: 'English', fr: 'Français', es: 'Español', de: 'Deutsch' }, lang)

  useEffect(() => {
    setLevel('all')
    setSearch('')
    loadContent()
  }, [lang, activeSection])

  async function loadContent() {
    setLoading(true)
    let query = supabase
      .from('lingua_lab_content')
      .select('*', { count: 'exact' })
      .eq('language', lang)
      .eq('section', activeSection)
      .order('order_index', { ascending: true })

    if (level !== 'all') query = query.eq('level_target', level)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data } = await query
    setContent(data || [])
    setLoading(false)
  }

  if (!can(`corner_${lang}`)) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl text-white font-serif mb-2">Language Lab</h2>
          <p className="text-muted mb-4">Abonnez-vous pour accéder au Language Lab {langLabel}</p>
          <Link to="/subscribe" className="btn bg-gold text-dark font-semibold px-6 py-3">Voir les offres</Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="font-mono text-[10px] tracking-widest text-gold uppercase mb-1">
          {language?.flag} Language Lab
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl text-white">
            {langLabel} <em className="text-gold italic">Lab</em>
          </h1>
          <Link to={`/corner/${lang}`}
            className="text-xs text-muted hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-sm hover:border-gold/30">
            ← Retour au Corner
          </Link>
        </div>
      </div>

      {/* Navigation sections */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {LAB_SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-medium transition-all whitespace-nowrap flex-shrink-0
              ${activeSection === s.id
                ? 'bg-gold/15 text-gold border border-gold/30'
                : 'glass text-muted border border-white/10 hover:text-white hover:border-white/20'}`}>
            <span className="text-base">{s.icon}</span>
            <span>{getLocalized(s.label, lang)}</span>
          </button>
        ))}
      </div>

      {/* Description et infos */}
      <div className="mb-6">
        <p className="text-sm text-muted leading-relaxed">
          {getLocalized(LAB_SECTIONS.find(s => s.id === activeSection)?.desc, lang)}
        </p>
        <div className="flex items-center gap-3 mt-3">
          <Link to={`/assistant?lang=${lang}&mode=${activeSection === 'writing' ? 'free_talk' : activeSection === 'speaking' ? 'free_talk' : 'free_talk'}`}
            className="text-xs px-3 py-1.5 bg-blue/20 text-blue rounded-sm hover:bg-blue/30 transition-colors">
            🤖 Pratiquer avec l'IA Coach
          </Link>
          {activeSection === 'podcasts' && (
            <Link to={`/corner/${lang}?theme=listening`}
              className="text-xs px-3 py-1.5 bg-white/10 text-muted rounded-sm hover:bg-white/20 transition-colors">
              🎧 Voir aussi les audios dans le Corner
            </Link>
          )}
        </div>
      </div>

      {/* Filtres niveau */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        <button onClick={() => setLevel('all')}
          className={`px-3 py-1.5 rounded-full font-mono text-xs font-bold flex-shrink-0 border transition-all
            ${level === 'all' ? 'bg-gold text-dark border-gold' : 'glass border-white/10 text-muted hover:border-gold/40'}`}>
          Tous niveaux
        </button>
        {CEFR_LEVELS.map(l => (
          <button key={l} onClick={() => setLevel(l)}
            className={`px-3 py-1.5 rounded-full font-mono text-xs font-bold flex-shrink-0 border transition-all
              ${level === l ? 'bg-gold text-dark border-gold' : 'glass border-white/10 text-muted hover:border-gold/40'}`}>
            {l} — {CEFR_LABELS[l]}
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 flex items-center gap-3 glass rounded-sm px-4 py-3 border border-white/10">
          <span className="text-muted text-sm">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Rechercher dans ${getLocalized(LAB_SECTIONS.find(s => s.id === activeSection)?.label, lang)}...`}
            className="bg-transparent border-none outline-none text-white text-sm flex-1" />
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <MasterCardSkeleton key={i} variant="content" padding="none" />)}
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">
            {activeSection === 'reading' ? '📖' : activeSection === 'writing' ? '✍️' : activeSection === 'listening' ? '🎧' : activeSection === 'speaking' ? '🎤' : '🎙️'}
          </div>
          <p className="text-muted text-sm mb-3">
            Aucun exercice disponible pour "{getLocalized(LAB_SECTIONS.find(s => s.id === activeSection)?.label, lang)}"
          </p>
          <p className="text-muted/60 text-xs">
            {activeSection === 'podcasts'
              ? 'Les podcasts seront bientôt disponibles. En attendant, explorez le Coach IA ou le Corner.'
              : activeSection === 'writing'
              ? 'Utilisez le Coach IA pour pratiquer l\'écriture avec feedback en temps réel.'
              : activeSection === 'speaking'
              ? 'Le Coach IA peut vous aider à pratiquer l\'expression orale dès maintenant.'
              : 'Explorez le Corner pour du contenu existant ou utilisez le Coach IA.'}
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <Link to={`/assistant?lang=${lang}`}
              className="text-xs px-4 py-2 bg-gold/20 text-gold rounded-sm hover:bg-gold/30 transition-colors">
              🤖 Coach IA
            </Link>
            <Link to={`/corner/${lang}`}
              className="text-xs px-4 py-2 bg-white/10 text-muted rounded-sm hover:bg-white/20 transition-colors">
              📚 Explorer le Corner
            </Link>
            <Link to={`/modules/${lang}`}
              className="text-xs px-4 py-2 bg-white/10 text-muted rounded-sm hover:bg-white/20 transition-colors">
              📖 Modules
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.map(item => (
            <MasterCard key={item.id} variant="content" lang={lang} interactive glow padding="none"
              className="overflow-hidden group" onClick={() => {
                if (item.media_url) window.open(item.media_url, '_blank')
              }}>
              {/* Header */}
              <div className="h-24 relative flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${language?.color}22, ${language?.color}44)` }}>
                <span className="text-4xl opacity-60">
                  {activeSection === 'reading' ? '📖' : activeSection === 'writing' ? '✍️' : activeSection === 'listening' ? '🎧' : activeSection === 'speaking' ? '🎤' : '🎙️'}
                </span>
                {item.level_target && (
                  <div className="absolute top-2 left-2">
                    <LevelBadge level={item.level_target} lang={lang} size="xs" />
                  </div>
                )}
                {item.duration_min && (
                  <div className="absolute bottom-2 right-2 font-mono text-[9px] px-1.5 py-0.5 bg-dark/80 text-white/70 rounded">
                    {item.duration_min} min
                  </div>
                )}
              </div>
              {/* Body */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-white leading-snug line-clamp-2 mb-1 group-hover:text-gold transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-muted line-clamp-2 mb-2">{item.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/10 text-muted rounded-sm">
                    {item.exercise_type || activeSection}
                  </span>
                  {item.difficulty && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/10 text-muted rounded-sm">
                      {item.difficulty}
                    </span>
                  )}
                </div>
                {item.media_url && (
                  <div className="mt-2">
                    <span className="text-[10px] text-gold/70 hover:text-gold transition-colors">
                      Ouvrir ↗
                    </span>
                  </div>
                )}
              </div>
            </MasterCard>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
