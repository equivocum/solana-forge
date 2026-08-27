import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['vitest-browser-react', 'd3-force', 'd3-zoom', 'd3-quadtree', 'd3-selection'],
  },
  test: {
    globals: true,
    testTimeout: 30_000,
    include: ['tests/browser/**/*.browser.{ts,tsx}'],
    browser: {
      enabled: true,
      provider: playwright({
        launchOptions: {
          args: [
            '--no-sandbox',
            '--no-zygote',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-setuid-sandbox',
            '--disable-extensions',
            '--disable-background-networking',
          ],
        },
      }),
      headless: true,
      connectTimeout: 30_000,
      instances: [
        {
          browser: 'chromium',
          viewport: { width: 1280, height: 720 },
        },
      ],
      expect: {
        toMatchScreenshot: {
          comparatorName: 'pixelmatch',
          comparatorOptions: {
            threshold: 0.2,
            allowedMismatchedPixelRatio: 0.05,
          },
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
