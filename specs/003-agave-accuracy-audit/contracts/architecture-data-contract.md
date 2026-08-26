# Contract: Architecture Data Deltas

**Scope**: Corrections this feature applies to the existing data definitions. Existing shapes are **not** restated here — see `src/types/index.ts` (`Component`, `Connection`, etc.) and current exports in `src/components/architecture/data/`. This document specifies only what changes and the new invariants that must hold afterward. Consumers: both diagram views, tour engine, `tests/data-consistency.test.ts`.

## C-1. Citation reference grammar (new requirement)

Every `refs[]` entry on components/sub-components added or touched by this audit must satisfy:

```
https://github.com/anza-xyz/agave/blob/v4.2.1/<repo-relative-path>(#L<line>|#L<start>-L<end>)?
```

- Host `github.com`, repo `anza-xyz/agave`, tag exactly `v4.2.1`
- Pre-existing refs not matching this grammar must be updated to it as their components are corrected
- Enforced by a new test invariant (C-5)

## C-2. Component deltas

| Component | Change |
|---|---|
| `rpc-api` | **NEW** node — client-facing submission entry point |
| `cluster-info-vote-listener` | **NEW** node — inbound gossip vote ingestion + confirmation thresholds |
| `voting-service` | **NEW** node — outbound vote publication |
| `sig-verify` | Remove GPU/CUDA claims; scope = signature verification + packet dedup + priority-floor coordination |
| `status-cache` | Re-scope: blockhash-freshness/dedup checks in banking context + RPC status reads |
| `poh-recording` | Replace "VDF" sub-item with hash-chain/tick description; recorder/service split |
| `broadcast` | Merkle-signed shreds, chained roots, 32:32 FEC specifics |
| `shred-sig-verify` | Merkle-root verification against slot's scheduled leader |
| `window-service` | Add erasure recovery + retransmit loop + duplicate-conflict detection |
| `replay-stage` | Add parallel replay pools, fork-choice gating before voting |
| `tower-bft` | Lockout math (initial 2, ×2 doubling, 31-deep stack), confirmed-vs-finalized levels |
| `epoch-schedule` | Schedule derivation independent of consensus voting |
| `gulf-stream` + `forwarding` | **MERGED** into single node id `forwarding`, display name "Forwarding (Gulf Stream)"; `gulf-stream` component retired; its leader-schedule sub-content moves under `epoch-schedule`; content corrected per spec FR-014 (no ahead-of-time execution, no forwarder-stake priority) |
| `quic-streamer` | Three distinct endpoints (TPU / TPU-forwards / TPU-vote) |

Layer assignments for new nodes: `rpc-api` → networking; `cluster-info-vote-listener`, `voting-service` → consensus.

## C-3. Connection deltas

**Removed edges:** (`sig-verify`,`status-cache`), (`tower-bft`,`epoch-schedule`), (`gulf-stream`,`quic-streamer`) — the last because the `gulf-stream` component is retired

**New group:** `VOTE_FLOW: Connection[]` exported alongside existing groups; included in `ALL_CONNECTIONS` union.

**Required new edges (minimum):** (`rpc-api`,`quic-streamer`), (`cluster-info-vote-listener`,`banking-stage`), (`replay-stage`,`voting-service`), (`voting-service`,`gossip`), (`gossip`,`cluster-info-vote-listener`), (`sig-verify`,`forwarding`), (`forwarding`,`quic-streamer`).

## C-4. TX_LIFECYCLE_PATH delta

Restructured to the corrected lifecycle (see [data-model.md](../data-model.md) transitions). Invariants:

1. All ids ∈ ALL_COMPONENTS
2. Consecutive pairs connected by an edge in `ALL_CONNECTIONS`, or listed in an explicit multi-hop allowlist with justification comment
3. First step of the tour path begins at `rpc-api`; final step covers root advancement/finalization

## C-5. Test invariants (added to tests/data-consistency.test.ts)

1. Every component has ≥1 ref matching grammar C-1
2. `VOTE_FLOW` non-empty; removed edges from C-3 absent; required edges present
3. Path invariants C-4
4. New component ids exist with declared layers
5. Existing invariants (ids referenced by steps/path exist; no duplicate edges) retained

Any structural change to these exports requires updating the suite **in the same commit** (spec FR-018).
