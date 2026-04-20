/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:    '#0D2D52',
        blue:    '#1B4F8A',
        gold:    '#E8941A',
        'gold-lt': '#F5B942',
        dark:    '#080F1A',
        card:    '#132540',
        muted:   '#8A9AB5',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans:  ['DM Sans', 'sans-serif'],
        mono:  ['Space Mono', 'monospace'],
      }
    }
  },
  plugins: []
}
