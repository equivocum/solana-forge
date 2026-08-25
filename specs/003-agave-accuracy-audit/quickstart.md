# Quickstart: Validating the Agave Accuracy Audit

End-to-end validation that the corrected visualization matches Agave v4.2.1 and all gates pass.

## Prerequisites

- Node.js 18+, pnpm 9+
- Working directory: repository root, branch `feature/8-agave-accuracy-audit` (issue #8)

## 1. Build & run

```bash
pnpm install
pnpm dev            # app at http://localhost:3000
```

## 2. Automated gates (run after EVERY applied change)

```bash
pnpm test              # data-consistency + component tests must be fully green
npx tsc --noEmit       # type check must be clean
```

Expected: zero failures. A red suite blocks further work (spec FR-022).

## 3. Guided-tour walk (manual acceptance)

1. Open the app → start the guided tour.
2. Verify **Step 1** is the client submission step (`rpc-api`), not raw QUIC arrival.
3. Step through to verification: confirm duplicate/blockhash checks are shown inside banking-stage context; sig-verify panel shows CPU-parallel ed25519 and packet-level dedup only — no GPU claims anywhere.
4. Execution/ledger steps: executed batch recorded into PoH immediately; state persistence depicted as asynchronous consolidation.
5. Propagation: broadcast panel mentions Merkle-signed shreds with 32:32 FEC; shred-sig-verify explains Merkle-root verification against scheduled leader.
6. Vote loop: after replay/fork-choice steps, observe vote publication (voting-service) and inbound gossip votes (cluster-info-vote-listener) before finalization/root step ends the tour.
7. Final step covers root advancement — not "state persisted" as a synchronous write.

## 4. Citation spot-check (SC-002)

Sample ≥10 `REF:` links across components/tour steps. Each must open
`https://github.com/anza-xyz/agave/blob/v4.2.1/<path>` scrolled to a line range that supports the claim. 10/10 must resolve correctly.

## 5. Findings report completeness (SC-003)

Open `specs/003-agave-accuracy-audit/report.md`:
- every row has classification + after-evidence citation,
- zero rows left undispositioned,
- methodology section explains re-audit against a newer tag.

## 6. Structural consistency (SC-005)

`tests/data-consistency.test.ts` passes including new invariants:
citation grammar, VOTE_FLOW non-empty, lifecycle-path adjacency rules, removed-edge absence. See [contracts/architecture-data-contract.md](./contracts/architecture-data-contract.md).

## Done when

All six sections above pass on the feature branch, PR open against `main`, squash-merge after review (constitution Git Flow).
