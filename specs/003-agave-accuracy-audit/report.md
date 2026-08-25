# Findings Report: Agave Accuracy Audit

**Feature**: [spec.md](./spec.md) · **Pinned standard**: `anza-xyz/agave` tag `v4.2.1` · **Status**: IN PROGRESS (ledger seeded; dispositions land alongside their correcting commits)

## Methodology (draft — finalized in T026)

### Evidence standard
- Every retained factual claim must resolve to a permalink of the form `https://github.com/anza-xyz/agave/blob/v4.2.1/<repo-relative-path>#L<line>` (range `#L<a>-L<b>` where appropriate) — data contract C-1.
- Where the pinned source and secondary material (docs, blogs, talks) conflict, the pinned source governs (FR-003); the divergence is recorded as a finding row.
- Claims without verifiable pinned-source support are removed or explicitly labeled `(simplification)` in-app per FR-004 / ui-tour-contract T-6, each with a ledger row classified `misleading-simplification`.
- Constants whose *definitions* live in published Solana crates external to the agave repo (e.g., `solana-clock`, `solana-vote-program`) cannot receive an in-repo definitional permalink; they are anchored to authoritative in-repo usage/test sites instead, and noted here (see W-39/W-40).

### Procedure (how every anchor below was derived)
1. Check out tag `v4.2.1` content (`git grep <pattern> v4.2.1 -- <path>` against a local clone of `anza-xyz/agave`) — raw↔blob line parity makes these numbers directly usable in GitHub permalinks.
2. Locate the governing symbol/constant for each research.md (D-2…D-12) claim; record `file#L<n>` or `#L<a>-L<b>`.
3. During implementation, each corrected component's `refs[]` reuses these anchors; spot-check ≥10 permalinks in-browser (SC-002, quickstart §4).

### Re-audit against a newer tag (draft — expanded in T026)
Pin the new tag → repeat steps 1–2 for every claim in the ledger's after-evidence column → diff old vs new anchors → any drift opens a new finding row instead of silently editing claims.

## Working Notes — verified v4.2.1 line anchors (T002)

Legend: ✅ anchor verified against tag content. ⏳ = finalize during the owning component task (symbol not resolvable by simple grep).

