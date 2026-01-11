/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg1: '#0B0618',
        bg2: '#190C3D',
        bg3: '#2A145A',
        card: 'rgba(255,255,255,0.06)',
        'card-border': 'rgba(255,255,255,0.12)',
        text: '#F4F1FF',
        muted: 'rgba(244,241,255,0.72)',
        accent: '#F2A14A',
        accent2: '#FFCE8A',
        glow: 'rgba(242,161,74,0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
