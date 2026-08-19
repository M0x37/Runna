/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#071A2C',
        canvas: '#081C2F',
        surface: '#0D2740',
        'surface-raised': '#123552',
        'surface-soft': '#194764',
        line: '#2C526C',
        muted: '#A9C0C8',
        faint: '#7593A0',
        lime: '#FF684A',
        'lime-pressed': '#E9563C',
        orange: '#FF684A',
        success: '#5BE0B1',
        danger: '#FF6B6B',
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        'sans-medium': ['Inter_500Medium'],
        'sans-semibold': ['Inter_600SemiBold'],
        'sans-bold': ['Inter_700Bold'],
        'display-semibold': ['Archivo_600SemiBold'],
        display: ['Archivo_700Bold'],
        'display-extrabold': ['Archivo_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
