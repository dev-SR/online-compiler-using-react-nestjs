/** @type {import('tailwindcss').Config} */
const defaultConfig = require('tailwindcss/defaultConfig');
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Inter', defaultConfig.theme.fontFamily.sans],
    },
    extend: {},
  },
  plugins: [],
};

// module.exports = {
//   // mode: 'jit',
//   content: ['./index.html', './src/**/*.tsx', './src/**/*.ts'],
//   darkMode: 'class', // or 'media' or 'class'
//   theme: {
//     fontFamily: {
//       sans: ['Inter', defaultConfig.theme.fontFamily.sans],
//     },
//     colors: {
//       transparent: 'transparent',
//       current: 'currentColor',
//       black: colors.black,
//       white: colors.white,
//       // gray: colors.gray,
//       gray: {
//         darkest: '#202225',
//         dark: '#292A2F',
//         DEFAULT: '#1E1E1E',
//         semiDark: '#6F737A',
//         light: '#BDBEC0',
//         lighter: '#E4E6EB',
//         lightest: '#FAFAFA',
//       },
//       indigo: colors.indigo,
//       red: colors.rose,
//       yellow: colors.amber,
//       green: colors.green,
//     },
//     extend: {},
//   },
//   variants: {
//     extend: {},
//   },
//   plugins: [require('@tailwindcss/forms')],
// };
