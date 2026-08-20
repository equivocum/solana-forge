import { describe, it, expect } from 'vitest'
import { SIMULATION_STEPS } from '../src/components/architecture/data/simulation-steps'
import { TX_LIFECYCLE_PATH } from '../src/components/architecture/data/connections'
import { ALL_COMPONENTS } from '../src/components/architecture/data/components'

describe('Data consistency', () => {
  it('TX_LIFECYCLE_PATH length matches SIMULATION_STEPS length', () => {
    expect(TX_LIFECYCLE_PATH).toHaveLength(SIMULATION_STEPS.length)
  })

  it('every TX_LIFECYCLE_PATH entry references a valid component', () => {
    const componentIds = new Set(ALL_COMPONENTS.map(c => c.id))
    TX_LIFECYCLE_PATH.forEach((id, i) => {
      expect(componentIds.has(id)).toBe(true)
    })
  })

  it('every SIMULATION_STEPS componentId references a valid component', () => {
    const componentIds = new Set(ALL_COMPONENTS.map(c => c.id))
    SIMULATION_STEPS.forEach((step, i) => {
      expect(componentIds.has(step.componentId)).toBe(true)
    })
  })

  it('SIMULATION_STEPS componentIds align with TX_LIFECYCLE_PATH', () => {
    SIMULATION_STEPS.forEach((step, i) => {
      expect(step.componentId).toBe(TX_LIFECYCLE_PATH[i])
    })
  })
})
