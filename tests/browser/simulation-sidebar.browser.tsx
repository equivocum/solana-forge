import { describe, it, expect, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { SimulationSidebar } from '../../src/components/architecture/SimulationSidebar'
import { SIMULATION_STEPS } from '../../src/components/architecture/data/simulation-steps'

describe('SimulationSidebar', () => {
  const defaultProps = {
    isRunning: false,
    speed: 1,
    slowMotion: false,
    currentStep: 0,
    totalSteps: SIMULATION_STEPS.length,
    onStepChange: () => {},
    onPause: () => {},
    onResume: () => {},
    onNext: () => {},
    onBack: () => {},
  }

  it('renders step counter', async () => {
    const screen = await render(<SimulationSidebar {...defaultProps} />)
    await expect.element(screen.getByText('Step 1/21')).toBeVisible()
  })

  it('renders current step title', async () => {
    const screen = await render(<SimulationSidebar {...defaultProps} />)
    await expect.element(screen.getByText(SIMULATION_STEPS[0].title)).toBeVisible()
  })

  it('renders current step description', async () => {
    const screen = await render(<SimulationSidebar {...defaultProps} />)
    await expect.element(screen.getByText(SIMULATION_STEPS[0].description)).toBeVisible()
  })

  it('renders Back and Next buttons', async () => {
    const screen = await render(<SimulationSidebar {...defaultProps} />)
    await expect.element(screen.getByText('← Back')).toBeVisible()
    await expect.element(screen.getByText('Next →')).toBeVisible()
  })

  it('renders Resume button when not running', async () => {
    const screen = await render(<SimulationSidebar {...defaultProps} />)
    await expect.element(screen.getByText('▶ Resume')).toBeVisible()
  })

  it('renders Pause button when running', async () => {
    const screen = await render(
      <SimulationSidebar {...defaultProps} isRunning={true} />
    )
    await expect.element(screen.getByText('⏸ Pause')).toBeVisible()
  })

  it('Back button is disabled on first step', async () => {
    const screen = await render(
      <SimulationSidebar {...defaultProps} currentStep={0} />
    )
    const backBtn = screen.getByText('← Back')
    await expect.element(backBtn).toBeVisible()
  })

  it('Next button is disabled on last step', async () => {
    const screen = await render(
      <SimulationSidebar
        {...defaultProps}
        currentStep={SIMULATION_STEPS.length - 1}
      />
    )
    await expect.element(screen.getByText('Next →')).toBeVisible()
  })

  it('calls onNext when Next is clicked', async () => {
    const onNext = vi.fn()
    const screen = await render(
      <SimulationSidebar {...defaultProps} onNext={onNext} />
    )
    await screen.getByText('Next →').click()
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('calls onBack when Back is clicked', async () => {
    const onBack = vi.fn()
    const screen = await render(
      <SimulationSidebar {...defaultProps} currentStep={5} onBack={onBack} />
    )
    await screen.getByText('← Back').click()
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('calls onResume when Resume is clicked', async () => {
    const onResume = vi.fn()
    const screen = await render(
      <SimulationSidebar {...defaultProps} onResume={onResume} />
    )
    await screen.getByText('▶ Resume').click()
    expect(onResume).toHaveBeenCalledOnce()
  })

  it('calls onPause when Pause is clicked', async () => {
    const onPause = vi.fn()
    const screen = await render(
      <SimulationSidebar {...defaultProps} isRunning={true} onPause={onPause} />
    )
    await screen.getByText('⏸ Pause').click()
    expect(onPause).toHaveBeenCalledOnce()
  })

  it('renders annotation badges', async () => {
    const screen = await render(<SimulationSidebar {...defaultProps} />)
    const step = SIMULATION_STEPS[0]
    for (const ann of step.annotation) {
      await expect.element(screen.getByText(ann.type)).toBeVisible()
    }
  })

  it('updates step counter when currentStep changes', async () => {
    const screen = await render(
      <SimulationSidebar {...defaultProps} currentStep={5} />
    )
    await expect.element(screen.getByText('Step 6/21')).toBeVisible()
  })
})