| ID | Claim (research ref) | File | Anchor |
|----|----------------------|------|--------|
| W-01 | Validator service tree spawned by `Validator::new` (D-2) | core/src/validator.rs | #L688, spawns #L1027–L1589 |
| W-02 | RPC entry: `JsonRpcService::new_with_config` (D-2/D-11) | core/src/validator.rs | #L1303 |
| W-03 | Gossip / Poh / ServeRepair services spawned (D-2) | core/src/validator.rs | #L1478, #L1525, #L1589 |
| W-04 | Three QUIC endpoints `solQuicTVo`, `solQuicTpu`, `solQuicTpuFwd` (D-3) | core/src/tpu.rs | #L220–L265 |
| W-05 | Stake-weighted vs simple-QoS server spawning (D-3) | core/src/tpu.rs | #L56, #L244–L265 |
| W-06 | `SigVerifyStage` inside TPU handles non-vote + vote packets (D-3) | core/src/tpu.rs | #L284 |
| W-07 | Standalone Forwarding Stage: `spawn_forwarding_stage` (D-3) | core/src/tpu.rs | #L338–L341 |
| W-08 | Manager thread "BankingMgr" on tokio current-thread runtime (D-4) | core/src/banking_stage.rs | #L390–L392 |
| W-09 | Scheduler thread "solBnkTxSched" (D-4) | core/src/banking_stage.rs | #L570 |
| W-10 | N ConsumeWorkers "solCoWorker{id}" (D-4) | core/src/banking_stage.rs | #L549 |
| W-11 | Dedicated VoteWorker "solBanknStgVote" consuming TPU-vote receiver (D-4) | core/src/banking_stage.rs | #L609–L623 |
| W-12 | GreedyScheduler over priority container (D-4) | core/src/banking_stage/transaction_scheduler/greedy_scheduler.rs | #L32–L81 |
| W-13 | Buffered-packet decisions incl. `ForwardAndHold` (D-4) | core/src/banking_stage/decision_maker.rs | #L15, #L60 |
| W-14 | Blockhash/fee-payer checks: `check_fee_payer_unlocked` in consumer (D-4/D-13) | core/src/banking_stage/consumer.rs | #L474 |
| W-15 | Worker count default 4 (`const NUM_WORKERS`) (D-4) | core/src/banking_stage/transaction_scheduler/scheduler_common.rs | #L326 |
| W-16 | Tick producer thread "solPohTickProd" (D-5) | poh/src/poh_service.rs | #L120 |
| W-17 | WorkingBank tick-range flush contract (D-5) | poh/src/poh_recorder.rs | #L4–L11, #L127–L131 |
| W-18 | Bounded `record_channels` fed by TransactionRecorder (D-5) | poh/src/record_channels.rs | #L31 |
| W-19 | Leadership gating `would_be_leader` (D-5/D-15) | poh/src/poh_recorder.rs | #L729 |
| W-20 | FEC set 32 data : 32 coding (D-6) | ledger/src/shred.rs | #L121–L122 |
| W-21 | `MAX_DATA_SHREDS_PER_SLOT` (D-6) | ledger/src/shred.rs | #L128 |
| W-22 | Merkle-root signing / chained roots (D-6) | ledger/src/shred/src/merkle.rs | ⏳ finalize in T022 (broadcast) |
| W-23 | TVU assembly: ShredFetch → shred-sigverify → Retransmit → WindowService (D-7) | core/src/tvu.rs | fields #L113–L116, wiring #L359–L454 |
| W-24 | Shred sigverify resolves scheduled leader via LeaderScheduleCache (D-7) | turbine/src/sigverify_shreds.rs | #L82, #L147 |
| W-25 | Duplicate detection: MerkleRootConflict / ChainedMerkleRootConflict (D-7) | core/src/window_service.rs | #L148–L162 |
| W-26 | Parallel replay pools config (D-8) | core/src/replay_stage.rs | #L415–L416, #L736–L737, #L878–L882 |
| W-27 | Fork-choice gating before voting: `select_vote_and_reset_forks` (D-8) | core/src/replay_stage.rs | #L13–L15 |
| W-28 | Switch/duplicate thresholds (D-8/D-9) | core/src/replay_stage.rs | #L13, #L130 |
| W-29 | Tower stack full → pop oldest (=root); `double_lockouts`; lockout = `INITIAL_LOCKOUT.pow(n)` (D-9) | core/src/consensus/tower_vote_state.rs | #L48, #L70, #L161 |
| W-30 | Optimistic-confirmation threshold `VOTE_THRESHOLD_SIZE = 2/3` (D-9) | runtime/src/commitment.rs | #L9, #L141 |
| W-31 | `NUM_CONSECUTIVE_LEADER_SLOTS = 4` (D-10) | leader-schedule/src/lib.rs | #L20 |
| W-32 | Stake-weighted ChaCha-seeded schedule draw (D-10) | leader-schedule/src/lib.rs | #L8, #L44, #L60 |
| W-33 | Schedule cache computed one epoch ahead at root (D-10) | ledger/src/leader_schedule_cache.rs | #L44–L62, #L71–L80 |
| W-34 | Vote listener `recv_loop` polls `cluster_info.get_votes` (D-11) | core/src/cluster_info_vote_listener.rs | #L510, #L529 |
| W-35 | `VoteTracker` / per-slot trackers (D-11) | core/src/cluster_info_vote_listener.rs | #L128–L142 |
| W-36 | Verified gossip vote hashes forwarded toward replay/tower (D-11) | core/src/cluster_info_vote_listener.rs | #L73, #L482 |
| W-37 | CPU-parallel verification batch size `VERIFY_PACKET_CHUNK_SIZE = 128` (D-12/D-13) | perf/src/sigverify.rs | #L15 |
| W-38 | GPU/CUDA code removed upstream — evidence type PR (not source line) (D-12) | github.com/anza-xyz/agave/pull/3817 | PR link |
| W-39 | `INITIAL_LOCKOUT`, `MAX_LOCKOUT_HISTORY` definitions live in published `solana-vote-program` crate — no in-repo definitional permalink; anchored via W-29 usage/tests | — | note |
| W-40 | `DEFAULT_TICKS_PER_SLOT` (64), `MAX_PROCESSING_AGE` defined in published `solana-clock` crate — same treatment as W-39 | core/src/replay_stage/tests.rs | #L90 (usage assertion) |

## Findings Ledger (seeded from research D-sections; dispositions added per FR-021 pairing)

