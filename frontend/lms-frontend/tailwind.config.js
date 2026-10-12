/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        primary: { DEFAULT: '#2563eb', dark: '#1d4ed8', light: '#eff6ff' },
        secondary: '#7c3aed',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        navy: { DEFAULT: '#0b1226', 800: '#111a33', 700: '#1a2547' },
      },
    },
  },
  plugins: [],
};
