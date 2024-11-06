/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        main: '#060D16',
        secondary: '#061018',
        third: '#151e29',
        inputcolor: '#1e2c3c',
        black: '#000000',
        highlight: '#fffffff5',
        bcolor: '#15202C',

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
    font: {
      mono: ['Roboto Mono', 'monospace'],
      regular: ['regular', 'sans-serif'],
      boldy: ['boldy', 'sans-serif'],
      special: ['special', 'sans-serif'],
    },
    fontFamily: {
      regular: ['regular'],
      special: ['special'],
      boldy: ['boldy'],
      mono: 'Roboto Mono',
    },
  },
  plugins: [],
};
