# Implementation Plan: Agave Accuracy Audit

**Branch**: `feature/8-agave-accuracy-audit` ([#8](https://github.com/equivocum/solana-forge/issues/8)) | **Date**: 2026-08-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-agave-accuracy-audit/spec.md`

## Summary

Audit every architectural claim in Solana Forge's visualization against the Agave validator client at pinned release **v4.2.1**, correct all inaccuracies (lifecycle ordering, missing vote return path, removed capabilities), add three missing independent services as first-class nodes, restructure the guided tour (~20 steps, submission → finalization incl. vote loop), produce a cited findings report, and apply everything through git flow with per-change verification (`pnpm test` + `npx tsc --noEmit` green after each unit).

## Technical Context

**Language/Version**: TypeScript 5.9 (existing app; no new languages)

**Primary Dependencies**: React 18, Vite 6.4, Tailwind CSS 4.3, Vitest 3.2 (all existing; zero new runtime dependencies)

**Storage**: IndexedDB + localStorage (existing, untouched by this feature); findings report as Markdown under `specs/003-agave-accuracy-audit/`

**Testing**: Vitest (`pnpm test`) + TypeScript compiler check (`npx tsc --noEmit`); existing `tests/data-consistency.test.ts` evolves to enforce corrected invariants

**Target Platform**: Modern browsers via static site (existing); Docker packaging unchanged

**Project Type**: Single-project web application (interactive educational visualization)

**Performance Goals**: No runtime-performance regression vs current build (tour animation cadence unchanged)

**Constraints**: All citations must resolve to permanent GitHub permalinks pinning tag `v4.2.1` (`https://github.com/anza-xyz/agave/blob/v4.2.1/<path>#L<line>`); mainnet-active behavior only (feature-gated successor consensus mentioned at most as labeled notes); process gates FR-020–FR-023 mandatory

**Scale/Scope**: 29 existing components audited/corrected, ~3 new nodes, ~88-line connection graph rewritten, 18→~20 tour steps, 1 findings report

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Progressive Complexity | PASS | Restructured tour orders steps strictly by real data flow (submission → ingress → verification → scheduling → execution → ledger clock → propagation → validation → voting → finalization); each step builds on the prior |
| II. Visual-First Learning | PASS | Work targets the existing diagram + animated transaction bubble; new machinery enters through nodes/detail panels, never prose-only |
| III. Annotated Execution | PASS | Annotation badge types (STAGE/WHY/HOW/REF/DECISION/BYTES) retained; `// REF:` upgraded to pinned-release permalinks per constitution's cross-reference requirement |
| IV. Decision Points Exposed | PASS (improved) | Adds previously missing decision surfaces: fork-choice switch/reset logic, lockout-based root advancement, confirmation thresholds, leader-schedule derivation |
| V. Cryptography Transparency | PASS (improved) | Corrects crypto narratives: CPU-parallel ed25519 verification, PoH as sequential SHA-256 hash chain (not "VDF"), Merkle-root-signed erasure-coded fragments |
| VI. RPC/Validator Separation | PASS (improved) | New client-facing remote-interface node makes the Client→RPC→Validator boundary explicit, which the current model skips entirely |

**Post-Phase-1 re-check**: No violations introduced. Design artifacts keep constitution compliance (see research.md D-14).

## Project Structure

### Documentation (this feature)

```text
specs/003-agave-accuracy-audit/
├── plan.md              # This file
├── research.md          # Phase 0 output: consolidated verified findings w/ citations
├── data-model.md        # Phase 1 output: entities, rules, lifecycle states
├── quickstart.md        # Phase 1 output: end-to-end validation guide
├── contracts/           # Phase 1 output: data + UI contracts
│   ├── architecture-data-contract.md
│   └── ui-tour-contract.md
├── checklists/
│   └── requirements.md  # Spec quality checklist (16/16 passing)
├── report.md            # Phase 2+ output (findings report, created during implementation)
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created here)
```

### Source Code (repository root)

```text
src/
├── App.tsx                                   # unchanged entry
├── components/architecture/
│   ├── ArchitectureView.tsx                  # tour logic (step targeting updates)
│   ├── PipelineFlowView.tsx                  # layout absorbs new nodes
│   ├── LayeredView.tsx                       # layer assignment for new nodes
│   ├── ComponentNode.tsx / TransactionBubble.tsx / ZoomPanel.tsx / SimulationSidebar.tsx  # unchanged mechanics
│   └── data/
│       ├── components.ts                     # CORRECTED: claims, sub-items, citations (+3 components)
│       ├── connections.ts                    # REWRITTEN: flows + TX_LIFECYCLE_PATH + vote loop
│       └── simulation-steps.ts               # RESTRUCTURED: ~20 ordered steps
├── hooks/useAnnotations.ts                   # unchanged
├── services/*                                # unchanged
└── types/index.ts                            # extended only if new node kinds require it

tests/
└── data-consistency.test.ts                  # UPDATED invariants (components ↔ connections ↔ steps)
```

**Structure Decision**: Existing single-project layout retained; changes concentrate in `src/components/architecture/data/` (pure data corrections), the consistency tests, and README. No new directories, dependencies, or services.

## Complexity Tracking

> No constitution violations to justify — table intentionally empty.
