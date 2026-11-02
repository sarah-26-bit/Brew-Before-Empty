/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Emerald & Deep Forest Palette
        midnight: {
          DEFAULT: '#101713', // Midnight Charcoal
          surface: '#17251D', // Deep Forest
          card: '#1B2C23',    // Elevated Forest Card
          border: '#263C30',  // Muted Forest Border
          hover: '#22382C',
          900: '#0C120F',
          800: '#101713',
          700: '#17251D',
          600: '#1D3025',
          500: '#263C30',
        },
        forest: {
          DEFAULT: '#17251D',
          dark: '#101713',
          card: '#1B2C23',
          border: '#273F32',
          light: '#253D30',
        },
        // Flat aliases ensuring reliable PostCSS / @apply resolution
        'forest-border': '#273F32',
        'forest-card': '#1B2C23',
        'forest-dark': '#101713',
        'forest-light': '#253D30',
        'midnight-surface': '#17251D',
        'midnight-card': '#1B2C23',
        'midnight-border': '#263C30',
        'deep-forest': '#17251D',
        'warm-ivory': '#F3F0E6',
        'antique-gold': '#C5A46D',
        'sage-green': '#A6B99B',
        'moonlight-muted': '#C8C4B7',

        emerald: {
          DEFAULT: '#237A57',
          hover: '#2A8F66',
          light: '#36A87A',
          dark: '#195B40',
          glow: 'rgba(35, 122, 87, 0.35)',
        },
        sage: {
          DEFAULT: '#A6B99B',
          light: '#BDCEB3',
          dark: '#7D9571',
        },
        gold: {
          DEFAULT: '#C5A46D', // Antique Gold
          light: '#DFCA9F',
          dark: '#9F7E49',
          glow: 'rgba(197, 164, 109, 0.35)',
        },
        ivory: {
          DEFAULT: '#F3F0E6', // Warm Ivory
          muted: '#C8C4B7',
          dark: '#938F83',
        },
        amber: {
          DEFAULT: '#E9A23B', // Warning Amber
          light: '#F4B760',
          dark: '#B8781B',
          glow: 'rgba(233, 162, 59, 0.35)',
        },
        critical: {
          DEFAULT: '#D65C56', // Critical Red
          light: '#E27974',
          dark: '#A83B36',
          glow: 'rgba(214, 92, 86, 0.35)',
        },
        // Aliases for seamless component compatibility
        arcane: {
          DEFAULT: '#237A57', // Mapped to Emerald
          light: '#36A87A',
          dark: '#195B40',
          glow: 'rgba(35, 122, 87, 0.35)',
        },
        potion: {
          DEFAULT: '#C5A46D', // Mapped to Antique Gold
          light: '#DFCA9F',
          dark: '#9F7E49',
          glow: 'rgba(197, 164, 109, 0.35)',
        },
        enchanted: {
          DEFAULT: '#237A57',
          light: '#A6B99B',
          dark: '#195B40',
          glow: 'rgba(35, 122, 87, 0.35)',
        },
        curse: {
          DEFAULT: '#D65C56', // Critical Red
          light: '#E27974',
          dark: '#A83B36',
          glow: 'rgba(214, 92, 86, 0.35)',
        },
        moonlight: {
          DEFAULT: '#F3F0E6',
          muted: '#C8C4B7',
          dark: '#938F83',
        }
      },
      borderColor: ({ theme }) => ({
        DEFAULT: '#263C30',
        ...theme('colors'),
        'forest-border': '#273F32',
        'midnight-border': '#263C30',
      }),
      fontFamily: {
        serif: ['Cinzel', 'Cinzel Decorative', 'Georgia', 'serif'],
        display: ['Cinzel', 'Cinzel Decorative', 'Georgia', 'serif'],
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'emerald-sm': '0 0 15px rgba(35, 122, 87, 0.25)',
        'emerald-md': '0 0 25px rgba(35, 122, 87, 0.35)',
        'gold-sm': '0 0 15px rgba(197, 164, 109, 0.25)',
        'gold-md': '0 0 25px rgba(197, 164, 109, 0.35)',
        'gold-glow': '0 0 30px rgba(197, 164, 109, 0.35)',
        'critical-glow': '0 0 25px rgba(214, 92, 86, 0.35)',
        'amber-glow': '0 0 25px rgba(233, 162, 59, 0.35)',
        'botanical-card': '0 8px 32px 0 rgba(16, 23, 19, 0.6)',
      },
      backgroundImage: {
        'forest-gradient': 'linear-gradient(135deg, #17251D 0%, #101713 100%)',
        'emerald-mesh': 'radial-gradient(circle at 15% 15%, rgba(35, 122, 87, 0.18) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(197, 164, 109, 0.12) 0%, transparent 45%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent, rgba(197, 164, 109, 0.2), transparent)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gold-pulse': 'goldPulse 3s ease-in-out infinite',
      },
      keyframes: {
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(197, 164, 109, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(197, 164, 109, 0.45)' },
        }
      }
    },
  },
  plugins: [],
}
