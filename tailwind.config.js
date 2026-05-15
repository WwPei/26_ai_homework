/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF0050',
        secondary: '#1677FF',
        sidebar: '#1A1A2E',
        'sidebar-dark': '#001529',
        background: '#F5F7FA',
      },
      borderRadius: {
        'xl': '12px',
      },
    },
  },
  plugins: [],
}