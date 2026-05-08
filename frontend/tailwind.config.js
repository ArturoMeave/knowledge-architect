/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blueprint-blue': '#0052cc', // El azul de los botones de Stich
        'blueprint-bg': '#f8f9f9',   // El blanco roto de fondo
        'blueprint-grid': '#e5e7eb', // El color de las líneas de la rejilla
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'], 
      },
    },
  },
  plugins: [],
}