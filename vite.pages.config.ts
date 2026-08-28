import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'github-pages-src',
  base: '/smallgames/',
  publicDir: '../public',
  plugins: [react()],
  build: {
    outDir: '../github-pages-dist',
    emptyOutDir: true,
  },
});

