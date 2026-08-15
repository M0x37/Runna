/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        strava: '#FC4C02',
        stravaDark: '#141414',
        stravaBg: '#F4F4F4',
        stravaCard: '#1E1E1E',
        stravaBorder: '#333333',
        stravaMuted: '#A1A1A1',
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
