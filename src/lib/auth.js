import { supabase } from './supabase'

// ─── Inscription ─────────────────────────────────────────
// Le trigger Supabase crée lingua_users automatiquement
// NE PAS insérer manuellement dans lingua_users ici
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