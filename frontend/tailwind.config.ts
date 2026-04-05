// ============================================================
// Configuration Tailwind CSS
// On étend le thème par défaut avec les couleurs Warignan
// ============================================================

import type { Config } from 'tailwindcss';

const config: Config = {
  // content = liste des fichiers où Tailwind cherche les classes utilisées
  // Tailwind supprime les classes NON utilisées en production (tree-shaking)
  content: ['./index.html', './src/**/*.{ts,tsx}'],

  theme: {
    extend: {
      // On ajoute nos couleurs custom à Tailwind
      // Utilisables comme : bg-tiktok-pink, text-tiktok-cyan, etc.
      colors: {
        'tiktok-pink': '#FE2C55',
        'tiktok-cyan': '#25F4EE',
        'live-red': '#FF0000',
        'reserve-purple': '#9146FF',
        'bg-void': '#050505',
        'surface-dark': '#121212',
        'surface-border': '#2A2A2A',
        'status-green': '#00FF55',
        'status-orange': '#FF9900',
      },
      fontFamily: {
        // On ajoute nos polices custom
        // Utilisables comme : font-grotesk, font-inter
        grotesk: ['"Space Grotesk"', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      keyframes: {
        ctaGlow: {
          '0%, 100%': {
            boxShadow:
              '0 0 0 0 rgba(254, 44, 85, 0.45), 0 10px 40px rgba(0, 0, 0, 0.5)',
          },
          '50%': {
            boxShadow:
              '0 0 0 14px rgba(254, 44, 85, 0.1), 0 12px 48px rgba(254, 44, 85, 0.35)',
          },
        },
        pulseRedDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.88)' },
        },
      },
      animation: {
        'cta-glow': 'ctaGlow 2.4s ease-in-out infinite',
        'pulse-dot': 'pulseRedDot 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;