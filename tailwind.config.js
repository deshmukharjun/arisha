/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgDark: "#121212",
        cardDark: "#1e1e1e",
        grayText: "#9ca3af",
        highlight: "#facc15", // yellow-400
      },
      fontFamily: {
        // Overriding the default 'sans' font to use Poppins
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
