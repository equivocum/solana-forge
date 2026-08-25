// Complete Solana Validator Architecture - Component Definitions
// 3 levels of detail: Component → Sub-components → Internals
// Each component includes: purpose, role, how it works, why it matters, step-by-step process

// // STAGE: architecture_data_model

export type ComponentCategory = 'networking' | 'tpu' | 'tvu' | 'runtime' | 'consensus' | 'storage' | 'programs'

export interface StepByStep {
  title: string
  steps: string[]
}

export interface ComponentDetail {
  purpose: string      // Why does this exist?
  role: string         // What does it do?
  howItWorks: StepByStep  // Step-by-step process
  whyItMatters: string // Engineering rationale
  metrics?: string[]   // Key numbers/formulas
}

export interface SubComponent {
  id: string
  name: string
  icon: string
  detail: ComponentDetail
  internals?: InternalDetail[]
  refs?: string[]     // Pinned-release citation permalinks (grammar: contract C-1)
}

export interface InternalDetail {
  title: string
  content: string
  formula?: string
}

export interface ArchitectureComponent {
  id: string
  name: string
  icon: string
  category: ComponentCategory
  layer: 'networking' | 'tpu' | 'tvu' | 'runtime' | 'consensus' | 'storage' | 'programs'
  pipeline?: 'tpu' | 'tvu' | 'shared'  // Which pipeline this belongs to
  position: number    // Order in pipeline (for layout)
  detail: ComponentDetail
  subComponents: SubComponent[]
  refs?: string[]     // Pinned-release citation permalinks (grammar: contract C-1)
}

// ═══════════════════════════════════════════════════════════════════
// NETWORKING LAYER
// ═══════════════════════════════════════════════════════════════════

export const QUIC_STREAMER: ArchitectureComponent = {
  id: 'quic-streamer',
  name: 'QUIC Streamer',
  icon: '🔌',
  category: 'networking',
  layer: 'networking',
  pipeline: 'shared',
  position: 0,
  detail: {
    purpose: 'Receives incoming transactions from clients and other validators over QUIC protocol with TLS 1.3 encryption.',
    role: 'Entry point for all new transactions into the TPU pipeline. Replaced raw UDP as the primary transport.',
    howItWorks: {
      title: 'QUIC Connection Flow',
      steps: [
        'Client establishes QUIC connection with TLS 1.3 (ALPN: solana-tpu)',
        'Each transaction sent as a separate unidirectional QUIC stream',
        'SWQoS allocates 80% capacity to staked validators, 20% to unstaked',
        'Rate limiting applied per connection via STREAM_STOP_CODE_THROTTLING',
        'Packets coalesced and buffered for SigVerify stage',
      ]
    },
    whyItMatters: 'QUIC provides flow control, connection migration, and 0-RTT connection establishment. TLS 1.3 encrypts transaction data in transit. Replaced raw UDP which had no congestion control.',
    metrics: [
      'Max transaction payload: 1,232 bytes (IPv6 MTU)',
      'Default ports: 9001 (TPU-UDP), 9007 (TPU-QUIC)',
      'Stake-weighted limits: 80% staked, 20% unstaked',
      'Throttling window: 100ms',
    ]
  },
  subComponents: [
    {
      id: 'quic-tls',
      name: 'TLS 1.3 Handshake',
      icon: '🔐',
      detail: {
        purpose: 'Establishes encrypted connection with mutual authentication.',
        role: 'Authenticates validator identity via Ed25519 keys embedded in TLS certificates.',
        howItWorks: {
          title: 'TLS 1.3 Flow',
          steps: [
            'Client sends ClientHello with ALPN "solana-tpu"',
            'Server responds with ServerHello + certificate containing Ed25519 public key',
            'Key exchange completes (X25519)',
            'Both sides derive symmetric keys for AES-256-GCM encryption',
            '0-RTT data can be sent on reconnection',
          ]
        },
        whyItMatters: 'Prevents MITM attacks and transaction interception. Ed25519 authentication ties QUIC connections to validator stake.',
        metrics: ['Handshake: 1 RTT (0-RTT on reconnect)', 'Cipher: AES-256-GCM', 'Key exchange: X25519']
      }
    },
    {
      id: 'swqos',
      name: 'Stake-Weighted QoS',
      icon: '⚖️',
      detail: {
        purpose: 'Prioritizes network traffic from staked validators over unstaked nodes.',
        role: 'Allocates bandwidth proportionally to stake. Higher-staked validators get more concurrent streams.',
        howItWorks: {
          title: 'SWQoS Allocation',
          steps: [
            'Track connection load via stream_load_ema (Exponential Moving Average)',
            'Calculate available capacity: (max_load² / current_load) × (stake / total_stake)',
            'Staked connections: up to 80% of total capacity',
            'Unstaked connections: up to 20% of total capacity',
            'Evict oldest 10% of unstaked connections when capacity full',
          ]
        },
        whyItMatters: 'Prevents DoS from unstaked nodes. Ensures honest validators with stake always have bandwidth. Critical for network stability.',
        metrics: [
          'Staked allocation: 80%',
          'Unstaked allocation: 20%',
          'Minimum stake for staked treatment: 0.002% of total',
          'Throttling interval: 100ms',
        ]
      }
    },
  ]
}

export const GULF_STREAM: ArchitectureComponent = {
  id: 'gulf-stream',
  name: 'Gulf Stream',
  icon: '🌊',
  category: 'networking',
  layer: 'networking',
  pipeline: 'shared',
  position: 1,
  detail: {
    purpose: 'Eliminates the traditional mempool by forwarding transactions directly to upcoming leaders.',
    role: 'Transactions are forwarded to the current slot leader AND the next 2 upcoming leaders via QUIC.',
    howItWorks: {
      title: 'Mempool-less Forwarding',
      steps: [
        'RPC node receives transaction from client',
        'Looks up leader schedule (known 2 epochs in advance)',
        'Forwards transaction to current leader + next 2 leaders via QUIC',
        'No persistent mempool — transactions not processed are dropped',
        'Leader processes or drops within one slot (~400ms)',
      ]
    },
    whyItMatters: 'No mempool means no state bloat, no MEV from mempool monitoring, and guaranteed delivery to leaders. Transactions either get processed or expire.',
    metrics: [
      'Forwarding: current + next 2 leaders',
      'Blockhash validity: 151 slots (~60-90s)',
      'Outbound queue cap: 10,000 txs during congestion',
    ]
  },
  subComponents: [
    {
      id: 'leader-schedule-lookup',
      name: 'Leader Schedule Lookup',
      icon: '📅',
      detail: {
        purpose: 'Determines which validators produce blocks for which slots.',
        role: 'Stake-weighted random selection computed at epoch boundaries, known 2 epochs ahead.',
        howItWorks: {
          title: 'Leader Selection',
          steps: [
            'At epoch boundary, snapshot all validator stakes',
            'Compute weighted random selection seeded by PoH tick count',
            'Each leader assigned 4 consecutive slots (~1.6s)',
            'Schedule distributed via Gossip to all validators',
            'Deterministic: all validators compute same schedule independently',
          ]
        },
        whyItMatters: 'Predictable leader schedule enables Gulf Stream forwarding. Stake-weighted selection ensures honest validators with more stake produce more blocks.',
        metrics: [
          'Epoch: 432,000 slots (~2-3 days)',
          'Consecutive slots per leader: 4',
          'Schedule known: 2 epochs ahead (~4-6 days)',
        ]
      }
    }
  ]
}

