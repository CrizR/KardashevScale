import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';

const legacyJsxInJs = {
  name: 'legacy-jsx-in-js',
  enforce: 'pre',
  async transform(code, id) {
    if (!/\/src\/.*\.js$/.test(id)) {
      return null;
    }

    return transformWithOxc(code, id, {
      lang: 'jsx',
      sourceType: 'module',
      jsx: {
        runtime: 'automatic',
      },
    });
  },
};

export default defineConfig({
  plugins: [legacyJsxInJs, react()],
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
