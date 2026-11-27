import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const apiTarget = process.env.API_INTERNAL_URL || 'http://localhost:3001';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    port: 6001,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true
      }
    }
  }
});
