/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf8ee',
          100: '#faefd0',
          200: '#f5dfa0',
          300: '#efc96a',
          400: '#e8b43a',
          500: '#c9a227',
          600: '#a8841a',
          700: '#7d6213',
          800: '#52400d',
          900: '#2a2106',
        }
      },
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      }
    }
  },
  plugins: []
}