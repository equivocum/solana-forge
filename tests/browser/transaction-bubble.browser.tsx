import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-react'
import { TransactionBubble } from '../../src/components/architecture/TransactionBubble'
import { ALL_COMPONENTS } from '../../src/components/architecture/data/components'
import { TX_LIFECYCLE_PATH } from '../../src/components/architecture/data/connections'

describe('TransactionBubble', () => {
  it('renders when isRunning is true', async () => {
    const screen = await render(
      <TransactionBubble
        isRunning={true}
        currentStep={0}
        components={ALL_COMPONENTS}
      />
    )
    await expect.element(screen.getByText('Transaction', { exact: true })).toBeVisible()
  })

  it('shows step counter', async () => {
    const screen = await render(
      <TransactionBubble
        isRunning={true}
        currentStep={0}
        components={ALL_COMPONENTS}
      />
    )
    await expect.element(screen.getByText('Step 1/21')).toBeVisible()
  })

  it('shows current component name', async () => {
    const firstComponentId = TX_LIFECYCLE_PATH[0]
    const firstComponent = ALL_COMPONENTS.find(c => c.id === firstComponentId)!
    const screen = await render(
      <TransactionBubble
        isRunning={true}
        currentStep={0}
        components={ALL_COMPONENTS}
      />
    )
    await expect.element(screen.getByText(firstComponent.name)).toBeVisible()
  })

  it('renders transaction info section', async () => {
    const screen = await render(
      <TransactionBubble
        isRunning={true}
        currentStep={5}
        components={ALL_COMPONENTS}
      />
    )
    await expect.element(screen.getByText('Transaction', { exact: true })).toBeVisible()
    await expect.element(screen.getByText('Step 6/21')).toBeVisible()
    const componentId = TX_LIFECYCLE_PATH[5]
    const component = ALL_COMPONENTS.find(c => c.id === componentId)!
    await expect.element(screen.getByText(component.name)).toBeVisible()
  })

  it('renders mock transaction hash', async () => {
    const screen = await render(
      <TransactionBubble
        isRunning={true}
        currentStep={0}
        components={ALL_COMPONENTS}
      />
    )
    const hashEl = screen.locator.locator('.font-mono')
    await expect.element(hashEl).toBeVisible()
  })

  it('updates step counter when currentStep changes', async () => {
    const screen = await render(
      <TransactionBubble
        isRunning={true}
        currentStep={2}
        components={ALL_COMPONENTS}
      />
    )
    await expect.element(screen.getByText('Step 3/21')).toBeVisible()
  })

  it('returns null when component not found', async () => {
    const { container } = await render(
      <TransactionBubble
        isRunning={true}
        currentStep={999}
        components={ALL_COMPONENTS}
      />
    )
    expect(container.querySelector('.fixed')).toBeNull()
  })
})
