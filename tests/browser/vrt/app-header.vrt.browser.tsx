import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-react'
import App from '../../../src/App'

describe('VRT - App header and controls', () => {
  it('app-header-default', async () => {
    await render(<App />)
    await expect.element(document.querySelector('header')!).toMatchScreenshot('app-header-default')
  })

  it('app-view-mode-buttons', async () => {
    const screen = await render(<App />)
    await screen.getByRole('button', { name: /Pipeline Flow/ }).click()
    const buttons = document.querySelector('.flex.bg-gray-800.rounded-lg.p-1')!
    await expect.element(buttons).toMatchScreenshot('app-view-mode-buttons')
  })

  it('app-simulation-controls', async () => {
    const screen = await render(<App />)
    await screen.getByRole('button', { name: /Guided Tour/ }).click()
    await expect.element(screen.getByText('Reset')).toBeVisible()
    await expect.element(document.querySelector('header')!).toMatchScreenshot('app-simulation-controls')
  })
})
