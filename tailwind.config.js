/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'constru-primary': {
          DEFAULT: 'rgb(var(--color-forest) / <alpha-value>)',
          hover: 'rgb(var(--color-forest-hover) / <alpha-value>)',
          light: '#29563f',
        },
        'constru-accent': {
          DEFAULT: 'rgb(var(--color-leaf) / <alpha-value>)',
          hover: 'rgb(var(--color-leaf-hover) / <alpha-value>)',
          light: '#80d456',
        },
        'constru-offwhite': 'rgb(var(--color-mist) / <alpha-value>)',
        'constru-dark': 'rgb(var(--color-ink) / <alpha-value>)',
        'constru-ink': 'rgb(var(--color-ink) / <alpha-value>)',
        'constru-muted': 'rgb(var(--color-muted) / <alpha-value>)',
        'constru-mist': 'rgb(var(--color-mist) / <alpha-value>)',
        'constru-line': 'rgb(var(--color-line) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

