# Research: Agave v4.2.1 Validator Internals (Ground Truth for Audit)

**Date**: 2026-08-25 · **Pinned standard**: `anza-xyz/agave` tag **v4.2.1** (latest stable release, published 2026-08-13; "stable release suitable for Testnet, Devnet and Mainnet Beta")

All citations below use permanent permalinks of the form
`https://github.com/anza-xyz/agave/blob/v4.2.1/<path>` (+ `#L<line>` anchors to be finalized against the tag during implementation — line numbers gathered from live sources at commit/tag level; every anchor gets re-verified item-by-item before entering the app per FR-002).

---

## D-1. Release pinning & evidence format

- **Decision**: Pin all claims and citations to tag `v4.2.1`.
- **Rationale**: Latest stable mainnet-adoption release (Solana Foundation: "recommended for mainnet adoption in August 2026"); tags are immutable → citations never rot; matches existing in-app `REF:` link style.
- **Alternatives**: master HEAD (line drift breaks links); docs-only basis (imprecise on internals). Rejected.
- Citations: <https://github.com/anza-xyz/agave/releases/tag/v4.2.1> · <https://solana.com/upgrades/agave-4-2-release-overview>

## D-2. Validator service topology

- **Decision**: Model the validator as a tree of long-running services spawned by `Validator::new` (in `core/src/validator.rs`): GossipService, PohService (+PohRecorder/PohController/TransactionRecorder), Tpu, Tvu, JsonRpcService, SnapshotPackagerService, AccountsBackgroundService, ServeRepairService, CompletedDataSetsService, ClusterInfoVoteListener (inside TPU), VotingService (inside TVU), StakedNodesUpdaterService, plus startup phases (snapshot download → BankForks restore).
- **Rationale**: This is the actual concurrency structure; components in-app should map 1:1 to real services where independent.
- **Alternatives**: crate-level mapping (too coarse); thread-level mapping (hairball). Hybrid rule chosen instead (spec FR-011/012).
- Citations: `core/src/validator.rs` (imports & spawn sequence) · DeepWiki cross-checks of validator lifecycle.

## D-3. TPU pipeline structure (ingress)

- **Decision**: Ingress = three distinct QUIC streamers → FetchStage → SigVerifyStage → BankingStage, with a separate ForwardingStage and BroadcastStage:
  - `solQuicTpu` — stake-weighted QoS streamer (`spawn_stake_weighted_qos_server`)
  - `solQuicTpuFwd` — forwarded-tx streamer (unstaked nodes blocked from forwarding)
  - `solQuicTVo` — vote streamer (`spawn_simple_qos_server`)
  - SigVerifyStage now handles both non-vote and vote packets in one stage, coordinating with the banking scheduler via a shared `SchedulerPriorityFloor`
  - ForwardingStage is a standalone stage (`spawn_forwarding_stage`) that forwards packets to upcoming leaders
- **Rationale**: Verified from current `Tpu` struct wiring.
- **Alternatives**: repo's single generic "quic-streamer" node + separate vote path (outdated shape). Rejected — corrected model splits endpoints.
- Citations: <https://github.com/anza-xyz/agave/blob/v4.2.1/core/src/tpu.rs>

## D-4. Banking Stage internals

- **Decision**: Detail panel shows: manager thread ("BankingMgr", tokio current-thread) → SchedulerController thread ("solBnkTxSched") running GreedyScheduler over a priority container → N ConsumeWorkers ("solCoWorker{id}") → dedicated VoteWorker ("solBanknStgVote") consuming both TPU-vote and gossip-vote receivers; Committer/Consumer/QoS roles; decisions Consume/Forward/ForwardAndHold/Hold; votes drained stake-weighted and processed one-at-a-time (favors entry/FEC-set packing); DEFAULT_NUM_WORKERS=4, MAX_NUM_WORKERS=64 (`ThreadAwareAccountLocks` uses a u64 bitmask); blockhash-age + StatusCache checks happen here (`check_fee_payer_unlocked`, age checks), not in sigverify.
- **Alternatives**: keep old 6-thread/multi-iterator description (pre-1.18 era). Rejected.
- Citations: <https://github.com/anza-xyz/agave/blob/v4.2.1/core/src/banking_stage.rs> · `core/src/banking_stage/consume_worker.rs` · `vote_worker.rs` · `transaction_scheduler/greedy_scheduler.rs`

## D-5. Proof-of-History mechanics

