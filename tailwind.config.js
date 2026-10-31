/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#100B19',
          50: '#2A1F3D',
          100: '#241A35',
          200: '#1D142B',
          300: '#171022',
          400: '#130D1E',
          500: '#100B19', // Primary background
          600: '#0C0813',
          700: '#09060E',
          800: '#06040A',
          900: '#030205',
          surface: '#181226',
          card: '#1F1731',
          border: '#2E2246',
          muted: '#261C39'
        },
        arcane: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#6D28D9',
          glow: 'rgba(139, 92, 246, 0.35)',
        },
        potion: {
          DEFAULT: '#FF8A32',
          light: '#FFA665',
          dark: '#E06A14',
          glow: 'rgba(255, 138, 50, 0.35)',
        },
        enchanted: {
          DEFAULT: '#78D66B',
          light: '#98E28F',
          dark: '#58B84B',
          glow: 'rgba(120, 214, 107, 0.35)',
        },
        curse: {
          DEFAULT: '#FF5268',
          light: '#FF7B8C',
          dark: '#D93247',
          glow: 'rgba(255, 82, 104, 0.35)',
        },
        moonlight: {
          DEFAULT: '#F3EBDD',
          muted: '#C4B8A5',
          dark: '#938774',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'Cinzel Decorative', 'Cinzel Decorative', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'arcane-sm': '0 0 15px rgba(139, 92, 246, 0.2)',
        'arcane-md': '0 0 25px rgba(139, 92, 246, 0.35)',
        'arcane-lg': '0 0 45px rgba(139, 92, 246, 0.45)',
        'potion-glow': '0 0 25px rgba(255, 138, 50, 0.35)',
        'curse-glow': '0 0 25px rgba(255, 82, 104, 0.35)',
        'enchanted-glow': '0 0 25px rgba(120, 214, 107, 0.35)',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(var(--tw-gradient-stops))',
        'arcane-mesh': 'radial-gradient(circle at 15% 15%, rgba(139, 92, 246, 0.15) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(255, 138, 50, 0.1) 0%, transparent 40%)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-violet': 'glowViolet 4s ease-in-out infinite alternate',
      },
      keyframes: {
        glowViolet: {
          '0%': { boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.45)' },
        }
      }
    },
  },
  plugins: [],
}
