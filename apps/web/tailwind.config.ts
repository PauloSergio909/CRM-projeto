/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],

  theme: {
    extend: {
      colors: {
        cb: {
          primary: '#2563EB',
          success: '#22C55E',
          danger: '#EF4444',
          warning: '#F59E0B',
          neutral: '#64748B',
          bg: '#F8FAFC',
          sidebar: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
