/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'red': {
          950: '#450a0a',
        },
        'champagne': {
          DEFAULT: '#DAA520',
          light: '#F7DC6F',
          dark: '#B8860B',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flag-wave': 'flagWave 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'shimmer-text': 'shimmerText 3s ease-in-out infinite',
      },
      keyframes: {
        flagWave: {
          '0%, 100%': { 
            transform: 'perspective(400px) rotateY(0deg) rotateX(0deg)',
            filter: 'brightness(1)'
          },
          '25%': { 
            transform: 'perspective(400px) rotateY(2deg) rotateX(1deg)',
            filter: 'brightness(1.1)'
          },
          '50%': { 
            transform: 'perspective(400px) rotateY(0deg) rotateX(2deg)',
            filter: 'brightness(1.2)'
          },
          '75%': { 
            transform: 'perspective(400px) rotateY(-2deg) rotateX(1deg)',
            filter: 'brightness(1.1)'
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        shimmerText: {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            textShadow: '0 0 10px rgba(218, 165, 32, 0.5)'
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            textShadow: '0 0 20px rgba(247, 220, 111, 0.8), 0 0 30px rgba(218, 165, 32, 0.6)'
          },
        },
      },
      backgroundSize: {
        'size-200': '200% 200%',
      },
    },
  },
  plugins: [],
};