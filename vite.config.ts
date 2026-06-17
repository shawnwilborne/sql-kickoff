import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path for GitHub Pages. Locally this is '/'; in CI the deploy workflow
// sets VITE_BASE to '/<repo-name>/' so assets resolve under the Pages sub-path.
const base = process.env.VITE_BASE ?? '/';

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  optimizeDeps: {
    // PGlite ships its own WASM and must not be pre-bundled by esbuild.
    exclude: ['@electric-sql/pglite'],
  },
  worker: {
    format: 'es',
  },
});
