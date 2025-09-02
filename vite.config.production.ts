import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { splitVendorChunkPlugin } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
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
    
    // Bundle splitting otimizado
    rollupOptions: {
      output: {
        // Chunks principais
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['wouter'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'vendor-charts': ['recharts', 'd3'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
          
          // Feature chunks
          'feature-calculator': [
            './src/components/Calculator.tsx',
            './src/components/Results.tsx',
            './src/components/EquipmentComparison.tsx'
          ],
          'feature-giveaways': [
            './src/components/GiveawayAdmin.tsx',
            './src/components/GiveawayAnalytics.tsx',
            './src/components/GiveawayModal.tsx',
            './src/components/WinnerManager.tsx'
          ],
          'feature-dashboard': [
            './src/components/AdminDashboardV2.tsx',
            './src/components/HybridDashboard.tsx',
            './src/components/MetricsDashboard.tsx'
          ],
          'feature-maps': [
            './src/components/MapPlanner.tsx',
            './src/components/MapMetrics.tsx'
          ],
          
          // Shared chunks
          'shared-ui': [
            './src/components/ui/card.tsx',
            './src/components/ui/button.tsx',
            './src/components/ui/input.tsx',
            './src/components/ui/badge.tsx',
            './src/components/ui/dialog.tsx',
            './src/components/ui/select.tsx',
            './src/components/ui/tabs.tsx'
          ],
          'shared-hooks': [
            './src/hooks/use-auth.ts',
            './src/hooks/use-theme.ts',
            './src/hooks/use-giveaway.ts'
          ],
          'shared-utils': [
            './src/lib/equipmentBuilds.ts',
            './src/lib/missionVerification.ts',
            './src/lib/lazy-loading.tsx'
          ]
        },
        
        // Nomes de arquivos otimizados
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
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
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // CSS code splitting
    cssCodeSplit: true,
    
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
    drop: ['console', 'debugger'],
    pure: ['console.log', 'console.info', 'console.debug'],
  },
});