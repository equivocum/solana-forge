# Feature Specification: Solana Block Lifecycle Learning Game

**Feature Branch**: `001-solana-block-lifecycle-game`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "I want to learn Solana blockchain internals end to end from UI to including block into the chain with examples. Creating a simple manufacture like game would help a lot as long as each block, decision, cryptography, RPC, validator, etc - visualize the full cycle of the block producing end to end is clearly visible and annotated. Ask questions one at a time for clarification."

## User Scenarios & Testing

### User Story 1 - Transaction Signing & Submission (Priority: P1)
As a learner, I want to generate a keypair, sign a transaction locally, and submit it via RPC so that I understand the client-side transaction lifecycle before it reaches the network.

**Why this priority**: This is the entry point - every Solana interaction begins with client-side signing. Without understanding this, subsequent stages cannot be comprehended.

**Independent Test**: Learner runs a CLI command that generates a keypair, signs a message, verifies the signature, builds a transaction, and submits via RPC. Output shows each step with annotations explaining the cryptographic purpose.

**Acceptance Scenarios**:
1. **Given** no keypair exists, **When** learner runs key generation, **Then** ed25519 keypair is created with public/private keys displayed in base58
2. **Given** a keypair and message, **When** learner signs the message, **Then** signature is produced and verified locally with `// WHY: ed25519 signing proves ownership without revealing private key`
3. **Given** a signed transaction, **When** learner submits via RPC, **Then** transaction signature is returned and status can be polled

### User Story 2 - RPC Processing & Simulation (Priority: P1)
As a learner, I want to see how RPC nodes receive, simulate, and forward transactions so that I understand the gateway between clients and validators.

