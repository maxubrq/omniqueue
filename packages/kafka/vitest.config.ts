import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8'
    },
    include: ['src/**/*.spec.ts'],
    globals: true,
    environment: 'node',
    alias: {
      '@omniqueue/rabbitmq': './src/index.ts',
      '@omniqueue/core': '../../core/src/index.ts'
    },
  },
})