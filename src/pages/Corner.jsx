import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useSubscription } from '../hooks/useSubscription'
import { LANGUAGES } from '../lib/constants'
import MasterCard, { LevelBadge, MasterCardSkeleton } from '../components/ui/MasterCard'

const THEMES = {
  en: [
    { code:'all',          label:'Tout',           icon:'🌟' },
    { code:'grammar',      label:'Grammar',         icon:'📝' },
    { code:'vocabulary',   label:'Vocabulary',      icon:'📖' },
    { code:'listening',    label:'Listening',       icon:'🎧' },
    { code:'business',     label:'Business',        icon:'💼' },
    { code:'ielts',        label:'IELTS',           icon:'🏆' },
    { code:'pronunciation',label:'Pronunciation',   icon:'🔊' },
    { code:'idioms',       label:'Idioms',          icon:'💬' },
    { code:'news',         label:'News',            icon:'📰' },
  ],
  fr: [
    { code:'all',          label:'Tout',            icon:'🌟' },
    { code:'grammaire',    label:'Grammaire',        icon:'📝' },
    { code:'vocabulaire',  label:'Vocabulaire',      icon:'📖' },
    { code:'comprehension',label:'Compréhension',    icon:'🎧' },
    { code:'professionnel',label:'Professionnel',    icon:'💼' },
    { code:'delf',         label:'DELF/DALF',        icon:'🏆' },
    { code:'culture',      label:'Culture',          icon:'🌍' },
  ],
  es: [
    { code:'all',          label:'Todo',            icon:'🌟' },
    { code:'gramatica',    label:'Gramática',        icon:'📝' },
    { code:'vocabulario',  label:'Vocabulaire',      icon:'📖' },
    { code:'comprension',  label:'Comprensión',      icon:'🎧' },
    { code:'dele',         label:'DELE',             icon:'🏆' },
  ],
  de: [
    { code:'all',          label:'Alles',            icon:'🌟' },
    { code:'grammatik',    label:'Grammatik',         icon:'📝' },
    { code:'vokabular',    label:'Vokabular',         icon:'📖' },
    { code:'hoerverstehen',label:'Hörverstehen',      icon:'🎧' },
    { code:'goethe',       label:'Goethe',            icon:'🏆' },
  ],
}

const LEVELS = ['all','A1','A2','B1','B2','C1','C2']

