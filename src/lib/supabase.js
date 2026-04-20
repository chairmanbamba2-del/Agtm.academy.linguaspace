import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error('Variables Supabase manquantes. Vérifiez votre fichier .env')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// ─── Helpers Lingua Users ──────────────────────────────────

export async function getLinguaUser(authId) {
  const { data, error } = await supabase
    .from('lingua_users')
    .select('*')
    .eq('id', authId)
    .single()
  if (error) throw error
  return data
}

export async function getSubscription(userId) {
  const { data, error } = await supabase
    .from('lingua_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function getProgress(userId) {
  const { data, error } = await supabase
    .from('lingua_progress')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data ?? []
}

export async function getModules(language, level = null) {
  let query = supabase
    .from('lingua_modules')
    .select('*')
    .eq('language', language)
    .eq('is_published', true)
    .order('order_num')

  if (level) query = query.eq('level', level)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getCornerContent(language, limit = 10) {
  const { data, error } = await supabase
    .from('lingua_content')
    .select('*')
    .eq('language', language)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function updateProgress(userId, language, updates) {
  const { error } = await supabase
    .from('lingua_progress')
    .upsert({ user_id: userId, language, ...updates }, { onConflict: 'user_id,language' })
  if (error) throw error
}

export async function markModuleComplete(userId, moduleId, score) {
  const { error } = await supabase
    .from('lingua_module_progress')
    .upsert({
      user_id: userId,
      module_id: moduleId,
      status: 'completed',
      score,
      completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,module_id' })
  if (error) throw error
}
