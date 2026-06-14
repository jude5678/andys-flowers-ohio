import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // tell vite to automatically check files for changes
    },
    proxy: {
      // Intercepts any frontend fetch starting with '/api'
      '/api': {
        target: 'http://127.0.0.1:8000', // Path to your Express server
        changeOrigin: true,
        secure: false,
      },
    },
  },
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.otf', '**/*.svg'],
});