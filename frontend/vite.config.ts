import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { config } from 'dotenv';

config();

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': process.env.VITE_API_URL!,
      '/models': process.env.VITE_API_URL!,
      '/users': process.env.VITE_API_URL!,
      '/conversations': process.env.VITE_API_URL!,
      '/analytics': process.env.VITE_API_URL!
    }
  }
});