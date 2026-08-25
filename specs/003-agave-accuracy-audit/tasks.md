# Tasks: Agave Accuracy Audit

**Input**: Design documents from `/specs/003-agave-accuracy-audit/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks are included — spec FR-018/FR-022 explicitly mandate updating `tests/data-consistency.test.ts` in lockstep with structural changes and running the suite after every change.

**Organization**: Tasks grouped by user story; each implementation task = one conventional commit on branch `feature/8-agave-accuracy-audit` (FR-020/021); every commit passes `pnpm test` + `npx tsc --noEmit` before the commit is created (FR-022); every commit is fully complete and ≤500 changed lines before the next begins (FR-024); each story additionally ends with an explicit verification gate.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1…US5 from spec.md)

## Path Conventions

Single project at repository root: `src/components/architecture/data/`, `tests/`, `specs/003-agave-accuracy-audit/`.

---

## Phase 1: Setup

**Purpose**: Confirm clean starting point before any mutation.

- [x] T001 Verify Git Flow prerequisites: issue [#8](https://github.com/equivocum/solana-forge/issues/8) is open and branch `feature/8-agave-accuracy-audit` (renamed from `003-agave-accuracy-audit`) is checked out; then run baseline verification gates: `pnpm test` and `npx tsc --noEmit` must both pass with zero failures before any file is modified

**Checkpoint**: Baseline green — audit work may begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Evidence infrastructure required by every user story.

**⚠️ CRITICAL**: No correction task may start until citation anchors are pinned and the findings ledger exists.

- [x] T002 Pin exact line anchors against tag v4.2.1 for all core claims in specs/003-agave-accuracy-audit/research.md (D-2 through D-12): verify each permalink resolves and record final `#L<start>-L<end>` anchors into a working notes section of specs/003-agave-accuracy-audit/report.md
- [x] T003 Create findings ledger in specs/003-agave-accuracy-audit/report.md: methodology subsection + findings table with columns (component / prior claim / classification incorrect|misleading-simplification|missing / correction / before-evidence / after-evidence) seeded from research.md D-sections

**Checkpoint**: Every claim has a verified anchor; every planned correction has a ledger row awaiting its disposition.

---

## Phase 3: User Story 1 — Trustworthy Transaction Lifecycle (P1) 🎯 MVP

**Goal**: The main transaction path (submission → broadcast) matches real Agave behavior: checks in the right stages, execution as a library, immediate PoH recording, asynchronous state persistence.

**Independent Test**: Walk corrected tour steps covering this segment; each step's claims match its pinned citations; suite green throughout.

### Implementation for User Story 1

Each task below = one conventional commit (`fix:` or `docs:`+`fix:` pairing where a ledger row is updated alongside).

