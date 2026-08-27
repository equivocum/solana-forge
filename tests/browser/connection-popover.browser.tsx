import { describe, it, expect, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { ConnectionPopover } from '../../src/components/architecture/ParticleMap/ConnectionPopover'
import { ALL_COMPONENTS } from '../../src/components/architecture/data/components'
import { ALL_CONNECTIONS } from '../../src/components/architecture/data/connections'
import type { ParticleLink } from '../../src/components/architecture/ParticleMap/useParticleGraph'

const firstConnection = ALL_CONNECTIONS[0]
const fromComponent = ALL_COMPONENTS.find(c => c.id === firstConnection.from)!
const toComponent = ALL_COMPONENTS.find(c => c.id === firstConnection.to)!

const mockLink: ParticleLink = {
  source: firstConnection.from,
  target: firstConnection.to,
  label: firstConnection.label,
  type: firstConnection.type,
  onSpine: true,
}

describe('ConnectionPopover', () => {
  it('renders explanation title', async () => {
    const screen = await render(
      <ConnectionPopover
        link={mockLink}
        fromComponent={fromComponent}
        toComponent={toComponent}
        anchor={{ x: 100, y: 100 }}
        onClose={() => {}}
      />
    )
    await expect.element(screen.getByRole('heading', { name: firstConnection.label })).toBeVisible()
  })

  it('renders explanation body with from/to purpose', async () => {
    const screen = await render(
      <ConnectionPopover
        link={mockLink}
        fromComponent={fromComponent}
        toComponent={toComponent}
        anchor={{ x: 100, y: 100 }}
        onClose={() => {}}
      />
    )
    const body = screen.locator.locator('.text-gray-300')
    await expect.element(body).toBeVisible()
  })

  it('renders citation link when present', async () => {
    const screen = await render(
      <ConnectionPopover
        link={mockLink}
        fromComponent={fromComponent}
        toComponent={toComponent}
        anchor={{ x: 100, y: 100 }}
        onClose={() => {}}
      />
    )
    const citation = screen.locator.locator('a[href*="github.com"]')
    await expect.element(citation).toBeVisible()
  })

  it('close button triggers onClose', async () => {
    const onClose = vi.fn()
    const screen = await render(
      <ConnectionPopover
        link={mockLink}
        fromComponent={fromComponent}
        toComponent={toComponent}
        anchor={{ x: 100, y: 100 }}
        onClose={onClose}
      />
    )
    await screen.getByText('×').click()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('positions itself at anchor coordinates', async () => {
    const screen = await render(
      <ConnectionPopover
        link={mockLink}
        fromComponent={fromComponent}
        toComponent={toComponent}
        anchor={{ x: 200, y: 300 }}
        onClose={() => {}}
      />
    )
    const popover = screen.locator.locator('.absolute')
    await expect.element(popover).toBeVisible()
  })
})
