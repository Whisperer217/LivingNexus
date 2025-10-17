import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        'ai-interceptor': resolve(__dirname, 'src/content/ai-interceptor.ts'),
        'manual-scraper': resolve(__dirname, 'src/content/manual-scraper.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Preserve the directory structure
          if (chunkInfo.name === 'service-worker') {
            return 'src/background/[name].js';
          }
          if (chunkInfo.name === 'ai-interceptor') {
            return 'src/content/[name].js';
          }
          if (chunkInfo.name === 'manual-scraper') {
            return 'src/content/[name].js';
          }
          return 'src/[name].js';
        },
        // Inline all dependencies - no code splitting
        inlineDynamicImports: false,
        manualChunks: undefined,
      },
    },
    // Don't minify for easier debugging
    minify: false,
    // Generate source maps
    sourcemap: true,
    // Inline all dependencies
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});

