/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          950: '#060608',
          900: '#0B0B0F',
          850: '#111117',
          800: '#171720',
          750: '#1F1F2B',
          700: '#2A2A38',
          border: '#2E2E3E',
          red: {
            DEFAULT: '#E50914',
            light: '#FF2431',
            dark: '#B80710',
            glow: '#FF0033',
            deep: '#5C0509',
          },
          gold: '#FFB800',
        },
      },
      boxShadow: {
        '3d-red': '0 10px 25px -5px rgba(229, 9, 20, 0.4), 0 8px 10px -6px rgba(229, 9, 20, 0.2)',
        '3d-red-lg': '0 20px 35px -5px rgba(229, 9, 20, 0.5), 0 10px 15px -5px rgba(229, 9, 20, 0.3)',
        '3d-card': '0 12px 28px rgba(0, 0, 0, 0.7), 0 2px 4px rgba(255, 255, 255, 0.05) inset',
        '3d-card-hover': '0 20px 40px rgba(229, 9, 20, 0.25), 0 0 20px rgba(229, 9, 20, 0.15), 0 1px 1px rgba(255, 255, 255, 0.1) inset',
        'inner-glow': 'inset 0 0 20px rgba(229, 9, 20, 0.2)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s infinite',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.88', transform: 'scale(1.02)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