export const GOSSIP: ArchitectureComponent = {
  id: 'gossip',
  name: 'Gossip (CRDS)',
  icon: '📡',
  category: 'networking',
  layer: 'networking',
  pipeline: 'shared',
  position: 2,
  detail: {
    purpose: 'Provides eventually-consistent cluster-wide information sharing among all validators.',
    role: 'Disseminates ContactInfo, votes, snapshots, epoch slots, and other critical data via push/pull protocol.',
    howItWorks: {
      title: 'Gossip Protocol Flow',
      steps: [
        'Each node publishes ContactInfo every 15 seconds via CRDS',
        'Push protocol: send updates to stake-weighted active set',
        'Pull protocol: request missed data from peers using Bloom filters',
        'Ping/Pong mechanism verifies connection liveness',
        'CrdsShards enable fast Bloom filter construction for pull requests',
      ]
    },
    whyItMatters: 'Gossip is the backbone of cluster coordination. Without it, validators cannot discover peers, build Turbine trees, or coordinate consensus.',
    metrics: [
      'ContactInfo refresh: every 15 seconds',
      'Contact debug interval: 10 seconds',
      'Data types: ContactInfo, Vote, SnapshotHashes, EpochSlots, DuplicateShred, NodeInstance, Version',
    ]
  },
  subComponents: [
    {
      id: 'crds',
      name: 'Cluster Replicated Data Store',
      icon: '🗄️',
      detail: {
        purpose: 'Eventually-consistent distributed key-value store shared via gossip.',
        role: 'Maps CrdsValueLabel → VersionedCrdsValue. Only one value per (data_type, pubkey) pair.',
        howItWorks: {
          title: 'CRDS Update Rules',
          steps: [
            'Each value has a wallclock timestamp and version counter',
            'On receive: if newer than local, update; else discard',
            'Latest version always wins (last-writer-wins)',
            'CrdsShards partition data for fast Bloom filter construction',
          ]
        },
        whyItMatters: 'Simple conflict resolution via timestamps. No complex CRDT needed. Works for eventually-consistent data like contact info and vote records.',
        metrics: ['Max value size: ~1KB', 'Shard count: configurable']
      }
    }
  ]
}

export const REPAIR: ArchitectureComponent = {
  id: 'repair',
  name: 'Repair Protocol',
  icon: '🔧',
  category: 'networking',
  layer: 'networking',
  pipeline: 'shared',
  position: 3,
  detail: {
    purpose: 'Allows validators to request missing shreds from peers when Turbine delivery is incomplete.',
    role: 'Fallback mechanism for data availability. Validators send repair requests to serve_repair ports of peers.',
    howItWorks: {
      title: 'Repair Flow',
      steps: [
        'Validator tracks which shreds are missing per slot',
        'Sends repair request to serve_repair port of a peer that has the data',
        'Peer responds with the requested shreds',
        'If insufficient shreds received, falls back to gossip-based repair',
        'Deterministic Turbine repair: any node with full block can serve shreds',
      ]
    },
    whyItMatters: 'Turbine is best-effort. Repair ensures data availability even when network partitions or packet loss occur. Critical for liveness.',
    metrics: ['Repair requests are on-demand', 'serve_repair port advertised via ContactInfo']
  },
  subComponents: []
}

// ═══════════════════════════════════════════════════════════════════
// TPU PIPELINE (Leader Mode)
// ═══════════════════════════════════════════════════════════════════

export const TPU_FETCH: ArchitectureComponent = {
  id: 'tpu-fetch',
  name: 'Fetch Stage',
  icon: '📥',
  category: 'tpu',
  layer: 'tpu',
  pipeline: 'tpu',
  position: 0,
  detail: {
    purpose: 'Receives raw transaction packets from the QUIC streamer and prepares them for signature verification.',
    role: 'Entry point of the TPU pipeline. Allocates packet memory, reads data from QUIC endpoint, coalesces simultaneous packets.',
    howItWorks: {
      title: 'Fetch Processing',
      steps: [
        'Three separate QUIC servers: user transactions, votes, forwarding',
        'SO_REUSEPORT for multi-socket binding on single port',
        'Packets coalesced if received simultaneously',
        'Memory allocated for packet buffers',
        'Packets passed to SigVerify stage',
      ]
    },
    whyItMatters: 'Separating fetch from verification allows pipelining. While SigVerify processes batch N, Fetch can receive batch N+1.',
    metrics: [
      'Three QUIC servers: tx, vote, forwards',
      'SO_REUSEPORT for parallel socket binding',
    ]
  },
  subComponents: []
}

export const SIG_VERIFY: ArchitectureComponent = {
  id: 'sig-verify',
  name: 'SigVerify Stage',
  icon: '✍️',
  category: 'tpu',
  layer: 'tpu',
  pipeline: 'tpu',
  position: 1,
  detail: {
    purpose: 'Checks that every incoming transaction carries a valid Ed25519 signature before it consumes any further compute.',
    role: 'Second stage of the TPU pipeline. Verifies signatures across all CPU cores in parallel and filters out duplicate packets.',
    howItWorks: {
      title: 'Signature Verification',
      steps: [
        'Packets received from Fetch stage',
        'Each packet\'s transaction signature probes a Bloom filter — recently seen duplicates are dropped before verification work is spent',
        'Surviving packets verified in batches of 128 (VERIFY_PACKET_CHUNK_SIZE) spread across all CPU cores',
        'Invalid signatures flagged and their packets discarded',
        'Load shedding discards excess packets under overload',
        'A shared priority floor (SchedulerPriorityFloor) keeps consensus votes verifying ahead of ordinary traffic',
        'Verified packets passed to Banking Stage',
      ]
    },
    whyItMatters: 'Signature verification dominates per-transaction cost. Chunked parallel batching across CPU cores is what lets one validator push tens of thousands of signatures per second.',
    metrics: [
      'VERIFY_PACKET_CHUNK_SIZE: 128 packets per batch',
      'Dedup filter: probabilistic Bloom filter over recent packet signatures',
    ]
  },
  refs: [
    'https://github.com/anza-xyz/agave/blob/v4.2.1/perf/src/sigverify.rs#L15',
    'https://github.com/anza-xyz/agave/blob/v4.2.1/core/src/tpu.rs#L284',
    'https://github.com/anza-xyz/agave/blob/v4.2.1/banking-stage-ingress-types/src/lib.rs#L20',
    'https://github.com/anza-xyz/agave/blob/v4.2.1/perf/src/deduper.rs#L20',
  ],
  subComponents: [
    {
      id: 'dedup',
      name: 'Packet Deduplication',
      icon: '🔍',
      detail: {
        purpose: 'Drops duplicate packets before signature verification work is wasted on them.',
        role: 'A Bloom filter (perf::Deduper) keyed on the transaction signature hash remembers every recently seen packet.',
        howItWorks: {
          title: 'Dedup Logic',
          steps: [
            'Hash each packet\'s transaction signature',
            'Probe the Bloom filter built over recent signatures',
            'Signature never seen before → packet continues to verification',
            'Signature already seen → packet discarded immediately',
            'The filter resets periodically so entries age out',
          ]
        },
        whyItMatters: 'Clients often re-submit identical packets when they don\'t get a quick answer. Filtering them here is nearly free compared to verifying the same signatures again.',
        metrics: ['Dedup key: transaction signature hash']
      },
      refs: ['https://github.com/anza-xyz/agave/blob/v4.2.1/perf/src/deduper.rs#L20'],
    }
  ]
}

