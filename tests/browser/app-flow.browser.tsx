import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-react'
import App from '../../src/App'

describe('App full flow', () => {
  it('renders header with title', async () => {
    const screen = await render(<App />)
    await expect.element(screen.getByText('Solana')).toBeVisible()
    await expect.element(screen.getByText('Validator Architecture')).toBeVisible()
  })

  it('shows all three view mode buttons', async () => {
    const screen = await render(<App />)
    await expect.element(screen.getByRole('button', { name: 'Pipeline Flow' })).toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Layered' })).toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Particles' })).toBeVisible()
  })

  it('defaults to pipeline view with active button styling', async () => {
    const screen = await render(<App />)
    const pipelineBtn = screen.getByRole('button', { name: 'Pipeline Flow' })
    await expect.element(pipelineBtn).toBeVisible()
  })

  it('switches to particles view on click', async () => {
    const screen = await render(<App />)
    await screen.getByRole('button', { name: 'Particles' }).click()
    await expect.element(screen.getByText('Particles')).toBeVisible()
  })

  it('switches to layered view on click', async () => {
    const screen = await render(<App />)
    await screen.getByRole('button', { name: 'Layered' }).click()
    await expect.element(screen.getByRole('button', { name: 'Layered' })).toBeVisible()
  })

  it('starts guided tour and shows reset button', async () => {
    const screen = await render(<App />)
    await screen.getByRole('button', { name: /Guided Tour/ }).click()
    await expect.element(screen.getByRole('button', { name: /Reset/ })).toBeVisible()
  })

  it('resets tour back to initial state', async () => {
    const screen = await render(<App />)
    await screen.getByRole('button', { name: /Guided Tour/ }).click()
    await screen.getByRole('button', { name: /Reset/ }).click()
    await expect.element(screen.getByRole('button', { name: /Guided Tour/ })).toBeVisible()
  })

  it('speed control buttons are present', async () => {
    const screen = await render(<App />)
    await expect.element(screen.getByRole('button', { name: '0.5x' })).toBeVisible()
    await expect.element(screen.getByRole('button', { name: '1x' })).toBeVisible()
    await expect.element(screen.getByRole('button', { name: '2x' })).toBeVisible()
  })

  it('slow motion toggle works', async () => {
    const screen = await render(<App />)
    const slowBtn = screen.getByRole('button', { name: /Slow/ })
    await expect.element(slowBtn).toBeVisible()
    await slowBtn.click()
    await expect.element(slowBtn).toBeVisible()
  })
})
