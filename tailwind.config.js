/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#3730A3",   // Deep Indigo
          accent: "#F97316",    // Coral
          bg: "#F8F7F4",        // Cream bg
          dark: "#1C1917",      // Near-black
          muted: "#78716C",     // Muted warm gray
          success: "#16A34A",
          warning: "#D97706",
          danger: "#DC2626",
        }
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
        'input': '8px',
      }
    },
  },
  plugins: [],
}
