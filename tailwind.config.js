/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        main: "#101124",
        secondary: "#16182e",
        grey: "#1e2136",
      },
    },
    fontFamily: {
      regular: ["regular"],
      thin: ["thin"],
      bold: ["bold"],
    },
  },
  plugins: [],
};
