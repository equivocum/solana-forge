import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-react'
import { PipelineFlowView } from '../../../src/components/architecture/PipelineFlowView'
import { ALL_COMPONENTS, TPU_PIPELINE, TVU_PIPELINE, SHARED_COMPONENTS } from '../../../src/components/architecture/data/components'
import { TX_LIFECYCLE_PATH } from '../../../src/components/architecture/data/connections'

describe('VRT - PipelineFlowView', () => {
  it('pipeline-full-view', async () => {
    const screen = await render(
      <PipelineFlowView
        activeComponent={null}
        highlightedComponent={null}
        currentStepId={null}
        onComponentClick={() => {}}
        onComponentHover={() => {}}
        onSubClick={() => {}}
        txPath={TX_LIFECYCLE_PATH}
        txPosition={0}
      />
    )
    await expect.element(screen.locator).toMatchScreenshot('pipeline-full-view')
  })

  it('pipeline-tpu-section', async () => {
    const screen = await render(
      <PipelineFlowView
        activeComponent={null}
        highlightedComponent={null}
        currentStepId={null}
        onComponentClick={() => {}}
        onComponentHover={() => {}}
        onSubClick={() => {}}
        txPath={TX_LIFECYCLE_PATH}
        txPosition={0}
      />
    )
    await expect.element(screen.getByText('TPU Pipeline').first()).toMatchScreenshot('pipeline-tpu-section')
  })

  it('pipeline-tvu-section', async () => {
    const screen = await render(
      <PipelineFlowView
        activeComponent={null}
        highlightedComponent={null}
        currentStepId={null}
        onComponentClick={() => {}}
        onComponentHover={() => {}}
        onSubClick={() => {}}
        txPath={TX_LIFECYCLE_PATH}
        txPosition={0}
      />
    )
    await expect.element(screen.getByText('TVU Pipeline').first()).toMatchScreenshot('pipeline-tvu-section')
  })

  it('pipeline-with-active-step', async () => {
    const screen = await render(
      <PipelineFlowView
        activeComponent={null}
        highlightedComponent={null}
        currentStepId="quic-streamer"
        onComponentClick={() => {}}
        onComponentHover={() => {}}
        onSubClick={() => {}}
        txPath={TX_LIFECYCLE_PATH}
        txPosition={1}
      />
    )
    await expect.element(screen.locator).toMatchScreenshot('pipeline-with-active-step')
  })
})
