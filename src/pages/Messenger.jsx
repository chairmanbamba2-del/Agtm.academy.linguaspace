import { useState, useEffect, useRef } from 'react'
import { useUserStore } from '../store/userStore'
import { supabase } from '../lib/supabase'
import AppLayout from '../components/layout/AppLayout'
import MasterCard from '../components/ui/MasterCard'
import Spinner from '../components/ui/Spinner'

export default function Messenger() {
  const user = useUserStore(s => s.user)
  const linguaUser = useUserStore(s => s.linguaUser)

  const [conversations, setConversations] = useState([])
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newConv, setNewConv] = useState(false)

  const chatEnd = useRef(null)
  const isAdmin = useUserStore(s => s.isAdmin)

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    loadConversations()
    loadContacts()
    const sub = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lingua_messages', filter: `receiver_id=eq.${user.id}` }, () => loadConversations())
      .subscribe()
    return () => sub.unsubscribe()
  }, [])

  useEffect(() => {
    if (selectedContact) loadMessages(selectedContact)
  }, [selectedContact])

  async function loadConversations() {
    const { data } = await supabase
      .from('lingua_messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    if (!data) return
    const pairs = new Map()
    data.forEach(m => {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id
      if (!pairs.has(otherId) || new Date(m.created_at) > new Date(pairs.get(otherId).created_at)) {
        pairs.set(otherId, m)
      }
    })
    setConversations(Array.from(pairs.values()))
  }

  async function loadContacts() {
    const { data } = await supabase
      .from('lingua_users')
      .select('id, full_name, email, role')
    if (data) setContacts(data.filter(c => c.id !== user.id))
  }

  async function loadMessages(otherId) {
    const { data } = await supabase
      .from('lingua_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setLoading(false)

    const unread = (data || []).filter(m => m.receiver_id === user.id && !m.read_at)
    if (unread.length > 0) {
      await supabase.from('lingua_messages').update({ read_at: new Date().toISOString() }).in('id', unread.map(m => m.id))
    }
  }

  async function sendMessage() {
    if (!input.trim() || !selectedContact || sending) return
    setSending(true)
    const { error } = await supabase.from('lingua_messages').insert({
      sender_id: user.id,
      receiver_id: selectedContact,
      subject: subject || '(sans objet)',
      body: input,
    })
    if (!error) {
      setInput('')
      setSubject('')
      loadMessages(selectedContact)
      loadConversations()
    }
    setSending(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  function getContactName(id) {
    const c = contacts.find(x => x.id === id)
    return c?.full_name || c?.email || id.slice(0, 8)
  }

  function getUnreadCount(conv) {
    return messages.filter(m => m.receiver_id === user.id && !m.read_at).length
  }

  if (!user) return null

  return (
    <AppLayout>
      <div className="flex h-[calc(100dvh-80px)] max-h-[880px] gap-3">
        {/* Liste conversations */}
        <div className="w-72 flex-shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-serif text-xl text-white">Messagerie</h1>
            <button onClick={() => { setNewConv(true); setSelectedContact(null) }}
              className="text-xs px-3 py-1.5 bg-gold/20 text-gold rounded-sm hover:bg-gold/30">+</button>
          </div>
          <MasterCard variant="content" padding="sm" className="flex-1 overflow-y-auto sidebar-scrollbar">
            {newConv && (
              <div className="mb-3 p-2 bg-white/5 rounded-sm">
                <p className="text-xs text-muted mb-2">Nouvelle conversation</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {contacts.filter(c => !conversations.find(conv => {
                    const other = conv.sender_id === user.id ? conv.receiver_id : conv.sender_id
                    return other === c.id
                  })).map(c => (
                    <button key={c.id} onClick={() => { setSelectedContact(c.id); setNewConv(false); setSubject('') }}
                      className="block w-full text-left text-xs px-2 py-1.5 text-white hover:bg-white/5 rounded-sm">
                      {c.full_name || c.email}
                    </button>
                  ))}
                </div>
                <button onClick={() => setNewConv(false)} className="text-xs text-muted mt-2">Annuler</button>
              </div>
            )}
            {conversations.map(conv => {
              const otherId = conv.sender_id === user.id ? conv.receiver_id : conv.sender_id
              const unread = messages.filter(m => m.receiver_id === user.id && !m.read_at).length
              return (
                <button key={conv.id} onClick={() => { setSelectedContact(otherId); setNewConv(false) }}
                  className={`block w-full text-left px-3 py-2 rounded-sm mb-1 transition-all ${selectedContact === otherId ? 'bg-gold/15 border-l-2 border-gold' : 'hover:bg-white/5'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white truncate">{getContactName(otherId)}</span>
                    {unread > 0 && <span className="text-[9px] bg-gold text-dark px-1.5 py-0.5 rounded-full font-bold">{unread}</span>}
                  </div>
                  <p className="text-[10px] text-muted truncate mt-0.5">{conv.subject}</p>
                </button>
              )
            })}
            {conversations.length === 0 && !newConv && (
              <p className="text-xs text-muted text-center py-8">Aucune conversation</p>
            )}
          </MasterCard>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-white">{getContactName(selectedContact)}</span>
                <span className="text-[10px] text-muted">
                  {contacts.find(c => c.id === selectedContact)?.role === 'admin' ? '(Admin)' : '(Utilisateur)'}
                </span>
              </div>
              <MasterCard variant="content" padding="sm" className="flex-1 overflow-y-auto sidebar-scrollbar mb-2">
                {loading ? (
                  <div className="flex items-center justify-center h-full"><Spinner size="sm" /></div>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-muted text-center py-8">Aucun message. Commencez la conversation !</p>
                ) : (
                  <div className="space-y-3">
                    {messages.map(m => {
                      const isMe = m.sender_id === user.id
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${isMe
                            ? 'bg-gold/15 text-white rounded-2xl rounded-br-sm border border-gold/20'
                            : 'bg-white/5 text-white rounded-2xl rounded-bl-sm border border-white/10'}`}>
                            {m.subject && m.subject !== '(sans objet)' && (
                              <p className="text-[10px] text-muted font-medium mb-1">{m.subject}</p>
                            )}
                            {m.body}
                            <p className={`text-[9px] mt-1.5 ${isMe ? 'text-gold/50 text-right' : 'text-muted/50'}`}>
                              {new Date(m.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              {m.read_at && isMe && <span className="ml-2">✓ Lu</span>}
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
                  placeholder="Sujet (optionnel)" className="w-28 text-xs bg-transparent text-white/70 border border-white/10 rounded-sm px-2 py-2 focus:outline-none focus:border-gold/30"
                  style={{ background: 'rgba(255,255,255,0.03)' }} />
                <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Votre message… (Entrée pour envoyer)" rows={1}
                  className="flex-1 text-sm text-white resize-none focus:outline-none"
                  style={{ background: 'transparent', border: 'none', color: '#FAFAF8', minHeight: '44px', padding: '0.65rem 0.5rem', caretColor: '#E8941A' }} />
                <button onClick={sendMessage} disabled={!input.trim() || sending}
                  className="flex-shrink-0 w-11 h-11 rounded-card flex items-center justify-center text-dark font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: input.trim() && !sending ? 'linear-gradient(135deg, #E8941A, #F5B942)' : 'rgba(232,148,26,0.2)' }}>
                  {sending ? <span className="w-4 h-4 border-2 border-dark/40 border-t-dark rounded-full" style={{ animation: 'spin-slow 0.8s linear infinite' }} /> : '↑'}
                </button>
              </MasterCard>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted text-sm">
              Sélectionnez une conversation ou créez-en une nouvelle
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
