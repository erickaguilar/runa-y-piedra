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
    chunkSizeWarningLimit: 500,
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
          if (id.includes('src/audio/')) {
            return 'engine-audio';
          }
          if (id.includes('src/render/textures/') || id.includes('src/render/models/') || id.includes('FirstPersonWeaponRenderer')) {
            return 'engine-render';
          }
          if (id.includes('src/combat/') || id.includes('src/config/combat') || id.includes('DummyRenderer') || id.includes('ProjectileRenderer') || id.includes('EnemyRenderer')) {
            return 'engine-combat';
          }
          if (id.includes('src/levels/data/dev_showroom') || id.includes('src/levels/data/dev_combatroom')) {
            return 'levels-showroom';
          }
          if (id.includes('src/levels/data/')) {
            return 'levels-data';
          }
          if (id.includes('src/heroes/heroPortraits') || id.includes('src/heroes/portraits/') || id.includes('src/ui/Icons') || id.includes('src/ui/icons.data')) {
            return 'assets-art';
          }
        }
      }
    }
  }
});

