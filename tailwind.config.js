/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clay: {
          black: '#0B0E09',
          bg: '#10140D',
          recessed: '#0B0E09',
          surface: '#171D12',
          raised: '#1D2517',
          elevated: '#252E1D',
          highlight: '#303A25',
          border: 'rgba(255, 255, 255, 0.055)',
          'border-active': 'rgba(113, 130, 91, 0.35)',
        },
        olive: {
          deep: '#39482B',
          muted: '#4C5D38',
          accent: '#8EA66B',
        },
        sage: {
          DEFAULT: '#71825B',
          light: '#A4B18A',
        },
        ivory: {
          warm: '#E4E7D8',
          cta: '#D9DDCB',
        },
        dark: {
          bg: '#0B0E09',
          deep: '#10140D',
          secondary: '#171D12',
          surface: '#1D2517',
          elevated: '#252E1D',
          metallic: '#303A25',
          950: '#0B0E09',
          900: '#10140D',
          850: '#171D12',
          800: '#1D2517',
          750: '#252E1D',
          700: '#303A25',
        },
        brand: {
          primary: '#A4B18A',
          secondary: '#D9DDCB',
          chrome: '#E4E7D8',
          'chrome-light': '#F1F2E9',
          mineral: '#71825B',
          'mineral-deep': '#39482B',
          ore: '#8EA66B',
          champagne: '#D9DDCB',
          500: '#A4B18A',
          400: '#8EA66B',
          600: '#71825B',
          glow: 'rgba(164, 177, 138, 0.12)'
        },
        txt: {
          primary: '#F1F2E9',
          secondary: '#C0C6B2',
          muted: '#858E78',
        },
        status: {
          warning: '#8EA66B',
          critical: '#5A3D34',
          info: '#71825B',
          success: '#A4B18A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      borderColor: {
        subtle: 'rgba(255, 255, 255, 0.055)',
        strong: 'rgba(255, 255, 255, 0.12)',
        chrome: 'rgba(228, 231, 216, 0.25)',
        mineral: 'rgba(113, 130, 91, 0.35)',
        ore: 'rgba(142, 166, 107, 0.35)',
      },
      boxShadow: {
        'clay-raised': '0 14px 35px rgba(0, 0, 0, 0.38), inset 0 1px 1px rgba(255, 255, 255, 0.055), inset 0 -2px 4px rgba(0, 0, 0, 0.30)',
        'clay-recessed': 'inset 0 5px 14px rgba(0, 0, 0, 0.32), inset 0 -1px 1px rgba(255, 255, 255, 0.025)',
        'clay-pressed': 'inset 0 3px 8px rgba(0, 0, 0, 0.38)',
        'chrome-glow': '0 0 15px -3px rgba(228, 231, 216, 0.15)',
        'mineral-glow': '0 0 15px -3px rgba(113, 130, 91, 0.20)',
        'ore-glow': '0 0 15px -3px rgba(142, 166, 107, 0.20)',
        'floating-panel': '0 18px 45px -10px rgba(0, 0, 0, 0.90)',
      }
    },
  },
  plugins: [],
}


