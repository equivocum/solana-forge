import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-react'
import { LayeredView } from '../../src/components/architecture/LayeredView'
import { LAYERS, ALL_COMPONENTS } from '../../src/components/architecture/data/components'

describe('LayeredView', () => {
  const defaultProps = {
    activeComponent: null,
    highlightedComponent: null,
    currentStepId: null,
    onComponentClick: () => {},
    onComponentHover: () => {},
    onSubClick: () => {},
  }

  it('renders title', async () => {
    const screen = await render(<LayeredView {...defaultProps} />)
    await expect.element(screen.getByText('Layered Architecture')).toBeVisible()
    await expect.element(screen.getByText('Bottom = foundation, Top = application')).toBeVisible()
  })

  it('renders all 7 layer sections', async () => {
    const screen = await render(<LayeredView {...defaultProps} />)
    await expect.element(screen.getByText('Core Programs').first()).toBeVisible()
    await expect.element(screen.getByText('Storage Layer')).toBeVisible()
    await expect.element(screen.getByText('Consensus Layer')).toBeVisible()
    await expect.element(screen.getByText('Runtime / Execution')).toBeVisible()
    await expect.element(screen.getByText('TPU (Leader Mode)')).toBeVisible()
    await expect.element(screen.getByText('TVU (Validator Mode)')).toBeVisible()
    await expect.element(screen.getByText('Networking Layer')).toBeVisible()
  })

  it('renders layer component counts', async () => {
    const screen = await render(<LayeredView {...defaultProps} />)
    const counts = Object.values(LAYERS).map(c => c.length).filter(n => n > 0)
    for (const count of counts) {
      const countText = `(${count} components)`
      await expect.element(screen.getByText(countText).first()).toBeVisible()
    }
  })

  it('renders Data Flow Direction legend', async () => {
    const screen = await render(<LayeredView {...defaultProps} />)
    await expect.element(screen.getByText('Data Flow Direction')).toBeVisible()
    await expect.element(screen.getByText('Networking', { exact: true })).toBeVisible()
    await expect.element(screen.getByText('TPU/TVU')).toBeVisible()
    await expect.element(screen.getByText('Runtime', { exact: true })).toBeVisible()
    await expect.element(screen.getByText('Consensus', { exact: true })).toBeVisible()
    await expect.element(screen.getByText('Storage', { exact: true })).toBeVisible()
  })

  it('calls onComponentClick when a component is clicked', async () => {
    let clickedId: string | null = null
    const screen = await render(
      <LayeredView
        {...defaultProps}
        onComponentClick={(comp) => { clickedId = comp.id }}
      />
    )
    const firstComp = ALL_COMPONENTS[0]
    await screen.getByText(firstComp.name).click()
    expect(clickedId).toBe(firstComp.id)
  })

  it('shows SELECTED badge when activeComponent matches', async () => {
    const screen = await render(
      <LayeredView
        {...defaultProps}
        activeComponent={ALL_COMPONENTS[0].id}
      />
    )
    await expect.element(screen.getByText('SELECTED')).toBeVisible()
  })

  it('shows CURRENT badge when currentStepId matches', async () => {
    const screen = await render(
      <LayeredView
        {...defaultProps}
        currentStepId={ALL_COMPONENTS[0].id}
      />
    )
    await expect.element(screen.getByText('CURRENT')).toBeVisible()
  })
})
