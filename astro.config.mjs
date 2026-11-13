// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // User site: https://kamdaa.github.io/
  site: 'https://kamdaa.github.io',
  // HTML-aware whitespace keeps inline text spacing predictable.
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
