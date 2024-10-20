import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    include: ['**/*.spec.ts?(x)'],
    environmentMatchGlobs: [
      ['**/*.tsx', 'jsdom'],
      ['**/*.ts', 'node'],
    ],
    setupFiles: './vitest.setup.mts',
  },
});
