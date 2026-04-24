import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import AppLayout from '../../components/layout/AppLayout'
import MasterCard from '../../components/ui/MasterCard'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../lib/utils'

export default function AdminInbox() {
  const [conversations, setConversations] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sendingToAll, setSendingToAll] = useState(false)
  const [broadcastSubject, setBroadcastSubject] = useState('')
  const [broadcastBody, setBroadcastBody] = useState('')
  const [showBroadcast, setShowBroadcast] = useState(false)
  const chatEnd = useRef(null)

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    loadUsers()
    const sub = supabase
      .channel('admin-inbox')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lingua_messages' }, () => {
        if (selectedUserId) loadMessages(selectedUserId)
        loadConversations()
      })
      .subscribe()
    return () => sub.unsubscribe()
  }, [])

  useEffect(() => {
    if (selectedUserId) loadMessages(selectedUserId)
  }, [selectedUserId])

  async function loadUsers() {
    const { data } = await supabase.from('lingua_users').select('id, full_name, email').order('full_name')
    if (data) {
      setUsers(data)
      setLoading(false)
    }
  }

  async function loadConversations() {
    const { data } = await supabase
      .from('lingua_messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (!data) return
    const pairs = new Map()
    data.forEach(m => {
      const otherId = m.sender_id
      const adminId = m.receiver_id
      const key = `${adminId}-${otherId}`
      if (!pairs.has(key) || new Date(m.created_at) > new Date(pairs.get(key).created_at)) {
        pairs.set(key, m)
      }
    })
    setConversations(Array.from(pairs.values()))
  }

  async function loadMessages(userId) {
    const { data } = await supabase
      .from('lingua_messages')
      .select('*')
      .or(`and(sender_id.eq.${userId}),and(receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])

    const unread = (data || []).filter(m => m.receiver_id === selectedUserId && !m.read_at)
    if (unread.length > 0) {
      await supabase.from('lingua_messages').update({ read_at: new Date().toISOString() }).in('id', unread.map(m => m.id))
    }
  }

  function getAdminId() {
    const admin = users.find(u => u.id === selectedUserId)
    return null
  }

  async function sendAsAdmin() {
    if (!input.trim() || !selectedUserId || sending) return
    setSending(true)
    const adminUser = (await supabase.auth.getSession()).data.session?.user
    if (!adminUser) return
    await supabase.from('lingua_messages').insert({
      sender_id: adminUser.id,
      receiver_id: selectedUserId,
      subject: subject || 'Réponse support',
      body: input,
    })
    setInput('')
    setSubject('')
    loadMessages(selectedUserId)
    loadConversations()
    setSending(false)
  }

  async function broadcastToAll() {
    if (!broadcastBody.trim() || sendingToAll) return
    setSendingToAll(true)
    const adminUser = (await supabase.auth.getSession()).data.session?.user
    if (!adminUser) return
    const filtered = users.filter(u => !u.id.includes('admin'))
    for (const u of filtered) {
      await supabase.from('lingua_messages').insert({
        sender_id: adminUser.id,
        receiver_id: u.id,
        subject: broadcastSubject || 'Information LINGUA SPACE',
        body: broadcastBody,
      })
    }
    setBroadcastBody('')
    setBroadcastSubject('')
    setShowBroadcast(false)
    setSendingToAll(false)
  }

  function getUserName(id) {
    const u = users.find(x => x.id === id)
    return u?.full_name || u?.email || id.slice(0, 8)
  }

  function getUnreadForUser(userId) {
    return messages.filter(m => m.sender_id === userId && !m.read_at).length
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAsAdmin() }
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100dvh-80px)] max-h-[880px] gap-3">
        {/* Sidebar utilisateurs */}
        <div className="w-72 flex-shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-serif text-xl text-white">Boîte de réception</h1>
            <button onClick={() => setShowBroadcast(!showBroadcast)}
              className="text-xs px-3 py-1.5 bg-blue/20 text-blue rounded-sm hover:bg-blue/30">📢 Broadcast</button>
          </div>

          {showBroadcast && (
            <MasterCard variant="content" padding="sm" className="mb-2">
              <p className="text-xs text-muted mb-2">Diffuser un message à tous les utilisateurs</p>
              <input type="text" value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)}
                placeholder="Sujet" className="w-full text-xs bg-transparent text-white border border-white/10 rounded-sm px-2 py-1.5 mb-2 focus:outline-none focus:border-gold/30" />
              <textarea value={broadcastBody} onChange={e => setBroadcastBody(e.target.value)}
                placeholder="Votre message…" rows={3}
                className="w-full text-xs bg-transparent text-white border border-white/10 rounded-sm px-2 py-1.5 mb-2 focus:outline-none focus:border-gold/30 resize-none" />
              <div className="flex gap-2">
                <button onClick={broadcastToAll} disabled={!broadcastBody.trim() || sendingToAll}
                  className="text-xs px-3 py-1.5 bg-gold/20 text-gold rounded-sm hover:bg-gold/30 disabled:opacity-30">
                  {sendingToAll ? 'Envoi...' : 'Envoyer à tous'}
                </button>
                <button onClick={() => setShowBroadcast(false)} className="text-xs px-3 py-1.5 bg-white/5 text-muted rounded-sm">Annuler</button>
              </div>
            </MasterCard>
          )}

          <MasterCard variant="content" padding="sm" className="flex-1 overflow-y-auto sidebar-scrollbar">
            {users.map(u => (
              <button key={u.id} onClick={() => { setSelectedUserId(u.id); loadConversations() }}
                className={`block w-full text-left px-3 py-2 rounded-sm mb-0.5 transition-all ${selectedUserId === u.id ? 'bg-gold/15 border-l-2 border-gold' : 'hover:bg-white/5'}`}>
                <span className="text-sm text-white truncate block">{u.full_name || u.email}</span>
                <span className="text-[9px] text-muted">{u.email}</span>
              </button>
            ))}
            {users.length === 0 && <p className="text-xs text-muted text-center py-8">Aucun utilisateur</p>}
          </MasterCard>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col">
          {selectedUserId ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-white">{getUserName(selectedUserId)}</span>
                <span className="text-[9px] text-muted bg-white/5 px-2 py-0.5 rounded-sm">Utilisateur</span>
              </div>
              <MasterCard variant="content" padding="sm" className="flex-1 overflow-y-auto sidebar-scrollbar mb-2">
                {messages.length === 0 ? (
                  <p className="text-xs text-muted text-center py-8">Aucun message avec cet utilisateur</p>
                ) : (
                  <div className="space-y-3">
                    {messages.map(m => {
                      const isAdmin = users.find(u => u.id === m.sender_id)?.role === 'admin'
                      return (
                        <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${isAdmin
                            ? 'bg-gold/15 text-white rounded-2xl rounded-br-sm border border-gold/20'
                            : 'bg-white/5 text-white rounded-2xl rounded-bl-sm border border-white/10'}`}>
                            {m.subject && m.subject !== '(sans objet)' && (
                              <p className="text-[10px] text-muted font-medium mb-1">{m.subject}</p>
                            )}
                            {m.body}
                            <p className={`text-[9px] mt-1.5 ${isAdmin ? 'text-gold/50 text-right' : 'text-muted/50'}`}>
                              {new Date(m.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={chatEnd} />
                  </div>
                )}
              </MasterCard>
              <MasterCard variant="action" padding="none" className="flex gap-2 p-2">
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Sujet" className="w-24 text-xs bg-transparent text-white/70 border border-white/10 rounded-sm px-2 py-2 focus:outline-none focus:border-gold/30"
                  style={{ background: 'rgba(255,255,255,0.03)' }} />
                <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Réponse… (Entrée pour envoyer)" rows={1}
                  className="flex-1 text-sm text-white resize-none focus:outline-none"
                  style={{ background: 'transparent', border: 'none', color: '#FAFAF8', minHeight: '44px', padding: '0.65rem 0.5rem', caretColor: '#E8941A' }} />
                <button onClick={sendAsAdmin} disabled={!input.trim() || sending}
                  className="flex-shrink-0 w-11 h-11 rounded-card flex items-center justify-center text-dark font-bold text-lg disabled:opacity-30"
                  style={{ background: input.trim() && !sending ? 'linear-gradient(135deg, #E8941A, #F5B942)' : 'rgba(232,148,26,0.2)' }}>
                  {sending ? <span className="w-4 h-4 border-2 border-dark/40 border-t-dark rounded-full animate-spin" /> : '↑'}
                </button>
              </MasterCard>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted text-sm">
              Sélectionnez un utilisateur pour voir ses messages
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
