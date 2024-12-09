/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        main: '#121114',
        mainDark: '#18181C',
        secondary: '#111113',
        third: '#23252E',
        inputcolor: '#18181C',
        black: '#000000',
        highlight: '#fffffff5',
        bcolor: '#1D1C23',

        // text
        txtfade: '#858789',
        light: 'var(--color-light)',

        green: '#07956B',
        red: '#C9243A',
        redbright: '#ff344e',
        orange: '#f77f00',
        blue: '#3a86ff',
      },
      fontSize: {
        xxs: '0.6rem', // Extra Extra Small
        xs: '0.65rem', // Extra Small
        sm: '0.75rem', // Small
        base: '0.875rem', // Base
        lg: '1rem', // Large
        xl: '1.125rem', // Extra Large
        '2xl': '1.25rem', // 2 Extra Large
        '3xl': '1.5rem', // 3 Extra Large
        '4xl': '1.875rem', // 4 Extra Large
        '5xl': '2.25rem', // 5 Extra Large
        '6xl': '2.625rem', // 6 Extra Large
      },
    },
    keyframes: {
      'text-shimmer': {
        from: { backgroundPosition: '0 0' },
        to: { backgroundPosition: '-200% 0' },
      },
    },

    animation: {
      'text-shimmer': 'text-shimmer 4s ease-out infinite alternate',
    },
    font: {
      mono: ['Roboto Mono', 'monospace'],
      regular: ['regular', 'sans-serif'],
      boldy: ['boldy', 'sans-serif'],
      special: ['special', 'sans-serif'],
      archivo: ['Archivo Black', 'sans-serif'],
    },
    fontFamily: {
      regular: ['regular'],
      special: ['special'],
      boldy: ['boldy'],
      mono: 'Roboto Mono',
      archivo: 'Archivo Black',
    },
  },
  plugins: [],
};
