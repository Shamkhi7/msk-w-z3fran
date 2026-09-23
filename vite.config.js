import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: 'localhost', // Localhost only (isolated from LAN)
    port: 3000,
    open: false,
    watch: {
      ignored: ['**/release/**', '**/dist-desktop/**', '**/electron/**', '**/SHOP_PACKAGE_*/**'],
    },
  },
  preview: {
    host: 'localhost',
    port: 3000,
  },
});
