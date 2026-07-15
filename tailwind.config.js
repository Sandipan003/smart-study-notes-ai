/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#07090D', // Obsidian Ink
          elevated: '#0D1117', // Deep Graphite
          surface: '#121820', // Carbon Slate
          soft: '#171E27', // Soft Elevated
        },
        brand: {
          primary: '#62F6C5', // Electric Mint
          secondary: '#F5C76B', // Luminous Amber
          tertiary: '#9FAEFF', // Soft Periwinkle
        },
        feedback: {
          success: '#63E6A7',
          warning: '#F5C76B',
          error: '#FF7373',
          info: '#79A8FF',
        },
        text: {
          primary: '#F5F7FA',
          secondary: '#A7B0BE',
          muted: '#697386',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.08)',
        strong: 'rgba(255,255,255,0.14)',
      },
      boxShadow: {
        'layer-1': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'layer-2': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        'layer-3': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        'layer-4': '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        'inner-highlight': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
