/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 500ms ease'
      },
      boxShadow: {
        'sm2': '0 3px 6px 0 rgb(0 0 0 / 0.1)',
      },
      colors: {
        'lightorange': '#E59700',
        'gray': {
          150: '#eaecef'
        }
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: 0,
          },
          '100%': {
            opacity: 1
          }
        }
      }
    },
  },
  plugins: [],
}

