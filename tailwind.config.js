/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // background colors
        /*
        // ADRENA Style
        main: '#171717',
        secondary: '#1E1D1D',
        third: '#343232',
        highlight: '#36538f', // RED: #C43152

        // border
        grey: '#2A2A2A',
        */

        // GMX Style
        main: '#101124',
        secondary: '#16182D',
        third: '#242842',
        highlight: '#323FCE',

        // border
        grey: '#23263b',

        // text
        txtfade: '#8C8D97',
        txtregular: '#E5E6E8',

        // To change leverage colors, search for:
        // Leverage colors
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
