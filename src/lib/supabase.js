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
  try {
    const { data, error } = await supabase
      .from('lingua_users')
      .select('*')
      .eq('id', authId)
      .single()
    
    if (!error) {
      return data
    }
    
    // Si l'utilisateur n'existe pas dans lingua_users, le créer
    if (error.code === 'PGRST116') {
      // Récupérer les infos de l'utilisateur auth
      const { data: authUser } = await supabase.auth.getUser()
      if (!authUser?.user) {
        console.warn('Utilisateur auth non trouvé pour', authId)
        return null
      }
      
      // Créer l'entrée dans lingua_users avec rôle par défaut 'user'
      // On utilise insert avec ignoreDuplicates pour éviter d'écraser un rôle existant
      const { error: insertError } = await supabase
        .from('lingua_users')
        .insert({
          id: authId,
          email: authUser.user.email,
          full_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || 'Utilisateur',
          phone: authUser.user.user_metadata?.phone || null,
          country: authUser.user.user_metadata?.country || 'CI',
          role: 'user'
        })
        .select()
        .single()
      
      // Si l'insert échoue à cause d'un conflit (utilisateur existe déjà), on récupère l'entrée existante
      if (insertError && insertError.code !== '23505') { // 23505 = unique_violation (déjà existant)
        console.error('Erreur création lingua_users:', insertError)
        return null
      }
      
      // Dans tous les cas, récupérer l'utilisateur (nouveau ou existant)
      const { data: existingUser, error: selectError } = await supabase
        .from('lingua_users')
        .select('*')
        .eq('id', authId)
        .single()
      
      if (selectError) {
        console.error('Erreur récupération lingua_users après création:', selectError)
        return null
      }
      return existingUser
    }
    
    console.error('Erreur getLinguaUser:', error)
    return null
  } catch (err) {
    console.error('Exception getLinguaUser:', err)
    return null
  }
}

export async function getSubscription(userId) {
  try {
    const { data, error } = await supabase
      .from('lingua_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null  // No subscription found
      }
      // For 406 errors, try without .single() as fallback
      if (error.message && error.message.includes('406')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('lingua_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
        
        if (fallbackError) {
          return null
        }
        return fallbackData && fallbackData.length > 0 ? fallbackData[0] : null
      }
      // Pour toute autre erreur, retourner null au lieu de propager
      return null
    }
    
    return data
  } catch (err) {
    return null
  }
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

export async function updateNativeLanguage(userId, language) {
  const { error } = await supabase
    .from('lingua_users')
    .update({ native_language: language })
    .eq('id', userId)
  if (error) console.error('Erreur mise à jour native_language:', error)
  return !error
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
