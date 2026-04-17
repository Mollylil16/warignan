// ============================================================
// Configuration Vite (l'outil qui compile et sert le projet)
// ============================================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    // Plugin officiel React pour Vite (active le Fast Refresh)
    react(),
  ],
  server: {
    port: 3000,  // Le serveur de dev tourne sur http://localhost:3000
    // proxy : /api → backend Express (même port que PORT dans backend/.env, défaut 4000)
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
