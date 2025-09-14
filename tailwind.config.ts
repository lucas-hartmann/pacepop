import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: 'hsl(var(--accent))',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(90deg, var(--accent-from), var(--accent-to))',
      },
      boxShadow: {
        focus: '0 0 0 3px rgba(255, 138, 0, 0.35)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 400ms ease-out both',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [
    function ({ addVariant }: any) {
      addVariant('hocus', ['&:hover', '&:focus']);
    },
  ],
}

export default config

