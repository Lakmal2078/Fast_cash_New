/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#08121f',
        deep: '#0d1f3c',
        xblue: '#1e5be8',
        bright: '#3a7fff',
        xgold: '#f5c518',
        xgreen: '#00e87a',
        muted: '#6a87b0',
        xgray: '#d0dcf0',
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        teko: ['Teko', 'sans-serif'],
        sinhala: ['Noto Sans Sinhala', 'sans-serif'],
      },
      animation: {
        blink: 'blink 1.2s ease-in-out infinite',
        ticker: 'ticker 20s linear infinite',
        spin: 'spin 6s linear infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        slideUp: 'slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
        fadeIn: 'fadeIn 0.6s ease-out both',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.15' },
        },
        ticker: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        slideUp: {
          from: { transform: 'translateY(110%)' },
          to: { transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
