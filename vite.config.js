import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5500
  },
  build: {
    outDir: 'dist'
  },
  // Keep your existing asset structure
  base: '/'
});