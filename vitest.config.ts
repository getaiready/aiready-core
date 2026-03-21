import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.base.config';

export default defineConfig(
  mergeConfig(baseConfig, {
    test: {
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/.{idea,git,cache,output,temp}/**',
      ],
      coverage: {
        exclude: [
          'coverage/**',
          'dist/**',
          '**/*.d.ts',
          '**/*.config.*',
          '**/__tests__/**',
        ],
      },
    },
  })
);
