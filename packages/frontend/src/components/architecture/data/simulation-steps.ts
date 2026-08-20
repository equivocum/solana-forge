// Simulation steps for Guided Tour mode
// Each step represents a stage in the Solana transaction lifecycle
// Source references use Agave v3.1.8 with exact file paths from official Solana docs
// https://solana.com/docs/core/transactions/transaction-pipeline

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
  // ═══════════════════════════════════════════════════════════════
  // LEADER PATH (TPU) — Block Production
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'step-1',
    componentId: 'quic-streamer',
    title: '1. Transaction arrives via QUIC',
    description: 'Client sends signed transaction over QUIC with TLS 1.3 encryption. Raw bytes must fit within a single packet (1,232 bytes).',
    annotation: [
      { type: 'STAGE', content: 'QUIC Streamer receives incoming transaction packets', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/streamer/src/quic.rs' },
      { type: 'HOW', content: 'TLS 1.3 with ALPN "solana-tpu". Each tx sent as separate unidirectional QUIC stream. Stake-weighted rate limiting.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/streamer/src/quic.rs' },
      { type: 'BYTES', content: 'PACKET_DATA_SIZE = 1,232 bytes (IPv6 MTU). Deserialized into VersionedTransaction.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/streamer/src/packet.rs' },
    ],
    duration: 3000,
  },
  {
    id: 'step-2',
    componentId: 'tpu-fetch',
    title: '2. Fetch Stage ingests packets',
    description: 'Raw transaction packets are buffered and prepared for signature verification. Three separate QUIC servers handle user txs, votes, and forwarding.',
    annotation: [
      { type: 'STAGE', content: 'Fetch Stage receives packets from QUIC streamer', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/fetch_stage.rs' },
      { type: 'HOW', content: 'SO_REUSEPORT for parallel socket binding. Kernel distributes packets across sockets. Separate channels for votes vs transactions.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/fetch_stage.rs' },
    ],
    duration: 2500,
  },
  {
    id: 'step-3',
    componentId: 'sig-verify',
    title: '3. Parallel signature verification',
    description: 'Ed25519 signatures verified in parallel across GPU/AVX512 cores. Invalid signatures cause packet discard.',
    annotation: [
      { type: 'STAGE', content: 'SigVerify validates transaction signatures in parallel', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/perf/src/sigverify.rs' },
      { type: 'HOW', content: 'Parallel Ed25519 verification. Batches of 128 packets (VERIFY_PACKET_CHUNK_SIZE). Deduplication removes duplicate packets. Load shedding discards excessive packets.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/sigverify_stage.rs' },
      { type: 'BYTES', content: 'Signature cost: 720 CUs. Ed25519 verify: 2,280 CUs. For each signature at index i: Ed25519(signatures[i], account_keys[i], message_bytes).', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/perf/src/sigverify.rs' },
    ],
    duration: 3000,
  },
  {
    id: 'step-4',
    componentId: 'status-cache',
    title: '4. Deduplication check (Status Cache)',
    description: 'Status Cache checks if this transaction was already processed. Message hash checked against cache.',
    annotation: [
      { type: 'STAGE', content: 'Status Cache deduplicates transactions', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/runtime/src/status_cache.rs' },
      { type: 'DECISION', content: 'If message hash found in cache: reject with AlreadyProcessed. If new: proceed to Banking Stage.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/runtime/src/status_cache.rs' },
      { type: 'HOW', content: 'Also checks blockhash age (MAX_PROCESSING_AGE = 150 slots). If blockhash not found, checks for valid durable nonce.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/runtime/src/bank/check_transactions.rs' },
    ],
    duration: 2000,
  },
  {
    id: 'step-5',
    componentId: 'banking-stage',
    title: '5. Banking Stage schedules tx',
    description: 'Central Scheduler builds priority DAG (Prio-Graph) and dispatches to worker threads. Non-conflicting txs scheduled in parallel.',
    annotation: [
      { type: 'STAGE', content: 'Banking Stage schedules and executes transactions', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/banking_stage.rs' },
      { type: 'HOW', content: '6 threads: 4 regular + 2 vote. Central Scheduler builds Prio-Graph DAG. Non-conflicting txs scheduled in parallel across threads.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/banking_stage.rs' },
      { type: 'DECISION', content: 'Priority = reward * 1,000,000 / (cost + 1). Higher priority = scheduled first. Transactions that conflict on accounts are serialized.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/banking_stage.rs' },
    ],
    duration: 4000,
  },
  {
    id: 'step-6',
    componentId: 'svm-pipeline',
    title: '6. SVM executes transaction',
    description: 'Transaction processed through the 8-stage Solana pipeline: Sanitize → Budget → Age Check → Nonce → Fee Payer → Load Accounts → Execute → Commit.',
    annotation: [
      { type: 'STAGE', content: 'SVM (Solana Virtual Machine) executes the transaction', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/svm/src/transaction_processor.rs' },
      { type: 'HOW', content: 'Stage 3: Sanitize structural invariants. Stage 4: Parse compute budget, check blockhash age. Stage 5: Validate fee payer, deduct fee. Stage 6: Load all accounts from AccountsDB.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/svm/src/account_loader.rs' },
      { type: 'HOW', content: 'Stage 7: Execute instructions sequentially via process_message. Each instruction invokes target program in BPF VM (or precompile). Stage 8: Commit changes or rollback on failure.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/svm/src/transaction_processor.rs' },
      { type: 'BYTES', content: 'Max CPI depth: 5 (9 with SIMD-0268). Account locks: write=exclusive, read=shared. Max loaded accounts data: 64 MiB.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/svm/src/account_loader.rs' },
    ],
    duration: 5000,
  },
  {
    id: 'step-7',
    componentId: 'accounts-db',
    title: '7. Leader commits state changes',
    description: 'Account modifications written to AccountsDB write cache. This is the leader committing execution results before PoH recording.',
    annotation: [
      { type: 'STAGE', content: 'AccountsDB stores state changes from SVM execution', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/accounts-db/src/accounts_db.rs' },
      { type: 'HOW', content: 'Write Cache: per-slot caching before flushing to disk. Memory-mapped AppendVecs for zero-copy reads. Accounts modified by earlier txs in same batch visible to later txs.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/accounts-db/src/accounts_db.rs' },
      { type: 'BYTES', content: 'Index: 8,192 bins sharded by pubkey. Write cache limit: 15GB. Each account stored as (pubkey, account_state) in AppendVec.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/accounts-db/src/accounts_db.rs' },
    ],
    duration: 3000,
  },
  {
    id: 'step-8',
    componentId: 'poh-recording',
    title: '8. PoH records entry hash',
    description: 'Entry hash mixed into SHA-256 hash chain. PoH proves chronological order without validator communication. 64 ticks per slot (~400ms).',
    annotation: [
      { type: 'STAGE', content: 'PoH Recording hashes entry into SHA-256 chain', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/poh/src/poh_recorder.rs' },
      { type: 'HOW', content: 'Single-threaded SHA-256 loop. Cannot be parallelized. Each tick: SHA-256(previous_hash) = 32 bytes. Final hash = block hash.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/poh/src/poh_recorder.rs' },
      { type: 'WHY', content: 'PoH proves chronological order without validator communication. VDF (Verifiable Delay Function) prevents time manipulation. The hash chain is the universal clock.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/poh/src/poh_service.rs' },
      { type: 'BYTES', content: '64 ticks per slot. Each tick = SHA-256 hash (32 bytes). Slot duration ~400ms.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/poh/src/poh_recorder.rs' },
    ],
    duration: 3500,
  },
  {
    id: 'step-9',
    componentId: 'broadcast',
    title: '9. Broadcast Stage creates shreds',
    description: 'Entries serialized into ~1,228 byte shreds with Reed-Solomon erasure coding (32:32). Leader signs each shred.',
    annotation: [
      { type: 'STAGE', content: 'Broadcast Stage creates and sends shreds', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/broadcast_stage.rs' },
      { type: 'HOW', content: 'Entries → data shreds (~1,228 bytes). Reed-Solomon 32:32 FEC: 32 data + 32 coding = 64 total shreds per batch. Leader Ed25519 signature on each shred.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/ledger/src/shred.rs' },
      { type: 'BYTES', content: 'DATA_SHREDS_PER_FEC_BLOCK = 32. CODING_SHREDS_PER_FEC_BLOCK = 32. SHREDS_PER_FEC_BLOCK = 64. Recovery threshold: 32 of 64.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/ledger/src/shred.rs' },
    ],
    duration: 3000,
  },
  // ═══════════════════════════════════════════════════════════════
  // TRANSITION — Turbine Propagation
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'step-10',
    componentId: 'turbine',
    title: '10. Turbine propagates shreds',
    description: 'Shreds distributed via stake-weighted tree (BitTorrent-inspired). 2-3 hops to reach all validators. O(√N) propagation.',
    annotation: [
      { type: 'STAGE', content: 'Turbine propagates shreds to all validators', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/turbine/src/turbine.rs' },
      { type: 'HOW', content: 'BitTorrent-inspired tree. Fan-out: 200 peers per neighborhood. Stake-weighted: higher stake = closer to leader in tree. Deterministic per-shred seed.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/turbine/src/turbine.rs' },
      { type: 'WHY', content: 'O(√N) propagation instead of O(N). Critical for scaling to 1000+ validators. Each validator also retransmits to its neighborhood.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/turbine/src/turbine.rs' },
      { type: 'BYTES', content: 'Propagation: ~100ms. Tree depth: 2-3 hops. UDP transport. Each validator needs only 50% of shreds to reconstruct block (Reed-Solomon).', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/turbine/src/turbine.rs' },
    ],
    duration: 3500,
  },
  // ═══════════════════════════════════════════════════════════════
  // VALIDATOR PATH (TVU) — Block Verification
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'step-11',
    componentId: 'shred-fetch',
    title: '11. Validators receive shreds',
    description: 'Other validators receive shreds via Turbine and begin block reconstruction. SO_REUSEPORT for parallel socket binding.',
    annotation: [
      { type: 'STAGE', content: 'TVU Shred Fetch receives shreds from Turbine', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/shred_fetch_stage.rs' },
      { type: 'HOW', content: 'SO_REUSEPORT for parallel socket binding. Kernel distributes packets across sockets. Filters: slot range, shred version, FEC set alignment.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/shred_fetch_stage.rs' },
    ],
    duration: 2500,
  },
  {
    id: 'step-12',
    componentId: 'shred-sig-verify',
    title: '12. Shred signature verification',
    description: 'Each shred verified against current leader public key. Invalid shreds discarded. Same SigVerify engine as transaction signatures.',
    annotation: [
      { type: 'STAGE', content: 'ShredSigVerify validates shred signatures against leader key', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/perf/src/sigverify.rs' },
      { type: 'HOW', content: 'For each shred: verify(shred.signature, leader_pubkey, shred.signed_data). Leader signs Merkle root of erasure batch. Recovered shreds inherit signature from received shreds.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/ledger/src/shred.rs' },
      { type: 'DECISION', content: 'If signature invalid: discard. If valid: pass to Window Service for reassembly.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/shred_fetch_stage.rs' },
    ],
    duration: 2000,
  },
  {
    id: 'step-13',
    componentId: 'window-service',
    title: '13. Block reconstruction (Window Service)',
    description: 'Window Service assembles complete blocks from shreds. Missing shreds requested via Repair. Tracks received shreds per slot.',
    annotation: [
      { type: 'STAGE', content: 'Window Service assembles block from shreds', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/window_service.rs' },
      { type: 'HOW', content: 'Track received shreds per slot. Detect missing shreds. Initiate repair requests to peers. Feed assembled entries to Replay Stage.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/window_service.rs' },
      { type: 'HOW', content: 'Once 50%+ of shreds received (Reed-Solomon threshold), reconstruct full block. Store completed data sets for replay.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/completed_data_sets_service.rs' },
    ],
    duration: 3000,
  },
  {
    id: 'step-14',
    componentId: 'blockstore',
    title: '14. Shreds persisted to Blockstore',
    description: 'Reconstructed shreds stored in Blockstore (on-disk ledger). Enables repair, replay, and snapshot creation.',
    annotation: [
      { type: 'STAGE', content: 'Blockstore persists shreds to disk', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/ledger/src/blockstore.rs' },
      { type: 'HOW', content: 'RocksDB-backed storage. Shreds indexed by (slot, shred_index, shred_type). Enables random access for repair and replay. Compaction runs in background.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/ledger/src/blockstore.rs' },
      { type: 'WHY', content: 'Blockstore is the persistent ledger. Enables repair (missing shreds), replay (re-execute blocks), and snapshot creation (state checkpoints).', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/ledger/src/blockstore.rs' },
    ],
    duration: 2000,
  },
  {
    id: 'step-15',
    componentId: 'replay-stage',
    title: '15. Replay Stage executes block',
    description: 'Transactions re-executed against local Bank state via SVM. Results reported to consensus (Tower BFT). Fork selection applied.',
    annotation: [
      { type: 'STAGE', content: 'Replay Stage verifies leader\'s work', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/replay_stage.rs' },
      { type: 'HOW', content: 'Read entries from Blockstore. Execute transactions via SVM (same pipeline as leader). Update AccountsDB. Report to Tower BFT. Handle fork selection.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/replay_stage.rs' },
      { type: 'WHY', content: 'Every validator independently re-executes all transactions to verify the leader\'s work. Consensus requires 2/3+ stake agreement.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/replay_stage.rs' },
    ],
    duration: 4000,
  },
  {
    id: 'step-16',
    componentId: 'accounts-db',
    title: '16. Validator commits state',
    description: 'Validator writes execution results to AccountsDB. Same mechanism as leader commit, but triggered by replay.',
    annotation: [
      { type: 'STAGE', content: 'AccountsDB stores validator execution results', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/accounts-db/src/accounts_db.rs' },
      { type: 'HOW', content: 'Same write cache mechanism as leader. Account changes from replay committed to batch-local cache. Background flushing to AppendVecs on disk.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/accounts-db/src/accounts_db.rs' },
    ],
    duration: 3000,
  },
  {
    id: 'step-17',
    componentId: 'tower-bft',
    title: '17. Consensus vote cast (Tower BFT)',
    description: 'Validator votes on block via vote transaction. Lockout doubles each vote. Fork choice: heaviest subtree by stake-weighted votes.',
    annotation: [
      { type: 'STAGE', content: 'Tower BFT casts consensus vote', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/consensus.rs' },
      { type: 'HOW', content: 'Vote transaction sent on-chain. Lockout = 2 slots, doubles each vote (2, 4, 8, 16, 32...). Max 32 votes deep. Vote propagated via Gulf Stream.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/voting_service.rs' },
      { type: 'DECISION', content: 'Fork choice: heaviest subtree by stake-weighted votes. Supermajority (≥2/3 stake) = confirmed. Exponential lockout makes deep history irreversible.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/consensus.rs' },
      { type: 'WHY', content: 'Exponential lockout growth makes deep history economically infeasible to revert. 2/3 supermajority = finalized after 31+ additional slots.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/commitment_service.rs' },
    ],
    duration: 4000,
  },
  {
    id: 'step-18',
    componentId: 'accounts-db',
    title: '18. Finalized state persisted',
    description: 'Once finalized, account changes flushed from write cache to permanent AppendVec files. Transaction lifecycle complete.',
    annotation: [
      { type: 'STAGE', content: 'AccountsDB persists finalized state to disk', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/accounts-db/src/accounts_db.rs' },
      { type: 'HOW', content: 'Background flushing moves accounts from write cache to AppendVec files. Background cleaning removes dead accounts. Snapshots created from finalized state.', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/accounts-db/src/accounts_db.rs' },
      { type: 'STAGE', content: 'Transaction lifecycle complete: Processed → Confirmed (2/3 vote) → Finalized (31+ slots after confirmation)', sourceRef: 'https://github.com/anza-xyz/agave/blob/v3.1.8/core/src/commitment_service.rs' },
    ],
    duration: 3000,
  },
]
