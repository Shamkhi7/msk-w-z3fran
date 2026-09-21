/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDF2F4',
          100: '#FCE7EA',
          200: '#F7C3CB',
          300: '#EE94A4',
          400: '#DF5E77',
          500: '#C72E4E',
          600: '#A81839',
          700: '#8A0F2B',
          800: '#800020', // Primary Deep Burgundy / Maroon
          900: '#5C0017',
          950: '#38000E',
        },
        warm: {
          50: '#FDFBF7',
          100: '#F9F5EB',
          200: '#F5EEDB',
          300: '#EDE2C4',
          400: '#E0CE9F',
          500: '#CBB276',
          beige: '#F5F5DC',
        },
        gold: {
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          accent: '#D4AF37',
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
