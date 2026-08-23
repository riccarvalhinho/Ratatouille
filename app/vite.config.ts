import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * base: o GitHub Pages de um repositório de projeto serve em /<repo>/, não na raiz.
 * target: ES2017 por precaução enquanto o modelo do tablet Fire não estiver confirmado
 * (questão Q1) — o WebView dos Fire mais antigos é datado. Relaxar quando soubermos.
 */
export default defineConfig({
  base: process.env.VITE_BASE ?? '/Ratatouille/',
  plugins: [react()],
  build: {
    target: 'es2017',
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    host: true,
  },
});
