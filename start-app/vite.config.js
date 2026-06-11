import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** GitHub Pages: copy index.html → 404.html so /start/* deep links can recover. */
function ghPagesSpaFallback() {
  return {
    name: 'gh-pages-spa-fallback',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(outDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, path.join(outDir, '404.html'));
      }
    },
  };
}

// Prod: https://actionnow.my/start/
export default defineConfig({
  plugins: [react(), ghPagesSpaFallback()],
  base: '/start/',
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, '../assets'),
    },
  },
  server: {
    proxy: {
      '/supabase-functions': {
        target: 'https://edqhawzttjqhpfflzprb.supabase.co',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/supabase-functions/, '/functions/v1'),
        secure: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