export const BANKING_STAGE: ArchitectureComponent = {
  id: 'banking-stage',
  name: 'Banking Stage',
  icon: '🏦',
  category: 'tpu',
  layer: 'tpu',
  pipeline: 'tpu',
  position: 2,
  detail: {
    purpose: 'The core block-building engine. Schedules and executes transactions, builds the block.',
    role: 'Third stage of TPU. 6 independent worker threads (4 regular + 2 vote) schedule and execute transactions in parallel.',
    howItWorks: {
      title: 'Banking Stage Pipeline',
      steps: [
        'Central Scheduler receives verified packets from SigVerify',
        'Transactions sorted by priority: reward * 1M / (cost + 1)',
        'Prio-Graph DAG built to identify account conflicts',
        'Non-conflicting transactions scheduled in parallel across 4 worker threads',
        '2 dedicated vote threads ensure consensus votes are never starved',
        'Account locks acquired per transaction (write = exclusive, read = shared)',
        'Transactions executed via SVM/Sealevel runtime',
        'Results committed to Bank state',
      ]
    },
    whyItMatters: 'This is where blocks are actually built. The scheduler determines throughput — a bad scheduler means wasted block space and lower TPS.',
    metrics: [
      'Worker threads: 4 regular + 2 vote',
      'Block capacity: 48M CU (100M with SIMD)',
      'Default per-tx budget: 200,000 CU',
      'Max per-tx: 1,400,000 CU',
      'Max 64 txs per entry (non-conflicting batch)',
    ]
  },
  subComponents: [
    {
      id: 'central-scheduler',
      name: 'Central Scheduler',
      icon: '🎛️',
      detail: {
        purpose: 'Single scheduler thread that builds a priority graph and dispatches transactions to worker threads.',
        role: 'Replaces legacy thread-local schedulers. Builds DAG of transaction dependencies, dispatches to workers.',
        howItWorks: {
          title: 'Central Scheduler Flow',
          steps: [
            'Receives verified packets from SigVerify',
            'Sorts by priority: reward * 1,000,000 / (cost + 1)',
            'Builds Prio-Graph: DAG with edges between conflicting transactions (same accounts)',
            'Look-ahead window pops transactions from priority queue into graph',
            'Detects conflicts: transactions touching same accounts cannot run in parallel',
            'Dispatches non-conflicting batches to worker threads',
            'Handles re-queuing when locks cannot be acquired',
          ]
        },
        whyItMatters: 'Central scheduler has全局 view of all pending transactions, enabling optimal scheduling decisions. Replaces greedy local schedulers.',
        metrics: ['Scheduler thread: single', 'Worker dispatch: non-conflicting batches']
      }
    },
    {
      id: 'prio-graph',
      name: 'Prio-Graph (DAG)',
      icon: '📊',
      detail: {
        purpose: 'Directed Acyclic Graph that models transaction conflicts for parallel scheduling.',
        role: 'Edges represent account conflicts. Non-conflicting transactions can execute simultaneously.',
        howItWorks: {
          title: 'Prio-Graph Construction',
          steps: [
            'Each transaction is a node in the graph',
            'Edge from tx A → tx B if A and B access the same account and at least one writes',
            'Priority ordering: higher priority transactions scheduled first',
            'Graph join detection: conflicting future transactions queued on same thread',
            'Enables parallel execution of independent transactions',
          ]
        },
        whyItMatters: 'Without DAG, scheduler would process transactions sequentially. DAG enables parallel execution of non-conflicting transactions.',
        metrics: [
          'Priority formula: reward * 1,000,000 / (cost + 1)',
          'Conflict detection: same account + at least one write',
        ]
      }
    },
    {
      id: 'account-locking',
      name: 'Account Locking',
      icon: '🔒',
      detail: {
        purpose: 'Ensures transactions don\'t conflict during parallel execution by locking accounts.',
        role: 'Write locks are exclusive. Read locks are shared. Prevents data races during parallel execution.',
        howItWorks: {
          title: 'Lock Acquisition',
          steps: [
            'Before execution, each thread acquires locks on all accounts the transaction touches',
            'Write lock: exclusive access (no other thread can read or write)',
            'Read lock: shared access (other threads can read but not write)',
            'If lock cannot be acquired: transaction re-queued to waiting queue',
            'Hot accounts (popular DEX pools) create serialization bottlenecks',
          ]
        },
        whyItMatters: 'Account locking is what enables Sealevel parallelism. Without it, all transactions would need sequential execution.',
        metrics: [
          'Write lock cost: 300 CUs per account',
          'Hot accounts create serialization bottlenecks',
        ]
      }
    }
  ]
}

export const POH_RECORDING: ArchitectureComponent = {
  id: 'poh-recording',
  name: 'PoH Recording',
  icon: '⏱️',
  category: 'tpu',
  layer: 'tpu',
  pipeline: 'tpu',
  position: 3,
  detail: {
    purpose: 'Stamps every executed batch into the ongoing SHA-256 hash chain, fixing its exact position in history.',
    role: 'Leader-side recording half of Proof of History. Batches travel TransactionRecorder → bounded record_channels → PohService, which folds them into the chain immediately.',
    howItWorks: {
      title: 'Recording Into the Chain',
      steps: [
        'Consume-workers finish executing a batch',
        'TransactionRecorder sends the batch over a bounded record channel',
        'PohService immediately computes new_hash = SHA-256(previous_hash ‖ batch_data) — no storage step waits in between',
        'Between batches, tick markers keep the chain advancing: 64 per slot by default',
        'At the slot\'s final tick, accumulated entries flush to the working bank and continue on to Broadcast',
      ]
    },
    whyItMatters: 'The block literally is the recorded sequence: replaying the same hashes reproduces the same order, so transaction ordering needs no separate consensus.',
    metrics: [
      'Hash function: SHA-256',
      'Ticks per slot: 64 (default)',
      'Slot duration: ~400ms',
      'Output: 32 bytes per hash',
    ]
  },
  refs: [
    'https://github.com/anza-xyz/agave/blob/v4.2.1/poh/src/poh_service.rs#L120',
    'https://github.com/anza-xyz/agave/blob/v4.2.1/poh/src/record_channels.rs#L31',
    'https://github.com/anza-xyz/agave/blob/v4.2.1/poh/src/poh_recorder.rs#L127',
  ],
  subComponents: [
    {
      id: 'tick-producer',
      name: 'Inside the Hash Chain',
      icon: '🔐',
      detail: {
        purpose: 'Shows exactly how successive hashes create a verifiable timeline.',
        role: 'A purely sequential function: each value is derived only from the previous one, starting at genesis.',
        howItWorks: {
          title: 'Chain Walkthrough',
          steps: [
            'h₀ = genesis hash',
            'h₁ = SHA-256(h₀)',
            'h₂ = SHA-256(h₁) … hₙ = SHA-256(hₙ₋₁)',
            'To mix in data (a transaction batch): h = SHA-256(h_prev ‖ batch_data) — the data becomes part of the chain',
            'Every hash depends on all previous ones, so the sequence cannot be reordered or computed out of order',
            'Anyone can start from h₀ and recompute the whole chain to verify it — no trust required',
          ]
        },
        whyItMatters: 'Each step is cheap but strictly sequential, so counting hashes measures elapsed work — a property shared with Verifiable Delay Functions (VDFs). PoH uses that property as a shared clock for ordering events; validators verify by recomputing rather than debating timestamps.',
        metrics: [
          '32 bytes per hash output',
          'One dedicated thread, sequential by design',
        ]
      },
      refs: ['https://github.com/anza-xyz/agave/blob/v4.2.1/poh/src/poh_service.rs#L120'],
    }
  ]
}

export const BROADCAST: ArchitectureComponent = {
  id: 'broadcast',
  name: 'Broadcast Stage',
  icon: '📡',
  category: 'tpu',
  layer: 'tpu',
  pipeline: 'tpu',
  position: 4,
  detail: {
    purpose: 'Serializes completed entries into shreds and sends them via Turbine to the network.',
    role: 'Final stage of TPU pipeline. Runs in parallel with Banking Stage — entries stream out as produced.',
    howItWorks: {
      title: 'Broadcast Flow',
      steps: [
        'Receives entries from Banking Stage',
        'Serializes entries into data shreds (~1,228 bytes each)',
        'Generates coding shreds via Reed-Solomon erasure coding (32:32 FEC)',
        'Signs shreds with leader\'s keypair',
        'Sends shreds through Turbine tree to network peers',
      ]
    },
    whyItMatters: 'Continuous block building: entries stream out as produced, not after full block assembly. Reduces latency.',
    metrics: [
      'Data shred: ~1,228 bytes payload',
      'FEC ratio: 32:32 (data:coding)',
      'Signed by slot leader',
    ]
  },
  subComponents: [
    {
      id: 'erasure-coding',
      name: 'Reed-Solomon Erasure Coding',
      icon: '🧩',
      detail: {
        purpose: 'Adds redundancy to shreds so blocks can be reconstructed from partial data.',
        role: 'Generates coding shreds that allow recovery from lost data shreds.',
        howItWorks: {
          title: 'Erasure Coding',
          steps: [
            'Split entry into 32 data shreds (~1,228 bytes each)',
            'Generate 32 coding shreds using Reed-Solomon encoding',
            'Any 32 of 64 shreds (data + coding) can reconstruct the original',
            'Send all 64 shreds through Turbine',
            'Receiver needs only 50% of shreds to recover full block',
          ]
        },
        whyItMatters: '50% redundancy means blocks survive significant packet loss. Critical for Turbine\'s best-effort delivery model.',
        metrics: ['FEC: 32 data + 32 coding = 64 total', 'Recovery threshold: 32 of 64']
      }
    }
  ]
}

