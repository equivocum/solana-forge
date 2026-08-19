# Tasks: Solana Block Lifecycle Learning Game

**Input**: Design documents from `/specs/001-solana-block-lifecycle-game/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: REQUIRED per constitution Learning Milestone Gates and FR-010. All 5 gates must pass `npm run test:gateN` verification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize monorepo structure with packages/frontend, packages/native, packages/shared directories
- [ ] T002 Configure root package.json with workspace settings for monorepo
- [ ] T003 Initialize packages/frontend with Vite + React + TypeScript template
- [ ] T004 Configure packages/frontend/package.json with dependencies: react, vite, typescript, @mermaid-js/mermaid-react, @noble/ed25519, vitest
- [ ] T005 Initialize packages/native with Rust Cargo.toml and napi-rs configuration
- [ ] T006 Configure packages/native/Cargo.toml with dependencies: solana-poh, solana-runtime, solana-ledger, solana-vote-program, napi, napi-derive
- [ ] T007 Create packages/shared/types/index.ts with shared TypeScript interfaces
- [ ] T008 Configure TypeScript path aliases in packages/frontend/tsconfig.json and packages/native/tsconfig.json
- [ ] T009 [P] Setup ESLint and Prettier configuration across all packages
- [ ] T010 [P] Configure Vitest in packages/frontend for unit testing
- [ ] T011 Create tests/ directory structure with unit/, integration/, gate/ subdirectories
- [ ] T012 Configure git hooks with husky for pre-commit linting
- [ ] T012b Implement architectural boundary lint rule in packages/frontend/eslint-plugin-solana-learn/rules/no-direct-validator-import.ts
- [ ] T012c Add ESLint rule to packages/frontend/.eslintrc.js: "solana-learn/no-direct-validator-import": "error"
- [ ] T012d Create integration test in tests/integration/arch-boundary.test.ts that attempts direct Client→Validator import and expects failure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T013 Define all TypeScript types in packages/shared/types/index.ts (Learner, GateProgress, GateState, GateMetrics, SimulationState, Transaction, Instruction, AccountMeta, Block, Vote, Validator, Keypair, Annotation, GameState, FactoryState, ConveyorState, QCStationState, ShipmentRecord, DefectiveBatch — matching data-model.md entities)
- [ ] T014 Implement storage service in packages/frontend/src/services/storage.ts (localStorage + IndexedDB) with // STAGE: storage annotation
- [ ] T015 Implement annotation service in packages/frontend/src/services/annotations.ts with // STAGE: annotation_service annotation
- [ ] T016 Implement simulation engine interface in packages/frontend/src/services/simulation.ts with // STAGE: simulation_interface annotation
- [ ] T017 Create useSimulation hook in packages/frontend/src/hooks/useSimulation.ts
- [ ] T018 Create useAnnotations hook in packages/frontend/src/hooks/useAnnotations.ts
- [ ] T019 Create useProgress hook in packages/frontend/src/hooks/useProgress.ts
- [ ] T020 Implement Rust native module entry point in packages/native/src/lib.rs
- [ ] T021 Implement simulation.rs with validator simulation core logic
- [ ] T022 Implement validator.rs with validator state management
- [ ] T023 Implement rpc.rs with RPC simulation layer
- [ ] T024 Implement poh.rs with PoH hash chain simulation
- [ ] T025 Create napi-rs bindings in packages/native/src/lib.rs for TypeScript interop
- [ ] T025b Define napi-rs TypeScript interface in packages/shared/types/native.ts (simulation, validator, rpc, poh APIs + contract types: SimulationResult, PohTick, SlashingEvent, ValidatorConfig, ProcessResult, ValidatorState)
- [ ] T025c Define diagram data contracts in packages/shared/types/diagrams.ts (TransactionFlowData, BlockLifecycleData, ForkResolutionData)
- [ ] T026 Build and test native module compilation with npm run build:native
- [ ] T026b Write Rust unit tests for packages/native/src/poh.rs (PoH hash chain correctness)
- [ ] T026c Write Rust unit tests for packages/native/src/validator.rs (validator state transitions)
- [ ] T026d Write Rust unit tests for packages/native/src/rpc.rs (RPC simulation layer)
- [ ] T026e Write Rust unit tests for packages/native/src/simulation.rs (simulation core logic)
- [ ] T026f Verify all Rust tests pass via `cargo test` in packages/native/
- [ ] T027 Create base React App component in packages/frontend/src/App.tsx
- [ ] T028 Create Dashboard component skeleton in packages/frontend/src/components/Dashboard.tsx
- [ ] T029 Create GateSelector component in packages/frontend/src/components/GateSelector.tsx
- [ ] T030 Create AnnotationPanel component in packages/frontend/src/components/AnnotationPanel.tsx
- [ ] T030b [P] Implement annotation side panel with live feed and clickable cross-references
- [ ] T030c [P] Implement inline tooltips on diagram nodes/edges
- [ ] T030d [P] Implement step-by-step execution log with expandable annotations
- [ ] T031 Create ExecutionLog component in packages/frontend/src/components/ExecutionLog.tsx
- [ ] T032 Create SimulationControls component in packages/frontend/src/components/SimulationControls.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Transaction Signing & Submission (Priority: P1) MVP

**Goal**: Learner generates keypair, signs transaction, submits via RPC, understands client-side lifecycle

**Independent Test**: Learner runs CLI command that generates keypair, signs message, verifies signature, builds transaction, submits via RPC. Output shows each step with annotations.

### Implementation for User Story 1

- [ ] T033 [US1] Implement Ed25519Service in packages/frontend/src/services/crypto.ts using @noble/ed25519
- [ ] T034 [US1] Implement keypair generation with annotation support in packages/frontend/src/services/crypto.ts
- [ ] T035 [US1] Implement message signing with // WHY: annotation in packages/frontend/src/services/crypto.ts
- [ ] T036 [US1] Implement signature verification with // BYTES: annotation in packages/frontend/src/services/crypto.ts
- [ ] T037 [US1] Create TransactionBuilder service in packages/frontend/src/services/transaction.ts
- [ ] T038 [US1] Implement transaction serialization with base58 encoding
- [ ] T039 [US1] Create Gate1 component in packages/frontend/src/gates/gate1-tx-signing.tsx
- [ ] T040 [US1] Add keypair generation UI with public/private key display
- [ ] T041 [US1] Add private key mask/unmask toggle with security warning
- [ ] T042 [US1] Add message signing UI with signature display
- [ ] T043 [US1] Add signature verification UI with result display
- [ ] T044 [US1] Create TransactionFlow diagram component in packages/frontend/src/components/diagrams/TransactionFlow.tsx
- [ ] T045 [US1] Add Mermaid diagram for transaction signing flow
- [ ] T046 [US1] Integrate useAnnotations hook in Gate1 for live annotation feed
- [ ] T047 [US1] Add // STAGE: keypair_generation annotation at function entry
- [ ] T048 [US1] Add // WHY: ed25519 signing proves ownership annotation on signing lines
- [ ] T049 [US1] Add // BYTES: hex annotations for key material and signatures
- [ ] T050 [US1] Add // REF: cross-references linking crypto operations
- [ ] T050b [US1] Add // HOW: annotations explaining implementation mechanics at each crypto step

### Game Integration for Gate 1
- [ ] T033b [US1+US6] Create Factory component skeleton in packages/frontend/src/game/Factory.tsx with // REF: client_signing.rs
- [ ] T033c [US1+US6] Implement raw material (transaction) creation in Factory with // REF: transaction.rs annotation

**Checkpoint**: Gate 1 (Transaction Signing) fully functional and testable independently

---

## Phase 4: User Story 2 - RPC Processing & Simulation (Priority: P1)

**Goal**: Learner sees how RPC nodes receive, simulate, and forward transactions

**Independent Test**: Learner submits transaction to RPC, observes simulation results, preflight checks, and subscription events with annotations.

### Implementation for User Story 2

- [ ] T051 [US2] Implement RPC simulation layer in packages/native/src/rpc.rs
- [ ] T052 [US2] Implement transaction simulation with compute units and logs
- [ ] T053 [US2] Implement preflight checks (signature verification, blockhash expiry)
- [ ] T054 [US2] Implement commitment level tracking (Processed, Confirmed, Finalized)
- [ ] T055 [US2] Create RPC service interface in packages/frontend/src/services/rpc.ts
- [ ] T056 [US2] Implement submitTransaction method with annotation callbacks
- [ ] T057 [US2] Implement simulateTransaction method with result formatting
- [ ] T058 [US2] Implement pollStatus method with commitment level display
- [ ] T059 [US2] Create Gate2 component in packages/frontend/src/gates/gate2-rpc-submit.tsx
- [ ] T060 [US2] Add transaction submission UI with RPC response display
- [ ] T061 [US2] Add simulation results display with compute units and logs
- [ ] T062 [US2] Add commitment level polling UI with progress indicators
- [ ] T063 [US2] Add // STAGE: rpc_submit annotation on RPC operations
- [ ] T064 [US2] Add // WHY: RPC forwards to leader via gossip annotation
- [ ] T065 [US2] Add commitment level explanations (Processed/Confirmed/Finalized)
- [ ] T065f [US2] Add // HOW: annotations explaining RPC simulation and forwarding mechanics
- [ ] T065b [US2] Implement RPC unreachable error handling with retry logic and annotation
- [ ] T065c [US2] Implement blockhash expiry detection with // DECISION: annotation
- [ ] T065d [US2] Implement duplicate transaction (same signature) detection with // WHY: annotation
- [ ] T065e [US2] Implement invalid transaction error handling (insufficient funds, nonce mismatch) with annotations

### Game Integration for Gate 2
- [ ] T051b [US2+US6] Create Conveyor component in packages/frontend/src/game/Conveyor.tsx with // STAGE: poh_tick
- [ ] T051c [US2+US6] Implement conveyor movement syncing with RPC simulation events

**Checkpoint**: Gate 2 (RPC Submit) fully functional and testable independently

---

## Phase 5: User Story 3 - Validator Execution & Block Production (Priority: P1)

**Goal**: Learner runs local validator, observes transaction processing, block production, and voting

**Independent Test**: Learner submits transactions, observes validator logs showing execution, PoH tick progression, block packing, and vote submission.

### Implementation for User Story 3

- [ ] T066 [US3] Implement validator execution logic in packages/native/src/validator.rs
- [ ] T067 [US3] Implement banking stage for transaction processing
- [ ] T068 [US3] Implement PoH tick generation in packages/native/src/poh.rs
- [ ] T069 [US3] Implement block production with entries and transactions
- [ ] T070 [US3] Implement leader selection with stake-weighted schedule
- [ ] T071 [US3] Implement vote submission with vote tower lockout
- [ ] T072 [US3] Create ValidatorService in packages/frontend/src/services/validator.ts
- [ ] T073 [US3] Implement startValidator, stopValidator, getValidatorState methods
- [ ] T074 [US3] Create Gate3 component in packages/frontend/src/gates/gate3-validator-process.tsx
- [ ] T075 [US3] Add validator startup UI with initialization logs
- [ ] T076 [US3] Add transaction submission to validator UI
- [ ] T077 [US3] Add validator execution logs display
- [ ] T078 [US3] Add block production visualization with entries and transactions
- [ ] T079 [US3] Add vote submission display with lockout and tower depth
- [ ] T080 [US3] Create BlockLifecycle diagram component in packages/frontend/src/components/diagrams/BlockLifecycle.tsx
- [ ] T081 [US3] Add Mermaid diagram for validator processing flow
- [ ] T082 [US3] Add // STAGE: validator_execute annotation at execution
- [ ] T083 [US3] Add // WHY: Validator executes transactions sequentially annotation
- [ ] T084 [US3] Add // DECISION: leader selected via stake-weighted schedule annotation
- [ ] T085 [US3] Add // DECISION: vote tower depth=32 lockout annotation
- [ ] T085b [US3] Add // HOW: annotations explaining validator execution and block production mechanics

### Game Integration for Gate 3
- [ ] T066b [US3+US6] Create QCStation component in packages/frontend/src/game/QCStation.tsx with // DECISION: vote tower lockout=32
- [ ] T066c [US3+US6] Implement QC inspection syncing with validator vote events

**Checkpoint**: Gate 3 (Validator Process) fully functional and testable independently

---

## Phase 6: User Story 4 - Block Finalization & Commitment (Priority: P2)

**Goal**: Learner tracks block from production to finalization, understands commitment levels and fork choice

**Independent Test**: Learner queries block commitment status over time, observing progression from Processed to Confirmed to Finalized.

### Implementation for User Story 4

- [ ] T086 [US4] Implement commitment tracking in packages/native/src/validator.rs
- [ ] T087 [US4] Implement supermajority vote counting (2/3 stake weight)
- [ ] T088 [US4] Implement fork choice rule (heaviest fork selection)
- [ ] T089 [US4] Implement block finalization with rooted=true status
- [ ] T090 [US4] Create FinalizationService in packages/frontend/src/services/finalization.ts
- [ ] T091 [US4] Implement trackCommitment method with status updates
- [ ] T092 [US4] Create Gate4 component in packages/frontend/src/gates/gate4-block-finalize.tsx
- [ ] T093 [US4] Add block commitment tracking UI with progress visualization
- [ ] T094 [US4] Add commitment level display (Processed/Confirmed/Finalized)
- [ ] T095 [US4] Add vote threshold explanation display
- [ ] T096 [US4] Add // WHY: 2/3 stake weight required for finalization annotation
- [ ] T097 [US4] Add // DECISION: fork choice rule selected heaviest fork annotation
- [ ] T097b [US4] Add // HOW: annotations explaining commitment tracking and finalization mechanics
- [ ] T098 [US4] Add fork visualization with losing fork discard display
- [ ] T098b [US4] Implement insufficient stake for supermajority scenario with annotation

### Game Integration for Gate 4
- [ ] T086b [US4+US6] Create Shipment component in packages/frontend/src/game/Shipment.tsx with // STAGE: block_finalize
- [ ] T086c [US4+US6] Implement shipment dispatch syncing with block finalization events

**Checkpoint**: Gate 4 (Block Finalize) fully functional and testable independently

---

## Phase 7: User Story 5 - Fork Resolution & Network Dynamics (Priority: P2)

**Goal**: Learner creates and observes fork scenarios, understands how Solana resolves competing histories

**Independent Test**: Learner runs multi-validator cluster, creates network partition, observes fork choice, vote switching, and slashing.

### Implementation for User Story 5

- [ ] T099 [US5] Implement multi-validator cluster simulation in packages/native/src/simulation.rs
- [ ] T100 [US5] Implement network partition simulation
- [ ] T101 [US5] Implement competing fork creation
- [ ] T102 [US5] Implement fork choice with heaviest fork rule
- [ ] T103 [US5] Implement slashing condition detection
- [ ] T104 [US5] Implement partition healing and chain convergence
- [ ] T105 [US5] Create ForkService in packages/frontend/src/services/fork.ts
- [ ] T106 [US5] Create Gate5 component in packages/frontend/src/gates/gate5-fork-resolution.tsx
- [ ] T107 [US5] Add fork creation UI with competing chain visualization
- [ ] T108 [US5] Add validator vote display across forks
- [ ] T109 [US5] Add fork choice resolution display
- [ ] T110 [US5] Add slashing condition display with explanation
- [ ] T111 [US5] Create ForkResolution diagram component in packages/frontend/src/components/diagrams/ForkResolution.tsx
- [ ] T112 [US5] Add Mermaid diagram for fork resolution flow
- [ ] T113 [US5] Add // DECISION: heaviest fork (by stake weight) wins annotation
- [ ] T114 [US5] Add // WHY: slashing deters equivocation annotation
- [ ] T114b [US5] Add // HOW: annotations explaining fork resolution and slashing mechanics
- [ ] T115 [US5] Add partition healing and convergence visualization

### Game Integration for Gate 5
- [ ] T099b [US5+US6] Add defective batch (fork) visualization to Factory/Conveyor with // REF: fork_resolution.rs
- [ ] T099c [US5+US6] Implement fork resolution game mechanics with slashing display

**Checkpoint**: Gate 5 (Fork Resolution) fully functional and testable independently

---

## Phase 8: User Story 6 - Manufacturing Game Integration (Priority: P2)

**Goal**: Cross-cutting game state management and persistence (gate-specific components integrated in Phases 3-7)

**Independent Test**: Learner progresses through all 5 gates with unified game state persisted across sessions.

### Implementation for User Story 6

- [ ] T116 [US6] Create GameStateService in packages/frontend/src/services/gameState.ts
- [ ] T117 [US6] Implement game state persistence to localStorage
- [ ] T118 [US6] Create useGameState hook in packages/frontend/src/game/useGameState.ts
- [ ] T119 [US6] Implement game state visualization panel (overview across all gates)
- [ ] T120 [US6] Integrate game components with simulation engine events
- [ ] T120b [US6] Create ShiftSchedule component in packages/frontend/src/game/ShiftSchedule.tsx with // REF: leader_schedule.rs mapping Shift=Leader Schedule
- [ ] T120c [US6] Create QualityMetrics component in packages/frontend/src/game/QualityMetrics.tsx with // REF: vote_tower.rs mapping Quality Metrics=Vote Tower/Lockout

**Checkpoint**: Manufacturing game state management fully integrated

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T132 [P] Add Mermaid.js diagrams for all 5 gates
- [ ] T133 [P] Add color coding: Green=finalized, Yellow=processing, Red=forked, Blue=PoH
- [ ] T134 [P] Add frame-by-frame PoH tick animation
- [ ] T135 [P] Add cross-reference links (// REF: file:line) in all annotations
- [ ] T136 Implement variable speed simulation with slow-motion toggle
- [ ] T136b Implement step-by-step simulation control (manual tick advancement)
- [ ] T137 Implement speed slider (0.25x - 4x) UI control
- [ ] T138 Add private key mask/unmask toggle across all gates
- [ ] T139 Add error display without halting (mirror real Solana behavior)
- [ ] T140 Add gate completion verification and progression logic
- [ ] T141 Add learner progress persistence across sessions
- [ ] T142 Run quickstart.md validation scenarios
- [ ] T143 Perform constitution compliance review
- [ ] T144 Create gate test files in tests/gate/ (gate1.test.ts through gate5.test.ts) — Vitest tests calling native module via napi-rs
- [ ] T144b Add npm scripts in root package.json: "test:gate1": "vitest run tests/gate/gate1.test.ts", etc.
- [ ] T145 Run all gate tests via `npm run test:gate1` through `npm run test:gate5` and verify pass/fail behavior
- [ ] T146 Build mapping fidelity verification script (verify // REF: cross-refs for all game components)
- [ ] T147 Audit all crypto operations for // BYTES: and // WHY: coverage
- [ ] T147b Add performance budget verification: visualization updates within 100ms, PoH animation at target frame rate
- [ ] T148 Implement game state versioning and migration strategy for localStorage/IndexedDB

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 -> P2)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3/US4
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - Integrates with all previous stories

### Within Each User Story

- Core implementation before integration
- Services before UI components
- UI components before diagrams and annotations
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members
- Polish phase tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all crypto service tasks together:
Task: "Implement Ed25519Service in packages/frontend/src/services/crypto.ts using @noble/ed25519"
Task: "Implement keypair generation with annotation support in packages/frontend/src/services/crypto.ts"
Task: "Implement message signing with // WHY: annotation in packages/frontend/src/services/crypto.ts"
Task: "Implement signature verification with // BYTES: annotation in packages/frontend/src/services/crypto.ts"

# Launch all Gate1 UI tasks together:
Task: "Create Gate1 component in packages/frontend/src/gates/gate1-tx-signing.tsx"
Task: "Add keypair generation UI with public/private key display"
Task: "Add private key mask/unmask toggle with security warning"
Task: "Add message signing UI with signature display"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Deploy/Demo (MVP!)
3. Add User Story 2 -> Test independently -> Deploy/Demo
4. Add User Story 3 -> Test independently -> Deploy/Demo
5. Add User Story 4 -> Test independently -> Deploy/Demo
6. Add User Story 5 -> Test independently -> Deploy/Demo
7. Add User Story 6 -> Test independently -> Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Transaction Signing)
   - Developer B: User Story 2 (RPC Processing)
   - Developer C: User Story 3 (Validator Process)
3. Stories complete and integrate independently
4. Developers can then work on User Stories 4-6 in parallel

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

| Phase | Tasks | Parallel Tasks |
|-------|-------|----------------|
| Setup | 12 | 4 |
| Foundational | 25 | 0 |
| US1 (Tx Signing) | 19 | 0 |
| US2 (RPC Submit) | 16 | 0 |
| US3 (Validator Process) | 21 | 0 |
| US4 (Block Finalize) | 14 | 0 |
| US5 (Fork Resolution) | 18 | 0 |
| US6 (Game Integration) | 13 | 0 |
| Polish | 19 | 8 |
| **Total** | **157** | **12** |
