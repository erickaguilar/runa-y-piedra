import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    allowedHosts: true
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/peerjs') || id.includes('node_modules/@msgpack')) {
            return 'vendor-net';
          }
          if (id.includes('node_modules/qrcode') || id.includes('node_modules/nipplejs')) {
            return 'vendor-ui';
          }
        }
      }
    }
  }
});

