import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-react'
import { ComponentNode } from '../../src/components/architecture/ComponentNode'
import { ALL_COMPONENTS } from '../../src/components/architecture/data/components'

const QUIC = ALL_COMPONENTS.find(c => c.id === 'quic-streamer')!
const RPC = ALL_COMPONENTS.find(c => c.id === 'rpc-api')!

describe('ComponentNode', () => {
  it('renders component icon and name', async () => {
    const screen = await render(
      <ComponentNode component={QUIC} onClick={() => {}} />
    )
    await expect.element(screen.getByText(QUIC.icon)).toBeVisible()
    await expect.element(screen.getByText(QUIC.name)).toBeVisible()
  })

  it('shows sub-component count when present', async () => {
    const screen = await render(
      <ComponentNode component={QUIC} onClick={() => {}} />
    )
    if (QUIC.subComponents.length > 0) {
      await expect.element(screen.getByText(`${QUIC.subComponents.length} sub`)).toBeVisible()
    }
  })

  it('shows SELECTED badge when isActive', async () => {
    const screen = await render(
      <ComponentNode component={QUIC} isActive={true} onClick={() => {}} />
    )
    await expect.element(screen.getByText('SELECTED')).toBeVisible()
  })

  it('shows CURRENT badge when isCurrentStep', async () => {
    const screen = await render(
      <ComponentNode component={QUIC} isCurrentStep={true} onClick={() => {}} />
    )
    await expect.element(screen.getByText('CURRENT')).toBeVisible()
  })

  it('calls onClick when clicked', async () => {
    let clicked = false
    const screen = await render(
      <ComponentNode component={QUIC} onClick={() => { clicked = true }} />
    )
    await screen.getByText(QUIC.name).click()
    expect(clicked).toBe(true)
  })

  it('shows hover hint on mouse enter', async () => {
    const screen = await render(
      <ComponentNode component={QUIC} onClick={() => {}} />
    )
    const button = screen.getByTitle(`${QUIC.name} — Click to explore`)
    await button.hover()
    await expect.element(screen.getByText('click to explore')).toBeVisible()
  })

  it('renders different component correctly', async () => {
    const screen = await render(
      <ComponentNode component={RPC} onClick={() => {}} />
    )
    await expect.element(screen.getByText(RPC.icon)).toBeVisible()
    await expect.element(screen.getByText(RPC.name)).toBeVisible()
  })
})
