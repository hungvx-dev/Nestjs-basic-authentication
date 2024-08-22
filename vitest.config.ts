import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    alias: {
      '~': './src',
    },
    root: './',
  },
  resolve: {
    alias: {
      '~': './src',
    },
    extensions: ['ts'],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
    tsconfigPaths(),
  ],
});
