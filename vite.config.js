import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // The existing GitHub Pages path follows the repository name; local Vite stays at root.
  base: command === 'build' ? '/bobbiegame/' : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
  },
}));
