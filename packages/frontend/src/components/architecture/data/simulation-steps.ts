// Simulation steps for Guided Tour mode
// Each step represents a stage in the transaction lifecycle

export interface SimulationStep {
  id: string
  componentId: string
  title: string
  description: string
  annotation: {
    type: 'STAGE' | 'WHY' | 'HOW' | 'REF' | 'DECISION' | 'BYTES'
    content: string
    sourceRef: string
  }[]
  duration: number // ms before auto-advancing
}

export const SIMULATION_STEPS: SimulationStep[] = [
  {
    id: 'step-1',
    componentId: 'quic-streamer',
    title: 'Transaction arrives via QUIC',
    description: 'Client sends signed transaction over QUIC with TLS 1.3 encryption.',
    annotation: [
      { type: 'STAGE', content: 'QUIC Streamer receives incoming transaction packets', sourceRef: 'quic_streamer.rs' },
      { type: 'HOW', content: 'TLS 1.3 with ALPN "solana-tpu". Each tx sent as separate unidirectional QUIC stream.', sourceRef: 'quic_streamer.rs' },
      { type: 'BYTES', content: 'Max tx payload: 1,232 bytes (IPv6 MTU). TLS handshake: 1 RTT.', sourceRef: 'quic_streamer.rs' },
    ],
    duration: 3000,
  },
  {
    id: 'step-2',
    componentId: 'tpu-fetch',
    title: 'Fetch Stage ingests packets',
    description: 'Raw transaction packets are buffered and prepared for signature verification.',
    annotation: [
      { type: 'STAGE', content: 'Fetch Stage receives packets from QUIC streamer', sourceRef: 'fetch_stage.rs' },
      { type: 'HOW', content: 'Three separate QUIC servers: user transactions, votes, forwarding. SO_REUSEPORT for parallel socket binding.', sourceRef: 'fetch_stage.rs' },
    ],
    duration: 2500,
  },
  {
    id: 'step-3',
    componentId: 'sig-verify',
    title: 'Parallel signature verification',
    description: 'Ed25519 signatures verified in parallel across GPU/AVX512 cores.',
    annotation: [
      { type: 'STAGE', content: 'SigVerify validates transaction signatures in parallel', sourceRef: 'sigverify_stage.rs' },
      { type: 'HOW', content: 'Parallel Ed25519 verification. Deduplication removes duplicate packets. Load shedding discards excessive packets.', sourceRef: 'sigverify_stage.rs' },
      { type: 'BYTES', content: 'Signature cost: 720 CUs. Ed25519 verify: 2,280 CUs.', sourceRef: 'compute_budget.rs' },
    ],
    duration: 3000,
  },
  {
    id: 'step-4',
    componentId: 'status-cache',
    title: 'Deduplication check',
    description: 'Status Cache checks if this transaction was already processed.',
    annotation: [
      { type: 'STAGE', content: 'Status Cache deduplicates transactions', sourceRef: 'status_cache.rs' },
      { type: 'DECISION', content: 'If signature found in cache: discard. If new: proceed to Banking Stage.', sourceRef: 'status_cache.rs' },
    ],
    duration: 2000,
  },
  {
    id: 'step-5',
    componentId: 'banking-stage',
    title: 'Banking Stage schedules transaction',
    description: 'Central Scheduler builds priority DAG and dispatches to worker threads.',
    annotation: [
      { type: 'STAGE', content: 'Banking Stage schedules and executes transactions', sourceRef: 'banking_stage.rs' },
      { type: 'HOW', content: '6 threads: 4 regular + 2 vote. Central Scheduler builds Prio-Graph DAG. Non-conflicting txs scheduled in parallel.', sourceRef: 'banking_stage.rs' },
      { type: 'DECISION', content: 'Priority = reward * 1,000,000 / (cost + 1). Higher priority = scheduled first.', sourceRef: 'prio_graph.rs' },
    ],
    duration: 4000,
  },
  {
    id: 'step-6',
    componentId: 'svm-pipeline',
    title: 'SVM executes transaction',
    description: 'Transaction processed through Block Processor → Transaction Processor → Instruction Processor.',
    annotation: [
      { type: 'STAGE', content: 'SVM Pipeline executes the transaction', sourceRef: 'svm/pipeline.rs' },
      { type: 'HOW', content: 'Block Processor assigns to worker. Transaction Processor loads accounts. Instruction Processor invokes program.', sourceRef: 'svm/pipeline.rs' },
      { type: 'BYTES', content: 'Max CPI depth: 5 (9 with SIMD-0268). Account locks: write=exclusive, read=shared.', sourceRef: 'svm/pipeline.rs' },
    ],
    duration: 4000,
  },
  {
    id: 'step-7',
    componentId: 'accounts-db',
    title: 'State changes written',
    description: 'Account modifications written to write cache, eventually flushed to AppendVecs on disk.',
    annotation: [
      { type: 'STAGE', content: 'AccountsDB stores state changes', sourceRef: 'accounts_db.rs' },
      { type: 'HOW', content: 'Write Cache: per-slot caching before flushing to disk. Memory-mapped AppendVecs for zero-copy reads.', sourceRef: 'accounts_db.rs' },
      { type: 'BYTES', content: 'Index: 8,192 bins sharded by pubkey. Write cache limit: 15GB.', sourceRef: 'accounts_db.rs' },
    ],
    duration: 3000,
  },
  {
    id: 'step-8',
    componentId: 'poh-recording',
    title: 'PoH records entry hash',
    description: 'Entry hash mixed into SHA-256 hash chain. Transaction ordering proven.',
    annotation: [
      { type: 'STAGE', content: 'PoH Recording hashes entry into SHA-256 chain', sourceRef: 'poh_recorder.rs' },
      { type: 'HOW', content: 'Single-threaded SHA-256 loop. Cannot be parallelized. 64 ticks per slot (~400ms).', sourceRef: 'poh_recorder.rs' },
      { type: 'WHY', content: 'PoH proves chronological order without validator communication. VDF prevents time manipulation.', sourceRef: 'poh_service.rs' },
      { type: 'BYTES', content: 'Each tick: SHA-256(previous_hash) = 32 bytes. Final hash = block hash.', sourceRef: 'hash.rs' },
    ],
    duration: 3500,
  },
  {
    id: 'step-9',
    componentId: 'broadcast',
    title: 'Broadcast Stage creates shreds',
    description: 'Entries serialized into ~1,228 byte shreds with Reed-Solomon erasure coding.',
    annotation: [
      { type: 'STAGE', content: 'Broadcast Stage creates and sends shreds', sourceRef: 'broadcast_stage.rs' },
      { type: 'HOW', content: 'Entries → data shreds (~1,228 bytes). Reed-Solomon 32:32 FEC. Signed by leader.', sourceRef: 'broadcast_stage.rs' },
      { type: 'BYTES', content: 'FEC: 32 data + 32 coding = 64 total. Recovery threshold: 32 of 64.', sourceRef: 'erasure.rs' },
    ],
    duration: 3000,
  },
  {
    id: 'step-10',
    componentId: 'turbine',
    title: 'Turbine propagates shreds',
    description: 'Shreds distributed via stake-weighted tree. 2-3 hops to reach all validators.',
    annotation: [
      { type: 'STAGE', content: 'Turbine propagates shreds to all validators', sourceRef: 'turbine.rs' },
      { type: 'HOW', content: 'BitTorrent-inspired tree. Fan-out: 200x per layer. Stake-weighted: higher stake = closer to leader.', sourceRef: 'turbine.rs' },
      { type: 'WHY', content: 'O(√N) propagation instead of O(N). Critical for scaling to 1000+ validators.', sourceRef: 'turbine.rs' },
      { type: 'BYTES', content: 'Propagation: ~100ms. Tree depth: 2-3 hops. UDP transport.', sourceRef: 'turbine.rs' },
    ],
    duration: 3500,
  },
  {
    id: 'step-11',
    componentId: 'shred-fetch',
    title: 'Validators receive shreds',
    description: 'Other validators receive shreds via Turbine and begin block reconstruction.',
    annotation: [
      { type: 'STAGE', content: 'TVU Shred Fetch receives shreds from Turbine', sourceRef: 'shred_fetch.rs' },
      { type: 'HOW', content: 'SO_REUSEPORT for parallel socket binding. Kernel distributes packets across sockets.', sourceRef: 'shred_fetch.rs' },
    ],
    duration: 2500,
  },
  {
    id: 'step-12',
    componentId: 'window-service',
    title: 'Block reconstruction',
    description: 'Window Service assembles complete blocks from shreds. Missing shreds requested via Repair.',
    annotation: [
      { type: 'STAGE', content: 'Window Service assembles block from shreds', sourceRef: 'window_service.rs' },
      { type: 'HOW', content: 'Track received shreds per slot. Detect missing shreds. Initiate repair requests. Feed assembled entries to Replay.', sourceRef: 'window_service.rs' },
    ],
    duration: 3000,
  },
  {
    id: 'step-13',
    componentId: 'replay-stage',
    title: 'Replay Stage executes block',
    description: 'Transactions executed against local Bank state. Results reported to consensus.',
    annotation: [
      { type: 'STAGE', content: 'Replay Stage verifies leader\'s work', sourceRef: 'replay_stage.rs' },
      { type: 'HOW', content: 'Execute transactions via SVM. Update AccountsDB. Report to Tower BFT. Handle fork selection.', sourceRef: 'replay_stage.rs' },
    ],
    duration: 4000,
  },
  {
    id: 'step-14',
    componentId: 'tower-bft',
    title: 'Consensus vote cast',
    description: 'Validator votes on block. Lockout doubles. Fork choice updated.',
    annotation: [
      { type: 'STAGE', content: 'Tower BFT casts consensus vote', sourceRef: 'tower_bft.rs' },
      { type: 'HOW', content: 'Vote transaction on-chain. Lockout = 2 slots, doubles each vote. Max 32 votes deep.', sourceRef: 'tower_bft.rs' },
      { type: 'DECISION', content: 'Fork choice: heaviest subtree by stake-weighted votes. Supermajority (≥2/3) = confirmed.', sourceRef: 'fork_choice.rs' },
      { type: 'WHY', content: 'Exponential lockout growth makes deep history irreversible. 2/3 supermajority = economically infeasible to revert.', sourceRef: 'tower_bft.rs' },
    ],
    duration: 4000,
  },
  {
    id: 'step-15',
    componentId: 'accounts-db',
    title: 'Finalized state persisted',
    description: 'Once finalized, account changes flushed from write cache to permanent AppendVec files.',
    annotation: [
      { type: 'STAGE', content: 'AccountsDB persists finalized state', sourceRef: 'accounts_db.rs' },
      { type: 'HOW', content: 'Background flushing moves accounts from write cache to disk. Background cleaning removes dead accounts.', sourceRef: 'accounts_db.rs' },
      { type: 'STAGE', content: 'Transaction lifecycle complete: Processed → Confirmed → Finalized', sourceRef: 'commitment.rs' },
    ],
    duration: 3000,
  },
]