export const FORWARDING: ArchitectureComponent = {
  id: 'forwarding',
  name: 'Forwarding Stage',
  icon: '➡️',
  category: 'tpu',
  layer: 'tpu',
  pipeline: 'tpu',
  position: 5,
  detail: {
    purpose: 'Forwards received transactions to upcoming leaders when the node is not the current leader.',
    role: 'Active when node is not producing blocks. Sorts packets by priority before forwarding.',
    howItWorks: {
      title: 'Forwarding Logic',
      steps: [
        'Check if node is current leader',
        'If not leader: sort received packets by priority',
        'Always forward TPU votes (consensus critical)',
        'Non-vote transactions forwarded only if node has option enabled',
        'One-hop limit: forwarding only to tpu_forwards port',
      ]
    },
    whyItMatters: 'Ensures transactions reach the leader even when received by non-leader validators. Critical for Gulf Stream\'s mempool-less design.',
    metrics: ['Forwarding limit: one hop', 'Outbound queue cap: 10,000 txs']
  },
  subComponents: []
}

// ═══════════════════════════════════════════════════════════════════
// TVU PIPELINE (Validator Mode)
// ═══════════════════════════════════════════════════════════════════

export const SHRED_FETCH: ArchitectureComponent = {
  id: 'shred-fetch',
  name: 'Shred Fetch',
  icon: '📥',
  category: 'tvu',
  layer: 'tvu',
  pipeline: 'tvu',
  position: 0,
  detail: {
    purpose: 'Receives shreds from network peers via Turbine.',
    role: 'Entry point of TVU pipeline. Binds to TVU port (8002 UDP) with SO_REUSEPORT for parallel processing.',
    howItWorks: {
      title: 'Shred Reception',
      steps: [
        'Binds to TVU port via SO_REUSEPORT',
        'Kernel distributes incoming packets across multiple sockets',
        'Socket info published via Gossip in ContactInfo',
        'Received shreds passed to Shred SigVerify',
      ]
    },
    whyItMatters: 'SO_REUSEPORT enables parallel packet processing across CPU cores, critical for high-throughput shred reception.',
    metrics: ['TVU port: 8002 UDP', 'SO_REUSEPORT for parallel sockets']
  },
  subComponents: []
}

export const SHRED_SIG_VERIFY: ArchitectureComponent = {
  id: 'shred-sig-verify',
  name: 'Shred SigVerify',
  icon: '✍️',
  category: 'tvu',
  layer: 'tvu',
  pipeline: 'tvu',
  position: 1,
  detail: {
    purpose: 'Verifies signatures on incoming shreds to ensure they come from the expected leader.',
    role: 'Second stage of TVU. Verifies leader signatures on each shred.',
    howItWorks: {
      title: 'Shred Signature Verification',
      steps: [
        'Receive shreds from Shred Fetch',
        'Verify Ed25519 signature against expected leader\'s public key',
        'Check that signer matches the leader schedule for this slot',
        'Discard shreds with invalid signatures',
        'Pass valid shreds to Window Service',
      ]
    },
    whyItMatters: 'Prevents malicious validators from injecting fake shreds. Ensures only legitimate leader-produced data enters the blockstore.',
    metrics: ['Signature verification: Ed25519']
  },
  subComponents: []
}

export const WINDOW_SERVICE: ArchitectureComponent = {
  id: 'window-service',
  name: 'Window Service',
  icon: '🪟',
  category: 'tvu',
  layer: 'tvu',
  pipeline: 'tvu',
  position: 2,
  detail: {
    purpose: 'Assembles complete blocks from received shreds and handles repair requests for missing data.',
    role: 'Tracks which shreds have been received per slot, detects missing shreds, and initiates repair.',
    howItWorks: {
      title: 'Block Assembly',
      steps: [
        'Track received shreds per slot in a window',
        'Detect missing shreds by comparing against expected range',
        'Initiate repair requests for missing shreds',
        'Assemble contiguous entries from received shreds',
        'Feed assembled entries to Replay Stage',
      ]
    },
    whyItMatters: 'Turbine is best-effort. Window Service ensures complete block reconstruction through repair, maintaining data availability.',
    metrics: ['Window size: configurable', 'Repair: on-demand']
  },
  subComponents: []
}

export const REPLAY_STAGE: ArchitectureComponent = {
  id: 'replay-stage',
  name: 'Replay Stage',
  icon: '🔄',
  category: 'tvu',
  layer: 'tvu',
  pipeline: 'tvu',
  position: 3,
  detail: {
    purpose: 'Executes transactions from assembled blocks against local state and reports results to consensus.',
    role: 'Main loop of the validator. Connects ledger, runtime, AccountsDB, and consensus.',
    howItWorks: {
      title: 'Replay Flow',
      steps: [
        'Pull new blocks from Blockstore via Window Service',
        'For each block: execute transactions against local Bank state',
        'Use SVM/Sealevel runtime for parallel execution',
        'Update AccountsDB with state changes',
        'Report execution results to Consensus (Tower BFT)',
        'Handle fork selection and rollback if needed',
        'Roll back Bank to vote point and replay if fork switches',
      ]
    },
    whyItMatters: 'Replay Stage is where validators verify the leader\'s work. Without it, validators cannot participate in consensus.',
    metrics: ['Main validator loop', 'Fork-aware: handles multiple competing chains']
  },
  subComponents: []
}

export const RETRANSMIT: ArchitectureComponent = {
  id: 'retransmit',
  name: 'Retransmit Stage',
  icon: '🔁',
  category: 'tvu',
  layer: 'tvu',
  pipeline: 'tvu',
  position: 4,
  detail: {
    purpose: 'Propagates received shreds to other validators through the Turbine tree.',
    role: 'Each validator retransmits to a subset of peers in the next layer of the Turbine tree.',
    howItWorks: {
      title: 'Retransmit Flow',
      steps: [
        'Receive verified shreds from Shred SigVerify',
        'Determine position in Turbine tree (based on stake)',
        'Retransmit shreds to downstream peers in the next layer',
        'Each layer fans out to 200x more nodes (DATA_PLANE_FANOUT = 200)',
      ]
    },
    whyItMatters: 'Without retransmission, Turbine tree would only reach direct peers. Retransmission ensures full network coverage.',
    metrics: ['DATA_PLANE_FANOUT: 200', 'Tree depth: 2-3 hops']
  },
  subComponents: []
}

// ═══════════════════════════════════════════════════════════════════
// TURBINE (Shared Networking)
// ═══════════════════════════════════════════════════════════════════

