# Solana Forge

Learn Solana blockchain internals through an interactive manufacturing game. Trace a transaction from signing to finalization, with every decision, cryptographic operation, and consensus mechanism fully annotated.

## What You'll Learn

Solana Forge teaches the complete Solana block lifecycle through 5 progressive gates:

| Gate | Topic | What You'll Understand |
|------|-------|----------------------|
| 1 | **Transaction Signing** | Generate ed25519 keypairs, sign messages, verify signatures |
| 2 | **RPC Submit** | Build transactions, submit to RPC, poll commitment status |
| 3 | **Validator Process** | Start a validator, process transactions, produce blocks, cast votes |
| 4 | **Block Finalize** | Track commitment progression: Processed → Confirmed → Finalized |
| 5 | **Fork Resolution** | Create competing forks, observe voting/resolution, heal partitions |

A **Guided Tour** mode walks through the full Solana validator architecture (18 steps), covering the TPU pipeline (leader path) and TVU pipeline (validator path) with annotated explanations at every stage.

## Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** 9+

### Install & Run

```bash
# Clone the repo
git clone git@github.com:equivocum/solana-forge.git
cd solana-forge

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

The dashboard opens at `http://localhost:5173`.

## Project Structure

```
solana-forge/
├── packages/
│   ├── frontend/          # React + Vite + TypeScript UI
│   │   ├── src/
│   │   │   ├── components/    # Architecture visualization, diagrams, pipeline
│   │   │   ├── gates/         # 5 learning gate components
│   │   │   ├── game/          # Manufacturing game (Factory, Conveyor, QC)
│   │   │   ├── hooks/         # React hooks (annotations, progress, simulation)
│   │   │   └── services/      # Crypto, RPC, validator, storage services
│   └── shared/            # Shared TypeScript types
├── tests/
│   └── gate/              # Gate-level tests (gate1–gate5)
├── specs/                 # Feature specifications and design docs
└── logs/                  # JSONL execution logs
```

## The Manufacturing Game

Abstract blockchain concepts are mapped 1:1 to tangible factory operations:

| Manufacturing Concept | Solana Concept |
|---|---|
| Factory | Validator |
| Conveyor Belt | Proof of History (PoH) |
| Raw Material | Transaction |
| QC Station | Voting / Vote Tower |
| Shipment | Finalized Block |
| Defective Batch | Fork |
| Shift Schedule | Leader Schedule |
| Quality Metrics | Vote Tower / Lockout |

Every game action is annotated with its Solana counterpart and a cross-reference to the source code.

## Architecture

Solana Forge visualizes two core data flows:

- **TPU Pipeline (Leader Path)**: QUIC Streamer → Gulf Stream → Gossip → Fetch → SigVerify → Banking Stage → PoH Recording → Broadcast
- **TVU Pipeline (Validator Path)**: Shred Fetch → SigVerify → Window Service → Replay Stage → Retransmit

The architecture view supports two modes:
- **Pipeline Flow**: See data flow through all 17 components
- **Layered View**: Components organized by layer (networking, TPU, TVU, runtime, consensus, storage)

Click any component to see detailed internals including purpose, role, how it works, why it matters, and live metrics.

## Annotation System

Every code path and UI element carries structured annotations using 6 marker types:

| Marker | Purpose |
|---|---|
| `// STAGE:` | Current lifecycle stage |
| `// WHY:` | Rationale and purpose |
| `// HOW:` | Implementation mechanics |
| `// REF:` | Cross-references to Agave source code |
| `// DECISION:` | Consensus and architectural decisions |
| `// BYTES:` | Raw byte-level data visibility |

Annotations appear in three views:
1. **Side panel** — Live annotation feed with clickable cross-references
2. **Inline tooltips** — Contextual explanations on diagram nodes/edges
3. **Execution log** — Step-by-step expandable details per gate

## Testing

```bash
# Run all tests
pnpm test

# Run individual gate tests
pnpm test:gate1
pnpm test:gate2
pnpm test:gate3
pnpm test:gate4
pnpm test:gate5

# Lint
pnpm lint
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Diagrams | Mermaid.js |
| Crypto | @noble/ed25519 |
| Testing | Vitest, @testing-library/react |
| Monorepo | pnpm workspaces |

## Contributing

1. Follow existing code conventions (no semicolons, single quotes, 2-char indentation)
2. Every new component must include `// STAGE:` annotation at the top
3. Run `pnpm lint` and `pnpm test` before committing

## License

MIT
