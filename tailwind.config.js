/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // background colors
        main: '#101124',
        secondary: '#16182D',
        third: '#242842',
        highlight: '#323FCE',
        // border
        grey: '#23263b',
        // text
        txtfade: '#8C8D97',
        txtregular: '#E5E6E8',
      },
    },
    fontFamily: {
      regular: ['regular'],
      thin: ['thin'],
      bold: ['bold'],
    },
  },
  plugins: [],
};