export const TURBINE: ArchitectureComponent = {
  id: 'turbine',
  name: 'Turbine',
  icon: '🌪️',
  category: 'networking',
  layer: 'networking',
  pipeline: 'shared',
  position: 4,
  detail: {
    purpose: 'Propagates block data (shreds) from the leader to all validators efficiently.',
    role: 'BitTorrent-inspired multi-layer tree propagation. 2-3 hops to reach all validators.',
    howItWorks: {
      title: 'Turbine Propagation',
      steps: [
        'Leader breaks blocks into MTU-sized shreds (~1,228 bytes)',
        'Reed-Solomon erasure coding: 32:32 FEC sets',
        'Stake-weighted shuffle: higher-staked validators placed closer to leader',
        'Per-shred tree: deterministic tree from seed (leader_id, slot, index)',
        'Fan-out: each layer is 200x previous (DATA_PLANE_FANOUT = 200)',
        '2-3 hops: leader → root → L1 → L2 reaches all validators',
        'UDP transport for low latency (~100ms)',
      ]
    },
    whyItMatters: 'Turbine achieves O(√N) propagation instead of O(N). Critical for scaling to 1000+ validators.',
    metrics: [
      'DATA_PLANE_FANOUT: 200',
      'Shred size: ~1,228 bytes',
      'FEC: 32:32',
      'Propagation: ~100ms',
      'Tree depth: 2-3 hops',
    ]
  },
  subComponents: [
    {
      id: 'stake-weighted-tree',
      name: 'Stake-Weighted Tree',
      icon: '🌳',
      detail: {
        purpose: 'Constructs propagation tree with higher-staked validators closer to the leader.',
        role: 'Ensures critical path (leader to supermajority) is as short as possible.',
        howItWorks: {
          title: 'Tree Construction',
          steps: [
            'Collect all validators and their stakes from Gossip',
            'Shuffle validators using deterministic seed (slot, shred_index)',
            'Place higher-staked validators in earlier layers',
            'Each validator knows its position in the tree',
            'Retransmit to 200 downstream peers in next layer',
          ]
        },
        whyItMatters: 'Stake-weighted placement ensures 2/3 supermajority is reached in 2 hops, enabling fast confirmation.',
        metrics: ['Fan-out: 200', 'Depth to supermajority: 2 hops']
      }
    }
  ]
}

// ═══════════════════════════════════════════════════════════════════
// RUNTIME / EXECUTION LAYER
// ═══════════════════════════════════════════════════════════════════

export const SVM_PIPELINE: ArchitectureComponent = {
  id: 'svm-pipeline',
  name: 'SVM Pipeline',
  icon: '⚡',
  category: 'runtime',
  layer: 'runtime',
  pipeline: 'shared',
  position: 0,
  detail: {
    purpose: 'Executes transactions: loads their accounts, runs each instruction, and applies the results to bank state.',
    role: 'A library, not a pipeline stage. The same engine is invoked by Banking Stage consume-workers when producing a block and by ReplayStage when validating one.',
    howItWorks: {
      title: 'How SVM Executes a Batch',
      steps: [
        'A caller hands over a batch of transactions with account locks already held — Banking Stage consume-workers on the leader, ReplayStage during validation',
        'Each transaction\'s accounts are loaded from AccountsDB caches into the execution context',
        'Per instruction: built-in programs run as native Rust; on-chain programs run inside an sBPF virtual machine',
        'Programs may invoke other programs via CPI, up to 5 frames deep',
        'Execution results are applied to bank state and locks are released',
        'Because both production and validation call this identical library, every validator agrees on outcomes',
      ]
    },
    whyItMatters: 'One engine, two callers: whoever executes it first — leader or validator — must reach the same result. That is what makes replayed blocks trustworthy.',
    metrics: [
      'Max CPI depth: 5 (gated note: SIMD-0268 raises this to 9 once activated)',
      'Account-level parallelism (locks held by the caller)',
    ]
  },
  refs: [
    'https://github.com/anza-xyz/agave/blob/v4.2.1/core/src/banking_stage/consumer.rs#L318',
    'https://github.com/anza-xyz/agave/blob/v4.2.1/runtime/src/bank.rs#L1',
    'https://github.com/anza-xyz/agave/blob/v4.2.1/program-runtime/src/execution_budget.rs#L7',
  ],
  subComponents: [
    {
      id: 'block-processor',
      name: 'Block Processing (validation side)',
      icon: '🧱',
      detail: {
        purpose: 'Drives SVM over a received block\'s entries during replay, so validators independently reach the leader\'s results.',
        role: 'The verification-side caller of the runtime: loads each entry\'s transactions and executes them against a candidate bank.',
        howItWorks: {
          title: 'Replaying a Block',
          steps: [
            'A completed slot is read back from blockstore',
            'Each entry\'s transactions are handed to the runtime in order',
            'Account locks are acquired per transaction before execution',
            'Results must match what the leader broadcast — any mismatch invalidates the block for this validator',
            'When every entry succeeds, the bank is frozen',
          ]
        },
        whyItMatters: 'This is the "trust but verify" half of Solana: no validator ever trusts a leader\'s claimed state; everyone recomputes it.',
        metrics: ['Executes inside ReplayStage\'s parallel thread pools']
      }
    },
    {
      id: 'transaction-processor',
      name: 'Transaction Processor',
      icon: '📋',
      detail: {
        purpose: 'Validates transaction structure and executes each instruction through the Instruction Processor.',
        role: 'Three stages: validation, program/account loading, instruction execution.',
        howItWorks: {
          title: 'Transaction Processing',
          steps: [
            'Validate transaction structure (signatures, accounts, instructions)',
            'Load accounts from AccountsDB',
            'For each instruction: pass to Instruction Processor',
            'Manage CPI stack (max depth 5)',
            'Commit results to Bank state',
          ]
        },
        whyItMatters: 'Handles the full lifecycle of a single transaction. Clean separation of concerns.',
        metrics: ['Max instructions per tx: unlimited (within CU budget)']
      }
    },
    {
      id: 'instruction-processor',
      name: 'Instruction Processor',
      icon: '⚙️',
      detail: {
        purpose: 'Determines program type and executes accordingly (Native vs sBPF).',
        role: 'Two program types: Native (builtin) and sBPF (on-chain). Invokes native programs directly or creates sBPF VM.',
        howItWorks: {
          title: 'Instruction Execution',
          steps: [
            'Inspect account owner to determine program type',
            'If Native (system_program, vote_program, etc.): invoke directly',
            'If sBPF (user-deployed program): create VM instance',
            'Load sBPF bytecode into VM memory',
            'Execute program in sandboxed environment',
            'Handle syscalls (hashing, CPI, logging, etc.)',
            'Return execution result',
          ]
        },
        whyItMatters: 'Native programs are fast (direct Rust execution). sBPF programs are sandboxed for safety. Both use the same interface.',
        metrics: ['Native: direct execution', 'sBPF: JIT compiled to x86_64']
      }
    }
  ]
}

export const SBPF_VM: ArchitectureComponent = {
  id: 'sbpf-vm',
  name: 'sBPF VM',
  icon: '🖥️',
  category: 'runtime',
  layer: 'runtime',
  pipeline: 'shared',
  position: 1,
  detail: {
    purpose: 'Executes on-chain program bytecode in a sandboxed virtual machine.',
    role: 'Solana Bytecode Format VM. Runs user-deployed programs with memory isolation and syscall interface.',
    howItWorks: {
      title: 'sBPF VM Execution',
      steps: [
        '1. Memory Map: translate virtual addresses, allocate stack/heap/account data/program regions',
        '2. Load program bytecode into program memory region',
        '3. Interpreter: fetch, decode, execute 8-byte sBPF instructions',
        '4. Syscalls: ~30 predefined native functions (hashing, CPI, logging, etc.)',
        '5. JIT mode: compile to x86_64 machine code for faster execution',
        '6. Memory safety: bounds checking on all memory accesses',
      ]
    },
    whyItMatters: 'Sandboxing ensures untrusted on-chain programs cannot crash the validator or access unauthorized memory.',
    metrics: [
      'Instruction size: 8 bytes',
      'Syscalls: ~30',
      'JIT compilation: sBPF → x86_64',
      'Based on rBPF library (Rust eBPF)',
    ]
  },
  subComponents: [
    {
      id: 'syscalls',
      name: 'Syscalls',
      icon: '📞',
      detail: {
        purpose: 'Predefined native functions callable from sBPF programs.',
        role: 'Interface between on-chain programs and the runtime. ~30 syscalls for hashing, crypto, CPI, memory, etc.',
        howItWorks: {
          title: 'Syscall Categories',
          steps: [
            'Logging: sol_log_, sol_log_64_, sol_log_pubkey, sol_log_data',
            'Hashing: sol_sha256, sol_keccak256, sol_blake3',
            'Cryptography: sol_secp256k1_recover, sol_curve_validate_point',
            'CPI: sol_invoke_signed_rust, sol_invoke_signed_c',
            'Memory: sol_memcpy_, sol_memmove_, sol_memcmp_, sol_memset_',
            'Sysvars: sol_get_clock_sysvar, sol_get_epoch_schedule_sysvar',
            'PDA: sol_create_program_address, sol_try_find_program_address',
            'Return data: sol_set_return_data, sol_get_return_data',
          ]
        },
        whyItMatters: 'Syscalls provide controlled access to runtime functionality. Programs cannot access anything not exposed via syscalls.',
        metrics: ['~30 syscalls total', 'Ed25519 verify syscall available']
      }
    }
  ]
}