- **Decision**: PoH = continuous sequential SHA-256 hash chain; PohService tick producer thread ("solPohTickProd") hashes toward per-tick targets and generates ticks (64/slot default); executed batches reach it via TransactionRecorder → bounded `record_channels`; PohRecorder mixes records into entries, flushes ticks/entries to the WorkingBank channel consumed by BroadcastStage; `would_be_leader`/leader windows come from LeaderScheduleCache; slot end clears working bank at max_tick_height.
- **Corrections vs repo**: (a) sub-item "VDF" label wrong — PoH is a hash chain serving as a verifiable clock, not presented as a VDF construction; (b) recording happens immediately after execution per batch — not after an accounts-db commit step; (c) PoH ticks run independently of transaction flow.
- Citations: <https://github.com/anza-xyz/agave/blob/v4.2.1/poh/src/poh_service.rs> · `poh/src/poh_recorder.rs` · `poh/src/record_channels.rs` · `poh/src/transaction_recorder.rs`

## D-6. Broadcast & shreds

- **Decision**: BroadcastStage receives completed entries from PohRecorder's entry channel; Shredder serializes entries → data shreds (payload sized so coding shreds fit MTU) → Reed-Solomon erasure coding **32 data : 32 coding** per FEC set (`DATA_SHREDS_PER_FEC_BLOCK=32`, `CODING_SHREDS_PER_FEC_BLOCK=32`) → Merkle shreds: leader signs the FEC-set **Merkle root**; each shred carries merkle proof + signature; `chained_merkle_root` links consecutive FEC sets; optional retransmitter signature for resigned shreds. Common header is 83 bytes {signature, shred_variant, slot, index, version, fec_set_index}; MAX_DATA_SHREDS_PER_SLOT=32768.
- Citations: <https://github.com/anza-xyz/agave/blob/v4.2.1/ledger/src/shred.rs> · `ledger/src/shred/merkle.rs` · Helius shred overview (secondary corroboration)

## D-7. Turbine / TVU receive path

