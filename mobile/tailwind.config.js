/** @type {import('tailwindcss').Config} */
module.exports = {
  content: { relative: true, files: ['./App.tsx', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}', '../packages/ui/src/shared/**/*.ts', '../packages/ui/src/native/**/*.{ts,tsx}'] },
  presets: [require('nativewind/preset')],
  // Tailwind 3의 watch는 상대 require만 추적한다. 공통 JSON도 다시 읽도록 연결한다.
  theme: { extend: require('../packages/design-tokens/src/tailwind.cjs') },
  plugins: [],
};
