import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: path.resolve(__dirname, 'dist/public'),
    sourcemap: false,
    minify: 'terser',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          'chart-vendor': ['recharts'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'client/assets'),
    },
  },
  root: path.resolve(__dirname, 'client'),
  publicDir: path.resolve(__dirname, 'client', 'public'),
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts', 'date-fns'],
  },
});