/** @type {import('tailwindcss').Config} */
module.exports = {
  content: { relative: true, files: ['./App.tsx', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'] },
  presets: [require('nativewind/preset')],
  theme: { extend: { colors: require('@iambox/design-tokens/colors.json') } },
  plugins: [],
};
