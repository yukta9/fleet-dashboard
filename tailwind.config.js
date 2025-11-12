/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e9f2ff',
          100: '#d0e3ff',
          500: '#1F6FEB',
          700: '#144fa1',
          900: '#0b2d61',
        },
        success: '#17B26A',
        warning: '#F79009',
        danger: '#F04438',
        neutral: '#E2E8F0',
      },
      backgroundColor: {
        light: '#F9FAFB',
        dark: '#0C111D',
      },
      textColor: {
        primary: '#0F172A',
        secondary: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '16px',
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0,0,0,0.05)',
        card: '0 8px 24px rgba(0,0,0,0.06)',
      },
      spacing: {
        gutter: '8px',
      },
    },
  },
  plugins: [],
};
