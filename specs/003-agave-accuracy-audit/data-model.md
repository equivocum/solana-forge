# Data Model: Agave Accuracy Audit

**Feature**: [spec.md](./spec.md) · **Research basis**: [research.md](./research.md)

Entities below map to existing application data structures (`src/types/index.ts`, `src/components/architecture/data/*`). This feature corrects content/topology; it introduces no new storage.

## Entities

### Component
A validator building block displayed as a diagram node.

| Field | Rules |
|---|---|
| id | unique kebab-case; stable across refactor (tests reference ids) |
| name | display name; matches real Agave terminology where one exists (e.g., "Banking Stage", "Forwarding Stage") |
| layer | one of: networking / tpu / tvu / runtime / consensus / storage — must match LayeredView assignment |
| purpose / role / howItWorks / whyItMatters | prose; every factual assertion must be supportable by a Citation (FR-002) or labeled simplification (FR-004) |
| subComponents[] | thread/service-level internals (hybrid rule); each with own citations |
| refs[] | ≥1 Citation per component (FR-002) |

**New components**: `rpc-api` (layer: networking), `cluster-info-vote-listener` (layer: consensus), `voting-service` (layer: consensus).

**Corrected components** (non-exhaustive, see report.md when written): `sig-verify` (drop GPU; add packet dedup + priority floor), `status-cache` (re-scope to banking-context checks + RPC reads), `poh-recording` (hash chain, recorder/service split; drop "VDF"), `broadcast` (Merkle shreds, 32:32 FEC), `shred-sig-verify` (Merkle-root verification vs scheduled leader), `window-service` (recovery + retransmit loop), `replay-stage` (parallel pools, fork choice), `tower-bft` (lockout math, confirmation levels), `gulf-stream` → reframed around real Forwarding Stage, `epoch-schedule` (schedule derivation independent of voting), `banking-stage`, `poh`, `quic-streamer` (3 endpoints), `svm-pipeline` (library consumed by production & verification paths).

### Connection
Directed edge `{from, to, label, type: data|control|shared}`.

Rules:
- Every `from`/`to` must reference an existing component id (existing invariant, retained).
- New groups: `VOTE_FLOW` added beside TPU_FLOW/TVU_FLOW/CROSS_PIPELINE/NETWORKING_CONNECTIONS/CONSENSUS_CONNECTIONS.
- Removed edges: `sig-verify→status-cache`; `tower-bft→epoch-schedule`.
- Added edges (minimum set): `rpc-api→quic-streamer` (submission path), `cluster-info-vote-listener→banking-stage` (verified gossip votes when leader), `replay-stage→voting-service`, `voting-service→gossip` + `voting-service→quic-streamer` (vote publication), `gossip→cluster-info-vote-listener`.

### TX_LIFECYCLE_PATH
Ordered component-id list driving the animated bubble. Corrected order (leader path then validation loop):

```
rpc-api → quic-streamer → tpu-fetch → sig-verify → banking-stage → svm-pipeline
→ poh-recording → accounts-db(read) … wait — final order fixed during implementation:
```
Canonical corrected sequence (authoritative version lives in connections.ts after verification):
1. rpc-api (submit)
2. quic-streamer → tpu-fetch → sig-verify (ingress+verification)
3. banking-stage (schedule/locks/checks incl. status-cache context)
4. svm-pipeline (execution via runtime library)
5. poh-recording (immediate record of executed batch; continuous ticks)
6. broadcast (entries → Merkle/FEC shreds)
7. turbine → shred-fetch → shred-sig-verify → window-service → blockstore (receiver side)
8. replay-stage (PoH verify → execute → freeze)
9. cluster-info-vote-listener / tower-bft (thresholds, fork choice)
10. voting-service (own vote out) → back through gossip/banking of others
11. tower-bft root advancement → accounts-db asynchronous consolidation

Rule: consecutive pairs must exist as Connections OR be justified in report (multi-hop compression allowed only for the bubble's readability, never for first-class flow arrays).

### SimulationStep
Guided-tour stop `{componentId, title, annotations[], duration}`.

Rules: ~20 steps (FR-015); strict data-flow ordering; each step's narration carries STAGE + WHY + REF badges minimum; step count/order changes must update consistency tests in same commit (FR-018).

### AuditFinding
Report row in `report.md`: {affected components, prior claim quote, classification ∈ incorrect|misleading-simplification|missing, correction, before-evidence Citation?, after-evidence Citation}. One row per discrepancy; SC-003 requires zero undispositioned rows.

### Citation
`{url: github.com/anza-xyz/agave/blob/v4.2.1/<path>#L<n>(-L<m>)?, note?}`. Validation: URL host/repo/tag exact; line anchors verified during implementation (FR-022 gate).

## Lifecycle state transitions (transaction)

```
SUBMITTED ──rpc──▶ INGRESS ──stream──▶ VERIFIED ──sched──▶ EXECUTING
   ▶ RECORDED (PoH) ──slot end──▶ BROADCAST_SHREDDED ──turbine──▶ RECEIVED
   ▶ ASSEMBLED (blockstore) ──▶ REPLAYED_FROZEN ──fork choice──▶ VOTED
   ▶ OPTIMISTICALLY_CONFIRMED (≥⅔ voted) ──lockouts──▶ ROOTED/FINALIZED
   (async) STATE_CONSOLIDATED
```

Every tour step must map onto exactly one transition above; every transition must be covered by ≥1 step (consistency-test candidates).
