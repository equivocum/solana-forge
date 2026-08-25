// Data flow connections between architecture components
// Defines how data flows through the validator

export interface Connection {
  from: string
  to: string
  label: string
  type: 'data' | 'control' | 'shared'
}

// TPU Pipeline Flow (when leader)
export const TPU_FLOW: Connection[] = [
  { from: 'quic-streamer', to: 'tpu-fetch', label: 'Packets', type: 'data' },
  { from: 'tpu-fetch', to: 'sig-verify', label: 'Raw txs', type: 'data' },
  { from: 'sig-verify', to: 'banking-stage', label: 'Verified txs', type: 'data' },
  { from: 'banking-stage', to: 'svm-pipeline', label: 'Scheduled batches', type: 'data' },
  { from: 'svm-pipeline', to: 'poh-recording', label: 'Executed batches', type: 'data' },
  { from: 'poh-recording', to: 'broadcast', label: 'Recorded entries', type: 'data' },
  { from: 'broadcast', to: 'turbine', label: 'Shreds', type: 'data' },
]

// TVU Pipeline Flow (always receiving)
export const TVU_FLOW: Connection[] = [
  { from: 'turbine', to: 'shred-fetch', label: 'Shreds', type: 'data' },
  { from: 'shred-fetch', to: 'shred-sig-verify', label: 'Raw shreds', type: 'data' },
  { from: 'shred-sig-verify', to: 'window-service', label: 'Verified shreds', type: 'data' },
  { from: 'window-service', to: 'replay-stage', label: 'Assembled entries', type: 'data' },
  { from: 'replay-stage', to: 'tower-bft', label: 'Execution results', type: 'control' },
]

// Cross-pipeline connections
export const CROSS_PIPELINE: Connection[] = [
  { from: 'banking-stage', to: 'svm-pipeline', label: 'Execute txs', type: 'data' },
  { from: 'replay-stage', to: 'svm-pipeline', label: 'Execute txs', type: 'data' },
  { from: 'svm-pipeline', to: 'accounts-db', label: 'State changes', type: 'data' },
  { from: 'banking-stage', to: 'accounts-db', label: 'Read/write accounts', type: 'data' },
  { from: 'replay-stage', to: 'accounts-db', label: 'Read/write accounts', type: 'data' },
  { from: 'window-service', to: 'blockstore', label: 'Store shreds', type: 'data' },
  { from: 'broadcast', to: 'blockstore', label: 'Store shreds', type: 'data' },
  { from: 'blockstore', to: 'replay-stage', label: 'Completed slots', type: 'data' },
  { from: 'banking-stage', to: 'status-cache', label: 'Status checks', type: 'control' },
]

// Networking connections
export const NETWORKING_CONNECTIONS: Connection[] = [
  { from: 'gossip', to: 'turbine', label: 'Peer info', type: 'shared' },
  { from: 'gossip', to: 'tower-bft', label: 'Cluster info', type: 'shared' },
  { from: 'repair', to: 'window-service', label: 'Missing shreds', type: 'data' },
  { from: 'gulf-stream', to: 'quic-streamer', label: 'Forwarded txs', type: 'data' },
]

// Consensus connections
export const CONSENSUS_CONNECTIONS: Connection[] = [
  { from: 'tower-bft', to: 'epoch-schedule', label: 'Leader rotation', type: 'control' },
  { from: 'poh', to: 'tower-bft', label: 'Timestamps', type: 'shared' },
  { from: 'tower-bft', to: 'replay-stage', label: 'Fork decision', type: 'control' },
]

export const ALL_CONNECTIONS: Connection[] = [
  ...TPU_FLOW,
  ...TVU_FLOW,
  ...CROSS_PIPELINE,
  ...NETWORKING_CONNECTIONS,
  ...CONSENSUS_CONNECTIONS,
]

// Transaction lifecycle path (for animated bubble)
// Corrected per Agave v4.2.1: duplicate/blockhash checks live in banking consumption,
// execution is a library invoked by both paths, PoH recording happens immediately after
// execution, and durable persistence is asynchronous (final stop).
// Vote-return loop and finalization steps extend this path in Phase 4 (US2, T015/T016).
export const TX_LIFECYCLE_PATH = [
  'quic-streamer',
  'tpu-fetch',
  'sig-verify',
  'banking-stage',
  'svm-pipeline',
  'poh-recording',
  'broadcast',
  'turbine',
  'shred-fetch',
  'shred-sig-verify',
  'window-service',
  'blockstore',
  'replay-stage',
  'svm-pipeline', // validation side: replay executes through the same runtime library
  'accounts-db', // executed deltas land here; durable consolidation is asynchronous
]