- **Decision**: TVU = ShredFetchStage (turbine+repair sockets, QUIC turbine endpoint) → `spawn_shred_sigverify` (verifies leader's signature over the shred **Merkle root**, pubkey resolved via LeaderScheduleCache for the slot, LRU-cached) → RetransmitStage (forwards verified shreds down the stake-weighted turbine trees) ∥ WindowService (dedup filter, erasure recovery — recovered data shreds retransmitted, coding shreds not stored — insertion into Blockstore, duplicate-conflict detection incl. MerkleRootConflict/ChainedMerkleRootConflict) → ClusterSlotsService → ReplayStage; RepairService requests missing shreds (window repair, ancestor hashes, orphan repair); validators accept only shreds within the current verifiable epoch.
- **Correction vs repo**: repo's linear order fetch→sigverify→window→blockstore→replay is right in spirit but omits retransmit fan-out position (post-sigverify) and recovery/retransmission loop.
- Citations: <https://github.com/anza-xyz/agave/blob/v4.2.1/core/src/tvu.rs> · `turbine/src/broadcast_stage.rs` (broadcast side) · `docs.anza.xyz/validator/tvu` · implemented-proposals/repair-service

## D-8. Replay Stage & fork choice

- **Decision**: ReplayStage consumes blockstore-completed slots; verifies PoH chain and entries (blockstore_processor), executes transactions through the runtime using rayon pools (`replay_forks_threads` "solReplayForkNN" for parallel fork replay, `replay_transactions_threads` for intra-block parallelism), freezes banks; fork choice = `HeaviestSubtreeForkChoice` (stake-weighted subtree weights); voting gated by `select_vote_and_reset_forks`: lockout check, vote thresholds, leader-propagation check, switch-proof (`SWITCH_FORK_THRESHOLD`) when switching forks; own votes go to VotingService; handles duplicate-slot tracking, duplicate confirmation, unfrozen gossip vote hashes; roots set via handle_votable_bank → notifies ABS/root pipeline.
- Citations: <https://github.com/anza-xyz/agave/blob/v4.2.1/core/src/replay_stage.rs> · `core/src/consensus/fork_choice.rs` · `core/src/consensus/heaviest_subtree_fork_choice.rs`

## D-9. Tower BFT constants & confirmation levels

- **Decision**: Vote lockouts start at **INITIAL_LOCKOUT = 2** slots and **double** per additional consecutive confirmation; stack bounded by **MAX_LOCKOUT_HISTORY = 31**; when full, oldest popped vote becomes the validator's root; cluster-wide: **confirmed** = supermajority (≥⅔ stake, VOTE_THRESHOLD_SIZE) voted → optimistic confirmation; **finalized** = rooted + ≥⅔ stake rooted; duplicate confirmation threshold tracked separately by ClusterInfoVoteListener.
- Citations: vote state (`sdk/program/src/vote/state/mod.rs`: constants, `process_next_vote_slot`, `double_lockouts`, `pop_expired_votes`) · `runtime/src/commitment.rs` (thresholds)

## D-10. Leader schedule

- **Decision**: Schedule per epoch derived deterministically from epoch stakes: sort stakes, ChaCha RNG seeded from epoch, stake-weighted sampling, **NUM_CONSECUTIVE_LEADER_SLOTS = 4** consecutive slots per draw; computed one epoch ahead (leader-schedule epoch offset); cached in LeaderScheduleCache at root advancement; consumers: PohRecorder (would_be_leader), DecisionMaker, Turbine trees, shred sigverify, repair.
- **Correction vs repo**: edge `tower-bft → epoch-schedule ("Leader rotation")` removed — schedule derivation is independent of consensus voting.
- Citations: <https://github.com/anza-xyz/agave/blob/v4.2.1/ledger/src/leader_schedule_cache.rs> · `leader_schedule/src/lib.rs` (stake_weighted_slot_leaders, NUM_CONSECUTIVE_LEADER_SLOTS) · docs.anza.xyz/consensus/leader-rotation

## D-11. Vote ingestion & propagation paths

- **Decision**: Three inbound routes for votes: (a) gossip → ClusterInfoVoteListener.recv_loop polls `cluster_info.get_votes()`, CPU-verifies (`ed25519_verify_cpu`), tracks VoteTracker, fires optimistic/duplicate-confirmation thresholds, feeds `gossip_verified_vote_hash_sender` toward replay/tower, and bank_send_loop injects verified gossip votes into BankingStage when we're/will-be leader; (b) inside received blocks (replayed votes → replay_vote path); (c) direct TPU-vote QUIC ingress. Outbound: ReplayStage/Tower generate vote tx → VotingService publishes (gossip push + submission toward leaders).
- Citations: <https://github.com/anza-xyz/agave/blob/v4.2.1/core/src/cluster_info_vote_listener.rs> · tvu.rs (VotingService wiring)

## D-12. Removed capabilities (must not appear as current)

- **Decision**: Remove GPU/CUDA sigverify content entirely (code deleted PR #3817; `--cuda` deprecated v3.1, removed args in v4); remove UDP TPU ingress framing (`--tpu-enable-udp` removed; QUIC-only TPU); note `--block-verification-method blockstore-processor` removed (unified scheduler only).
- Citations: <https://github.com/anza-xyz/agave/pull/3817> · commit f664622 (deprecate --cuda) · CHANGELOG v4.x removed arguments

## D-13. Docs-vs-source conflicts observed

- Anza TPU doc page still describes older sigverify/dedup ordering generically; source governs (FR-003): dedup filter = packet Bloom filter in perf (`deduper`), StatusCache/blockhash checks = banking stage.
- Solana.com transaction-pipeline page (8 stages, refs @v3.1.8) broadly consistent; used as secondary corroboration only.

## D-15. Third-party source vetting: "Engineering Solana" Gulf Stream excerpt

Fact-checked claim-by-claim against pinned sources (feeds FR-003/FR-004 disposition):

| Excerpt claim | Verdict | Reality |
|---|---|---|
| No global mempool; deterministic leader schedule lets txs be distributed to upcoming leaders ahead of their slots | ✅ Accurate in spirit | Client/RPC pushes toward current+upcoming leaders (QUIC); validators run one-hop ForwardingStage; no persistent mempool — blockhash validity window bounds lifetime |
| "Ensuring upcoming leaders already have transactions" | ⚠️ Overstated | Best-effort push, no delivery guarantee; Banking Stage buffers near leadership and drops on slot boundaries |
| "Validators can execute transactions ahead of time" | ❌ Inaccurate | Buffering ≠ execution; execution happens only against a working bank while the node is leader (`would_be_leader` gating, `DecisionMaker`) |
| Processing priority follows stake weight of forwarding validator | ⚠️ Conflated | Stake governs ingress QoS (connection/stream limits), sigverify batch ordering, vote drain order — but block-inclusion/execution ordering is fee/compute-unit-price based (GreedyScheduler/prio-graph) |
| No fee competition for block space ("no gas auctions") | ❌ Inaccurate | Priority fees (compute unit price) are exactly the congestion-competition mechanism for inclusion/ordering; different from Ethereum's base-fee auction but competition exists |
| Comparative Bitcoin/Ethereum mempool characterization (~20k–100k pending; gossip filter overhead; ≥2× propagation) | ➖ Out of audit scope | Plausible qualitative framing; not verifiable against Agave sources |

**Disposition**: excerpt usable only as conceptual framing for the merged Forwarding (Gulf Stream) node's prose; the three ❌ claims must not appear in app content.

## D-14. Constitution re-check post-design

- All six principles remain satisfied; RPC/Validator separation strengthened by new remote-interface node; no violations introduced by design artifacts (contracts keep existing data shapes; UI contract preserves tour interaction semantics).

## Open items carried to implementation (not NEEDS CLARIFICATION — verification work)

1. Finalize exact `#L<line>` anchors for every citation against tag v4.2.1 during implementation (item-by-item, per FR-022 gate).
2. Extract exact values for switch-fork threshold constant and MAX_PROCESSING_AGE from pinned files before writing them into panels.
