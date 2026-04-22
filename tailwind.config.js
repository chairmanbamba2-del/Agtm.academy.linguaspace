/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {

      // ── Palette principale ───────────────────────────────────
      colors: {
        dark:      '#080F1A',
        navy:      '#0D2D52',
        blue:      '#1B4F8A',
        card:      '#0E1E35',
        'card-2':  '#111F38',
        bdr:       '#1E3A5F',
        'bdr-2':   '#253F66',
        gold:      '#E8941A',
        'gold-lt': '#F5B942',
        'gold-dk': '#C07010',
        'gold-glow':'rgba(232,148,26,0.25)',
        muted:     '#8A9AB5',
        'muted-2': '#6B7E99',
        white:     '#FAFAF8',
        green:     '#22C55E',

        // Couleurs identitaires par langue
        en: {
          DEFAULT: '#C8102E',
          light:   '#E84060',
          muted:   'rgba(200,16,46,0.15)',
        },
        es: {
          DEFAULT: '#F1BF00',
          light:   '#F7D340',
          muted:   'rgba(241,191,0,0.15)',
        },
        de: {
          DEFAULT: '#94A3B8',
          light:   '#B0BFCF',
          muted:   'rgba(148,163,184,0.15)',
        },
        fr: {
          DEFAULT: '#4A7FBF',
          light:   '#6B9FD4',
          muted:   'rgba(74,127,191,0.15)',
        },
      },

      // ── Typographie ─────────────────────────────────────────
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        mono:  ['Space Mono', 'Menlo', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        '3xs': ['0.5rem',   { lineHeight: '0.75rem' }],
      },

      letterSpacing: {
        'ultra':  '0.3em',
        'mega':   '0.5em',
      },

      // ── Ombres premium ──────────────────────────────────────
      boxShadow: {
        'card':         '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
        'card-hover':   '0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)',
        'gold':         '0 0 20px rgba(232,148,26,0.25)',
        'gold-sm':      '0 0 10px rgba(232,148,26,0.18)',
        'gold-lg':      '0 0 40px rgba(232,148,26,0.35)',
        'gold-btn':     '0 6px 24px rgba(232,148,26,0.35)',
        'gold-btn-hover':'0 10px 36px rgba(232,148,26,0.5)',
        'en':           '0 0 20px rgba(200,16,46,0.25)',
        'es':           '0 0 20px rgba(241,191,0,0.25)',
        'de':           '0 0 20px rgba(148,163,184,0.25)',
        'fr':           '0 0 20px rgba(74,127,191,0.25)',
        'glass':        '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        'inner-glow':   'inset 0 1px 0 rgba(255,255,255,0.08)',
        'sidebar':      '4px 0 24px rgba(0,0,0,0.5)',
        'navbar':       '0 1px 24px rgba(0,0,0,0.4)',
      },

      // ── Arrière-plans & gradients ────────────────────────────
      backgroundImage: {
        // Gradients de fond
        'lingua':       'linear-gradient(135deg, #080F1A 0%, #0D2D52 60%, #1B4F8A 100%)',
        'lingua-alt':   'linear-gradient(160deg, #080F1A 0%, #091525 50%, #0D2D52 100%)',
        'card-gradient':'linear-gradient(145deg, #0E1E35 0%, #0A1828 100%)',

        // Gradients gold
        'gold':         'linear-gradient(135deg, #E8941A 0%, #F5B942 100%)',
        'gold-subtle':  'linear-gradient(135deg, rgba(232,148,26,0.15) 0%, rgba(232,148,26,0.05) 100%)',

        // Gradients par langue
        'corner-en':    'linear-gradient(135deg, rgba(200,16,46,0.15) 0%, rgba(200,16,46,0.03) 100%)',
        'corner-es':    'linear-gradient(135deg, rgba(241,191,0,0.15) 0%, rgba(241,191,0,0.03) 100%)',
        'corner-de':    'linear-gradient(135deg, rgba(148,163,184,0.15) 0%, rgba(148,163,184,0.03) 100%)',
        'corner-fr':    'linear-gradient(135deg, rgba(74,127,191,0.15) 0%, rgba(74,127,191,0.03) 100%)',

        // Glassmorphism
        'glass':        'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'glass-dark':   'linear-gradient(135deg, rgba(13,45,82,0.4) 0%, rgba(8,15,26,0.6) 100%)',

        // Grille décorative
        'grid-gold':    'linear-gradient(rgba(232,148,26,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,148,26,0.04) 1px, transparent 1px)',

        // Noise (SVG inline)
        'noise':        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },

      backgroundSize: {
        'grid-60': '60px 60px',
      },

      // ── Backdrop blur ────────────────────────────────────────
      backdropBlur: {
        'xs':   '4px',
        'nav':  '20px',
        'card': '12px',
      },

      // ── Bordures ─────────────────────────────────────────────
      borderColor: {
        'glass':    'rgba(255,255,255,0.08)',
        'glass-2':  'rgba(255,255,255,0.04)',
        'gold-dim': 'rgba(232,148,26,0.20)',
        'gold-mid': 'rgba(232,148,26,0.35)',
      },

      // ── Animations & keyframes ───────────────────────────────
      keyframes: {
        // Pulsation lumineuse pour le glow
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(232,148,26,0.2)' },
          '50%':      { boxShadow: '0 0 30px rgba(232,148,26,0.5), 0 0 60px rgba(232,148,26,0.2)' },
        },
        // Float lent pour les éléments décoratifs
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        // Slide-in depuis la gauche (sidebar mobile)
        'slide-in-left': {
          '0%':   { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        // Fade + scale (apparition des cartes)
        'card-appear': {
          '0%':   { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0)   scale(1)' },
        },
        // Vague sonore (indicateur écoute IA)
        'sound-wave': {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%':      { transform: 'scaleY(1.0)' },
        },
        // Pulsation douce (synthèse vocale IA)
        'speak-pulse': {
          '0%, 100%': { transform: 'scale(1)',    opacity: '0.8' },
          '50%':      { transform: 'scale(1.08)', opacity: '1'   },
        },
        // Shimmer pour les skeleton loaders
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200%  0' },
        },
        // Typing dots pour l'IA
        'bounce-dot': {
          '0%, 100%': { transform: 'translateY(0)',    opacity: '0.4' },
          '50%':      { transform: 'translateY(-4px)', opacity: '1'   },
        },
        // Rotation douce pour les loaders
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // Barres fréquences audio asymétriques (AIVoiceWave)
        'wave-1': { '0%,100%': { transform: 'scaleY(0.3)' }, '50%': { transform: 'scaleY(1)'   } },
        'wave-2': { '0%,100%': { transform: 'scaleY(0.6)' }, '40%': { transform: 'scaleY(0.2)' }, '80%': { transform: 'scaleY(1)' } },
        'wave-3': { '0%,100%': { transform: 'scaleY(1)'   }, '30%': { transform: 'scaleY(0.3)' }, '70%': { transform: 'scaleY(0.8)' } },
        'wave-4': { '0%,100%': { transform: 'scaleY(0.4)' }, '60%': { transform: 'scaleY(1)'   } },
        'wave-5': { '0%,100%': { transform: 'scaleY(0.7)' }, '45%': { transform: 'scaleY(0.15)'}, '85%': { transform: 'scaleY(0.9)' } },
        // Halo pulsé pour avatar IA (PulseAvatar)
        'halo-idle':    { '0%,100%': { boxShadow: '0 0 8px  2px rgba(232,148,26,0.20)' }, '50%': { boxShadow: '0 0 18px 4px rgba(232,148,26,0.38)' } },
        'halo-thinking':{ '0%,100%': { boxShadow: '0 0 16px 4px rgba(232,148,26,0.45)' }, '50%': { boxShadow: '0 0 36px 8px rgba(232,148,26,0.70)' } },
        // Pop-in rebond entrée bulle (ElasticBubble)
        'pop-in': {
          '0%':   { opacity: '0', transform: 'scale(0.72) translateY(6px)' },
          '65%':  { transform: 'scale(1.04) translateY(-2px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        // Défilement de la grille (hero background)
        'grid-move': {
          '0%':   { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(60px)' },
        },
      },

      animation: {
        'glow-pulse':     'glow-pulse 3s ease-in-out infinite',
        'float':          'float 4s ease-in-out infinite',
        'slide-in-left':  'slide-in-left 0.3s ease-out forwards',
        'card-appear':    'card-appear 0.4s ease-out forwards',
        'sound-wave':     'sound-wave 0.8s ease-in-out infinite',
        'speak-pulse':    'speak-pulse 2s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'bounce-dot':     'bounce-dot 1.2s ease-in-out infinite',
        'spin-slow':      'spin-slow 3s linear infinite',
        'grid-move':      'grid-move 20s linear infinite',
        'wave-1':         'wave-1 0.9s ease-in-out infinite',
        'wave-2':         'wave-2 1.1s ease-in-out infinite',
        'wave-3':         'wave-3 0.7s ease-in-out infinite',
        'wave-4':         'wave-4 1.3s ease-in-out infinite',
        'wave-5':         'wave-5 1.0s ease-in-out infinite',
        'halo-idle':      'halo-idle 2.8s ease-in-out infinite',
        'halo-thinking':  'halo-thinking 1.1s ease-in-out infinite',
        'pop-in':         'pop-in 0.32s cubic-bezier(0.34,1.56,0.64,1) forwards',
      },

      // ── Transitions ──────────────────────────────────────────
      transitionTimingFunction: {
        'smooth':  'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring':  'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
      },

      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },

      // ── Espacement & dimensions ──────────────────────────────
      spacing: {
        '4.5':  '1.125rem',
        '13':   '3.25rem',
        '15':   '3.75rem',
        '18':   '4.5rem',
        '22':   '5.5rem',
        '68':   '17rem',
        '72':   '18rem',
      },

      width: {
        'sidebar':  '240px',
        'sidebar-sm': '72px',
      },

      height: {
        'navbar': '64px',
      },

      // ── Opacité ──────────────────────────────────────────────
      opacity: {
        '3':  '0.03',
        '6':  '0.06',
        '8':  '0.08',
        '12': '0.12',
        '15': '0.15',
        '35': '0.35',
        '65': '0.65',
        '85': '0.85',
      },

      // ── Border radius ────────────────────────────────────────
      borderRadius: {
        'card':  '10px',
        'pill':  '9999px',
      },

      // ── z-index ──────────────────────────────────────────────
      zIndex: {
        'sidebar': '60',
        'navbar':  '70',
        'overlay': '80',
        'modal':   '200',
        'toast':   '300',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
