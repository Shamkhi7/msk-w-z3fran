import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Expose to local network (LAN)
    port: 3000,
    open: false,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});
