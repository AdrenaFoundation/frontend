/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        main: '#060D16',
        secondary: '#061018',
        third: '#0B1420',
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
        purpleColor: '#9333ea',
        greenSide: '#64f58d',
        redSide: '#f56464',
        grayLabel: '#7e7d85',
        whiteLabel: '#e3e6ea',
        mutagen: '#ff47b5',
        mutagenDark: '#741e4c',
        mutagenBg: '#1a0a1f',
        mutagenShadow: '#ff47dbb3',
      },
      boxShadow: {
        mutagenBig: '0 0 24px 0 #ff47b5',
        mutagenHoverBig: '0 0 32px 0 #ff47b5',
        mutagenSmall: '0 0 12px 0 #ff47b5',
        mutagenHoverSmall: '0 0 16px 0 #ff47b5',
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
      // mono: ['Roboto Mono', 'monospace'],
      // regular: ['regular', 'sans-serif'],
      // boldy: ['boldy', 'sans-serif'],
      // interSemibold: ['interSemibold', 'sans-serif'],
      // interBold: ['interBold', 'sans-serif'],
      // interMedium: ['interMedium', 'sans-serif'],
      // special: ['special', 'sans-serif'],
      // archivo: ['Archivo Regular', 'sans-serif'],
      // archivoblack: ['Archivo Black', 'sans-serif'],
      // cursive: ['cursive', 'sans-serif'],

      archivo: ['Archivo Regular', 'sans-serif'],
      mono: ['Roboto Mono', 'monospace'],
      thin: ['thin', 'sans-serif'],
      regular: ['regular', 'sans-serif'],
      semibold: ['semibold', 'sans-serif'],
      bold: ['bold', 'sans-serif'],
      black: ['black', 'sans-serif'],
      special: ['special', 'sans-serif'],
      cursive: ['cursive', 'sans-serif'],
    },
    fontFamily: {
      archivo: ['archivo'],
      special: ['special'],
      thin: ['thin'],
      regular: ['regular'],
      bold: ['bold'],
      semibold: ['semibold'],
      black: ['black'],
      mono: 'Roboto Mono',
      cursive: 'cursive',
    },
  },
  plugins: [],
};
