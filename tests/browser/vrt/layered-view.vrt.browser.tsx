import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-react'
import { LayeredView } from '../../../src/components/architecture/LayeredView'

describe('VRT - LayeredView', () => {
  it('layered-full-view', async () => {
    const screen = await render(
      <LayeredView
        activeComponent={null}
        highlightedComponent={null}
        currentStepId={null}
        onComponentClick={() => {}}
        onComponentHover={() => {}}
        onSubClick={() => {}}
      />
    )
    await expect.element(screen.locator).toMatchScreenshot('layered-full-view')
  })

  it('layered-data-flow-legend', async () => {
    const screen = await render(
      <LayeredView
        activeComponent={null}
        highlightedComponent={null}
        currentStepId={null}
        onComponentClick={() => {}}
        onComponentHover={() => {}}
        onSubClick={() => {}}
      />
    )
    await expect.element(screen.getByText('Data Flow Direction')).toMatchScreenshot('layered-data-flow-legend')
  })

  it('layered-with-active-component', async () => {
    const screen = await render(
      <LayeredView
        activeComponent="quic-streamer"
        highlightedComponent={null}
        currentStepId={null}
        onComponentClick={() => {}}
        onComponentHover={() => {}}
        onSubClick={() => {}}
      />
    )
    await expect.element(screen.locator).toMatchScreenshot('layered-with-active-component')
  })
})
