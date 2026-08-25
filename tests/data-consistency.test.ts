import { describe, it, expect } from 'vitest'
import { SIMULATION_STEPS } from '../src/components/architecture/data/simulation-steps'
import {
  TX_LIFECYCLE_PATH,
  ALL_CONNECTIONS,
} from '../src/components/architecture/data/connections'
import { ALL_COMPONENTS } from '../src/components/architecture/data/components'

const connectionSet = new Set(ALL_CONNECTIONS.map(c => `${c.from}->${c.to}`))
const componentIds = new Set(ALL_COMPONENTS.map(c => c.id))

describe('Data consistency', () => {
  it('TX_LIFECYCLE_PATH length matches SIMULATION_STEPS length', () => {
    expect(TX_LIFECYCLE_PATH).toHaveLength(SIMULATION_STEPS.length)
  })

  it('every TX_LIFECYCLE_PATH entry references a valid component', () => {
    TX_LIFECYCLE_PATH.forEach(id => {
      expect(componentIds.has(id)).toBe(true)
    })
  })

  it('every SIMULATION_STEPS componentId references a valid component', () => {
    SIMULATION_STEPS.forEach(step => {
      expect(componentIds.has(step.componentId)).toBe(true)
    })
  })

  it('SIMULATION_STEPS componentIds align with TX_LIFECYCLE_PATH', () => {
    SIMULATION_STEPS.forEach((step, i) => {
      expect(step.componentId).toBe(TX_LIFECYCLE_PATH[i])
    })
  })

  it('consecutive lifecycle pairs are connected (contract C-4)', () => {
    for (let i = 0; i < TX_LIFECYCLE_PATH.length - 1; i++) {
      const pair = `${TX_LIFECYCLE_PATH[i]}->${TX_LIFECYCLE_PATH[i + 1]}`
      expect(connectionSet.has(pair), `missing edge: ${pair}`).toBe(true)
    }
  })

  it('corrected-model edges removed and required edges present (contract C-3/C-5)', () => {
    expect(connectionSet.has('sig-verify->status-cache')).toBe(false)
    expect(connectionSet.has('tower-bft->epoch-schedule')).toBe(false)
    expect(connectionSet.has('svm-pipeline->poh-recording')).toBe(true)
    expect(connectionSet.has('blockstore->replay-stage')).toBe(true)
  })

  it('lifecycle path starts at ingress and ends at async persistence home (C-4)', () => {
    expect(TX_LIFECYCLE_PATH[0]).toBe('quic-streamer')
    expect(TX_LIFECYCLE_PATH[TX_LIFECYCLE_PATH.length - 1]).toBe('accounts-db')
  })
})
