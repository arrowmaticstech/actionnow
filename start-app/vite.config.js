import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Prod: https://actionnow.my/start/
export default defineConfig({
  plugins: [react()],
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
