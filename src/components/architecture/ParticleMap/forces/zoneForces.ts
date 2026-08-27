// zoneForces.ts - Soft lifecycle-zone x/y anchors (pure config builders)
// STAGE: particle_forces
// WHY: Positions component clusters along transaction lifecycle order (FR-012)
// HOW: Pure functions that map zone IDs to anchor coordinates

import type { ParticleNode, ZoneId } from '../useParticleGraph'

// ─────────────────────────────────────────────────────────────────────────────
// ZoneAnchor - Coordinate anchor for a zone
// ─────────────────────────────────────────────────────────────────────────────
export interface ZoneAnchor {
  x: number
  y: number
}

// ─────────────────────────────────────────────────────────────────────────────
// zoneAnchors - Ordered left→right along the journey
// ─────────────────────────────────────────────────────────────────────────────
export function zoneAnchors(): Record<ZoneId, ZoneAnchor> {
  return {
    ingress: { x: -400, y: 0 },
    'tpu-pipeline': { x: -200, y: 0 },
    'tvu-replay': { x: 0, y: 0 },
    'runtime-shared': { x: 200, y: 0 },
    consensus: { x: 400, y: 0 },
    'storage-networking': { x: 600, y: 0 },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// zoneForceStrength - How strongly nodes are pulled toward zone anchor
// ─────────────────────────────────────────────────────────────────────────────
export function zoneForceStrength(): number {
  return 0.1 // weak guidance, not rigid walls
}

// ─────────────────────────────────────────────────────────────────────────────
// createZoneForce - Creates a d3-force compatible force function for zone anchoring
// ─────────────────────────────────────────────────────────────────────────────
export function createZoneForce(nodes: ParticleNode[]): (alpha: number) => void {
  const anchors = zoneAnchors()
  const strength = zoneForceStrength()

  return (alpha: number) => {
    for (const node of nodes) {
      const anchor = anchors[node.zone]
      if (!anchor) continue

      const nx = node.x ?? 0
      const ny = node.y ?? 0
      const dx = anchor.x - nx
      const dy = anchor.y - ny
      const dist = Math.sqrt(dx * dx + dy * dy) || 1

      // Weak attraction toward zone anchor, scaled by alpha
      const forceStrength = strength * alpha
      const fx = (dx / dist) * forceStrength
      const fy = (dy / dist) * forceStrength

      node.vx = (node.vx ?? 0) + fx
      node.vy = (node.vy ?? 0) + fy
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// createAmbientDriftForce - Weak brownian motion for continuous ambient drift (FR-004)
// ─────────────────────────────────────────────────────────────────────────────
export function createAmbientDriftForce(nodes: ParticleNode[], driftAmplitude: number): (alpha: number) => void {
  return (alpha: number) => {
    for (const node of nodes) {
      // Small random force for ambient drift
      const angle = Math.random() * Math.PI * 2
      const force = driftAmplitude * alpha * 0.5
      node.vx = (node.vx ?? 0) + Math.cos(angle) * force
      node.vy = (node.vy ?? 0) + Math.sin(angle) * force
    }
  }
}