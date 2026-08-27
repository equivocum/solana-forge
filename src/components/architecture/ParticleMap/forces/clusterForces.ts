// clusterForces.ts - Parent-attraction force for sub-components
// STAGE: particle_forces
// WHY: Keeps sub-components adjacent to their parent bubbles (FR-002)
// HOW: Pure config builder that returns d3-force compatible force configurations

import type { ParticleNode } from '../useParticleGraph'

// ─────────────────────────────────────────────────────────────────────────────
// clusterStrength - Returns attraction strength based on node kind
// ─────────────────────────────────────────────────────────────────────────────
export function clusterStrength(node: ParticleNode): number {
  // Sub-components have stronger attraction to parent
  if (node.kind === 'sub') return 0.7
  // Components have weak self-clustering
  return 0.1
}

// ─────────────────────────────────────────────────────────────────────────────
// createClusterForce - Creates a d3-force compatible force function
// ─────────────────────────────────────────────────────────────────────────────
export function createClusterForce(nodes: ParticleNode[]): (alpha: number) => void {
  // Build a map for O(1) parent lookup
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  return (alpha: number) => {
    for (const node of nodes) {
      if (node.kind !== 'sub' || !node.parentId) continue

      const parent = nodeMap.get(node.parentId)
      if (!parent) continue

      // Spring force toward parent
      const px = parent.x ?? 0
      const py = parent.y ?? 0
      const nx = node.x ?? 0
      const ny = node.y ?? 0
      const dx = px - nx
      const dy = py - ny
      const dist = Math.sqrt(dx * dx + dy * dy) || 1

      // Attraction strength increases with distance, scaled by alpha
      const strength = clusterStrength(node) * alpha
      const fx = (dx / dist) * strength
      const fy = (dy / dist) * strength

      // Apply force to sub-component (lighter, moves more)
      node.vx = (node.vx ?? 0) + fx
      node.vy = (node.vy ?? 0) + fy

      // Apply opposite force to parent (heavier, moves less)
      const parentMass = 3 // parent is visually 3x larger
      parent.vx = (parent.vx ?? 0) - fx / parentMass
      parent.vy = (parent.vy ?? 0) - fy / parentMass
    }
  }
}