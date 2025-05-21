// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spoon: {
          primary: '#F4821F',
          secondary: '#8B4513',
          light: '#FFF9F2',
          dark: '#2C3E50'
        },
        status: {
          success: '#27AE60',
          warning: '#F39C12',
          error: '#E74C3C',
          info: '#3498DB'
        }
      },
      fontFamily: {
        heading: ['Geist', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['GeistMono', 'monospace']
      },
      borderRadius: {
        DEFAULT: '8px',
        card: '12px'
      }
    }
  },
  plugins: []
} 