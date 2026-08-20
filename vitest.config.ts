import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'packages/frontend/src/**/*.test.ts']
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'packages/shared'),
      '@': path.resolve(__dirname, 'packages/frontend/src')
    }
  }
})
