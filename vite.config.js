import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  oxc: {
    include: /src\/.*\.js$/,
    jsx: {
      runtime: 'automatic',
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
