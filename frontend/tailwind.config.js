/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Public Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Trail blue - the Job Quest primary colour
        brand: {
          50: '#eff4ff', 100: '#dbe6ff', 200: '#bdd0ff', 300: '#91afff', 400: '#6086fb',
          500: '#3a62ee', 600: '#2748d6', 700: '#1f39ae', 800: '#1d3189', 900: '#1b2b6b',
        },
        // Marigold - used sparingly for highlights and featured badges
        accent: { 50: '#fff8eb', 100: '#ffeccc', 400: '#fbb83c', 500: '#f59e0b', 600: '#d97706' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.05), 0 1px 3px rgba(15,23,42,0.06)',
        lift: '0 8px 24px -8px rgba(31,57,174,0.25)',
      },
    },
  },
  plugins: [],
};
