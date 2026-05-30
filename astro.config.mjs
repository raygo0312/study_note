import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://raygo0312.github.io/study_note',
  base: '/study_note',
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
      wrap: false,
    },
  },
  build: {
    format: 'file',
  },
});
