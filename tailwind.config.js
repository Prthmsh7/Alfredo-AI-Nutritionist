/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          500: '#FD6F24',
        },
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        yellow: {
          200: '#F1F3C2',
        },
      },
      boxShadow: {
        'solid-sm': '2px 2px 0px 0px rgba(0, 0, 0, 1)',
        'solid': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
        'solid-lg': '6px 6px 0px 0px rgba(0, 0, 0, 1)',
        'solid-xl': '8px 8px 0px 0px rgba(0, 0, 0, 1)',
        'solid-2xl': '12px 12px 0px 0px rgba(0, 0, 0, 1)',
      },
      animation: {
        'pulse-orange': 'pulse-orange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce-gentle 1s ease-in-out infinite',
      },
      keyframes: {
        'pulse-orange': {
          '0%, 100%': {
            opacity: '1',
            backgroundColor: '#FD6F24',
          },
          '50%': {
            opacity: '.8',
            backgroundColor: '#FF8A4A',
          },
        },
        'bounce-gentle': {
          '0%, 100%': {
            transform: 'translateY(-5%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
    },
  },
  plugins: [],
};