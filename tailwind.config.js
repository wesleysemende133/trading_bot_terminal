/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tv: {
          bg: '#131722',
          panel: '#1e222d',
          border: '#2a2e39',
          text: '#d1d4dc',
          green: '#089981',
          red: '#f23645',
          blue: '#2962ff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
