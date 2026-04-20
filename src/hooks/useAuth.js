import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { supabase, getLinguaUser, getSubscription, getProgress } from '../lib/supabase'
import { signOut } from '../lib/auth'

// Charge le profil complet de l'utilisateur connecté
export function useProfile() {
  const { user, setLinguaUser, setSubscription, setProgress } = useUserStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }

    async function loadProfile() {
      try {
        const [linguaUser, subscription, progress] = await Promise.all([
          getLinguaUser(user.id),
          getSubscription(user.id),
          getProgress(user.id)
        ])
        setLinguaUser(linguaUser)
        setSubscription(subscription)
        setProgress(progress)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  return { loading, error }
}

// Hook de déconnexion
export function useSignOut() {
  const navigate = useNavigate()
  const reset = useUserStore(s => s.reset)

  return async () => {
    await signOut()
    reset()
    navigate('/')
  }
}
