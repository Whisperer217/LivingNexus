import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        'ai-interceptor': resolve(__dirname, 'src/content/ai-interceptor.ts'),
        'ai-conversation-logger': resolve(__dirname, 'src/loggers/ai-conversation-logger.ts'),
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
          if (chunkInfo.name === 'ai-conversation-logger') {
            return 'src/loggers/[name].js';
          }
          return 'src/[name].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // Don't minify for easier debugging
    minify: false,
    // Generate source maps
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});

