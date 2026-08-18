/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#080808',
        canvas: '#0D0D0E',
        surface: '#151516',
        'surface-raised': '#1C1C1E',
        'surface-soft': '#252527',
        line: '#343437',
        muted: '#A2A2A8',
        faint: '#6E6E74',
        lime: '#D8FF39',
        'lime-pressed': '#C6EC2F',
        orange: '#FF6B35',
        success: '#6EE7B7',
        danger: '#FF5B61',
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