export const CPI: ArchitectureComponent = {
  id: 'cpi',
  name: 'Cross-Program Invocation',
  icon: '🔗',
  category: 'runtime',
  layer: 'runtime',
  pipeline: 'shared',
  position: 2,
  detail: {
    purpose: 'Allows programs to invoke other programs, enabling composability.',
    role: '11-step execution flow through the runtime. Privilege escalation prevention. Max depth 5 (9 with SIMD-0268).',
    howItWorks: {
      title: 'CPI Execution Flow',
      steps: [
        '1. Caller program invokes sol_invoke_signed syscall',
        '2. Runtime validates CPI parameters',
        '3. Check instruction stack depth (max 5, or 9 with SIMD-0268)',
        '4. Pre-CPI sync: caller\'s modifications visible to callee',
        '5. Callee program executes',
        '6. Privilege check: callee cannot exceed caller\'s permissions',
        '7. Reentrancy check: program can only call itself if direct caller',
        '8. Post-CPI sync: callee\'s changes returned to caller',
        '9. Instruction stack popped',
        '10. Results committed',
      ]
    },
    whyItMatters: 'CPI enables program composability (e.g., DEX calling token program). Privilege escalation prevention is critical for security.',
    metrics: [
      'Max depth: 5 (9 with SIMD-0268)',
      'Reentrancy: A→B→A blocked, A→B→A (self) allowed',
      'Blocked programs: native_loader, bpf_loader, precomploys',
    ]
  },
  subComponents: []
}

export const COMPUTE_BUDGET: ArchitectureComponent = {
  id: 'compute-budget',
  name: 'Compute Budget',
  icon: '🧮',
  category: 'runtime',
  layer: 'runtime',
  pipeline: 'shared',
  position: 3,
  detail: {
    purpose: 'Meters computation and determines transaction fees and scheduling priority.',
    role: 'Parsed during transaction sanitization. Used by scheduler and runtime to allocate resources.',
    howItWorks: {
      title: 'Compute Budget Instructions',
      steps: [
        'RequestHeapFrame(bytes): heap size per program (min 32KB, max 256KB)',
        'SetComputeUnitLimit(units): max CUs the transaction may consume',
        'SetComputeUnitPrice(micro_lamports): CU price for priority',
        'SetLoadedAccountsDataSizeLimit(bytes): max account data loaded',
        'Total cost = signature_cost + write_lock_cost + data_bytes_cost + execution_cost + loaded_data_cost',
      ]
    },
    whyItMatters: 'Compute budget prevents DoS via unlimited computation. Priority fees create a market for block space.',
    metrics: [
      'Signature cost: 720 CUs',
      'Write lock: 300 CUs per account',
      'Data bytes: 4 CUs per byte',
      'Default instruction: 200,000 CU',
      'Max transaction: 1,400,000 CU',
      'Block limit: 48M CU (100M with SIMD)',
    ]
  },
  subComponents: [
    {
      id: 'fee-structure',
      name: 'Fee Structure',
      icon: '💰',
      detail: {
        purpose: 'Determines transaction costs: base fee + priority fee.',
        role: 'Base fee: 5,000 lamports per signature (50% burned). Priority fee: CU price × CU limit.',
        howItWorks: {
          title: 'Fee Calculation',
          steps: [
            'Base fee: 5,000 lamports × number of signatures',
            '50% of base fee burned, 50% to validator',
            'Priority fee: ceil(compute_unit_price × compute_unit_limit / 1,000,000)',
            'Priority fee: 100% to validator (per SIMD-0096)',
            'Fees charged whether tx succeeds or fails',
          ]
        },
        whyItMatters: 'Fee burning creates deflationary pressure. Priority fees create market for block space. Failed tx still pays to prevent DoS.',
        metrics: [
          'Base fee: 5,000 lamports/signature',
          'Burn rate: 50%',
          'Priority fee: 100% to validator',
        ]
      }
    }
  ]
}

// ═══════════════════════════════════════════════════════════════════
// CONSENSUS LAYER
// ═══════════════════════════════════════════════════════════════════

export const POH: ArchitectureComponent = {
  id: 'poh',
  name: 'Proof of History',
  icon: '⏱️',
  category: 'consensus',
  layer: 'consensus',
  pipeline: 'shared',
  position: 0,
  detail: {
    purpose: 'Provides a verifiable, sequential clock that timestamps events before consensus.',
    role: 'A continuous SHA-256 hash chain. Not a consensus mechanism itself — it is the shared clock every validator recomputes for itself.',
    howItWorks: {
      title: 'PoH Mechanism',
      steps: [
        'Single-threaded SHA-256 loop on one core per validator',
        'h₀ = genesis hash',
        'hₙ = SHA-256(hₙ₋₁) — each value depends only on the one before',
        'Transaction batches and ticks are folded into this chain as they happen',
        'Because each step needs the previous one, N hashes prove N units of sequential work',
        '64 ticks per slot (~400ms); the final tick hash closes the slot',
      ]
    },
    whyItMatters: 'PoH gives every validator an identical, independently checkable timeline — no timestamp committee needed. Consensus then only has to agree on validity and fork choice.',
    metrics: [
      'Hash: SHA-256',
      'Ticks per slot: 64',
      'Slot duration: ~400ms',
      'Output: 32 bytes per hash',
    ]
  },
  refs: [
    'https://github.com/anza-xyz/agave/blob/v4.2.1/poh/src/poh_service.rs#L120',
    'https://github.com/anza-xyz/agave/blob/v4.2.1/poh/src/poh_recorder.rs#L127',
  ],
  subComponents: []
}

