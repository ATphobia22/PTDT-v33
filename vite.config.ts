import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      conditions: ['import', 'module', 'browser', 'default'],
    },
    optimizeDeps: {
      include: ['three', 'maplibre-gl', 'pmtiles'],
    },
    build: {
      chunkSizeWarningLimit: 2500,
      commonjsOptions: {
        include: [/node_modules/],
      },
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('three')) return 'vendor-three';
              if (id.includes('maplibre-gl') || id.includes('pmtiles')) return 'vendor-maps';
              if (id.includes('recharts') || id.includes('d3')) return 'vendor-charts';
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : undefined,
    },
  };
});
