import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useUserStore } from '../store/userStore'
import { useProfile } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { supabase } from '../lib/supabase'
import { LANGUAGES } from '../lib/constants'
import MasterCard, { LevelBadge } from '../components/ui/MasterCard'

export default function Leaderboard() {
  useProfile()
  const linguaUser = useUserStore(s => s.linguaUser)
  const { isActive, isPremium } = useSubscription()

  const [leaders, setLeaders]   = useState([])
  const [lang, setLang]         = useState('en')
  const [loading, setLoading]   = useState(true)

  // Leaderboard premium uniquement
  if (!isPremium) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-80 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="font-serif text-2xl text-white mb-2">Leaderboard mensuel</h2>
          <p className="text-muted text-sm mb-6 max-w-xs">
            Le classement mensuel est réservé aux abonnés ALL ACCESS.
          </p>
          <a href="/subscribe?plan=all_access" className="btn-gold">
            Passer à ALL ACCESS →
          </a>
        </div>
      </AppLayout>
    )
  }

  useEffect(() => {
    async function load() {
      setLoading(true)

      // Récupérer le top 20 XP du mois en cours pour la langue sélectionnée
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data } = await supabase
        .from('lingua_progress')
        .select(`
          xp_points, current_level, streak_days,
          lingua_users ( full_name )
        `)
        .eq('language', lang)
        .order('xp_points', { ascending: false })
        .limit(20)

      setLeaders(data || DEMO_LEADERS)
      setLoading(false)
    }
    load()
  }, [lang])

  const l = LANGUAGES[lang]

  return (
    <AppLayout>
      <p className="section-label">Classement</p>
      <h1 className="font-serif text-3xl text-white mb-2">
        Leaderboard <em className="text-gold">Mensuel</em>
      </h1>
      <p className="text-muted text-sm mb-8">
        Les meilleurs apprenants du mois — classés par XP.
      </p>

      {/* Sélecteur de langue */}
      <div className="flex gap-2 mb-8">
        {Object.values(LANGUAGES).map(lg => (
          <button key={lg.code} onClick={() => setLang(lg.code)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded transition-all border
              ${lang === lg.code
                ? 'bg-gold text-dark border-gold font-semibold'
                : 'bg-card border-white/8 text-muted hover:text-white'}`}>
            {lg.flag} {lg.name}
          </button>
        ))}
      </div>

      {/* Podium top 3 */}
      {!loading && leaders.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-10">
          {/* 2ème */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-card border-2 border-muted flex items-center justify-center text-2xl mb-2">
              🥈
            </div>
            <div className="text-sm font-medium text-white text-center">
              {leaders[1]?.lingua_users?.full_name?.split(' ')[0] || 'Anonyme'}
            </div>
            <div className="font-mono text-xs text-muted">{leaders[1]?.xp_points?.toLocaleString()} XP</div>
            <div className="w-20 bg-muted/30 rounded-t mt-2" style={{ height: '80px' }} />
          </div>

          {/* 1er */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-card border-2 border-gold flex items-center justify-center text-3xl mb-2 shadow-[0_0_20px_rgba(232,148,26,0.3)]">
              🥇
            </div>
            <div className="text-base font-semibold text-gold text-center">
              {leaders[0]?.lingua_users?.full_name?.split(' ')[0] || 'Anonyme'}
            </div>
            <div className="font-mono text-xs text-gold">{leaders[0]?.xp_points?.toLocaleString()} XP</div>
            <div className="w-24 bg-gold/30 rounded-t mt-2" style={{ height: '120px' }} />
          </div>

          {/* 3ème */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-card border-2 border-amber-600/50 flex items-center justify-center text-xl mb-2">
              🥉
            </div>
            <div className="text-sm font-medium text-white text-center">
              {leaders[2]?.lingua_users?.full_name?.split(' ')[0] || 'Anonyme'}
            </div>
            <div className="font-mono text-xs text-muted">{leaders[2]?.xp_points?.toLocaleString()} XP</div>
            <div className="w-18 bg-amber-800/30 rounded-t mt-2" style={{ height: '60px' }} />
          </div>
        </div>
      )}

      {/* Liste complète */}
      {loading ? (
        <div className="text-center py-10 text-gold font-mono text-xs tracking-widest animate-pulse">CHARGEMENT...</div>
      ) : (
        <div className="space-y-2">
          {leaders.map((entry, i) => {
            const isMe = entry.lingua_users?.full_name === linguaUser?.full_name
            return (
              <div key={i}
                className={`flex items-center gap-4 px-5 py-4 rounded-sm border transition-all
                  ${isMe
                    ? 'bg-gold/10 border-gold/30'
                    : 'bg-card border-[#1E3A5F] hover:border-gold/20'}`}>

                {/* Rang */}
                <div className={`w-8 text-center font-mono text-sm font-bold flex-shrink-0
                  ${i === 0 ? 'text-gold' : i === 1 ? 'text-muted' : i === 2 ? 'text-amber-600' : 'text-muted/50'}`}>
                  {i + 1}
                </div>

                {/* Médaille podium */}
                <span className="flex-shrink-0 text-lg">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  '}
                </span>

                {/* Nom + badge moi */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">
                      {entry.lingua_users?.full_name || 'Anonyme'}
                    </span>
                    {isMe && (
                      <span className="font-mono text-[8px] tracking-[0.15em] bg-gold/15 border border-gold/30 text-gold px-1.5 py-0.5">
                        MOI
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-mono text-[10px] text-gold">{entry.current_level}</span>
                    {entry.streak_days > 0 && (
                      <span className="text-[10px] text-muted">🔥 {entry.streak_days}j</span>
                    )}
                  </div>
                </div>

                {/* XP */}
                <div className="flex-shrink-0 text-right">
                  <div className="font-serif text-lg text-gold">{entry.xp_points?.toLocaleString()}</div>
                  <div className="font-mono text-[9px] text-muted uppercase tracking-wider">XP</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Note de mise à jour */}
      <p className="text-center text-xs text-muted mt-6">
        🔄 Classement mis à jour en temps réel · Remis à zéro le 1er de chaque mois
      </p>
    </AppLayout>
  )
}

const DEMO_LEADERS = [
  { xp_points: 4850, current_level: 'B2', streak_days: 32, lingua_users: { full_name: 'Konan Yao' } },
  { xp_points: 3920, current_level: 'B1', streak_days: 21, lingua_users: { full_name: 'Aminata Diallo' } },
  { xp_points: 3400, current_level: 'B2', streak_days: 18, lingua_users: { full_name: 'Jean-Claude Brou' } },
  { xp_points: 2780, current_level: 'A2', streak_days: 15, lingua_users: { full_name: 'Fatou Coulibaly' } },
  { xp_points: 2100, current_level: 'B1', streak_days: 9,  lingua_users: { full_name: 'Ibrahim Touré' } },
]
