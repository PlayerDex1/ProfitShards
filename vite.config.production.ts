import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    
    // Bundle único para manter comunicação entre componentes
    rollupOptions: {
      output: {
        // Apenas vendor chunks externos - componentes ficam juntos
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['wouter'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge']
        },
        
        // Nomes de arquivos otimizados
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/index-[hash].js', // Bundle principal único
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash].[ext]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`;
        }
      }
    },
    
    // Otimizações de build
    terserOptions: {
      compress: {
        drop_console: false, // Manter logs para debug
        drop_debugger: true,
        pure_funcs: [], // Não remover funções
      },
      mangle: {
        safari10: true,
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 2000, // Aumentar limite
    
    // CSS code splitting
    cssCodeSplit: false, // CSS único para evitar problemas
    
    // Assets inline limit
    assetsInlineLimit: 4096,
  },
  
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'wouter',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'recharts',
      'date-fns',
      'clsx',
      'tailwind-merge'
    ],
    exclude: ['@replit/vite-plugin-runtime-error-modal']
  },
  
  // Configurações de preview
  preview: {
    port: 4173,
    host: true,
    strictPort: true,
  },
  
  // Configurações de servidor
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  
  // Configurações de define
  define: {
    __DEV__: false,
    __PROD__: true,
  },
  
  // Configurações de esbuild
  esbuild: {
    drop: ['debugger'], // Manter console para debug
    pure: [], // Não remover funções
  },
});