export default function Corner() {
  const { lang }    = useParams()
  const { can }     = useSubscription()
  const language    = LANGUAGES[lang]

  const [content, setContent]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [theme, setTheme]       = useState('all')
  const [level, setLevel]       = useState('all')
  const [type, setType]         = useState('all')
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(0)
  const [total, setTotal]       = useState(0)
  const [playing, setPlaying]   = useState(null)
  const [embedError, setEmbedError] = useState(false)

  const PER_PAGE = 12
  const themes   = THEMES[lang] || THEMES.en

  useEffect(() => {
    setPage(0)
    loadContent()
  }, [lang, theme, level, type, search])

  useEffect(() => { loadContent() }, [page])

  useEffect(() => {
    if (playing) {
      setEmbedError(false)
    }
  }, [playing])

  async function loadContent() {
    setLoading(true)

    let query = supabase
      .from('lingua_content')
      .select('*', { count: 'exact' })
      .eq('language', lang)
      .eq('is_active', true)
      .order('published_at', { ascending: false })
      .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1)

    if (theme !== 'all') query = query.eq('theme', theme)
    if (level !== 'all') query = query.eq('level_target', level)
    if (type  !== 'all') query = query.eq('content_type', type)
    if (search)          query = query.ilike('title', `%${search}%`)

    const { data, count } = await query
    setContent(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  function formatDuration(sec) {
    if (!sec) return ''
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2,'0')}`
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-mono text-[10px] tracking-widest text-gold uppercase mb-1">
            {language?.flag} EIP English In Practice
          </div>
          <h1 className="font-serif text-3xl text-white">
            {language?.name} <em className="text-gold italic">Corner</em>
          </h1>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs text-gold">{total}</div>
          <div className="font-mono text-[9px] text-muted uppercase tracking-wider">contenus</div>
        </div>
      </div>

      {/* Recherche */}
      <div className="flex gap-2 mb-4">
         <div className="flex-1 flex items-center gap-3 glass rounded-lg px-4 py-3 border border-white/10">
          <span className="text-muted text-sm">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Rechercher dans le ${language?.name} Corner...`}
            className="bg-transparent border-none outline-none text-white text-sm flex-1"
          />
        </div>
        <select value={type} onChange={e => setType(e.target.value)}
                     className="glass rounded-lg px-4 py-3 border border-white/10 text-white text-sm">
          <option value="all">Tout type</option>
          <option value="video">📹 Vidéo</option>
          <option value="audio">🎧 Audio</option>
          <option value="article">📖 Article</option>
        </select>
      </div>

      {/* Filtres niveaux */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
        {LEVELS.map(l => (
           <button key={l} onClick={() => setLevel(l)}
             className={`px-3 py-1.5 rounded-full font-mono text-xs font-bold flex-shrink-0 border transition-all
               ${level === l
                 ? 'bg-gold text-dark border-gold shadow-gold-sm'
                 : 'glass border-white/10 text-muted hover:border-gold/40 hover:text-white'}`}>
             {l === 'all' ? 'Tous' : l}
           </button>
        ))}
      </div>

      {/* Filtres thèmes */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {themes.map(t => (
           <button key={t.code} onClick={() => setTheme(t.code)}
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs flex-shrink-0 border transition-all
               ${theme === t.code
                 ? 'bg-blue/30 border-blue/50 text-white shadow-blue-sm'
                 : 'glass border-white/10 text-muted hover:text-white'}`}>
             <span>{t.icon}</span>
             <span>{t.label}</span>
           </button>
        ))}
      </div>

      {/* Grille de contenu */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           {[...Array(6)].map((_, i) => (
             <MasterCardSkeleton key={i} variant="content" padding="none" />
           ))}
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-muted text-sm">Aucun contenu pour ces filtres.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {content.map(item => (
               <MasterCard key={item.id}
                 variant="content"
                 lang={lang}
                 interactive
                 glow
                 padding="none"
                 className="overflow-hidden group"
                 onClick={() => setPlaying(item)}>

                {/* Thumbnail */}
                <div className="aspect-video relative overflow-hidden bg-navy">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {item.content_type === 'video' ? '🎬' :
                       item.content_type === 'audio' ? '🎧' : '📖'}
                    </div>
                  )}

                  {/* Overlay play */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center text-dark text-xl">
                      ▶
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                     {item.level_target && (
                       <LevelBadge level={item.level_target} lang={lang} size="xs" />
                     )}
                    <span className="font-mono text-[9px] px-1.5 py-0.5 bg-dark/80 text-white/70 rounded">
                      {item.content_type === 'video' ? '📹' :
                       item.content_type === 'audio' ? '🎧' : '📖'}
                    </span>
                  </div>

                  {/* Durée */}
                  {item.duration_sec > 0 && (
                    <div className="absolute bottom-2 right-2 font-mono text-[9px] px-1.5 py-0.5 bg-dark/80 text-white rounded">
                      {formatDuration(item.duration_sec)}
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="p-3">
                  <div className="text-sm font-medium text-white leading-snug line-clamp-2 mb-1 group-hover:text-gold transition-colors">
                    {item.title}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted">{item.channel_name || item.source}</div>
                       {item.view_count > 0 && (
                         <div className="font-mono text-[9px] text-muted">
                           {(item.view_count / 1000).toFixed(0)}K vues
                         </div>
                       )}
                  </div>
                  {item.theme && (
                    <div className="mt-1.5">
                      <span className="font-mono text-[9px] px-1.5 py-0.5 bg-blue/20 border border-blue/30 text-blue-300 rounded">
                        {item.theme}
                      </span>
                    </div>
                  )}
                </div>
              </MasterCard>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{total} résultat(s)</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs glass border border-white/10 text-muted disabled:opacity-30 rounded-sm hover:border-gold hover:text-gold">
                ← Précédent
              </button>
              <span className="px-3 py-1.5 text-xs text-muted font-mono">
                {page + 1} / {Math.ceil(total / PER_PAGE)}
              </span>
              <button disabled={(page + 1) * PER_PAGE >= total} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs glass border border-white/10 text-muted disabled:opacity-30 rounded-sm hover:border-gold hover:text-gold">
                Suivant →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal lecteur */}
      {playing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark/90 backdrop-blur-sm"
          onClick={() => setPlaying(null)}>

          <div
             className="w-full max-w-2xl glass border border-white/10 rounded-lg overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>

            {/* ✅ LECTEUR YOUTUBE EMBED */}
            {playing.youtube_video_id ? (
              <div className="aspect-video w-full">
                <iframe
                  key={playing.youtube_video_id}
                  src={`https://www.youtube.com/embed/${playing.youtube_video_id}?autoplay=1&rel=0&modestbranding=1`}
                  className="w-full h-full"
                  style={{ border: 'none', display: 'block' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={playing.title}
                  onError={() => setEmbedError(true)}
                />
                {embedError && (
                  <div className="aspect-video flex items-center justify-center bg-navy/50 flex-col gap-3">
                    <p className="text-muted text-sm">Cette vidéo ne peut pas être intégrée.</p>
                    <a
                      href={`https://www.youtube.com/watch?v=${playing.youtube_video_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-gold text-dark font-semibold text-sm rounded-sm">
                      ▶ Voir sur YouTube →
                    </a>
                  </div>
                )}
              </div>
            ) : playing.media_url?.includes('youtube.com') ? (
              /* ✅ Fallback : extraire l'ID depuis l'URL */
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${
                    new URL(playing.media_url).searchParams.get('v')
                  }?autoplay=1&rel=0`}
                  className="w-full h-full"
                  style={{ border: 'none', display: 'block' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={playing.title}
                  onError={() => setEmbedError(true)}
                />
                {embedError && (
                  <div className="aspect-video flex items-center justify-center bg-navy/50 flex-col gap-3">
                    <p className="text-muted text-sm">Cette vidéo ne peut pas être intégrée.</p>
                    <a
                      href={playing.media_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-gold text-dark font-semibold text-sm rounded-sm">
                      ▶ Voir sur YouTube →
                    </a>
                  </div>
                )}
              </div>
            ) : (
              /* ✅ Pour les autres types de contenu (audio, article) */
              <div className="p-6 text-center">
                <div className="text-5xl mb-4">
                  {playing.content_type === 'audio' ? '🎧' : '📖'}
                </div>
                <a
                  href={playing.media_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gold text-dark font-semibold rounded-sm">
                  Ouvrir le contenu ↗
                </a>
              </div>
            )}

            {/* Infos sous la vidéo */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-serif text-lg text-white leading-snug">
                  {playing.title}
                </h3>
                <button
                  onClick={() => setPlaying(null)}
                  className="text-muted hover:text-white text-xl flex-shrink-0">
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted">
                {playing.channel_name && <span>{playing.channel_name}</span>}
                {playing.level_target && (
                  <span className="font-mono text-gold">{playing.level_target}</span>
                )}
                {playing.theme && (
                  <span className="font-mono text-[9px] px-1.5 py-0.5 bg-blue/20 border border-blue/30 text-blue-300 rounded">
                    {playing.theme}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
