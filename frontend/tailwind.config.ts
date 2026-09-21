import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      colors: {
        mukana: {
          ink: '#1a1a1a',
          paper: '#fbf7f1',
          warm: '#f6ece1',
          line: '#e8dfd1',
          coral: '#e85a4f',
          plum: '#6c3a4f',
          olive: '#7d8a4a',
        },
      },
      fontFamily: {
        sans: ['"PingFang HK"', '"Noto Sans HK"', 'system-ui', 'sans-serif'],
        display: ['"PingFang HK"', '"Noto Serif TC"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 12px 30px -18px rgba(26,26,26,0.35)',
      },
    },
  },
  plugins: [],
};
export default config;
