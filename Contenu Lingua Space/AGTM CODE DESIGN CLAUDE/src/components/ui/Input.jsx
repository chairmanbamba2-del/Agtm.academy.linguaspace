/**
 * Input — champ de saisie universel
 *
 * Usage :
 *   <Input label="Email" type="email" value={v} onChange={fn} />
 *   <Input label="Mot de passe" type="password" error="Requis" />
 */
export default function Input({
  label,
  type       = 'text',
  value,
  onChange,
  placeholder,
  error,
  hint,
  required   = false,
  disabled   = false,
  icon       = null,
  className  = '',
  ...rest
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase flex items-center gap-1">
          {label}
          {required && <span className="text-gold">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full bg-dark text-white text-sm px-4 py-3 rounded
            border transition-colors
            placeholder:text-white/20
            focus:outline-none focus:ring-1
            disabled:opacity-40 disabled:cursor-not-allowed
            ${icon ? 'pl-9' : ''}
            ${error
              ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
              : 'border-white/10 focus:border-gold/50 focus:ring-gold/10'
            }
          `}
          {...rest}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span>{error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  )
}
