# Solana Forge

Interactive visualization of Solana validator internals. Trace a transaction from signing to finalization through an 18-step guided tour, with every component, cryptographic operation, and consensus mechanism fully annotated.

## What You'll Learn

The guided tour walks through the complete Solana validator architecture:

<img width="1421" height="965" alt="Solana Validator Architecture" src="https://github.com/user-attachments/assets/f43eb11e-78c2-494a-9d11-7ea03ba4ae4e" />

- **TPU Pipeline (Leader Path)**: QUIC Streamer → Fetch → SigVerify → Status Cache → Banking Stage → SVM → AccountsDB → PoH Recording → Broadcast
- **TVU Pipeline (Validator Path)**: Turbine → Shred Fetch → Shred SigVerify → Window Service → Blockstore → Replay Stage → AccountsDB → Tower BFT
- **Consensus**: Fork choice, voting, leader rotation, finalization

Click any component to see detailed internals including purpose, role, how it works, and why it matters.

## Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** 9+

### Install & Run

```bash
git clone git@github.com:equivocum/solana-forge.git
cd solana-forge
pnpm install
pnpm dev
```

The app opens at `http://localhost:3000`.

### Docker

```bash
# Build and run with Docker Compose
docker compose up --build

# Or build and run manually
docker build -t solana-forge .
docker run -p 3000:80 solana-forge
```

The app is served at `http://localhost:3000`.

## Project Structure

```
solana-forge/
├── src/
│   ├── App.tsx                          # Main entry, simulation state
│   ├── components/architecture/         # Architecture visualization
│   │   ├── ArchitectureView.tsx         # Main container with tour logic
│   │   ├── PipelineFlowView.tsx         # Pipeline layout (data flow)
│   │   ├── LayeredView.tsx              # C4-style layered layout
│   │   ├── ComponentNode.tsx            # Interactive component node
│   │   ├── TransactionBubble.tsx        # Animated tx lifecycle bubble
│   │   ├── SimulationSidebar.tsx        # Step info, annotations, controls
│   │   ├── ZoomPanel.tsx                # Detailed component inspector
│   │   └── data/                        # Architecture definitions
│   │       ├── components.ts            # 22 validator components
│   │       ├── connections.ts           # Data flow + tx lifecycle path
│   │       └── simulation-steps.ts      # 18-step guided tour sequence
│   ├── hooks/useAnnotations.ts          # Annotation state management
│   ├── services/
│   │   ├── annotations.ts               # Annotation creation + formatting
│   │   ├── annotationTheme.ts           # Color/icon mapping per type
│   │   ├── executionLog.ts              # IndexedDB-backed execution logs
│   │   └── storage.ts                   # IndexedDB tx/annotation/block storage
│   └── types/index.ts                   # Shared TypeScript interfaces
├── tests/
│   └── data-consistency.test.ts         # Verifies data structures stay in sync
├── specs/                               # Feature specifications
└── logs/                                # JSONL execution logs
```

## Architecture Views

Two visualization modes:

- **Pipeline Flow**: See data flow through all 18 components with the animated transaction bubble tracing the full lifecycle
- **Layered View**: Components organized by layer (networking, TPU, TVU, runtime, consensus, storage)

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

Annotations appear in the sidebar with clickable cross-references to the [Agave validator source](https://github.com/anza-xyz/agave).

## Testing

```bash
# Run all tests
pnpm test

# Type check
npx tsc --noEmit
```

The data consistency test verifies that `TX_LIFECYCLE_PATH`, `SIMULATION_STEPS`, and `ALL_COMPONENTS` stay in sync — catching drift between the guided tour steps and the architecture component definitions.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript 5.9, Vite 6.4, Tailwind CSS 4.3 |
| Testing | Vitest 3.2, @testing-library/react |
| Storage | IndexedDB + localStorage |

## Contributing

1. Follow existing code conventions (no semicolons, single quotes, 2-char indentation)
2. Every new component must include `// STAGE:` annotation at the top
3. Run `pnpm test` and `npx tsc --noEmit` before committing

## License

MIT