| ID | Component(s) | Prior claim | Classification | Correction | Before-evidence | After-evidence | Disposition |
|----|--------------|-------------|----------------|------------|-----------------|----------------|-------------|
| F-01 | sig-verify | GPU/CUDA signature offload accelerates verification | incorrect | Removed upstream; CPU-parallel ed25519 in 128-packet chunks | W-38 (PR #3817), W-37 | W-37, W-06, W-04 | corrected-in-app (T004) |
| F-02 | sig-verify | Duplicate suppression happens here | incorrect | Only packet-level Bloom dedup at ingress; semantic checks live in banking context | D-13 (Anza doc drift) | W-14, W-25 | corrected-in-app (T004; banking-side half lands T005) |
| F-03 | status-cache | Duplicate-signature & blockhash-freshness checked during signature verification | misleading-simplification | Checks occur inside banking consumption (`check_fee_payer_unlocked`, age checks) + RPC status reads | D-13 | W-14, W-30 | corrected-in-app (T005) |
| F-04 | svm-pipeline | Standalone pipeline stage between banking and storage | incorrect | Runtime is a library invoked by consume-workers (production) and replay (verification) | D-8 wiring | W-26, W-12 | pending |
| F-05 | poh-recording | PoH labeled "VDF" | incorrect | Sequential SHA-256 hash chain serving as verifiable clock | D-5 correction note | W-16, W-17 | pending |
| F-06 | poh-recording | Entries recorded after accounts-db commit | incorrect | Executed batches recorded immediately per batch via TransactionRecorder → record_channels | D-5 correction note | W-18, W-17 | pending |
| F-07 | poh | Ticks coupled to transaction flow | misleading-simplification | Ticks run continuously/independently (tick producer thread; 64/slot default) | D-5 correction note | W-16, W-40 | pending |
| F-08 | banking-stage | Old 6-thread/multi-iterator internals | misleading-simplification | Manager + GreedyScheduler thread + N ConsumeWorkers + dedicated VoteWorker; Consume/Forward/Hold decisions | D-4 alternatives | W-08–W-15 | pending |
| F-09 | broadcast | Generic "send shreds" framing | missing | Merkle-signed shreds, chained roots, FEC 32:32, header anatomy | — | W-20–W-22 | pending |
| F-10 | shred-sig-verify | Verifies individual shred signatures only | missing | Verifies leader's signature over the FEC-set Merkle root, pubkey from LeaderScheduleCache for slot | — | W-24, W-23 | pending |
| F-11 | window-service | Linear fetch→store only | missing | Dedup filter, erasure recovery + retransmit of recovered shreds, duplicate-conflict detection | D-7 correction note | W-25, W-23 | pending |
| F-12 | quic-streamer | Single generic QUIC endpoint | misleading-simplification | Three endpoints (TPU / TPU-forwards / TPU-vote) with stake-weighted vs simple QoS | D-3 alternatives | W-04, W-05 | pending |
| F-13 | tower-bft | No lockout math; confirmation levels conflated | missing | INITIAL_LOCKOUT=2 ×2 doubling to 31-deep stack → root pop; confirmed(optimistic) vs finalized(rooted+⅔) | — | W-29, W-30, W-39 | pending |
| F-14 | replay-stage | Linear execute framing | misleading-simplification | Parallel fork/tx rayon pools; fork-choice gating (lockouts, thresholds, propagation check, switch proof) before every vote | — | W-26–W-28 | pending |
| F-15 | epoch-schedule | Edge `tower-bft→epoch-schedule` ("leader rotation" driven by voting) | incorrect | Schedule derived from epoch stakes (stake-weighted ChaCha, 4 consecutive slots, one epoch ahead); independent of consensus voting | removed edge C-3 | W-31–W-33 | pending |
| F-16 | gulf-stream + forwarding | Two overlapping nodes; "validators execute ahead of their slot"; priority follows forwarder stake | misleading-simplification | Merged node `forwarding` "Forwarding (Gulf Stream)": push toward upcoming leaders + one-hop Forwarding Stage; blockhash-expiry bounds lifetime; banned claims per FR-014 | D-15 verdicts ❌ | W-07, W-19, W-32 | pending |
| F-17 | rpc-api | (no client-facing submission node) | missing | NEW networking-layer node: sendTransaction → push toward upcoming leaders via QUIC | — | W-02, W-04 | pending |
| F-18 | cluster-info-vote-listener | (absent) | missing | NEW consensus node: polls gossip votes, verifies, tracks thresholds, feeds verified votes toward tower/banking | — | W-34–W-36 | pending |
| F-19 | voting-service | (absent) | missing | NEW consensus node: persists tower, publishes own votes outward | — | W-03, W-23(voting) | pending |
| F-20 | accounts-db, bank | Execution writes durable state synchronously | misleading-simplification | Execution writes deltas to bank state; persistence asynchronous — freeze/root consolidation via background service | FR-008 rationale | W-01 (ABS spawn), ⏳ ABS internals anchor in T022 | pending |
| F-21 | TX_LIFECYCLE_PATH | Ordering: dedup/blockhash in sig-verify; execution commits before ledger clock | incorrect | Corrected data-flow order per data-model transitions; tests updated same commit | FR-005..FR-007 | W-04–W-19 sequence | pending |

*(Rows F-01…F-21 seeded by T003; dispositions land with their correcting commits.)*

## Disposition Rules
- Each row reaches exactly one terminal state: `corrected-in-app` | `labeled-simplification` | `deferred:<rationale>` (SC-003).
- Rows ride along the commit that implements their correction (FR-021); suite+tsc green required (FR-022).
