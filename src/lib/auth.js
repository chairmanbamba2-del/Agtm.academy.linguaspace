import { supabase } from './supabase'

// ─── Inscription ─────────────────────────────────────────
export async function signUp({ email, password, fullName, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone:     phone || null,
        country:   'CI',
      }
    }
  })
  if (error) throw error
  
  // Créer l'entrée dans lingua_users si elle n'existe pas déjà
  if (data.user) {
    try {
      await supabase.from('lingua_users').upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        phone: phone || null,
        country: 'CI',
        role: 'user' // rôle par défaut
      }, { onConflict: 'id' })
    } catch (err) {
      console.warn('Erreur création profil lingua_users:', err.message)
      // Ne pas bloquer l'inscription si ça échoue
    }
  }
  
  return data
}

// ─── Connexion ───────────────────────────────────────────
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

// ─── Déconnexion ─────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ─── Réinitialisation mot de passe ───────────────────────
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${import.meta.env.VITE_APP_URL}/update-password`
  })
  if (error) throw error
}

// ─── Messages d'erreur en français ───────────────────────
export function authErrorMessage(error) {
  const msg = error?.message || ''
  if (msg.includes('Invalid login credentials'))
    return 'Email ou mot de passe incorrect.'
  if (msg.includes('Email not confirmed'))
    return 'Confirmez votre email avant de vous connecter.'
  if (msg.includes('User already registered'))
    return 'Un compte existe déjà avec cet email.'
  if (msg.includes('Password should be'))
    return 'Le mot de passe doit contenir au moins 6 caractères.'
  if (msg.includes('rate limit'))
    return 'Trop de tentatives. Attendez quelques minutes.'
  return error?.message || 'Une erreur est survenue.'
}