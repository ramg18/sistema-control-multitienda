/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: '#0b1120',
          border: '#1e2d45',
          text: '#94a3b8',
          active: '#10b981',
          hover: '#1e2d45'
        },
        brand: {
          primary: '#0f172a',
          emerald: '#10b981',
          rose: '#f43f5e'
        }
      }
    },
  },
  // Desactivamos el preflight de Tailwind para no romper
  // los headings globales y botones que ya tienes diseñados en styles.scss
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