**Why this priority**: RPC is the interface layer - learners must understand what RPC does (and doesn't do) vs validators.

**Independent Test**: Learner runs a local RPC node (or uses testnet), submits a transaction, and observes simulation results, preflight checks, and subscription events with annotations at each stage.

**Acceptance Scenarios**:
1. **Given** a signed transaction, **When** submitted to RPC, **Then** RPC simulates execution showing compute units, logs, and return data
2. **Given** transaction submitted, **When** RPC forwards to validator, **Then** learner sees `// STAGE: rpc_submit` annotation with `// WHY: RPC forwards to leader via gossip; does not execute`
3. **Given** transaction in flight, **When** learner polls status, **Then** commitment levels (Processed, Confirmed, Finalized) are displayed with explanations

### User Story 3 - Validator Execution & Block Production (Priority: P1)
As a learner, I want to run a local validator, observe it process transactions, produce blocks, and vote so that I understand the consensus-critical path.

**Why this priority**: This is the core of Solana - where transactions become blocks and consensus happens.

**Independent Test**: Learner runs a local validator cluster, submits transactions, and observes validator logs showing transaction execution, PoH tick progression, block packing, and vote submission with decision markers.

**Acceptance Scenarios**:
1. **Given** validator running as leader, **When** transaction received, **Then** execution logs show `// STAGE: validator_execute` with `// WHY: Validator executes transactions sequentially per PoH order`
2. **Given** transactions executed, **When** block produced, **Then** block contains entries, transactions, and `// DECISION: leader selected via stake-weighted schedule for slot X`
3. **Given** block produced, **When** validator votes, **Then** vote shows `// DECISION: vote tower depth=32 lockout, committing to fork`

### User Story 4 - Block Finalization & Commitment (Priority: P2)
As a learner, I want to track a block from production to finalization so that I understand commitment levels and fork choice.

**Why this priority**: Finalization is when a block becomes immutable - critical for understanding safety guarantees.

**Independent Test**: Learner queries block commitment status over time, observing progression from Processed → Confirmed → Finalized with annotations explaining vote thresholds.

**Acceptance Scenarios**:
1. **Given** block produced, **When** supermajority votes observed, **Then** commitment level advances with `// WHY: 2/3 stake weight required for finalization`
2. **Given** block finalized, **When** learner queries, **Then** block shows `rooted=true` and `// DECISION: fork choice rule selected heaviest fork`
3. **Given** competing fork, **When** finalization occurs, **Then** learner sees losing fork discarded with slashing conditions explained

### User Story 5 - Fork Resolution & Network Dynamics (Priority: P2)
As a learner, I want to create and observe fork scenarios so that I understand how Solana resolves competing histories.

**Why this priority**: Fork resolution demonstrates the consensus mechanism's safety properties in action.

**Independent Test**: Learner runs a multi-validator cluster, creates a network partition or competing leader scenario, and observes fork choice, vote switching, and slashing with full annotations.

**Acceptance Scenarios**:
1. **Given** two competing forks, **When** validators vote, **Then** `// DECISION: heaviest fork (by stake weight) wins` displayed
2. **Given** validator votes on losing fork, **When** fork discarded, **Then** slashing conditions shown with `// WHY: slashing deters equivocation`
3. **Given** partition healed, **When** cluster converges, **Then** learner sees unified chain with all annotations preserved

### User Story 6 - Manufacturing Game Integration (Priority: P2)
As a learner, I want to interact with a manufacturing game that maps 1:1 to Solana concepts so that abstract blockchain concepts become tangible.

**Why this priority**: The game is the pedagogical vehicle - it must faithfully represent every Solana concept without distortion.

**Independent Test**: Learner plays the game through all 5 gates, with each game action (factory production, conveyor movement, QC inspection, shipment) directly annotated with its Solana counterpart.

**Acceptance Scenarios**:
1. **Given** game started, **When** raw material enters factory, **Then** `// REF: client_signing.rs` shows transaction creation
2. **Given** material on conveyor, **When** PoH tick advances, **Then** `// STAGE: poh_tick` shows hash chain progression
3. **Given** material at QC station, **When** vote cast, **Then** `// DECISION: vote tower lockout=32` mirrors validator voting
4. **Given** shipment dispatched, **When** block finalized, **Then** `// STAGE: block_finalize` shows commitment level

### Edge Cases

- What happens when RPC node is unreachable during submission?
- How does system handle transaction expiration (blockhash expiry)?
- What occurs when validator cluster has insufficient stake for supermajority?
- How are duplicate transactions (same signature) handled?
- What visualization shows when network partition creates competing leaders?
- How does game handle invalid transaction (insufficient funds, nonce mismatch)?
- Errors simulate real Solana behavior and are displayed for educational purposes (no halting)

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a web-based dashboard (served locally) that guides users through 5 progressive gates: Tx Signing → RPC Submit → Validator Process → Block Finalize → Fork Resolution
- **FR-002**: System MUST implement a manufacturing game with 1:1 mapping: Factory=Validator, Conveyor=PoH, Raw Material=Transaction, QC Station=Voting, Shipment=Finalized Block, Defective Batch=Fork
- **FR-003**: System MUST generate real-time visualizations meeting these measurable criteria:
  - Data-flow diagrams update within 100ms of simulation state change (React re-render bound)
  - Node highlighting: color-coded per Constitution (Green=finalized, Yellow=processing, Red=forked, Blue=PoH)
  - PoH tick animation: 1 frame per tick at 1x speed (400ms/tick), variable 0.25x–4x via speed slider
  - State explanation panel: displays human-readable description of current lifecycle stage, updates synchronously with diagram
  - All diagrams include `// REF: <file:line>` cross-references per Annotation Standards
- **FR-004**: System MUST annotate all code and command output with: `// STAGE:`, `// WHY:`, `// HOW:`, `// REF:`, `// DECISION:`, `// BYTES:` markers per constitution standards
- **FR-005**: System MUST expose cryptographic operations transparently: ed25519 keypair generation, signing, verification; PoH hash chaining; Merkle tree construction; account hashing
- **FR-006**: System MUST enforce architectural separation: Client (signs) → RPC (forwards/simulates) → Validator (executes/votes/produces) with no direct Client→Validator calls
- **FR-006a**: System MUST enforce architectural boundary at compile-time via static analysis (ESLint/TypeScript) preventing direct imports from validator modules in client/RPC code
- **FR-007**: System MUST make consensus decisions visible: leader selection (stake-weighted), vote tower (lockout=32), fork choice (heaviest fork), slashing conditions
- **FR-008**: Each learning gate MUST produce verifiable artifacts verified by gate test suite:
  - Working code: gate test passes (`npm run test:gateN`)
  - Interactive diagram: Mermaid.js component file exists at `packages/frontend/src/components/diagrams/Gate{N}Diagram.tsx`
  - Real-time visualization: React component with `data-testid="gate{N}-visualization"` rendering without errors
  - Annotated execution log: JSONL file at `logs/gate{N}-execution.log` with `// STAGE:`, `// WHY:`, `// DECISION:` entries
- **FR-009**: System MUST run locally without external dependencies with progressive simulation fidelity:
  - Gate 1: No simulation — pure client-side ed25519 crypto operations
  - Gate 2: In-process RPC simulation only (simulate, forward, subscribe)
  - Gates 3-4: In-process validator simulation (full fidelity: banking stage, PoH service, vote tower, block production)
  - Gate 5: In-process multi-validator cluster (deterministic, full fidelity: gossip, Turbine, fork resolution)
- **FR-010**: System MUST provide a test suite per gate (`npm run test:gateN`) that validates both functionality and educational output, per Constitution Learning Milestone Gates
- **FR-011**: System MUST persist learner progress and manufacturing game state between sessions using localStorage/IndexedDB, including: completed gates, factory configurations, transaction history, and annotation logs
- **FR-012**: System MUST display constitution-required annotations (`// STAGE:`, `// WHY:`, `// HOW:`, `// REF:`, `// DECISION:`, `// BYTES:`) via three complementary views: (1) persistent side panel with live annotation feed and clickable cross-references, (2) inline tooltips on data-flow diagram nodes/edges, (3) step-by-step execution log with expandable annotations per gate

### Key Entities

- **Learner**: Primary user progressing through gates; interacts via web dashboard; receives real-time annotated visualizations and human-readable state explanations at each step
- **Game State**: Persisted learner progress including completed gates, factory configurations, transaction history, annotation logs; stored in localStorage/IndexedDB
- **Transaction**: Raw Material in game; signed payload with instructions, signatures, blockhash, fee payer
- **Keypair**: ed25519 identity; generated at Gate 1; used for signing all transactions
- **RPC Node**: Gateway; simulates, forwards, subscribes; does not execute or vote
- **Validator**: Factory in game; executes transactions, produces blocks, votes, maintains PoH
- **Block**: Shipment in game; contains entries (PoH ticks), transactions, signatures; produced by leader
- **Vote**: QC inspection in game; validator's commitment to a fork; includes lockout, tower depth
- **PoH (Proof of History)**: Conveyor belt in game; continuous hash chain at fixed tick rate (400ms/tick)
- **Fork**: Defective batch in game; competing chain history; resolved by heaviest fork rule
- **Leader Schedule**: Shift schedule in game; epoch-based, stake-weighted leader assignment

## Success Criteria

### Measurable Outcomes

- **SC-001**: Learner completes Gate 1 (Tx Signing) in under 10 minutes with 100% annotation coverage on all crypto operations
- **SC-002**: Learner completes Gate 2 (RPC Submit) and correctly identifies 3 distinct RPC roles (simulate, forward, subscribe) from annotated output
- **SC-003**: Learner completes Gate 3 (Validator Process) and explains PoH tick progression, block packing, and vote submission from web dashboard visualization
- **SC-004**: Learner completes Gate 4 (Block Finalize) and distinguishes Processed/Confirmed/Finalized commitment levels with vote threshold rationale
- **SC-005**: Learner completes Gate 5 (Fork Resolution) and demonstrates fork choice by creating competing forks and observing heaviest-fork win
- **SC-006**: All 5 gates produce passing test suite (`npm run test:gateN`) with zero test failures and complete artifact sets (code, diagram, visualization, log)
- **SC-007**: Manufacturing game maintains 100% mapping fidelity - every game mechanic has documented Solana counterpart with `// REF:` cross-reference
- **SC-008**: Zero black-box operations - every cryptographic primitive shows raw bytes (`// BYTES:`) and purpose (`// WHY:`)
- **SC-009**: Architecture boundary enforced - static analysis confirms no direct Client→Validator calls in codebase
- **SC-010**: [POST-LAUNCH] Learner satisfaction: 90%+ rate the visualizations and annotations as "essential" or "very helpful" — measured via in-app survey (not an implementation criterion)

## Assumptions

- Target learner has basic programming knowledge (can read TypeScript/JavaScript) but no prior Solana experience
- Learner runs on Linux/macOS/Windows with Node.js installed; web browser required for dashboard
- Local validator simulation runs in-process via napi-rs embedding Agave crates (solana-poh, solana-runtime, solana-ledger, solana-vote-program) for Gates 3-5; Gate 2 uses RPC simulation only; Gate 1 uses pure crypto
- Gate 5 fork resolution uses in-process simulated multi-validator cluster (deterministic, controlled via wrapper)
- Visualizations render in web dashboard: interactive SVG/Canvas for data flow, real-time node highlighting, Mermaid.js for static diagrams
- Web-based dashboard served locally (e.g., `npm run dev` → `http://localhost:3000`) built with React + Vite + TypeScript
- Educational focus over production readiness - code clarity and annotations prioritized over performance
- Constitution compliance is mandatory - all 6 core principles and 4 additional sections must be satisfied; annotation standards apply to both frontend and backend code
- Simulation targets latest stable Solana release (v2.0.x) for transaction format, vote structure, PoH, and consensus behavior
- Game state and learner progress persist across sessions via localStorage/IndexedDB
- Validator simulation uses Agave crates directly via napi-rs wrapper; thin educational wrapper exposes callbacks for annotations/visualization
- Annotations displayed via three views: side panel (live feed), diagram tooltips (contextual), execution log (sequential)
- Private keys masked by default with toggle for learning transparency
- Simulation speed is variable: real-time by default with slow-motion toggle
- Errors simulate real Solana behavior and are displayed for educational purposes (no halting)
- Accessibility deferred to future iteration (visual-only for now)
- Game state uses last-write-wins with localStorage (no conflict resolution)

## Notes

This specification follows the Solana Learn Lab Constitution v1.0.1. All requirements are derived from the constitution's 6 core principles, 4 additional sections, and 5 learning milestone gates. The manufacturing game metaphor is not optional - it is mandated by the Game Architecture Constraints section. Implementation must proceed gate-by-gate per Progressive Complexity principle.

**Clarifications Resolved**: Web-based dashboard with real-time visualizations, node highlighting, and human-readable state panel; TypeScript/JavaScript implementation (React + Vite); in-process simulated cluster for Gate 5; full game state persistence (localStorage/IndexedDB); Agave crates via napi-rs wrapper for validator simulation; annotations via side panel + tooltips + execution log; private keys masked by default with reveal toggle; variable simulation speed with slow-motion toggle; errors mirror real Solana behavior with educational display; accessibility deferred; last-write-wins game state persistence.

## Clarifications

### Session 2026-08-18

- Q: Which Solana protocol version should the learning simulation target? → A: Latest stable release (e.g., v2.0.x)
- Q: Should the manufacturing game persist learner progress and game state between sessions? → A: Yes, full persistence (localStorage/IndexedDB)
- Q: What simulation fidelity should each gate use? → A: Progressive fidelity — Gate 1: pure client-side crypto (no simulation); Gate 2: in-process RPC simulation only (simulate, forward, subscribe); Gates 3-5: full fidelity — replicate Agave validator internals (banking stage, gossip, Turbine, PoH service, vote tower, block production, fork resolution) for educational accuracy
- Q: What frontend framework and build tooling should the web dashboard use? → A: React + Vite + TypeScript
- Q: How should constitution-required annotations be displayed in the web dashboard? → A: All three: side panel + tooltips + execution log
- Q: Should we use Agave crates directly (solana-poh, solana-runtime, solana-ledger, solana-vote-program) via napi-rs wrapper instead of reimplementing or using external validator? → A: Yes - use Agave crates as libraries via napi-rs wrapper; thin educational wrapper exposes callbacks for annotations/visualization

### Session 2026-08-18 (continued)

- Q: How should private keys be handled for security vs learning transparency? → A: Mask keys by default with toggle to reveal
- Q: What performance targets should the simulation aim for? → A: Variable speed with slow-motion toggle
- Q: How should error states behave in the dashboard? → A: Simulate real Solana errors, display for education without halting
- Q: Should the dashboard include accessibility features? → A: Visual-only for now, defer to future iteration
- Q: How should concurrent game state modifications be handled? → A: Last-write-wins with localStorage