import re

with open("vite.config.ts", "r") as f:
    content = f.read()

chunking = """  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) return 'vendor-three';
            if (id.includes('lucide')) return 'vendor-lucide';
            if (id.includes('maplibre') || id.includes('pmtiles') || id.includes('@vis.gl')) return 'vendor-maplibre';
            if (id.includes('react') || id.includes('recharts') || id.includes('xyflow') || id.includes('framer-motion')) return 'vendor-react';
            return 'vendor-core';
          }
        }
      }
    }
  },
  server: {"""
content = re.sub(r'  build: {.*?  server: {', chunking, content, flags=re.DOTALL)

with open("vite.config.ts", "w") as f:
    f.write(content)
