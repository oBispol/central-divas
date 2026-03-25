/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDFB',
          100: '#FFF8F2',
          200: '#FDF6F0',
          300: '#FAEEE6',
        },
        rose: {
          50: '#FFF5F7',
          100: '#FFE4EC',
          200: '#FFCCD9',
          300: '#F9A8C4',
          400: '#F48FB1',
          500: '#F06292',
          600: '#EC407A',
          700: '#E91E8C',
          800: '#D81B60',
          900: '#C2185B',
        },
        gold: {
          50: '#FFFDF5',
          100: '#FFF8E1',
          200: '#FFECB3',
          300: '#FFE082',
          400: '#FFD54F',
          500: '#D4AF37',
          600: '#C9A227',
          700: '#B8860B',
          800: '#996515',
          900: '#7A5A1E',
        },
        text: {
          primary: '#333333',
          secondary: '#666666',
          muted: '#999999',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 25px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
