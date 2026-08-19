# Implementation Plan: Solana Block Lifecycle Learning Game

**Branch**: `001-solana-block-lifecycle-game` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-solana-block-lifecycle-game/spec.md`

## Summary

Build an interactive web-based learning tool that teaches Solana blockchain internals through a manufacturing game metaphor. The tool progresses through 5 gates: Tx Signing → RPC Submit → Validator Process → Block Finalize → Fork Resolution. Each gate provides real-time visualizations, annotated code, and interactive diagrams. Uses React + Vite + TypeScript frontend with in-process Solana validator simulation via napi-rs wrapping Agave crates (solana-poh, solana-runtime, solana-ledger, solana-vote-program). Educational focus with variable speed simulation and masked private keys by default.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), Rust (napi-rs native modules for Agave crates)

**Primary Dependencies**: React 18+, Vite 5+, TypeScript 5+, napi-rs 3+, Agave crates (solana-poh, solana-runtime, solana-ledger, solana-vote-program)

**Storage**: localStorage/IndexedDB (game state, learner progress, transaction history)

**Testing**: Vitest (unit/integration), Cargo test (Rust native modules)

**Target Platform**: Web (Chrome/Firefox/Safari), runs locally on Linux/macOS/Windows with Node.js 18+

**Project Type**: Web application (React frontend + Rust native backend)

**Performance Goals**: Variable speed (real-time ~4,000 TPS default, slow-motion toggle for 2-4s blocks), smooth 60fps animations

**Constraints**: Local-first, no external network dependencies, educational focus over production readiness

**Scale/Scope**: Single-user learning tool, 5 progressive gates, ~10-15 components, ~5k-10k lines TypeScript

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Progressive Complexity | ✅ PASS | 5 gates build sequentially, each requiring previous gate completion |
| II. Visual-First Learning | ✅ PASS | Mermaid diagrams, terminal ASCII, frame-by-frame animations required per gate |
| III. Annotated Execution | ✅ PASS | All code carries // STAGE:, // WHY:, // REF:, // DECISION:, // BYTES: markers |
| IV. Decision Points Exposed | ✅ PASS | Leader selection, vote tower, fork choice, slashing all logged with DECISION: prefix |
| V. Cryptography Transparency | ✅ PASS | ed25519 keypair, signing, PoH hash, Merkle tree all exposed with raw bytes |
| VI. RPC/Validator Separation | ✅ PASS | Client → RPC → Validator enforced; no direct client→validator calls |

**Visualization Standards**: ✅ PASS - Mermaid.js, ASCII, color coding (Green=finalized, Yellow=processing, Red=forked, Blue=PoH), frame-by-frame, cross-refs

**Annotation Standards**: ✅ PASS - Stage headers, WHY inline, REF cross-refs, DECISION markers, BYTES visibility

**Game Architecture Constraints**: ✅ PASS - Factory=Validator, Conveyor=PoH, Raw Material=Tx, QC=Vote, Shipment=Block, Defective=Fork, Shift=Leader Schedule, Quality Metrics=Vote Tower/Lockout

**Learning Milestone Gates**: ✅ PASS - 5 gates with cargo test verification requirements

## Project Structure

### Documentation (this feature)

```text
specs/001-solana-block-lifecycle-game/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
packages/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── GateSelector.tsx
│   │   │   ├── AnnotationPanel.tsx
│   │   │   ├── ExecutionLog.tsx
│   │   │   └── diagrams/
│   │   │       ├── TransactionFlow.tsx
│   │   │       ├── BlockLifecycle.tsx
│   │   │       └── ForkResolution.tsx
│   │   ├── gates/
│   │   │   ├── gate1-tx-signing.tsx
│   │   │   ├── gate2-rpc-submit.tsx
│   │   │   ├── gate3-validator-process.tsx
│   │   │   ├── gate4-block-finalize.tsx
│   │   │   └── gate5-fork-resolution.tsx
│   │   ├── game/
│   │   │   ├── Factory.tsx
│   │   │   ├── Conveyor.tsx
│   │   │   ├── QCStation.tsx
│   │   │   ├── Shipment.tsx
│   │   │   └── useGameState.ts
│   │   ├── hooks/
│   │   │   ├── useSimulation.ts
│   │   │   ├── useAnnotations.ts
│   │   │   └── useProgress.ts
│   │   ├── services/
│   │   │   ├── simulation.ts
│   │   │   ├── annotations.ts
│   │   │   └── storage.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── native/
│   ├── src/
│   │   ├── lib.rs
│   │   ├── simulation.rs
│   │   ├── validator.rs
│   │   ├── rpc.rs
│   │   └── poh.rs
│   ├── Cargo.toml
│   └── package.json
└── shared/
    └── types/
        └── index.ts

tests/
├── unit/
├── integration/
└── gate/
    ├── gate1.test.ts
    ├── gate2.test.ts
    ├── gate3.test.ts
    ├── gate4.test.ts
    └── gate5.test.ts
```

**Structure Decision**: Monorepo with frontend (React+Vite) and native (Rust+napi-rs) packages. Shared types ensure contract alignment. Gate-specific tests validate each learning milestone independently.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| napi-rs native modules | Solana Agave crates are Rust-only; must wrap for TypeScript | Reimplementing in JS would lose fidelity of real validator behavior |
| In-process simulation | Gates 1-4 require deterministic, controlled execution for annotations | Real validator would be non-deterministic and hard to annotate |
| Full fidelity (heavy) | Constitution requires production-grade Agave internals for educational accuracy | Medium fidelity was rejected after user clarified full fidelity needed |
