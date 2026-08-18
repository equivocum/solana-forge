# Quickstart Validation Guide: Solana Block Lifecycle Learning Game

**Date**: 2026-08-18 | **Branch**: `001-solana-block-lifecycle-game`

## Prerequisites

- Node.js 18+ installed
- Rust toolchain (for napi-rs native modules)
- Git

## Setup

```bash
# Clone and install
git clone <repo-url>
cd solana-learn
npm install

# Build native modules
npm run build:native

# Start development server
npm run dev
```

The dashboard opens at `http://localhost:3000`.

## Validation Scenarios

### Gate 1: Transaction Signing

**Objective**: Verify keypair generation, signing, and verification

1. Navigate to Gate 1 in the dashboard
2. Click "Generate Keypair"
   - **Expected**: Public/private keys displayed (private key masked by default)
   - **Expected**: `// STAGE: keypair_generation` annotation appears
3. Click "Show Private Key" toggle
   - **Expected**: Private key revealed with security warning
4. Enter a test message and click "Sign"
   - **Expected**: Signature displayed in base58
   - **Expected**: `// WHY: ed25519 signing proves ownership without revealing private key`
5. Click "Verify Signature"
   - **Expected**: Verification success message
   - **Expected**: `// BYTES:` shows raw signature bytes

**Verification Command**:
```bash
npm run test:gate1
```

### Gate 2: RPC Submit

**Objective**: Verify transaction submission and RPC interaction

1. Navigate to Gate 2
2. Build a test transaction from Gate 1 keypair
3. Click "Submit to RPC"
   - **Expected**: Transaction signature returned
   - **Expected**: `// STAGE: rpc_submit` annotation
   - **Expected**: `// WHY: RPC forwards to leader via gossip; does not execute`
4. Click "Poll Status"
   - **Expected**: Commitment levels displayed (Processed -> Confirmed -> Finalized)
   - **Expected**: Each level has explanatory annotation

**Verification Command**:
```bash
npm run test:gate2
```

### Gate 3: Validator Process

**Objective**: Verify validator execution and block production

1. Navigate to Gate 3
2. Click "Start Validator"
   - **Expected**: Validator logs show initialization
3. Submit a transaction
   - **Expected**: `// STAGE: validator_execute` annotation
   - **Expected**: `// WHY: Validator executes transactions sequentially per PoH order`
4. Observe block production
   - **Expected**: Block contains entries, transactions
   - **Expected**: `// DECISION: leader selected via stake-weighted schedule for slot X`
5. Observe vote submission
   - **Expected**: `// DECISION: vote tower depth=32 lockout, committing to fork`

**Verification Command**:
```bash
npm run test:gate3
```

### Gate 4: Block Finalize

**Objective**: Verify block finalization and commitment levels

1. Navigate to Gate 4
2. Submit multiple transactions to produce blocks
3. Click "Track Finalization"
   - **Expected**: Block commitment advances: Processed -> Confirmed -> Finalized
   - **Expected**: `// WHY: 2/3 stake weight required for finalization`
4. Query finalized block
   - **Expected**: `rooted=true`
   - **Expected**: `// DECISION: fork choice rule selected heaviest fork`

**Verification Command**:
```bash
npm run test:gate4
```

### Gate 5: Fork Resolution

**Objective**: Verify fork creation and resolution

1. Navigate to Gate 5
2. Click "Create Competing Forks"
   - **Expected**: Two chain branches visible in visualization
3. Observe validator votes
   - **Expected**: `// DECISION: heaviest fork (by stake weight) wins`
4. Observe fork resolution
   - **Expected**: Losing fork discarded
   - **Expected**: `// WHY: slashing deters equivocation`
5. Click "Heal Partition"
   - **Expected**: Cluster converges to unified chain

**Verification Command**:
```bash
npm run test:gate5
```

### Variable Speed Simulation

**Objective**: Verify slow-motion toggle works

1. Start any gate simulation
2. Locate speed controls
3. Click "Slow Motion" toggle
   - **Expected**: Simulation slows to 2-4 second ticks
   - **Expected**: Step-by-step mode available
4. Adjust speed multiplier (0.25x - 4x)
   - **Expected**: Animation speed changes accordingly
5. Return to real-time
   - **Expected**: Simulation resumes normal speed

### Game State Persistence

**Objective**: Verify progress persists across sessions

1. Complete Gate 1
2. Close the browser tab
3. Reopen the application
   - **Expected**: Gate 1 shows as completed
   - **Expected**: Progress restored from localStorage

### Annotation Display

**Objective**: Verify three annotation views work

1. Start a simulation
2. Check side panel
   - **Expected**: Live annotation feed updates
3. Hover over diagram node
   - **Expected**: Tooltip shows annotation
4. Open execution log
   - **Expected**: Annotations listed sequentially with expandable details

## Expected Outcomes

| Scenario | Expected Result |
|----------|-----------------|
| Gate 1 completion | Keypair generated, signed, verified with annotations |
| Gate 2 completion | Transaction submitted, RPC response received |
| Gate 3 completion | Validator processes tx, produces block, votes |
| Gate 4 completion | Block finalized with 2/3 supermajority |
| Gate 5 completion | Forks created and resolved by heaviest fork |
| Variable speed | Toggle changes simulation speed |
| Persistence | Progress survives browser restart |
| Annotations | All 6 annotation types display correctly |

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Native module build fails | Ensure Rust toolchain installed: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Port 3000 in use | Change port in `vite.config.ts` |
| Animations lag | Reduce simulation speed or close other tabs |
| State not persisting | Check localStorage quota in browser dev tools |
