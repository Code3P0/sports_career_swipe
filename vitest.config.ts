import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['**/node_modules/**', '**/elo.test.ts'], // Exclude old test format and node_modules
    include: ['src/**/*.test.ts'], // Only include our test files
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