export const TOWER_BFT: ArchitectureComponent = {
  id: 'tower-bft',
  name: 'Tower BFT',
  icon: '🗼',
  category: 'consensus',
  layer: 'consensus',
  pipeline: 'shared',
  position: 1,
  detail: {
    purpose: 'Achieves Byzantine Fault Tolerant consensus using stake-weighted voting.',
    role: 'Vote tower with lockout periods. 2/3 supermajority required for confirmation.',
    howItWorks: {
      title: 'Tower BFT Consensus',
      steps: [
        '1. Validator receives block from Replay Stage',
        '2. Validates block correctness',
        '3. Casts vote via on-chain vote transaction',
        '4. Vote added to tower with lockout = 2 slots',
        '5. All previous lockouts double (exponential growth)',
        '6. Cannot vote on non-ancestor without waiting out lockout',
        '7. Fork choice: heaviest subtree by stake-weighted votes',
        '8. Supermajority (≥2/3 stake) on same fork = confirmed',
      ]
    },
    whyItMatters: 'Tower BFT is Solana\'s consensus mechanism. It combines PoS voting with PoH timestamps for fast, deterministic finality.',
    metrics: [
      'Initial lockout: 2 slots (~800ms)',
      'Max lockout: 2^32 slots (~54 years)',
      'Supermajority: ≥2/3 stake',
      'Votes per day: ~216,000',
      'Vote cost: ~2-3 SOL per epoch',
    ]
  },
  subComponents: [
    {
      id: 'vote-tower',
      name: 'Vote Tower',
      icon: '🗳️',
      detail: {
        purpose: 'Sequential stack of votes with exponentially increasing lockouts.',
        role: 'Each vote confirms a fork. Lockout doubles with each vote, making deep history irreversible.',
        howItWorks: {
          title: 'Vote Tower Mechanics',
          steps: [
            'Vote 1: lockout = 2 slots (~800ms)',
            'Vote 2: lockout = 4 slots (~1.6s)',
            'Vote 3: lockout = 8 slots (~3.2s)',
            '...',
            'Vote 32: lockout = 2^32 slots (~54 years)',
            'Exponential growth makes deep history irreversible',
            'Deque oldest vote when tower is full (32 votes)',
          ]
        },
        whyItMatters: 'Exponential lockout growth means the deeper a block is confirmed, the more economically infeasible it is to revert.',
        metrics: ['Max tower depth: 32', 'Lockout growth: exponential (2^n)']
      }
    },
    {
      id: 'fork-choice',
      name: 'Fork Choice Rule',
      icon: '🌲',
      detail: {
        purpose: 'Determines which fork is the canonical chain when multiple competing forks exist.',
        role: 'Heaviest Subtree Fork Choice (HSFC). Forks weighted by stake-weighted votes.',
        howItWorks: {
          title: 'Fork Selection',
          steps: [
            'Each fork has a weight = sum of stake that has voted for it',
            'Choose fork with highest weight (stake-weighted votes)',
            'If equal weight: choose fork with more recent vote',
            'Switching threshold: >38% of votes on alternative forks required',
            'Minimum cluster commitment at depth 8: 50%+',
          ]
        },
        whyItMatters: 'Fork choice ensures all honest validators eventually agree on the same chain. Critical for liveness.',
        metrics: ['Switching threshold: >38%', 'Min commitment at depth 8: 50%+']
      }
    }
  ]
}

export const STATUS_CACHE: ArchitectureComponent = {
  id: 'status-cache',
  name: 'Status Cache',
  icon: '🗃️',
  category: 'consensus',
  layer: 'consensus',
  pipeline: 'shared',
  position: 2,
  detail: {
    purpose: 'Remembers the outcome of recently processed transactions so nothing executes twice and every client gets an answer.',
    role: 'A lookup table consulted while transactions are consumed in the Banking Stage, and by RPC when clients poll for results.',
    howItWorks: {
      title: 'Exactly-Once Processing',
      steps: [
        'Before executing, Banking Stage validates the transaction\'s recent blockhash and fee payer (check_fee_payer_unlocked)',
        'A blockhash that has aged out of history means the transaction expired — it is rejected',
        'When a transaction executes, its signature and result are recorded here',
        'If the identical transaction arrives again, the recorded result short-circuits re-execution',
        'RPC getSignatureStatuses reads this table to answer "did my transaction land?"',
        'Entries expire once their slot is deeply finalized',
      ]
    },
    whyItMatters: 'Gives the chain exactly-once execution and gives clients instant feedback — the same structure serves both jobs.',
    metrics: ['Cache window: spans recent finalized slots']
  },
  refs: [
    'https://github.com/anza-xyz/agave/blob/v4.2.1/core/src/banking_stage/consumer.rs#L474',
    'https://github.com/anza-xyz/agave/blob/v4.2.1/runtime/src/commitment.rs#L9',
  ],
  subComponents: []
}

// ═══════════════════════════════════════════════════════════════════
// STORAGE LAYER
// ═══════════════════════════════════════════════════════════════════

export const ACCOUNTS_DB: ArchitectureComponent = {
  id: 'accounts-db',
  name: 'AccountsDB',
  icon: '🗄️',
  category: 'storage',
  layer: 'storage',
  pipeline: 'shared',
  position: 0,
  detail: {
    purpose: 'Persistent storage and indexing of all on-chain account data.',
    role: 'Core data layer. Memory-mapped files, sharded index, write/read caches, background cleanup.',
    howItWorks: {
      title: 'AccountsDB Architecture',
      steps: [
        '1. Accounts stored in AppendVecs (memory-mapped files per slot)',
        '2. Account Index: maps Pubkey → Vec<(Slot, file_id, offset)>',
        '3. Index sharded into 8,192 bins by first N bits of pubkey',
        '4. Write Cache: per-slot caching before flushing to disk',
        '5. Read Cache: caches full account data after first disk read',
        '6. Background Flushing: moves accounts from write cache to disk',
        '7. Background Cleaning: removes dead accounts (zero lamports)',
        '8. Background Shrinking: compacts account files',
      ]
    },
    whyItMatters: 'AccountsDB is the source of truth for all on-chain state. Performance directly impacts TPS.',
    metrics: [
      'Index bins: 8,192',
      'Write cache limit: 15GB default',
      'File format: memory-mapped AppendVecs',
      '64-byte alignment for all entries',
    ]
  },
  subComponents: [
    {
      id: 'append-vecs',
      name: 'AppendVecs',
      icon: '📁',
      detail: {
        purpose: 'Memory-mapped files that store account data for a single slot.',
        role: 'Concurrent single-thread append with many concurrent readers. Zero-copy access.',
        howItWorks: {
          title: 'AppendVec Structure',
          steps: [
            'Each file stores accounts for one slot',
            'Memory-mapped for zero-copy reads',
            'Single-thread append (write-once, read-many)',
            'Each entry: StoredMeta + AccountMeta + hash + data bytes',
            '64-byte alignment for all entries',
          ]
        },
        whyItMatters: 'Memory-mapping enables zero-copy reads, critical for high-throughput account access.',
        metrics: ['Alignment: 64 bytes', 'One file per slot']
      }
    },
    {
      id: 'account-index',
      name: 'Account Index',
      icon: '📇',
      detail: {
        purpose: 'Maps Pubkey to storage locations for fast account lookup.',
        role: 'Sharded into 8,192 bins. Two modes: In-Memory Only or Disk-Backed (BucketMap).',
        howItWorks: {
          title: 'Index Lookup',
          steps: [
            'Hash pubkey to determine bin (first N bits)',
            'Search bin for matching pubkey',
            'Return Vec<(Slot, file_id, offset)> for all versions',
            'RefCount tracks number of storages per account',
            'Global atomic write_version tracks commits',
          ]
        },
        whyItMatters: 'Sharded index enables O(1) lookup for most accounts. Critical for transaction execution speed.',
        metrics: ['Bins: 8,192', 'Modes: In-Memory or Disk-Backed']
      }
    }
  ]
}

export const BLOCKSTORE: ArchitectureComponent = {
  id: 'blockstore',
  name: 'Blockstore',
  icon: '📦',
  category: 'storage',
  layer: 'storage',
  pipeline: 'shared',
  position: 1,
  detail: {
    purpose: 'Persistent storage of blockchain data (shreds, entries) for all forks.',
    role: 'RocksDB-backed. Stores every shred observed on the network. Fork-able key space.',
    howItWorks: {
      title: 'Blockstore Architecture',
      steps: [
        'Key-value pairs: key = (slot_index, shred_index), value = entry data',
        'Stores every shred observed (if signed by expected leader)',
        'Fork-able key space: supports random access without choosing fork',
        'SlotMeta tracks: slot_index, num_blocks, consumed, received, next_slots',
        'is_connected: True iff every block from 0..slot forms full sequence',
        'Serves repair requests from RAM (recent) or disk (older)',
      ]
    },
    whyItMatters: 'Blockstore enables fork-aware storage. Validators can store data for multiple competing forks simultaneously.',
    metrics: ['Backend: RocksDB', 'Fork-able key space', 'SlotMeta: per-slot metadata']
  },
  subComponents: []
}

