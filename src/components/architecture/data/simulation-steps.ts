// Simulation steps for Guided Tour mode
// Each step follows one hop of TX_LIFECYCLE_PATH through an Agave v4.2.1 validator.
// All REF links pin release tag v4.2.1 and were line-verified during the audit
// (see specs/003-agave-accuracy-audit/report.md working notes).

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

const ref = (path: string, line: string) =>
  `https://github.com/anza-xyz/agave/blob/v4.2.1/${path}#${line}`

export const SIMULATION_STEPS: SimulationStep[] = [
  // ═══════════════════════════════════════════════════════════════
  // LEADER PATH (TPU) — submission to broadcast
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'step-1',
    componentId: 'quic-streamer',
    title: '1. Transaction arrives over QUIC',
    description:
      'A client sends its signed transaction over QUIC. Validators expose three streamer endpoints — regular TPU traffic, forwarded traffic, and votes — each admitted under different quality-of-service rules.',
    annotation: [
      { type: 'STAGE', content: 'INGRESS — encrypted QUIC streams terminate at the validator\'s endpoints', sourceRef: ref('core/src/tpu.rs', 'L220-L265') },
      { type: 'HOW', content: 'solQuicTpu and solQuicTpuFwd use stake-weighted QoS servers; solQuicTVo uses simple QoS for votes.', sourceRef: ref('core/src/tpu.rs', 'L244-L265') },
      { type: 'WHY', content: 'Bandwidth is finite: weighting by stake lets large validators push proportionally more traffic without drowning smaller ones.', sourceRef: ref('core/src/tpu.rs', 'L56') },
    ],
    duration: 3200,
  },
  {
    id: 'step-2',
    componentId: 'tpu-fetch',
    title: '2. Fetch Stage gathers packets',
    description:
      'Packets from all endpoints are pulled into unified channels and prepared for verification. Votes travel in their own lane from the very start.',
    annotation: [
      { type: 'STAGE', content: 'INGRESS — packet batching before verification', sourceRef: ref('core/src/tpu.rs', 'L284') },
      { type: 'WHY', content: 'Separating vote packets early lets downstream stages protect consensus latency from transaction spam.', sourceRef: ref('core/src/tpu.rs', 'L609') },
    ],
    duration: 2600,
  },
  {
    id: 'step-3',
    componentId: 'sig-verify',
    title: '3. Signatures verified on CPU',
    description:
      'Every packet\'s Ed25519 signature is checked in parallel across CPU cores, 128 packets per batch. A Bloom filter drops duplicate packets before work is wasted.',
    annotation: [
      { type: 'STAGE', content: 'VERIFY — parallel signature verification', sourceRef: ref('perf/src/sigverify.rs', 'L15') },
      { type: 'HOW', content: 'VERIFY_PACKET_CHUNK_SIZE = 128 packets per verification chunk; perf::Deduper filters recent duplicates.', sourceRef: ref('perf/src/deduper.rs', 'L20') },
      { type: 'WHY', content: 'A shared priority floor keeps vote packets verifying ahead of ordinary traffic.', sourceRef: ref('banking-stage-ingress-types/src/lib.rs', 'L20') },
    ],
    duration: 3000,
  },
  {
    id: 'step-4',
    componentId: 'banking-stage',
    title: '4. Banking Stage schedules the work',
    description:
      'The scheduler orders transactions by fee and compute-unit price, groups conflicting ones into batches, and dispatches them to consume-workers. A dedicated worker handles votes.',
    annotation: [
      { type: 'STAGE', content: 'SCHEDULE — priority ordering and conflict batching', sourceRef: ref('core/src/banking_stage.rs', 'L570') },
      { type: 'DECISION', content: 'GreedyScheduler picks highest-priority non-conflicting batches; inputs = fee price + account conflicts; outcome = execution order.', sourceRef: ref('core/src/banking_stage/transaction_scheduler/greedy_scheduler.rs', 'L53') },
      { type: 'WHY', content: 'Blockhash-freshness and fee-payer checks happen right here in consumption (check_fee_payer_unlocked) — not back at signature verification.', sourceRef: ref('core/src/banking_stage/consumer.rs', 'L474') },
    ],
    duration: 3400,
  },
  {
    id: 'step-5',
    componentId: 'svm-pipeline',
    title: '5. The runtime executes the batch',
    description:
      'Consume-workers call the SVM library: accounts are loaded, instructions run (native Rust or sBPF programs), and results apply to bank state. CPI nests up to 5 frames deep.',
    annotation: [
      { type: 'STAGE', content: 'EXECUTE — runtime library invoked by the consume-worker', sourceRef: ref('core/src/banking_stage/consumer.rs', 'L318') },
      { type: 'HOW', content: 'bank.load_and_execute_transactions loads accounts, runs programs, applies deltas.', sourceRef: ref('runtime/src/bank.rs', 'L1') },
      { type: 'BYTES', content: 'Compute budget: default 200k CU per tx, hard max 1,400,000 CU.', sourceRef: ref('program-runtime/src/execution_budget.rs', 'L26') },
    ],
    duration: 3400,
  },
  {
    id: 'step-6',
    componentId: 'poh-recording',
    title: '6. Recorded into Proof of History immediately',
    description:
      'The moment a batch finishes executing, it is folded into the SHA-256 chain: new_hash = SHA-256(previous_hash ‖ batch). Ticks keep ticking between batches; nothing waits for storage.',
    annotation: [
      { type: 'STAGE', content: 'RECORD — immediate sequencing of executed batches', sourceRef: ref('poh/src/poh_service.rs', 'L120') },
      { type: 'HOW', content: 'TransactionRecorder → bounded record_channels → PohService; working bank flushes entries when the slot\'s final tick lands.', sourceRef: ref('poh/src/poh_recorder.rs', 'L127') },
      { type: 'WHY', content: 'Ordering is fixed at execution time — durable state persistence happens later and asynchronously.', sourceRef: ref('poh/src/record_channels.rs', 'L31') },
    ],
    duration: 3600,
  },
  {
    id: 'step-7',
    componentId: 'broadcast',
    title: '7. Broadcast shreds the slot',
    description:
      'Completed entries leave the leader as erasure-coded shreds: 32 data + 32 coding shreds per FEC set, each carrying a Merkle proof signed by the leader.',
    annotation: [
      { type: 'STAGE', content: 'PROPAGATE — entry stream becomes transmittable shreds', sourceRef: ref('ledger/src/shred.rs', 'L121-L122') },
      { type: 'WHY', content: 'With 32:32 coding, receivers can reconstruct any lost shred from any 32 of the 64 in the set — no re-request needed.', sourceRef: ref('ledger/src/shred.rs', 'L121-L122') },
    ],
    duration: 3200,
  },
  // ═══════════════════════════════════════════════════════════════
  // VALIDATION PATH (TVU) — receiving and replaying
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'step-8',
    componentId: 'turbine',
    title: '8. Turbine fans shreds out cluster-wide',
    description:
      'Shreds travel down stake-weighted distribution trees so a single leader transmission reaches every validator in a few hops instead of thousands of direct sends.',
    annotation: [
      { type: 'STAGE', content: 'PROPAGATE — cluster-wide fan-out', sourceRef: ref('core/src/tvu.rs', 'L359-L395') },
      { type: 'WHY', content: 'Tree fan-out keeps leader upload cost constant while the network scales.', sourceRef: ref('core/src/tvu.rs', 'L359-L395') },
    ],
    duration: 2800,
  },
  {
    id: 'step-9',
    componentId: 'shred-fetch',
    title: '9. Receiving validators collect shreds',
    description:
      'The ShredFetchStage listens on turbine and repair sockets, collecting data shreds and coding shreds into reassembly buffers.',
    annotation: [
      { type: 'STAGE', content: 'RECEIVE — ingress of propagated shreds', sourceRef: ref('core/src/tvu.rs', 'L359-L395') },
      { type: 'WHY', content: 'Repair requests fill gaps only after the turbine pass has had its chance — avoiding duplicate bandwidth.', sourceRef: ref('core/src/tvu.rs', 'L359-L395') },
    ],
    duration: 2600,
  },
  {
    id: 'step-10',
    componentId: 'shred-sig-verify',
    title: '10. Shred signatures checked against the schedule',
    description:
      'Each shred carries the leader\'s signature over its FEC-set Merkle root. Receivers resolve who the slot\'s scheduled leader was and verify accordingly.',
    annotation: [
      { type: 'STAGE', content: 'VERIFY — shred authenticity before assembly', sourceRef: ref('turbine/src/sigverify_shreds.rs', 'L147') },
      { type: 'WHY', content: 'The leader schedule is deterministic — anyone can derive which pubkey should have signed this slot.', sourceRef: ref('turbine/src/sigverify_shreds.rs', 'L82') },
    ],
    duration: 2800,
  },
  {
    id: 'step-11',
    componentId: 'window-service',
    title: '11. Window Service dedups, recovers, stores',
    description:
      'Duplicate shreds are filtered; missing shreds are reconstructed from coding shreds and even retransmitted; conflicting Merkle roots are flagged as duplicate-slot evidence.',
    annotation: [
      { type: 'STAGE', content: 'ASSEMBLE — dedup, recovery, blockstore insertion', sourceRef: ref('core/src/window_service.rs', 'L148-L162') },
      { type: 'WHY', content: 'Erasure coding plus recovery turns packet loss into a local math problem instead of a network round-trip.', sourceRef: ref('ledger/src/shred.rs', 'L121-L122') },
    ],
    duration: 3000,
  },
  {
    id: 'step-12',
    componentId: 'blockstore',
    title: '12. The slot lands in blockstore',
    description:
      'Verified shreds are written to blockstore — the validator\'s local ledger. Once all shreds of a slot arrive, the completed block is handed to replay.',
    annotation: [
      { type: 'STAGE', content: 'ASSEMBLE — persistent local ledger', sourceRef: ref('core/src/tvu.rs', 'L454') },
      { type: 'HOW', content: 'Window service inserts shreds; completed slots become replay candidates.', sourceRef: ref('core/src/window_service.rs', 'L148') },
    ],
    duration: 2600,
  },
  {
    id: 'step-13',
    componentId: 'replay-stage',
    title: '13. Replay: trust nothing, verify everything',
    description:
      'ReplayStage checks the PoH chain, then re-executes every transaction through the same runtime the leader used — across parallel thread pools — and freezes banks that match.',
    annotation: [
      { type: 'STAGE', content: 'VALIDATE — independent re-execution', sourceRef: ref('core/src/replay_stage.rs', 'L415-L416') },
      { type: 'HOW', content: 'replay_forks_threads pool replays competing forks in parallel; rayon builds the pools at startup.', sourceRef: ref('core/src/replay_stage.rs', 'L736-L737') },
      { type: 'WHY', content: 'Validators never trust a leader\'s claimed state — they recompute it.', sourceRef: ref('core/src/replay_stage.rs', 'L13-L15') },
    ],
    duration: 3600,
  },
  {
    id: 'step-14',
    componentId: 'svm-pipeline',
    title: '14. Same engine, second caller',
    description:
      'Replay invokes the identical SVM library the leader used. If any result differs, the block is rejected — agreement comes from determinism, not trust.',
    annotation: [
      { type: 'STAGE', content: 'VALIDATE — runtime library on the verification side', sourceRef: ref('core/src/banking_stage/consumer.rs', 'L318') },
      { type: 'WHY', content: 'One implementation serving both paths guarantees leader and validators compute byte-identical state.', sourceRef: ref('runtime/src/bank.rs', 'L1') },
    ],
    duration: 3000,
  },
  {
    id: 'step-15',
    componentId: 'accounts-db',
    title: '15. State deltas — persistence comes later',
    description:
      'Executed transactions live as deltas in bank state immediately. Writing them durably to AccountsDB is asynchronous: consolidation happens around freeze and root boundaries.',
    annotation: [
      { type: 'STAGE', content: 'PERSIST — async write-back, never inline with execution', sourceRef: ref('core/src/validator.rs', 'L1045') },
      { type: 'WHY', content: 'Decoupling storage from execution keeps block production and replay fast; the background service consolidates at root advancement.', sourceRef: ref('core/src/validator.rs', 'L1045') },
    ],
    duration: 3400,
  },
]
