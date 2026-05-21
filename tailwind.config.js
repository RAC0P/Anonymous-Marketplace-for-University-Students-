/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '28px',
      },
      boxShadow: {
        'soft': '0 10px 30px -10px rgb(0 0 0 / 0.08)',
        'modern': '0 20px 50px -15px rgb(91 74 247 / 0.15)',
        'glow': '0 0 0 4px rgba(91, 74, 247, 0.15)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) both',
      }
    },
  },
  plugins: [],
}
