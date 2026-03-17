import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path  from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Allow "@/components/..." imports
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    // Proxy API calls to the backend during local development
    proxy: {
      '/api': {
        target:      'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
