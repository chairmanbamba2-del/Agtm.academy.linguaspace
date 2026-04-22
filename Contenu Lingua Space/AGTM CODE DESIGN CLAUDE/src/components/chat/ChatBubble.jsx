/**
 * ChatBubble — bulle de conversation pour l'assistant IA
 */
export default function ChatBubble({ message, isAI = false, isLoading = false }) {
  return (
    <div className={`flex items-end gap-2 ${isAI ? 'justify-start' : 'justify-end'}`}>

      {/* Avatar IA */}
      {isAI && (
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
             style={{ background: 'linear-gradient(135deg, #E8941A, #1B4F8A)' }}>
          🤖
        </div>
      )}

      {/* Bulle */}
      <div className={`
        max-w-[78%] px-4 py-3 text-sm leading-relaxed
        ${isAI
          ? 'bg-blue/20 border border-blue/30 text-white rounded-tl-sm rounded-tr-xl rounded-br-xl rounded-bl-xl'
          : 'bg-gold/15 border border-gold/20 text-white rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-xl'
        }
      `}>
        {isLoading ? (
          /* Indicateur de frappe */
          <div className="flex gap-1 py-0.5">
            {[0, 1, 2].map(i => (
              <div key={i}
                className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          /* Contenu du message avec mise en forme légère */
          <div className="whitespace-pre-wrap">
            {message.split(/(\[Correction:.*?\])/g).map((part, i) => {
              if (part.startsWith('[Correction:')) {
                return (
                  <span key={i} className="block mt-2 text-xs bg-green-900/30 border border-green-500/30 text-green-300 px-2 py-1 rounded">
                    ✏️ {part.replace('[Correction:', '').replace(']', '')}
                  </span>
                )
              }
              return <span key={i}>{part}</span>
            })}
          </div>
        )}
      </div>
    </div>
  )
}
