import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-react'
import { ZoomPanel } from '../../src/components/architecture/ZoomPanel'
import { ALL_COMPONENTS } from '../../src/components/architecture/data/components'

const QUIC = ALL_COMPONENTS.find(c => c.id === 'quic-streamer')!
const RPC = ALL_COMPONENTS.find(c => c.id === 'rpc-api')!

describe('ZoomPanel', () => {
  it('renders component name and purpose', async () => {
    const screen = await render(
      <ZoomPanel component={QUIC} onClose={() => {}} />
    )
    await expect.element(screen.getByText(QUIC.name)).toBeVisible()
    await expect.element(screen.getByText(QUIC.detail.purpose)).toBeVisible()
  })

  it('renders role section', async () => {
    const screen = await render(
      <ZoomPanel component={QUIC} onClose={() => {}} />
    )
    await expect.element(screen.getByText('Role')).toBeVisible()
    await expect.element(screen.getByText(QUIC.detail.role)).toBeVisible()
  })

  it('renders how-it-works section with steps', async () => {
    const screen = await render(
      <ZoomPanel component={QUIC} onClose={() => {}} />
    )
    await expect.element(screen.getByText(/How It Works/)).toBeVisible()
    // Steps are rendered as numbered list items
    await expect.element(screen.getByText(QUIC.detail.howItWorks.steps[0])).toBeVisible()
  })

  it('renders why-it-matters section', async () => {
    const screen = await render(
      <ZoomPanel component={QUIC} onClose={() => {}} />
    )
    await expect.element(screen.getByText('Why It Matters')).toBeVisible()
    await expect.element(screen.getByText(QUIC.detail.whyItMatters)).toBeVisible()
  })

  it('renders metrics when present', async () => {
    const screen = await render(
      <ZoomPanel component={QUIC} onClose={() => {}} />
    )
    if (QUIC.detail.metrics && QUIC.detail.metrics.length > 0) {
      await expect.element(screen.getByText('Key Metrics')).toBeVisible()
    }
  })

  it('renders sub-components list', async () => {
    const screen = await render(
      <ZoomPanel component={QUIC} onClose={() => {}} />
    )
    if (QUIC.subComponents.length > 0) {
      await expect.element(screen.getByText(/Sub-Components/)).toBeVisible()
      for (const sub of QUIC.subComponents) {
        await expect.element(screen.getByText(sub.name, { exact: true })).toBeVisible()
      }
    }
  })

  it('renders citations when present', async () => {
    const screen = await render(
      <ZoomPanel component={RPC} onClose={() => {}} />
    )
    if (RPC.refs && RPC.refs.length > 0) {
      await expect.element(screen.getByText('Sources (Agave v4.2.1)')).toBeVisible()
    }
  })

  it('close button triggers onClose', async () => {
    let closed = false
    const screen = await render(
      <ZoomPanel component={QUIC} onClose={() => { closed = true }} />
    )
    await screen.getByRole('button', { name: '✕' }).click()
    expect(closed).toBe(true)
  })

  it('clicking a sub-component shows detail view', async () => {
    const screen = await render(
      <ZoomPanel component={QUIC} onClose={() => {}} />
    )
    if (QUIC.subComponents.length > 0) {
      const firstSub = QUIC.subComponents[0]
      await screen.getByText(firstSub.name).click()
      await expect.element(screen.getByText(/Back to/)).toBeVisible()
    }
  })

  it('back button returns to main view', async () => {
    const screen = await render(
      <ZoomPanel component={QUIC} onClose={() => {}} />
    )
    if (QUIC.subComponents.length > 0) {
      const firstSub = QUIC.subComponents[0]
      await screen.getByText(firstSub.name).click()
      await screen.getByText(/Back to/).click()
      await expect.element(screen.getByText(QUIC.detail.purpose)).toBeVisible()
    }
  })
})
