/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        cream:        '#fdfbf9',
        'brown-dark': '#241812',
        'brown-mid':  '#5c3a21',
        'brown-light':'#8c5e3c',
        accent:       '#d96b27',
        'card-bg':    '#ffffff',
        'tag-bg':     '#f4ede6',
        muted:        '#826d60',
        border:       '#e6dcd3',
      },
    },
  },
  plugins: [],
};
