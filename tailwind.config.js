/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B00',
        secondary: '#1a3a5c',
        accent: '#138808',
        danger: '#991b1b',
        gold: '#c8952a',
      },
      fontFamily: {
        hindi: ['"Tiro Devanagari Hindi"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        heading: ['"Playfair Display"', 'serif'],
      }
    },
  },
  plugins: [],
}
