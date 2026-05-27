/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // cream — very light warm white background
        cream: '#FEFEFE',

        // beige — much lighter, almost white neutrals
        beige: {
          50:  '#FAFAFA',
          100: '#F5F5F0',
          150: '#EFEFEA',
          200: '#E8E8E0',
          300: '#D8D8CC',
          400: '#C4C4B4',
        },

        // olive — Deep Emerald Green (PRIMARY brand color) — unchanged
        olive: {
          50:  '#EDFAF3',
          100: '#C8EFD9',
          200: '#91DCAF',
          300: '#5AC988',
          400: '#2BAE64',
          500: '#0D914D',   // ← main CTA: deep emerald
          600: '#09723D',
          700: '#06552D',
          800: '#04381E',
          900: '#021D0F',
        },

        // brown — much lighter warm tones for text only
        brown: {
          200: '#E8DDD0',
          300: '#D4C4B0',
          400: '#B8A890',
          500: '#9C8C70',
          600: '#7A6C54',
          700: '#5C5040',   // ← main text: soft warm grey-brown
          800: '#3E3428',
          900: '#221C14',
        },

        // gold — Antique Gold (secondary accent) — unchanged
        gold: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D4920A',
          600: '#A97208',
          700: '#7E5406',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      boxShadow: {},
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight:   '-0.015em',
      },
    },
  },
  plugins: [],
};

export default config;
