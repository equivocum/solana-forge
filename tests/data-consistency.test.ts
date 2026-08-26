import { describe, it, expect } from 'vitest'
import { SIMULATION_STEPS } from '../src/components/architecture/data/simulation-steps'
import {
  TX_LIFECYCLE_PATH,
  ALL_CONNECTIONS,
  VOTE_FLOW,
} from '../src/components/architecture/data/connections'
import { ALL_COMPONENTS } from '../src/components/architecture/data/components'
import { LAYERS } from '../src/components/architecture/data/components'

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

  it('lifecycle path starts at submission and ends at async persistence home (C-4)', () => {
    expect(TX_LIFECYCLE_PATH[0]).toBe('rpc-api')
    expect(TX_LIFECYCLE_PATH[TX_LIFECYCLE_PATH.length - 1]).toBe('accounts-db')
  })

  it('VOTE_FLOW is non-empty and included in ALL_CONNECTIONS (contract C-3/C-5)', () => {
    expect(VOTE_FLOW.length).toBeGreaterThan(0)
    VOTE_FLOW.forEach(edge => {
      expect(
        ALL_CONNECTIONS.some(c => c.from === edge.from && c.to === edge.to && c.label === edge.label)
      ).toBe(true)
    })
  })

  it('every connection endpoint references an existing component (C-5)', () => {
    ALL_CONNECTIONS.forEach(edge => {
      expect(componentIds.has(edge.from), `unknown from: ${edge.from}`).toBe(true)
      expect(componentIds.has(edge.to), `unknown to: ${edge.to}`).toBe(true)
    })
  })

  it('new consensus services exist as first-class nodes (FR-011 subset)', () => {
    expect(componentIds.has('cluster-info-vote-listener')).toBe(true)
    expect(componentIds.has('voting-service')).toBe(true)
  })

  it('client-facing submission entry exists and feeds ingress (FR-011)', () => {
    expect(componentIds.has('rpc-api')).toBe(true)
    expect(TX_LIFECYCLE_PATH[0]).toBe('rpc-api')
    expect(connectionSet.has('rpc-api->quic-streamer')).toBe(true)
  })

  it('forwarding is a single merged node wired to sig-verify and quic (FR-014)', () => {
    expect(componentIds.has('forwarding')).toBe(true)
    expect(componentIds.has('gulf-stream')).toBe(false)
    expect(connectionSet.has('gulf-stream->quic-streamer')).toBe(false)
    expect(connectionSet.has('sig-verify->forwarding')).toBe(true)
    expect(connectionSet.has('forwarding->quic-streamer')).toBe(true)
  })

  it('every component is render-ready: unique id, layer, position (T023 gate)', () => {
    const ids = ALL_COMPONENTS.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    ALL_COMPONENTS.forEach(c => {
      expect(c.name.length).toBeGreaterThan(0)
      expect(c.layer, `${c.id} missing layer`).toBeTruthy()
      expect(typeof c.position).toBe('number')
    })
  })

  it('every layer bucket is non-empty so both views render all nodes', () => {
    ;(['networking','tpu','tvu','runtime','consensus','storage','programs'] as const).forEach(k => {
      expect(LAYERS[k].length, `layer ${k} empty`).toBeGreaterThan(0)
    })
    // new US3 nodes land in their declared layers
    expect(LAYERS.networking.some(c => c.id === 'rpc-api')).toBe(true)
    expect(LAYERS.consensus.some(c => c.id === 'cluster-info-vote-listener')).toBe(true)
    expect(LAYERS.consensus.some(c => c.id === 'voting-service')).toBe(true)
  })

  it('every component carries ≥1 pinned v4.2.1 citation with correct grammar (C-1/C-5)', () => {
    const REF_RE =
      /^https:\/\/github\.com\/anza-xyz\/agave\/blob\/v4\.2\.1\/[A-Za-z0-9_/.-]+(#L\d+(-L\d+)?)?$/
    ALL_COMPONENTS.forEach(c => {
      expect(c.refs, `${c.id} has no refs`).toBeDefined()
      expect(c.refs!.length, `${c.id} needs ≥1 ref`).toBeGreaterThanOrEqual(1)
      c.refs!.forEach(r => {
        expect(REF_RE.test(r), `${c.id} bad citation grammar: ${r}`).toBe(true)
      })
    })
  })
})
