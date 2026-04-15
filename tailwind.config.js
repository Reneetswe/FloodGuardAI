export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        wave: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .55 },
        },
      },
      animation: {
        wave: 'wave 10s linear infinite',
        pulseSlow: 'pulseSlow 2s ease-in-out infinite',
      },
      colors: {
        riskGreen: '#10B981',
        riskYellow: '#F59E0B',
        riskRed: '#EF4444',
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'],
      },
      boxShadow: {
        glow: '0 10px 30px -10px rgba(56,189,248,.45)',
        soft: '0 8px 24px -8px rgba(0,0,0,.15)'
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(60% 60% at 50% 40%, rgba(56,189,248,.25) 0, rgba(56,189,248,0) 70%)',
      },
    },
  },
  plugins: [],
};
