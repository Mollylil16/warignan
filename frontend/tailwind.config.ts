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
    },
  },
  plugins: [],
};

export default config;