export const BANK: ArchitectureComponent = {
  id: 'bank',
  name: 'Bank',
  icon: '🏦',
  category: 'storage',
  layer: 'storage',
  pipeline: 'shared',
  position: 2,
  detail: {
    purpose: 'In-memory representation of account state at a specific slot.',
    role: 'Snapshot of all accounts and balances at start of block. Used by both Banking Stage and Replay Stage.',
    howItWorks: {
      title: 'Bank State',
      steps: [
        'Created per-slot as a checkpoint',
        'Contains: prev_hash (PoH chain), tick_height, votes',
        'blockhash_queue: 300 most recent blockhashes (valid for 151 slots)',
        'Provides interface to apply transactions and record results',
        'Deterministic: same transactions in same order = identical Bank state',
      ]
    },
    whyItMatters: 'Bank is the fork point. When fork switch occurs, validator rolls back to last voted Bank and replays.',
    metrics: [
      'Blockhash queue: 300 entries',
      'Blockhash validity: 151 slots (~60-90s)',
      'Deterministic state',
    ]
  },
  subComponents: []
}

export const SNAPSHOT: ArchitectureComponent = {
  id: 'snapshot',
  name: 'Snapshot System',
  icon: '📸',
  category: 'storage',
  layer: 'storage',
  pipeline: 'shared',
  position: 3,
  detail: {
    purpose: 'Captures and restores complete validator state for fast bootstrapping.',
    role: 'Full snapshots + incremental snapshots. Used for new validator startup and recovery.',
    howItWorks: {
      title: 'Snapshot System',
      steps: [
        'Periodically capture full snapshot of account files + index + bank metadata',
        'Incremental snapshots capture changes since last full snapshot',
        'New validators download snapshot instead of replaying from genesis',
        'Reconstruct via reconstruct_accountsdb_from_fields',
        'Background snapshot generation and download',
      ]
    },
    whyItMatters: 'Without snapshots, new validators would need to replay from genesis (billions of slots). Snapshots enable fast bootstrap.',
    metrics: ['Full snapshots + incremental snapshots', 'Background generation']
  },
  subComponents: []
}

// ═══════════════════════════════════════════════════════════════════
// NATIVE PROGRAMS
// ═══════════════════════════════════════════════════════════════════

export const NATIVE_PROGRAMS: ArchitectureComponent = {
  id: 'core-programs',
  name: 'Core Programs',
  icon: '📦',
  category: 'programs',
  layer: 'programs',
  pipeline: 'shared',
  position: 0,
  detail: {
    purpose: 'Core programs compiled into the validator binary that provide essential blockchain functionality.',
    role: 'System, Vote, Stake, Compute Budget, ALT, BPF Loaders, ZK ElGamal, Precompiles.',
    howItWorks: {
      title: 'Core Programs',
      steps: [
        'System Program: create accounts, transfer lamports, assign programs',
        'Vote Program: process validator vote transactions, manage tower lockouts',
        'Stake Program: manage stake delegation and deactivation',
        'Compute Budget Program: set compute limits and priority fees',
        'Address Lookup Table (ALT): compact transaction encoding via account lookup tables',
        'BPF Loaders: deploy, upgrade, and manage on-chain programs',
        'ZK ElGamal Proof: verify zero-knowledge proofs for confidential transfers',
        'Precompiles: native signature verification (Ed25519, Secp256k1, Secp256r1)',
      ]
    },
    whyItMatters: 'Native programs are executed directly by the runtime (not via sBPF VM). They provide the foundational primitives for all on-chain activity.',
    metrics: [
      'System Program: most fundamental',
      'Vote Program: ~216,000 votes/day/validator',
      'Precompiles: Ed25519, Secp256k1, Secp256r1',
    ]
  },
  subComponents: [
    {
      id: 'precompiles',
      name: 'Precompiles',
      icon: '🔐',
      detail: {
        purpose: 'Native signature verification programs that bypass the sBPF VM.',
        role: 'Ed25519, Secp256k1, Secp256r1 signature verification. Direct native execution for performance.',
        howItWorks: {
          title: 'Precompile Execution',
          steps: [
            'Transaction targets precompile program address',
            'Runtime detects precompile (not sBPF)',
            'Invokes native Rust implementation directly',
            'Signature verification result returned',
            'No VM overhead — direct CPU execution',
          ]
        },
        whyItMatters: 'Signature verification is the most common instruction. Running it natively (not in VM) saves ~10x compute.',
        metrics: ['Ed25519: 2,280 CUs', 'Secp256k1: 6,690 CUs']
      }
    }
  ]
}

// ═══════════════════════════════════════════════════════════════════
// INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════════════

export const EPOCH_SCHEDULE: ArchitectureComponent = {
  id: 'epoch-schedule',
  name: 'Epoch Schedule',
  icon: '📅',
  category: 'consensus',
  layer: 'consensus',
  pipeline: 'shared',
  position: 3,
  detail: {
    purpose: 'Defines time boundaries for leader rotation and stake updates.',
    role: 'Epoch = 432,000 slots (~2-3 days). Leader schedule recomputed at epoch boundaries.',
    howItWorks: {
      title: 'Epoch Structure',
      steps: [
        'Epoch = 432,000 slots',
        'Slot duration: ~400ms',
        'Epoch duration: ~2-3 days',
        'Leader schedule recomputed at epoch boundaries',
        'Stake distribution snapshots at epoch boundaries',
        '2 epochs ahead: schedule is known',
      ]
    },
    whyItMatters: 'Epoch boundaries are the coordination points for the entire cluster. All state transitions happen at epoch boundaries.',
    metrics: ['Epoch: 432,000 slots (~2-3 days)', 'Schedule known: 2 epochs ahead']
  },
  subComponents: []
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT ALL COMPONENTS
// ═══════════════════════════════════════════════════════════════════

export const ALL_COMPONENTS: ArchitectureComponent[] = [
  // Networking
  QUIC_STREAMER, GULF_STREAM, GOSSIP, REPAIR, TURBINE,
  // TPU Pipeline
  TPU_FETCH, SIG_VERIFY, BANKING_STAGE, POH_RECORDING, BROADCAST, FORWARDING,
  // TVU Pipeline
  SHRED_FETCH, SHRED_SIG_VERIFY, WINDOW_SERVICE, REPLAY_STAGE, RETRANSMIT,
  // Runtime
  SVM_PIPELINE, SBPF_VM, CPI, COMPUTE_BUDGET,
  // Consensus
  POH, TOWER_BFT, STATUS_CACHE, EPOCH_SCHEDULE,
  // Storage
  ACCOUNTS_DB, BLOCKSTORE, BANK, SNAPSHOT,
  // Programs
  NATIVE_PROGRAMS,
]

// Pipeline groupings for layout
export const TPU_PIPELINE = ALL_COMPONENTS.filter(c => c.pipeline === 'tpu')
export const TVU_PIPELINE = ALL_COMPONENTS.filter(c => c.pipeline === 'tvu')
export const SHARED_COMPONENTS = ALL_COMPONENTS.filter(c => c.pipeline === 'shared')

export const LAYERS = {
  networking: ALL_COMPONENTS.filter(c => c.layer === 'networking'),
  tpu: ALL_COMPONENTS.filter(c => c.layer === 'tpu'),
  tvu: ALL_COMPONENTS.filter(c => c.layer === 'tvu'),
  runtime: ALL_COMPONENTS.filter(c => c.layer === 'runtime'),
  consensus: ALL_COMPONENTS.filter(c => c.layer === 'consensus'),
  storage: ALL_COMPONENTS.filter(c => c.layer === 'storage'),
  programs: ALL_COMPONENTS.filter(c => c.layer === 'programs'),
}
