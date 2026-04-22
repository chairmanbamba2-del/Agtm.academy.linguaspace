import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useUserStore } from '../store/userStore'
import { useProfile } from '../hooks/useAuth'
import { useSignOut } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { supabase } from '../lib/supabase'
import { LANGUAGES, PLANS } from '../lib/constants'
import MasterCard, { LevelBadge } from '../components/ui/MasterCard'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Settings() {
  useProfile()
  const linguaUser    = useUserStore(s => s.linguaUser)
  const signOut       = useSignOut()
  const { subscription, isPremium, isActive, daysLeft } = useSubscription()
  const [msg, setMsg] = useState('')

  async function cancelSubscription() {
    if (!window.confirm('Voulez-vous vraiment résilier votre abonnement ?')) return
    await supabase.from('lingua_subscriptions')
      .update({ auto_renew: false })
      .eq('id', subscription.id)
    setMsg('Abonnement résilié. Il restera actif jusqu\'à la fin de la période.')
  }

  const plan = subscription ? PLANS[subscription.plan_type] : null

  return (
    <AppLayout>
      <p className="section-label">Paramètres</p>
      <h1 className="font-serif text-3xl text-white mb-8">Mon <em className="text-gold">Compte</em></h1>

      {msg && (
        <div className="bg-green-900/30 border border-green-500/30 text-green-300 text-sm px-4 py-3 rounded mb-6">
          {msg}
        </div>
      )}

      {/* Infos compte */}
      <MasterCard variant="content" padding="lg" className="mb-6">
        <h2 className="font-serif text-lg text-white mb-4">Informations personnelles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted font-mono tracking-widest uppercase mb-1">Nom complet</p>
            <p className="text-white text-sm">{linguaUser?.full_name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted font-mono tracking-widest uppercase mb-1">Email</p>
            <p className="text-white text-sm">{linguaUser?.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted font-mono tracking-widest uppercase mb-1">Téléphone</p>
            <p className="text-white text-sm">{linguaUser?.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted font-mono tracking-widest uppercase mb-1">Pays</p>
            <p className="text-white text-sm">{linguaUser?.country || 'CI'}</p>
          </div>
        </div>
      </MasterCard>

      {/* Abonnement */}
      <MasterCard variant="content" padding="lg" className="mb-6">
        <h2 className="font-serif text-lg text-white mb-4">Mon abonnement</h2>

        {isActive && plan ? (
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] tracking-[0.2em] bg-gold/15 border border-gold/30 text-gold px-2 py-0.5">ACTIF</span>
                  {isPremium && <span className="font-mono text-[10px] tracking-[0.2em] bg-blue/20 border border-blue/40 text-blue-300 px-2 py-0.5">ALL ACCESS</span>}
                </div>
                <h3 className="font-serif text-xl text-gold">{plan.name}</h3>
                {subscription.selected_language && (
                  <p className="text-sm text-muted mt-0.5">
                    Langue : {LANGUAGES[subscription.selected_language]?.flag} {LANGUAGES[subscription.selected_language]?.name}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="font-serif text-2xl text-gold">{plan.price.toLocaleString()}</div>
                <div className="text-xs text-muted">FCFA / mois</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-dark rounded p-3">
                <p className="text-xs text-muted mb-1">Expire le</p>
                <p className="text-sm text-white font-medium">
                  {subscription.expires_at
                    ? format(new Date(subscription.expires_at), 'd MMMM yyyy', { locale: fr })
                    : '—'}
                </p>
                {daysLeft <= 7 && <p className="text-xs text-gold mt-0.5">⚠️ {daysLeft} jours restants</p>}
              </div>
              <div className="bg-dark rounded p-3">
                <p className="text-xs text-muted mb-1">Renouvellement auto</p>
                <p className="text-sm text-white">{subscription.auto_renew ? '✓ Activé' : '✗ Désactivé'}</p>
              </div>
            </div>

            <div className="flex gap-3">
              {!isPremium && (
                <Link to="/subscribe?plan=all_access" className="btn-gold flex-1 text-center text-sm">
                  Passer à ALL ACCESS →
                </Link>
              )}
              {subscription.auto_renew && (
                <button onClick={cancelSubscription} className="btn-outline flex-1 text-sm text-center text-red-400 border-red-400/30 hover:border-red-400/60">
                  Résilier l'abonnement
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted text-sm mb-4">Vous n'avez pas d'abonnement actif.</p>
            <Link to="/subscribe" className="btn-gold">Choisir un forfait →</Link>
          </div>
        )}
      </MasterCard>

      {/* Danger zone */}
      <MasterCard variant="content" padding="lg" className="border border-red-500/20">
        <h2 className="font-serif text-lg text-white mb-4">Zone sensible</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={signOut} className="btn-outline text-sm border-white/20 hover:border-white/40">
            🚪 Se déconnecter
          </button>
        </div>
      </MasterCard>
    </AppLayout>
  )
}
