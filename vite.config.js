import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project below /bobbiegame/, while local Vite stays at root.
  base: command === 'build' ? '/bobbiegame/' : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
  },
}));
