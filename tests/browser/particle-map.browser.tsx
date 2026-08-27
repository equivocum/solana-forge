import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-react'
import { ParticleMapView } from '../../src/components/architecture/ParticleMap/ParticleMapView'
import { ALL_COMPONENTS } from '../../src/components/architecture/data/components'

describe('ParticleMapView', () => {
  it('renders canvas container', async () => {
    const screen = await render(
      <ParticleMapView
        components={ALL_COMPONENTS}
        activeComponent={null}
        highlightedComponent={null}
        currentStepId={null}
        onComponentClick={() => {}}
        onComponentHover={() => {}}
        onSubClick={() => {}}
      />
    )
    await expect.element(screen.locator).toBeVisible()
  })

  it('renders with active component', async () => {
    const screen = await render(
      <ParticleMapView
        components={ALL_COMPONENTS}
        activeComponent="quic-streamer"
        highlightedComponent={null}
        currentStepId={null}
        onComponentClick={() => {}}
        onComponentHover={() => {}}
        onSubClick={() => {}}
      />
    )
    await expect.element(screen.locator).toBeVisible()
  })

  it('renders with highlighted component', async () => {
    const screen = await render(
      <ParticleMapView
        components={ALL_COMPONENTS}
        activeComponent={null}
        highlightedComponent="rpc-api"
        currentStepId={null}
        onComponentClick={() => {}}
        onComponentHover={() => {}}
        onSubClick={() => {}}
      />
    )
    await expect.element(screen.locator).toBeVisible()
  })

  it('renders with current step for tour', async () => {
    const screen = await render(
      <ParticleMapView
        components={ALL_COMPONENTS}
        activeComponent={null}
        highlightedComponent={null}
        currentStepId="quic-streamer"
        onComponentClick={() => {}}
        onComponentHover={() => {}}
        onSubClick={() => {}}
      />
    )
    await expect.element(screen.locator).toBeVisible()
  })
})
