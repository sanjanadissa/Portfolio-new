/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'projects-bg': 'hsl(var(--projects-bg))',
        'projects-text': 'hsl(var(--projects-text))',
        'projects-subtext': 'hsl(var(--projects-subtext))',
        'card-bg': 'hsl(var(--card-bg))',
        'card-border': 'hsl(var(--card-border))',
      },
    },
  },
  plugins: [],
}

