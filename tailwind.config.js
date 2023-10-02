/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // background colors
        // ADRENA Style
        main: '#171717',
        secondary: '#1E1D1D',
        third: '#343232',
        highlight: '#36538f', // RED: #C43152

        // text
        txtfade: '#8C8D97',
        txtregular: '#E5E6E8',

        light: 'var(--color-light)',
        dark: 'var(--color-dark)',

        gray: {
          200: 'var(--color-gray-200)',
          300: 'var(--color-gray-300)',
          400: 'var(--color-gray-400)',
          500: 'var(--color-gray-500)',
        },
        blue: {
          200: 'var(--color-blue-200)',
          300: 'var(--color-blue-300)',
          400: 'var(--color-blue-400)',
          500: 'var(--color-blue-500)',
        },
        red: {
          200: 'var(--color-red-200)',
          300: 'var(--color-red-300)',
          400: 'var(--color-red-400)',
          500: 'var(--color-red-500)',
        },
      },
    },
    font: {
      mono: ['JetBrains Mono', 'sans-serif'],
    },

    fontFamily: {
      regular: ['regular'],
      thin: ['thin'],
      bold: ['bold'],
      mono: 'JetBrains Mono',

      specialmonster: ['specialmonster'],
    },
  },
  plugins: [],
};
