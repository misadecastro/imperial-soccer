/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        imperial: {
          green: '#2a7a3d',
          'green-mid': '#16a34a',
          'green-light': '#dcfce7',
          red: '#dc2626',
          'red-light': '#fee2e2',
          bg: '#f0f4f1',
          card: '#ffffff',
          text: '#111827',
          'text-muted': '#6b7280',
          border: '#e5e7eb',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
