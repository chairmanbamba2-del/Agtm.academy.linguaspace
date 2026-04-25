import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, getModules, markModuleComplete, updateProgress } from '../lib/supabase'
import { XP_PER_LEVEL, nextLevel } from '../lib/utils'
import { CEFR_LEVELS } from '../lib/constants'

export function useModules(lang, level = null) {
  return useQuery({
    queryKey: ['modules', lang, level],
    queryFn: () => getModules(lang, level),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    placeholderData: (previousData) => previousData,
  })
}

export function useModule(id) {
  return useQuery({
    queryKey: ['module', id],
    queryFn: async () => {
      const { data } = await supabase.from('lingua_modules').select('*').eq('id', id).single()
      return data
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    enabled: !!id,
  })
}

export function useModuleProgress(userId) {
  return useQuery({
    queryKey: ['moduleProgress', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data } = await supabase.from('lingua_module_progress').select('*').eq('user_id', userId)
      return data ?? []
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    enabled: !!userId,
  })
}

export function useCompleteModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, moduleId, score, lang, xpPoints, modulesCompleted, currentLevel }) => {
      await markModuleComplete(userId, moduleId, score)

      const levelIdx = CEFR_LEVELS.indexOf(currentLevel)
      const next = levelIdx < CEFR_LEVELS.length - 1 ? CEFR_LEVELS[levelIdx + 1] : null
      const xpNeeded = next ? XP_PER_LEVEL[currentLevel] : Infinity
      const newLevel = xpPoints >= xpNeeded && next ? next : currentLevel

      await updateProgress(userId, lang, {
        xp_points: xpPoints,
        modules_completed: modulesCompleted,
        current_level: newLevel,
        last_activity_at: new Date().toISOString(),
      })
    },
    onSuccess: (_, { userId, lang }) => {
      queryClient.invalidateQueries({ queryKey: ['moduleProgress', userId] })
      queryClient.invalidateQueries({ queryKey: ['module', 'progress'] })
    },
  })
}
