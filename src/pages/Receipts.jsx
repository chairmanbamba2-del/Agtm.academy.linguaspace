// ============================================================
// Receipts.jsx — Historique des reçus de l'utilisateur
// Route : /receipts
// ============================================================
import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { useUserStore } from '../store/userStore'
import { getUserReceipts } from '../lib/certification'
import { formatDate, formatNumber } from '../lib/utils'

const TYPE_LABELS = {
  subscription: 'Abonnement',
  certificate:  'Certificat',
  test:         'Test de niveau',
  refund:       'Remboursement',
}

const PAY_LABELS = {
  orange_money: '🟠 Orange Money',
  wave:         '🔵 Wave',
  mtn:          '🟡 MTN MoMo',
  card:         '💳 Carte bancaire',
  flutterwave:  '🌍 Flutterwave',
}

export default function Receipts() {
  const user = useUserStore(s => s.user)
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!user) return
    getUserReceipts(user.id).then(data => {
      setReceipts(data)
      setLoading(false)
    })
  }, [user])

  const totalSpent = receipts.reduce((s, r) => s + r.amount_fcfa, 0)

  return (
    <AppLayout>
      <div className="font-mono text-[10px] tracking-widest text-gold uppercase mb-1">Historique</div>
      <h1 className="font-serif text-3xl text-white mb-8">
        Mes <em className="text-gold italic">Reçus</em>
      </h1>

      {/* Résumé */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="text-2xl mb-2">🧾</div>
          <div className="font-serif text-2xl text-gold">{receipts.length}</div>
          <div className="text-xs text-muted mt-1 font-mono tracking-wider uppercase">Reçus émis</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl mb-2">💵</div>
          <div className="font-serif text-2xl text-gold">{formatNumber(totalSpent)}</div>
          <div className="text-xs text-muted mt-1 font-mono tracking-wider uppercase">FCFA total dépensé</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl mb-2">📅</div>
          <div className="font-serif text-2xl text-gold">
            {receipts[0] ? new Date(receipts[0].transaction_date).getFullYear() : '—'}
          </div>
          <div className="text-xs text-muted mt-1 font-mono tracking-wider uppercase">Depuis</div>
        </div>
      </div>

      {/* Liste des reçus */}
      {loading ? (
        <div className="text-center py-10 text-gold font-mono text-xs tracking-widest animate-pulse">CHARGEMENT...</div>
      ) : receipts.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">🧾</div>
          <p className="text-muted text-sm">Aucun reçu disponible pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {receipts.map(r => (
            <div key={r.id}
              className="card p-5 flex items-center gap-4 hover:border-gold/30 transition-all cursor-pointer"
              onClick={() => setSelected(selected === r.id ? null : r.id)}>

              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-lg flex-shrink-0">
                {r.type === 'subscription' ? '📋' : r.type === 'certificate' ? '🎓' : '📝'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs text-gold">{r.receipt_number}</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border"
                    style={{ background:'rgba(232,148,26,0.1)', borderColor:'rgba(232,148,26,0.25)', color:'#E8941A' }}>
                    {TYPE_LABELS[r.type] || r.type}
                  </span>
                </div>
                <div className="text-sm text-white truncate">{r.description}</div>
                <div className="text-xs text-muted mt-0.5">{formatDate(r.transaction_date)} · {PAY_LABELS[r.payment_method] || r.payment_method}</div>
              </div>

              <div className="flex-shrink-0 text-right">
                <div className="font-serif text-lg text-green-400">+{formatNumber(r.amount_fcfa)} FCFA</div>
                <div className="font-mono text-[9px] text-green-400/60">CONFIRMÉ</div>
              </div>

              {r.receipt_pdf_url && (
                <a href={r.receipt_pdf_url} target="_blank" rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex-shrink-0 py-1.5 px-3 border border-white/15 text-white text-xs rounded-sm hover:border-gold/40 transition-all">
                  PDF ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}