import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-react'
import { PipelineFlowView } from '../../src/components/architecture/PipelineFlowView'
import { TPU_PIPELINE, TVU_PIPELINE, SHARED_COMPONENTS } from '../../src/components/architecture/data/components'
import { TX_LIFECYCLE_PATH } from '../../src/components/architecture/data/connections'

describe('PipelineFlowView', () => {
  const defaultProps = {
    activeComponent: null,
    highlightedComponent: null,
    currentStepId: null,
    onComponentClick: () => {},
    onComponentHover: () => {},
    onSubClick: () => {},
    txPath: TX_LIFECYCLE_PATH,
    txPosition: 0,
  }

  it('renders TPU Pipeline header', async () => {
    const screen = await render(<PipelineFlowView {...defaultProps} />)
    await expect.element(screen.getByText('TPU Pipeline')).toBeVisible()
    await expect.element(screen.getByText('Leader Mode — Block Production')).toBeVisible()
  })

  it('renders TVU Pipeline header', async () => {
    const screen = await render(<PipelineFlowView {...defaultProps} />)
    await expect.element(screen.getByText('TVU Pipeline')).toBeVisible()
    await expect.element(screen.getByText('Validator Mode — Block Verification')).toBeVisible()
  })

  it('renders Core Programs section', async () => {
    const screen = await render(<PipelineFlowView {...defaultProps} />)
    await expect.element(screen.getByText('Core Programs').first()).toBeVisible()
    await expect.element(screen.getByText('Compiled into validator binary')).toBeVisible()
  })

  it('renders all 4 SharedLayer sections', async () => {
    const screen = await render(<PipelineFlowView {...defaultProps} />)
    await expect.element(screen.getByText('Networking')).toBeVisible()
    await expect.element(screen.getByText('Runtime')).toBeVisible()
    await expect.element(screen.getByText('Consensus')).toBeVisible()
    await expect.element(screen.getByText('Storage')).toBeVisible()
  })

  it('renders TPU pipeline components', async () => {
    const screen = await render(<PipelineFlowView {...defaultProps} />)
    for (const comp of TPU_PIPELINE) {
      await expect.element(screen.getByText(comp.name)).toBeVisible()
    }
  })

  it('renders TVU pipeline components', async () => {
    const screen = await render(<PipelineFlowView {...defaultProps} />)
    for (const comp of TVU_PIPELINE) {
      await expect.element(screen.getByText(comp.name)).toBeVisible()
    }
  })

  it('calls onComponentClick when a component is clicked', async () => {
    let clickedId: string | null = null
    const screen = await render(
      <PipelineFlowView
        {...defaultProps}
        onComponentClick={(comp) => { clickedId = comp.id }}
      />
    )
    await screen.getByText(TPU_PIPELINE[0].name).click()
    expect(clickedId).toBe(TPU_PIPELINE[0].id)
  })

  it('shows current step badge when currentStepId matches', async () => {
    const screen = await render(
      <PipelineFlowView
        {...defaultProps}
        currentStepId={TPU_PIPELINE[0].id}
      />
    )
    await expect.element(screen.getByText('CURRENT')).toBeVisible()
  })

  it('shows SELECTED badge when activeComponent matches', async () => {
    const screen = await render(
      <PipelineFlowView
        {...defaultProps}
        activeComponent={TPU_PIPELINE[0].id}
      />
    )
    await expect.element(screen.getByText('SELECTED')).toBeVisible()
  })

  it('renders FlowArrow connectors between pipeline stages', async () => {
    const screen = await render(<PipelineFlowView {...defaultProps} />)
    await expect.element(screen.getByText('→').first()).toBeVisible()
  })
})
