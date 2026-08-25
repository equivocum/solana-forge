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
  { from: 'tower-bft', to: 'accounts-db', label: 'Root advancement → async consolidation', type: 'control' },
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
  { from: 'poh', to: 'tower-bft', label: 'Timestamps', type: 'shared' },
  { from: 'tower-bft', to: 'replay-stage', label: 'Fork decision', type: 'control' },
  { from: 'svm-pipeline', to: 'tower-bft', label: 'Recomputed results', type: 'data' },
  { from: 'cluster-info-vote-listener', to: 'tower-bft', label: 'Confirmation signals', type: 'control' },
]

// Vote return loop: how votes travel back into the cluster
// replay generates vote ops → VotingService publishes outward → votes return via
// gossip → ClusterInfoVoteListener verifies them and feeds verified gossip votes
// into Banking Stage when we are (or will be) leader.
export const VOTE_FLOW: Connection[] = [
  { from: 'replay-stage', to: 'voting-service', label: 'Vote ops', type: 'control' },
  { from: 'tower-bft', to: 'voting-service', label: 'Gated vote ops', type: 'control' },
  { from: 'voting-service', to: 'gossip', label: 'Publish votes', type: 'data' },
  { from: 'gossip', to: 'cluster-info-vote-listener', label: 'Cluster votes', type: 'data' },
  { from: 'cluster-info-vote-listener', to: 'banking-stage', label: 'Verified gossip votes', type: 'data' },
]

export const ALL_CONNECTIONS: Connection[] = [
  ...TPU_FLOW,
  ...TVU_FLOW,
  ...CROSS_PIPELINE,
  ...NETWORKING_CONNECTIONS,
  ...CONSENSUS_CONNECTIONS,
  ...VOTE_FLOW,
]

// Transaction lifecycle path (for animated bubble)
// Corrected per Agave v4.2.1: duplicate/blockhash checks live in banking consumption,
// execution is a library invoked by both paths, PoH recording happens immediately after
// execution, votes return via the VOTE_FLOW loop, and durable persistence is asynchronous.
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
  'tower-bft', // fork choice gates every vote
  'voting-service', // our vote goes out
  'gossip', // and travels the cluster mesh
  'cluster-info-vote-listener', // other validators' votes return here
  'tower-bft', // thresholds met → root advancement / fork pruning
  'accounts-db', // async consolidation completes the journey
]
