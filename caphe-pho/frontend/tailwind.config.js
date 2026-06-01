/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        cream:        '#faf6f0',
        'brown-dark': '#2c1810',
        'brown-mid':  '#6b3a2a',
        'brown-light':'#c4956a',
        accent:       '#d4754a',
        'card-bg':    '#fffcf8',
        'tag-bg':     '#f2e8df',
        muted:        '#8a7060',
        border:       '#e8ddd4',
      },
    },
  },
  plugins: [],
};
