/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'newyorker-red': '#D32F2F',
        'newyorker-dark': '#1A1A1A',
        'newyorker-gray': '#F5F5F5',
        'newyorker-text': '#333333',
        'newyorker-light-gray': '#E0E0E0',
      },
      fontFamily: {
        'serif': ['Georgia', 'Times New Roman', 'serif'],
        'sans': ['Helvetica Neue', 'Arial', 'sans-serif'],
        'display': ['Didot', 'Bodoni MT', 'serif'],
      },
      maxWidth: {
        'article': '65ch',
        'content': '1200px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 