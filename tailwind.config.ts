import type { Config } from 'tailwindcss';

/**
 * Team Flow design system — "quiet tool, loud progress".
 * Calm hairline surfaces; colour lives in progress + collection accents.
 * Tokens mirror the values used across the UI (see lib/theme.ts for the
 * canonical map the components consume directly).
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#16150F',
        canvas: '#F6F1E4',
        surface: '#FFFFFF',
        sheet: '#F7F6F2',
        hairline: '#E8E4D8',
        // text ramp
        muted: '#6E6B60',
        faint: '#9B988B',
        // accents
        sticker: '#FFD23F',
        success: '#12A15E',
        glow: '#35D07F',
      },
    },
  },
  plugins: [],
};

export default config;
