/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#1a0533',
          primary: '#7c3aed',
          secondary: '#a78bfa',
          mint: '#ddd6fe',
          rose: '#0f0520',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: []
}