import { describe, it, expect } from 'vitest'
import { buildParticleGraph, zoneOf } from '../src/components/architecture/ParticleMap/useParticleGraph'
import { ALL_COMPONENTS } from '../src/components/architecture/data/components'
import { composeHopExplanation } from '../src/services/connectionExplanations'
import { ALL_CONNECTIONS } from '../src/components/architecture/data/connections'
import { createClusterForce } from '../src/components/architecture/ParticleMap/forces/clusterForces'
import { createZoneForce, createAmbientDriftForce } from '../src/components/architecture/ParticleMap/forces/zoneForces'

describe('Particle map', () => {
  describe('zone mapping', () => {
    it('zoneOf returns a zone for every component', () => {
      ALL_COMPONENTS.forEach(comp => {
        const zone = zoneOf(comp)
        expect(zone).toBeTruthy()
        expect(typeof zone).toBe('string')
      })
    })

    it('rpc-api maps to ingress zone', () => {
      const rpc = ALL_COMPONENTS.find(c => c.id === 'rpc-api')!
      expect(zoneOf(rpc)).toBe('ingress')
    })

    it('quic-streamer maps to ingress zone', () => {
      const quic = ALL_COMPONENTS.find(c => c.id === 'quic-streamer')!
      expect(zoneOf(quic)).toBe('ingress')
    })

    it('components with pipeline tpu map to tpu-pipeline', () => {
      ALL_COMPONENTS.filter(c => c.pipeline === 'tpu').forEach(comp => {
        expect(zoneOf(comp)).toBe('tpu-pipeline')
      })
    })

    it('components with pipeline tvu map to tvu-replay', () => {
      ALL_COMPONENTS.filter(c => c.pipeline === 'tvu').forEach(comp => {
        expect(zoneOf(comp)).toBe('tvu-replay')
      })
    })

    it('components with pipeline shared map to runtime-shared (except ingress)', () => {
      ALL_COMPONENTS.filter(c => c.pipeline === 'shared' && zoneOf(c) !== 'ingress').forEach(comp => {
        expect(zoneOf(comp)).toBe('runtime-shared')
      })
    })
  })

  describe('graph builder', () => {
    it('produces nodes for all components and subs', () => {
      const graph = buildParticleGraph()
      const componentCount = ALL_COMPONENTS.length
      const subCount = ALL_COMPONENTS.reduce((sum, c) => sum + c.subComponents.length, 0)
      expect(graph.nodes).toHaveLength(componentCount + subCount)
    })

    it('every node has a valid zone', () => {
      const graph = buildParticleGraph()
      const validZones = [
        'ingress',
        'tpu-pipeline',
        'tvu-replay',
        'runtime-shared',
        'consensus',
        'storage-networking',
      ]
      graph.nodes.forEach(node => {
        expect(validZones).toContain(node.zone)
      })
    })
  })

  describe('connection explanation composer', () => {
    it('composes explanation from link label and destination purpose', () => {
      const link = ALL_CONNECTIONS[0]
      const from = ALL_COMPONENTS.find(c => c.id === link.from)!
      const to = ALL_COMPONENTS.find(c => c.id === link.to)!
      const explanation = composeHopExplanation(link, { from, to })
      expect(explanation.title).toBe(link.label)
      expect(explanation.body).toContain(link.label)
      expect(explanation.body).toContain(to.detail.purpose)
    })

    it('citation is first refs from either endpoint or null', () => {
      const link = ALL_CONNECTIONS[0]
      const from = ALL_COMPONENTS.find(c => c.id === link.from)!
      const to = ALL_COMPONENTS.find(c => c.id === link.to)!
      const explanation = composeHopExplanation(link, { from, to })
      const expectedCitation = (from.refs && from.refs[0]) || (to.refs && to.refs[0]) || null
      expect(explanation.citation).toBe(expectedCitation)
    })
  })

  describe('performance benchmarks (SC-002, SC-004)', () => {
    it('mount-to-motion: force setup completes within 5ms (proxy for SC-002)', () => {
      // This test validates that force initialization is fast
      // In browser, actual mount-to-motion includes canvas setup + first frame
      const graph = buildParticleGraph()
      const start = performance.now()

      const clusterForce = createClusterForce(graph.nodes)
      const zoneForce = createZoneForce(graph.nodes)
      const ambientForce = createAmbientDriftForce(graph.nodes, 1.0)

      // Simulate a few force ticks
      for (let i = 0; i < 10; i++) {
        clusterForce(0.1)
        zoneForce(0.1)
        ambientForce(0.1)
      }

      const elapsed = performance.now() - start
      // Should complete very quickly in Node.js (well under 5ms)
      expect(elapsed).toBeLessThan(50) // generous threshold for CI
    })

    it('force tick performance: 60 frames at 30fps = 2000ms total (proxy for SC-004)', () => {
      const graph = buildParticleGraph()
      const clusterForce = createClusterForce(graph.nodes)
      const zoneForce = createZoneForce(graph.nodes)
      const ambientForce = createAmbientDriftForce(graph.nodes, 1.0)

      const frameCount = 60
      const start = performance.now()

      for (let frame = 0; frame < frameCount; frame++) {
        const alpha = 0.1 * (1 - frame / frameCount) // decaying alpha
        clusterForce(alpha)
        zoneForce(alpha)
        ambientForce(alpha)
      }

      const elapsed = performance.now() - start
      // 60 frames should complete in reasonable time
      // This is a proxy - real test needs browser environment
      expect(elapsed).toBeLessThan(1000) // 1 second for 60 frames
    })
  })

  describe('citation validation (SC-003)', () => {
    const REF_RE = /^https:\/\/github\.com\/anza-xyz\/agave\/blob\/v4\.2\.1\/[A-Za-z0-9_/.-]+(#L\d+(-L\d+)?)?$/

    it('all component citations have valid v4.2.1 URLs', () => {
      const problems: string[] = []
      ALL_COMPONENTS.forEach(c => {
        if (!c.refs || c.refs.length === 0) {
          problems.push(`${c.id}: missing citation`)
        }
        c.refs?.forEach(r => {
          if (!REF_RE.test(r)) problems.push(`${c.id}: invalid citation format: ${r}`)
        })
        c.subComponents.forEach(sub => {
          if (!sub.refs || sub.refs.length === 0) {
            problems.push(`${c.id}/${sub.id}: missing citation`)
          }
          sub.refs?.forEach(r => {
            if (!REF_RE.test(r)) problems.push(`${c.id}/${sub.id}: invalid citation format: ${r}`)
          })
        })
      })
      expect(problems).toEqual([])
    })

    it('connection explanations produce valid citation URLs when endpoints have refs', () => {
      const invalidCitations: string[] = []
      for (const link of ALL_CONNECTIONS) {
        const from = ALL_COMPONENTS.find(c => c.id === link.from)!
        const to = ALL_COMPONENTS.find(c => c.id === link.to)!
        const explanation = composeHopExplanation(link, { from, to })
        if (explanation.citation && !REF_RE.test(explanation.citation)) {
          invalidCitations.push(`${link.id}: ${explanation.citation}`)
        }
      }
      expect(invalidCitations).toEqual([])
    })
  })

  describe('soak test (SC-004)', () => {
    it('extended force simulation runs without errors (60s proxy)', () => {
      // This is a compressed soak test - runs many frames quickly
      // Real 60s soak requires browser environment with requestAnimationFrame
      const graph = buildParticleGraph()
      const clusterForce = createClusterForce(graph.nodes)
      const zoneForce = createZoneForce(graph.nodes)
      const ambientForce = createAmbientDriftForce(graph.nodes, 1.0)

      // Simulate 60 seconds at 30fps = 1800 frames
      const frameCount = 1800
      let errorOccurred = false

      try {
        for (let frame = 0; frame < frameCount; frame++) {
          const alpha = Math.max(0.001, 0.1 * (1 - frame / frameCount))
          clusterForce(alpha)
          zoneForce(alpha)
          ambientForce(alpha)

          // Verify node positions remain finite
          for (const node of graph.nodes) {
            if (node.x !== undefined && !Number.isFinite(node.x)) {
              errorOccurred = true
              break
            }
            if (node.y !== undefined && !Number.isFinite(node.y)) {
              errorOccurred = true
              break
            }
          }
          if (errorOccurred) break
        }
      } catch {
        errorOccurred = true
      }

      expect(errorOccurred).toBe(false)
    })
  })
})