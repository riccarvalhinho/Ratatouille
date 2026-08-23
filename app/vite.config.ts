import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * base: o GitHub Pages de um repositório de projeto serve em /<repo>/, não na raiz.
 *
 * target: ES2017 por opção, não por limitação. O tablet é um Fire HD 10 de 9.ª geração
 * (Fire OS 7 / Android 9, Chromium moderno) e aguentaria ES2022 sem problema — mas o objetivo
 * declarado é a app correr também noutros Androids mais antigos, e medimos que subir o target
 * poupa 1,3 kB em 154 kB. Compatibilidade de graça. Ver docs/adr/0003-pwa-em-vez-de-nativo.md.
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