- [x] T004 [US1] Correct `sig-verify` component content in src/components/architecture/data/components.ts: remove GPU/CUDA offload claims entirely (removed upstream PR #3817), scope = CPU-parallel ed25519 verification (VERIFY_PACKET_CHUNK_SIZE=128 batches) + packet-level Bloom dedup filter + SchedulerPriorityFloor coordination with banking scheduler; add ≥1 pinned ref; append disposition to matching report.md row
- [ ] T005 [US1] Re-scope `status-cache` component in src/components/architecture/data/components.ts: blockhash-freshness and duplicate-signature checks occur inside banking-stage consumption context (check_fee_payer_unlocked / age checks) plus RPC getSignatureStatuses reads — not in signature verification; refs; report row
- [ ] T006 [US1] Correct `svm-pipeline` framing in src/components/architecture/data/components.ts: present runtime execution as a library invoked inside Banking Stage consume-workers (production) and ReplayStage/blockstore processing (verification), not a standalone pipeline stage between banking and accounts-db; refs; report row
- [ ] T007 [US1] Correct `poh-recording` and `poh` components in src/components/architecture/data/components.ts: sequential SHA-256 hash chain serving as verifiable clock (replace "VDF" sub-item), TransactionRecorder→record_channels→PohService tick producer split, immediate per-batch recording after execution, continuous independent ticks (64/slot default), working-bank flush on slot completion; refs; report rows
- [ ] T008 [US1] Enrich `banking-stage` sub-components in src/components/architecture/data/components.ts: manager thread, GreedyScheduler/SchedulerController thread, dedicated VoteWorker consuming TPU-vote + gossip-vote receivers, N ConsumeWorkers (default 4, max 64 via u64 thread bitmask), Committer/Consumer/QoS roles, fee/compute-unit-price ordering, Consume/Forward/Hold decisions, stake-weighted one-at-a-time vote drain; refs; report row
- [ ] T009 [US1] Rewrite TX_LIFECYCLE_PATH ordering in src/components/architecture/data/connections.ts to corrected lifecycle; remove edge (sig-verify,status-cache); update tests/data-consistency.test.ts invariants in the SAME commit (removed-edge assertion, path existence): fix(lifecycle)+test
- [ ] T010 [US1] Restructure tour steps covering submission→ingress→verification→banking→execution→PoH→broadcast region in src/components/architecture/data/simulation-steps.ts; every step carries STAGE + WHY + REF badges minimum; renumber coherently
- [ ] T011 [US1] Story gate: run `pnpm test` + `npx tsc --noEmit`; walk tour segment per specs/003-agave-accuracy-audit/quickstart.md §3 items 2–4; confirm zero GPU mentions repo-wide in app data (`rg -i "gpu|cuda" src/` returns nothing)

**Checkpoint**: MVP — the leader-path story is factually correct end-to-end and independently demonstrable.

---

## Phase 4: User Story 2 — Vote Return Path & Finalization (P1)

**Goal**: Complete loop: fork-choice-gated voting → publication → gossip/block ingestion → thresholds → root advancement → async consolidation.

**Independent Test**: Follow tour from replay through finalization without dead-ends; every hop cites real machinery.

- [ ] T012 [US2] Correct `tower-bft` content in src/components/architecture/data/components.ts: INITIAL_LOCKOUT=2 slots, ×2 doubling per consecutive confirmation, MAX_LOCKOUT_HISTORY=31 stack depth, root = oldest popped vote at full stack, confirmed (optimistic) vs finalized (rooted + ⅔ rooted) levels; refs; report row
- [ ] T013 [US2] Correct `replay-stage` content in src/components/architecture/data/components.ts: PoH/entry verification precedes execution, parallel rayon pools (replay_forks_threads, replay_transactions_threads), HeaviestSubtreeForkChoice stake-weighted fork choice gating every vote (lockout check, thresholds, propagation check, switch proof); refs; report row
- [ ] T014 [US2] Correct `epoch-schedule` in src/components/architecture/data/components.ts: leader schedule derived from epoch stakes via stake-weighted ChaCha RNG (NUM_CONSECUTIVE_LEADER_SLOTS=4, computed one epoch ahead, LeaderScheduleCache at root advancement), independent of consensus voting; absorb leader-schedule sub-content; remove edge (tower-bft,epoch-schedule) in src/components/architecture/data/connections.ts; tests same commit; report row
- [ ] T015 [US2] Add VOTE_FLOW connection group in src/components/architecture/data/connections.ts with required edges (replay-stage,voting-service),(voting-service,gossip),(gossip,cluster-info-vote-listener),(cluster-info-vote-listener,banking-stage); include in ALL_CONNECTIONS union; extend tests/data-consistency.test.ts (VOTE_FLOW non-empty, endpoints exist) same commit
- [ ] T016 [US2] Restructure tour steps for fork-choice decision → vote publication → inbound votes via gossip and blocks → optimistic/duplicate confirmation thresholds → root advancement → asynchronous state consolidation in src/components/architecture/data/simulation-steps.ts; DECISION badges on consensus moments; bubble may traverse VOTE_FLOW hops
- [ ] T017 [US2] Story gate: suite green; walkthrough proves complete vote loop ending in finalization step (not a synchronous storage write)

**Checkpoint**: Stories 1+2 both functional — full submission→finalization narrative exists.

---

## Phase 5: User Story 3 — Full Validator Coverage (P2)

**Goal**: Component inventory complete and de-duplicated; new independent services become nodes; merged forwarding node per Clarifications.

**Independent Test**: Locate rpc-api, cluster-info-vote-listener, voting-service, single Forwarding (Gulf Stream) node in both views; each opens an inspectable detail panel with citations.

- [ ] T018 [US3] Add `rpc-api` node to src/components/architecture/data/components.ts (networking layer; client-facing submission entry: sendTransaction → push toward upcoming leaders via QUIC; send-transaction-service behavior); edge (rpc-api,quic-streamer) in connections.ts; retarget tour step 1; tests same commit
- [ ] T019 [US3] Merge `gulf-stream` + `forwarding` into single node id `forwarding` named "Forwarding (Gulf Stream)" in src/components/architecture/data/components.ts per Clarifications: retire gulf-stream id + edge (gulf-stream,quic-streamer); move duplicated leader-schedule sub-content under epoch-schedule; enforce FR-014 bans (no ahead-of-time execution, no forwarder-stake priority; blockhash-expiry framing); edges (sig-verify,forwarding),(forwarding,quic-streamer); tests same commit
- [ ] T020 [US3] Add `cluster-info-vote-listener` node (consensus layer) to src/components/architecture/data/components.ts: polls cluster votes, CPU-verifies, tracks VoteTracker, fires optimistic/duplicate-confirmation thresholds, feeds verified gossip votes into banking when leader; refs
- [ ] T021 [US3] Add `voting-service` node (consensus layer) to src/components/architecture/data/components.ts: receives ReplayStage/Tower vote ops, persists tower storage, publishes own votes outward; refs
- [ ] T022 [US3] Correct propagation-side components in src/components/architecture/data/components.ts as six sequential one-component commits (FR-021, FR-024), each with refs + report row + suite/tsc gate before committing (FR-022):
  1. fix(broadcast): Merkle-signed shreds, chained_merkle_root, FEC 32:32, header anatomy
  2. fix(shred-sig-verify): Merkle-root verification vs slot's scheduled leader pubkey, LRU cache
  3. fix(window-service): Bloom dedup, erasure recovery + retransmit of recovered data shreds, duplicate-conflict detection
  4. fix(turbine): stake-weighted trees, data/coding interleave
  5. fix(quic-streamer): three endpoints solQuicTpu/solQuicTpuFwd/solQuicTVo, stake-weighted QoS
  6. fix(accounts-db,bank): execution writes deltas to bank state; durable persistence is asynchronous — stored at freeze, squashed/consolidated around root advancement by AccountsBackgroundService, hardened via snapshots
- [ ] T023 [US3] Integrate new/renamed nodes into PipelineFlowView + LayeredView layouts in src/components/architecture/ (positions, layer assignments rpc-api→networking, listener/service→consensus); extend tour steps referencing them; story gate: suite green, both views render all nodes

**Checkpoint**: Coverage complete — every major real service has a diagram presence.

---

## Phase 6: User Story 4 — Verifiable Citations (P2)

**Goal**: Every factual claim carries a resolvable pinned link; grammar enforced automatically.

**Independent Test**: Sample 10 links across categories; 10/10 open supporting lines at v4.2.1.

- [ ] T024 [US4] Sweep all components/sub-components in src/components/architecture/data/components.ts ensuring ≥1 compliant pinned ref each (grammar: github.com/anza-xyz/agave/blob/v4.2.1/<path>#L<line>[-L<end>]); add citation-grammar test invariant + ≥1-ref invariant to tests/data-consistency.test.ts (contract C-5)
- [ ] T024b [US4] FR-004 disposition sweep: scan every factual claim in src/components/architecture/data/components.ts, connection labels in connections.ts, and narration in simulation-steps.ts for claims lacking verifiable pinned-source support; remove each unverifiable claim or mark it with an explicit in-app "simplification" label; append disposition to matching report.md row; suite+tsc gate before commit
- [ ] T025 [US4] Manual citation spot-check per specs/003-agave-accuracy-audit/quickstart.md §4: sample ≥10 links across different components/tour steps; record results in report.md methodology appendix

**Checkpoint**: Trust layer complete — claims are independently checkable.

---

## Phase 7: User Story 5 — Documented Audit Trail (P3)

**Goal**: Cold-readable findings report enabling future re-audits.

**Independent Test**: Read report.md cold; answer what was wrong, what changed, where proven.

- [ ] T026 [US5] Finalize specs/003-agave-accuracy-audit/report.md: every row dispositioned (zero undispositioned — SC-003), classifications populated, before/after evidence columns complete, re-audit methodology section explains repeating process against a newer tag

**Checkpoint**: Institutional knowledge preserved.

---

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T027 Update README.md architecture summary bullets (TPU/TVU pipeline descriptions, component count, vote-loop mention) to match corrected model; run full specs/003-agave-accuracy-audit/quickstart.md validation end-to-end; open PR from feature/8-agave-accuracy-audit to main referencing constitution Git Flow, closing #8 (issue/self-review/squash-merge)

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001) → Foundational (T002–T003) → US1 → US2 → US3 → US4 → US5 → Polish
- US2 before US3 because both touch `epoch-schedule` (T014 absorbs leader-schedule content that T019 relocates)
- Within phases: content tasks T004–T008 edit distinct export blocks but share one file — execute sequentially to avoid conflicts; report-row updates ride along each commit

### Story-level notes

- US1 is self-sufficient MVP (correct main path)
- US4's sweep depends on all corrections landing (final refs stable)
- Verification gates (T011/T017/T023) block their phase exit — FR-022

### Parallel Opportunities

- Limited by shared files: components.ts tasks serialize within a story; cross-story parallelization unsafe except T024 sweep prep vs report drafting (different files)
- Report-ledger row writing (report.md) can proceed in parallel with next component research at implementer discretion

---

## Implementation Strategy

- **MVP First**: Phases 1–3 only → corrected leader path demoable; stop-and-validate at T011
- **Incremental**: Each story adds an independently verifiable slice; checkpoints gate progression
- **Commit discipline**: One logical correction per conventional commit (FR-021), gated by suite + type-check immediately prior to each commit (FR-022), each commit fully complete and ≤500 changed lines (FR-024); structural data changes always pair with test updates in the same commit (FR-018); merge to main solely via PR after all gates (FR-020/023)

---

## Notes

- All Agave citations pin tag v4.2.1 (grammar C-1); anchors verified during T002 and reused everywhere
- Success criteria mapping: SC-001→T010/T016/T023; SC-002→T024/T025; SC-003→T024b/T026; SC-004→T017; SC-005→gates T011/T017/T023/T027; SC-006→T026
- Requirement coverage additions: FR-004→T024b; FR-024→per-commit size/completeness rule (≤500 changed lines, fully complete, enforced on every implementation task)
- Verify baseline before first change (T001); never leave the suite red (FR-022)
