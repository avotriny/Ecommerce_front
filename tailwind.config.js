/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding:'15px',
    },
    screen: {
      sm:'640px',
      md:'768px',
      lg:'960px',
      xl:'1200px',
    },
    
    extend: {
      colors: {
        primary: '#1c1c22',
        secondary: '#f0f0f0',
        accent:{
          DEFAULT:'#00ff99',
          hover:'#00e187'
        }
      }
    },
  },
  plugins: [],
}
