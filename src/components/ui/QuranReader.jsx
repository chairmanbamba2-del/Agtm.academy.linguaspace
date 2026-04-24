import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import MasterCard from './MasterCard'

const FALLBACK_AYAHS = [
  { id: 1, surah: 'Al-Fatiha', arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', transliteration: 'Bismillahir Rahmanir Rahim', translation: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux', audio_url: null },
  { id: 2, surah: 'Al-Fatiha', arabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', transliteration: 'Alhamdu lillahi rabbil \'alamin', translation: 'Louange à Allah, Seigneur de l\'univers', audio_url: null },
  { id: 3, surah: 'Al-Fatiha', arabic: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', transliteration: 'Ar-Rahmanir Rahim', translation: 'Le Tout Miséricordieux, le Très Miséricordieux', audio_url: null },
  { id: 4, surah: 'Al-Fatiha', arabic: 'مَٰلِكِ يَوْمِ ٱلدِّينِ', transliteration: 'Maliki yawmid din', translation: 'Maître du Jour de la Rétribution', audio_url: null },
  { id: 5, surah: 'Al-Fatiha', arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', transliteration: 'Iyyaka na\'budu wa iyyaka nasta\'in', translation: 'C\'est Toi seul que nous adorons, et c\'est Toi seul dont nous implorons le secours', audio_url: null },
  { id: 6, surah: 'Al-Fatiha', arabic: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', transliteration: 'Ihdinas siratal mustaqim', translation: 'Guide-nous dans le droit chemin', audio_url: null },
  { id: 7, surah: 'Al-Fatiha', arabic: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ', transliteration: 'Siratal ladhina an\'amta \'alayhim ghayril maghdubi \'alayhim wa lad-dallin', translation: 'Le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés', audio_url: null },
]

const QURAN_SURAHS = [
  { id: 1, name: 'Al-Fatiha', arabic: 'الفاتحة', verses: 7, audio_base: 'https://everyayah.com/data/Alafasy_64kbps/001' },
  { id: 36, name: 'Ya-Sin', arabic: 'يس', verses: 83, audio_base: 'https://everyayah.com/data/Alafasy_64kbps/036' },
  { id: 55, name: 'Ar-Rahman', arabic: 'الرحمن', verses: 78, audio_base: 'https://everyayah.com/data/Alafasy_64kbps/055' },
  { id: 67, name: 'Al-Mulk', arabic: 'الملك', verses: 30, audio_base: 'https://everyayah.com/data/Alafasy_64kbps/067' },
  { id: 112, name: 'Al-Ikhlas', arabic: 'الإخلاص', verses: 4, audio_base: 'https://everyayah.com/data/Alafasy_64kbps/112' },
  { id: 113, name: 'Al-Falaq', arabic: 'الفلق', verses: 5, audio_base: 'https://everyayah.com/data/Alafasy_64kbps/113' },
  { id: 114, name: 'An-Nas', arabic: 'الناس', verses: 6, audio_base: 'https://everyayah.com/data/Alafasy_64kbps/114' },
]

export default function QuranReader() {
  const [selectedSurah, setSelectedSurah] = useState(QURAN_SURAHS[0])
  const [playingAyah, setPlayingAyah] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const ayahs = FALLBACK_AYAHS

  function formatAyahNumber(surahNum, ayahNum) {
    return String(surahNum).padStart(3, '0') + String(ayahNum).padStart(3, '0')
  }

  function togglePlay(ayah) {
    const surah = selectedSurah
    const ayahIndex = ayahs.indexOf(ayah) + 1
    const url = `${surah.audio_base}${formatAyahNumber(surah.id, ayahIndex)}.mp3`

    if (playingAyah?.id === ayah.id && isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }

    if (audioRef.current) {
      audioRef.current.src = url
      audioRef.current.play().catch(() => {})
    } else {
      const audio = new Audio(url)
      audioRef.current = audio
      audio.play().catch(() => {})
      audio.onended = () => {
        setIsPlaying(false)
        setPlayingAyah(null)
      }
    }
    setPlayingAyah(ayah)
    setIsPlaying(true)
  }

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <MasterCard variant="content" padding="lg" className="text-center border-emerald-500/20">
        <p className="text-xs text-emerald-400 font-mono tracking-widest mb-2">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
        <p className="text-[10px] text-muted italic">Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux</p>
      </MasterCard>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {QURAN_SURAHS.map(s => (
          <button key={s.id} onClick={() => { setSelectedSurah(s); setPlayingAyah(null); setIsPlaying(false) }}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs border transition-all
              ${selectedSurah.id === s.id
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'glass border-white/10 text-muted hover:border-emerald-500/30 hover:text-white'}`}>
            <span className="font-arabic text-lg block mb-0.5">{s.arabic}</span>
            <span className="font-mono text-[9px]">{s.name} · {s.verses}v</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {ayahs.map((ayah, i) => {
          const isCurrentPlay = playingAyah?.id === ayah.id
          return (
            <MasterCard key={ayah.id}
              variant="content" padding="md"
              className={`border transition-all cursor-pointer
                ${isCurrentPlay && isPlaying ? 'border-emerald-500/50 shadow-emerald-sm' : 'border-white/5 hover:border-emerald-500/30'}`}
              onClick={() => togglePlay(ayah)}>
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0
                  ${isCurrentPlay && isPlaying
                    ? 'bg-emerald-500 text-dark'
                    : 'bg-white/5 text-muted border border-white/10'}`}>
                  {isCurrentPlay && isPlaying ? '⏸' : (i + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl text-right leading-loose font-arabic text-white mb-2" dir="rtl">
                    {ayah.arabic}
                  </p>
                  <p className="text-xs text-emerald-400/70 italic mb-1">{ayah.transliteration}</p>
                  <p className="text-xs text-muted">{ayah.translation}</p>
                </div>
                {ayah.audio_url && (
                  <div className="flex-shrink-0 text-emerald-400/50 text-lg">
                    🔊
                  </div>
                )}
              </div>
            </MasterCard>
          )
        })}
      </div>

      {playingAyah && isPlaying && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-dark/95 backdrop-blur-md border-t border-emerald-500/30">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button onClick={() => { audioRef.current?.pause(); setIsPlaying(false); setPlayingAyah(null) }}
              className="text-muted hover:text-white text-sm flex-shrink-0">✕</button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-emerald-400 font-arabic truncate" dir="rtl">{playingAyah.arabic}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted font-mono">{selectedSurah.name} · {ayahs.indexOf(playingAyah) + 1}</span>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-emerald-500/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-500/30 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
