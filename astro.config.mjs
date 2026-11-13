// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site: https://kamdaa.github.io/web/
  // Local development stays at http://localhost:4321/
  site: 'https://kamdaa.github.io',
  base: process.env.NODE_ENV === 'production' ? '/web' : '/',
  // HTML-aware whitespace keeps inline text spacing predictable.
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
