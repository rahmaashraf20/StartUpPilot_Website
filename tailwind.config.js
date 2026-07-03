/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5046e5',
        'primary-dark': '#3d35c8',
        'primary-light': '#ede9fe',
        surface: '#f8f8fb',
        border: '#e4e4f0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'elevated': '0 4px 16px 0 rgb(80 70 229 / 0.10), 0 1px 4px 0 rgb(0 0 0 / 0.06)',
        'glow': '0 0 0 3px rgb(80 70 229 / 0.15)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease both',
        'slide-up': 'slideUp 0.4s ease both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#5046e5",
          "primary-content": "#ffffff",
          "secondary": "#8b5cf6",
          "accent": "#06b6d4",
          "neutral": "#1e1b4b",
          "base-100": "#ffffff",
          "base-200": "#f8f8fb",
          "base-300": "#e4e4f0",
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
    ],
  },
}
