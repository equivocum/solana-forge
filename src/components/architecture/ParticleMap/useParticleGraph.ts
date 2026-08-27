// useParticleGraph.ts - Builds graph data for force-graph from existing architecture model
// STAGE: particle_graph_builder
// WHY: Converts static component/connection data into a dynamic graph structure
// HOW: Pure function that maps components to nodes and connections to links

import { ALL_COMPONENTS, ALL_CONNECTIONS, TX_LIFECYCLE_PATH } from '../data'
import type { ArchitectureComponent } from '../data/components'
import type { Connection } from '../data/connections'

// ─────────────────────────────────────────────────────────────────────────────
// ParticleNode - One bubble on the map (derived from model entries)
// ─────────────────────────────────────────────────────────────────────────────
export interface ParticleNode {
  id: string               // Component: unchanged id; Sub: "<parentId>/<subId>"
  kind: 'component' | 'sub'
  refId: string            // Original component.id or sub.id for lookup back into audited content
  parentId?: string        // Set iff kind === 'sub'
  zone: ZoneId             // Pure mapping from pipeline + layer
  sizeVal: number          // Visual weight: components > subs
  label: string            // component.name / sub.name verbatim
  category: string         // Copied for color lookup
  // Simulation state (added by d3-force during runtime)
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

// ─────────────────────────────────────────────────────────────────────────────
// ParticleLink - One drawn connection (derived from ALL_CONNECTIONS)
// ─────────────────────────────────────────────────────────────────────────────
export interface ParticleLink {
  id: string               // "<from>-><to>#<label>"
  source: string           // Endpoint ParticleNode id (component only)
  target: string           // Endpoint ParticleNode id (component only)
  label: string            // Verbatim Connection.label
  type: 'data' | 'control' | 'shared'
  onSpine: boolean         // True iff edge belongs to TX_LIFECYCLE_PATH traversal
}

// ─────────────────────────────────────────────────────────────────────────────
// ZoneId - Soft spatial anchors implementing lifecycle zones
// ─────────────────────────────────────────────────────────────────────────────
export type ZoneId =
  | 'ingress'
  | 'tpu-pipeline'
  | 'tvu-replay'
  | 'runtime-shared'
  | 'consensus'
  | 'storage-networking'

// ─────────────────────────────────────────────────────────────────────────────
// GraphData - Complete graph for force-graph
// ─────────────────────────────────────────────────────────────────────────────
export interface GraphData {
  nodes: ParticleNode[]
  links: ParticleLink[]
}

// ─────────────────────────────────────────────────────────────────────────────
// zoneOf - Pure mapping from component to zone (total function)
// ─────────────────────────────────────────────────────────────────────────────
export function zoneOf(component: ArchitectureComponent): ZoneId {
  // Entry-point networking components
  if (component.id === 'rpc-api' || component.id === 'quic-streamer') {
    return 'ingress'
  }
  // Pipeline-based zones
  if (component.pipeline === 'tpu') return 'tpu-pipeline'
  if (component.pipeline === 'tvu') return 'tvu-replay'
  if (component.pipeline === 'shared') return 'runtime-shared'
  // Layer-based fallback
  if (component.layer === 'consensus') return 'consensus'
  if (component.layer === 'storage' || component.layer === 'networking') return 'storage-networking'
  // Default to runtime-shared
  return 'runtime-shared'
}

// ─────────────────────────────────────────────────────────────────────────────
// buildParticleGraph - Pure builder (asserts invariants via tests)
// ─────────────────────────────────────────────────────────────────────────────
export function buildParticleGraph(
  components: ArchitectureComponent[] = ALL_COMPONENTS,
  connections: Connection[] = ALL_CONNECTIONS
): GraphData {
  // 1. Build component nodes
  const componentNodes: ParticleNode[] = components.map(comp => ({
    id: comp.id,
    kind: 'component',
    refId: comp.id,
    zone: zoneOf(comp),
    sizeVal: 10, // larger base size for components
    label: comp.name,
    category: comp.category,
  }))

  // 2. Build sub-component nodes (namespaced IDs)
  const subNodes: ParticleNode[] = []
  for (const comp of components) {
    for (const sub of comp.subComponents) {
      subNodes.push({
        id: `${comp.id}/${sub.id}`,
        kind: 'sub',
        refId: sub.id,
        parentId: comp.id,
        zone: zoneOf(comp), // subs inherit parent zone
        sizeVal: 6, // smaller size for subs
        label: sub.name,
        category: comp.category,
      })
    }
  }

  // 3. Combine nodes
  const nodes = [...componentNodes, ...subNodes]

  // 4. Build links from connections (only component-to-component)
  const links: ParticleLink[] = connections.map(conn => ({
    id: `${conn.from}->${conn.to}#${conn.label}`,
    source: conn.from,
    target: conn.to,
    label: conn.label,
    type: conn.type,
    onSpine: TX_LIFECYCLE_PATH.includes(conn.from) && TX_LIFECYCLE_PATH.includes(conn.to),
  }))

  return { nodes, links }
}