/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0e17",
        surface: {
          50: "#182234",
          100: "#131c2e",
          200: "#0f172a",
          300: "#0b1120",
          400: "#080d19",
        },
        border: {
          subtle: "#1e293b",
          DEFAULT: "#26354a",
          highlight: "#3b4d66"
        },
        brand: {
          blue: "#38bdf8",
          amber: "#f59e0b",
          red: "#ef4444",
          emerald: "#10b981",
          purple: "#8b5cf6"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}

