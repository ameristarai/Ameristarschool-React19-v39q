/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan for class names.
  // At build time it reads every file listed here, finds every Tailwind class
  // used, and includes only those classes in the final CSS bundle.
  // Result: ~5-20 KB of CSS instead of the ~400 KB CDN download.
  content: [
    './index.html',
    './**/*.{ts,tsx}',
    '!./node_modules/**',
    '!./dist/**',
  ],

  theme: {
    extend: {

      // ── Typography ──────────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        serif:   ['Playfair Display', 'serif'],
        display: ['Playfair Display', 'serif'],
      },

      // ── Letter spacing ──────────────────────────────────────────
      letterSpacing: {
        luxury: '0.3em',
      },

      // ── Brand colours ───────────────────────────────────────────
      colors: {
        obsidian:         '#000000',
        paper:            '#ffffff',
        oxford:           '#1e293b',   // Deep blue-grey
        champagne:        '#C5A065',   // Metallic gold
        'champagne-light':'#f3e5ab',
        brand: {
          navy: '#001A35',
          gold: '#D4AF37',
        },
      },

      // ── Animations ──────────────────────────────────────────────
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

    },
  },

  plugins: [],
};
