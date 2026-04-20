import { useEffect } from 'react'
import { useUserStore } from '../store/userStore'
import { supabase, getProgress } from '../lib/supabase'

/**
 * useStreak — Met à jour automatiquement le streak quotidien
 * À appeler depuis Dashboard ou AppLayout
 */
export function useStreak() {
  const user     = useUserStore(s => s.user)
  const progress = useUserStore(s => s.progress)
  const setProgress = useUserStore(s => s.setProgress)

  useEffect(() => {
    if (!user || progress.length === 0) return

    async function checkAndUpdateStreak() {
      const today     = new Date()
      const todayStr  = today.toISOString().split('T')[0]

      for (const prog of progress) {
        if (!prog.last_activity_at) continue

        const lastDate = new Date(prog.last_activity_at).toISOString().split('T')[0]
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        let newStreak = prog.streak_days || 0

        if (lastDate === todayStr) {
          // Déjà actif aujourd'hui → rien à faire
          continue
        } else if (lastDate === yesterdayStr) {
          // Actif hier → incrémenter le streak
          newStreak = (prog.streak_days || 0) + 1
        } else {
          // Rupture du streak
          newStreak = 0
        }

        if (newStreak !== prog.streak_days) {
          await supabase
            .from('lingua_progress')
            .update({ streak_days: newStreak })
            .eq('user_id', user.id)
            .eq('language', prog.language)
        }
      }

      // Rafraîchir le state
      const updated = await getProgress(user.id)
      setProgress(updated)
    }

    checkAndUpdateStreak()
  }, [user?.id])
}

/**
 * recordActivity — à appeler après toute activité (module, quiz, chat IA)
 * Met à jour last_activity_at et recalcule le streak
 */
export async function recordActivity(userId, language, currentProgress) {
  const today    = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const lastDate = currentProgress?.last_activity_at
    ? new Date(currentProgress.last_activity_at).toISOString().split('T')[0]
    : null

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let streak = currentProgress?.streak_days || 0

  if (lastDate === todayStr) {
    // Déjà actif aujourd'hui → streak inchangé
  } else if (lastDate === yesterdayStr || lastDate === null) {
    // Premier accès du jour → +1
    streak = streak + 1
  } else {
    // Rupture → repartir à 1
    streak = 1
  }

  await supabase
    .from('lingua_progress')
    .upsert({
      user_id:         userId,
      language,
      streak_days:     streak,
      last_activity_at: today.toISOString(),
    }, { onConflict: 'user_id,language' })

  return streak
}
