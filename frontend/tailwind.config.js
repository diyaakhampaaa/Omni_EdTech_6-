/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        // Lexend — designed to improve reading speed and comprehension.
        // Falls back to the system UI font stack if it fails to load.
        sans: [
          '"Lexend"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50: "#eefaf9",
          100: "#d3f1ee",
          200: "#a7e3dd",
          300: "#72cec5",
          400: "#3fb0a5",
          500: "#26948a",
          600: "#1c766f",
          700: "#1a5f5a",
          800: "#194c48",
          900: "#173f3c",
        },
      },
      fontSize: {
        // High-contrast / low-vision friendly scale used by Visual Mode reader
        "reader-base": ["1.125rem", "1.9"],
        "reader-lg": ["1.375rem", "1.9"],
        "reader-xl": ["1.75rem", "1.9"],
      },
    },
  },
  plugins: [],
};