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

- [x] T001 Initialize monorepo structure with packages/frontend, packages/native, packages/shared directories
- [x] T002 Configure root package.json with workspace settings for monorepo
- [x] T003 Initialize packages/frontend with Vite + React + TypeScript template
- [x] T004 Configure packages/frontend/package.json with dependencies: react, vite, typescript, @mermaid-js/mermaid-react, @noble/ed25519, vitest
- [x] T005 Initialize packages/native with Rust Cargo.toml and napi-rs configuration
- [x] T006 Configure packages/native/Cargo.toml with dependencies: solana-poh, solana-runtime, solana-ledger, solana-vote-program, napi, napi-derive
- [x] T007 Create packages/shared/types/index.ts with shared TypeScript interfaces
- [x] T008 Configure TypeScript path aliases in packages/frontend/tsconfig.json and packages/native/tsconfig.json
- [x] T009 [P] Setup ESLint and Prettier configuration across all packages
- [x] T010 [P] Configure Vitest in packages/frontend for unit testing
- [x] T011 Create tests/ directory structure with unit/, integration/, gate/ subdirectories
- [x] T012 Configure git hooks with husky for pre-commit linting
- [x] T012b Implement architectural boundary lint rule in packages/frontend/eslint-plugin-solana-learn/rules/no-direct-validator-import.ts
- [x] T012c Add ESLint rule to packages/frontend/.eslintrc.js: "solana-learn/no-direct-validator-import": "error"
- [x] T012d Create integration test in tests/integration/arch-boundary.test.ts that attempts direct Client→Validator import and expects failure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 Define all TypeScript types in packages/shared/types/index.ts (Learner, GateProgress, GateState, GateMetrics, SimulationState, Transaction, Instruction, AccountMeta, Block, Vote, Validator, Keypair, Annotation, GameState, FactoryState, ConveyorState, QCStationState, ShipmentRecord, DefectiveBatch — matching data-model.md entities)
- [x] T014 Implement storage service in packages/frontend/src/services/storage.ts (localStorage + IndexedDB) with // STAGE: storage annotation
- [x] T015 Implement annotation service in packages/frontend/src/services/annotations.ts with // STAGE: annotation_service annotation
- [x] T016 Implement simulation engine interface in packages/frontend/src/services/simulation.ts with // STAGE: simulation_interface annotation
- [x] T017 Create useSimulation hook in packages/frontend/src/hooks/useSimulation.ts
- [x] T018 Create useAnnotations hook in packages/frontend/src/hooks/useAnnotations.ts
- [x] T019 Create useProgress hook in packages/frontend/src/hooks/useProgress.ts
- [x] T020 Implement Rust native module entry point in packages/native/src/lib.rs
- [x] T021 Implement simulation.rs with validator simulation core logic
- [x] T022 Implement validator.rs with validator state management
- [x] T023 Implement rpc.rs with RPC simulation layer
- [x] T024 Implement poh.rs with PoH hash chain simulation
- [x] T025 Create napi-rs bindings in packages/native/src/lib.rs for TypeScript interop
- [x] T025b Define napi-rs TypeScript interface in packages/shared/types/native.ts (simulation, validator, rpc, poh APIs + contract types: SimulationResult, PohTick, SlashingEvent, ValidatorConfig, ProcessResult, ValidatorState)
- [x] T025c Define diagram data contracts in packages/shared/types/diagrams.ts (TransactionFlowData, BlockLifecycleData, ForkResolutionData)
- [x] T026 Build and test native module compilation with npm run build:native
- [x] T026b Write Rust unit tests for packages/native/src/poh.rs (PoH hash chain correctness)
- [x] T026c Write Rust unit tests for packages/native/src/validator.rs (validator state transitions)
- [x] T026d Write Rust unit tests for packages/native/src/rpc.rs (RPC simulation layer)
- [x] T026e Write Rust unit tests for packages/native/src/simulation.rs (simulation core logic)
- [x] T026f Verify all Rust tests pass via `cargo test` in packages/native/
- [x] T027 Create base React App component in packages/frontend/src/App.tsx
- [x] T028 Create Dashboard component skeleton in packages/frontend/src/components/Dashboard.tsx
- [x] T029 Create GateSelector component in packages/frontend/src/components/GateSelector.tsx
- [x] T030 Create AnnotationPanel component in packages/frontend/src/components/AnnotationPanel.tsx
- [x] T030b [P] Implement annotation side panel with live feed and clickable cross-references
- [x] T030c [P] Implement inline tooltips on diagram nodes/edges
- [x] T030d [P] Implement step-by-step execution log with expandable annotations
- [x] T031 Create ExecutionLog component in packages/frontend/src/components/ExecutionLog.tsx
- [x] T032 Create SimulationControls component in packages/frontend/src/components/SimulationControls.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Transaction Signing & Submission (Priority: P1) MVP

**Goal**: Learner generates keypair, signs transaction, submits via RPC, understands client-side lifecycle

**Independent Test**: Learner runs CLI command that generates keypair, signs message, verifies signature, builds transaction, submits via RPC. Output shows each step with annotations.

### Implementation for User Story 1

- [x] T033 [US1] Implement Ed25519Service in packages/frontend/src/services/crypto.ts using @noble/ed25519
- [x] T034 [US1] Implement keypair generation with annotation support in packages/frontend/src/services/crypto.ts
- [x] T035 [US1] Implement message signing with // WHY: annotation in packages/frontend/src/services/crypto.ts
- [x] T036 [US1] Implement signature verification with // BYTES: annotation in packages/frontend/src/services/crypto.ts
- [x] T037 [US1] Create TransactionBuilder service in packages/frontend/src/services/transaction.ts
- [x] T038 [US1] Implement transaction serialization with base58 encoding
- [x] T039 [US1] Create Gate1 component in packages/frontend/src/gates/gate1-tx-signing.tsx
- [x] T040 [US1] Add keypair generation UI with public/private key display
- [x] T041 [US1] Add private key mask/unmask toggle with security warning
- [x] T042 [US1] Add message signing UI with signature display
- [x] T043 [US1] Add signature verification UI with result display
- [x] T044 [US1] Create TransactionFlow diagram component in packages/frontend/src/components/diagrams/TransactionFlow.tsx
- [x] T045 [US1] Add Mermaid diagram for transaction signing flow
- [x] T046 [US1] Integrate useAnnotations hook in Gate1 for live annotation feed
- [x] T047 [US1] Add // STAGE: keypair_generation annotation at function entry
- [x] T048 [US1] Add // WHY: ed25519 signing proves ownership annotation on signing lines
- [x] T049 [US1] Add // BYTES: hex annotations for key material and signatures
- [x] T050 [US1] Add // REF: cross-references linking crypto operations
- [x] T050b [US1] Add // HOW: annotations explaining implementation mechanics at each crypto step

### Game Integration for Gate 1
- [x] T033b [US1+US6] Create Factory component skeleton in packages/frontend/src/game/Factory.tsx with // REF: client_signing.rs
- [x] T033c [US1+US6] Implement raw material (transaction) creation in Factory with // REF: transaction.rs annotation

**Checkpoint**: Gate 1 (Transaction Signing) fully functional and testable independently

---

## Phase 4: User Story 2 - RPC Processing & Simulation (Priority: P1)

**Goal**: Learner sees how RPC nodes receive, simulate, and forward transactions

**Independent Test**: Learner submits transaction to RPC, observes simulation results, preflight checks, and subscription events with annotations.

### Implementation for User Story 2

- [x] T051 [US2] Implement RPC simulation layer in packages/native/src/rpc.rs
- [x] T052 [US2] Implement transaction simulation with compute units and logs
- [x] T053 [US2] Implement preflight checks (signature verification, blockhash expiry)
- [x] T054 [US2] Implement commitment level tracking (Processed, Confirmed, Finalized)
- [x] T055 [US2] Create RPC service interface in packages/frontend/src/services/rpc.ts
- [x] T056 [US2] Implement submitTransaction method with annotation callbacks
- [x] T057 [US2] Implement simulateTransaction method with result formatting
- [x] T058 [US2] Implement pollStatus method with commitment level display
- [x] T059 [US2] Create Gate2 component in packages/frontend/src/gates/gate2-rpc-submit.tsx
- [x] T060 [US2] Add transaction submission UI with RPC response display
- [x] T061 [US2] Add simulation results display with compute units and logs
- [x] T062 [US2] Add commitment level polling UI with progress indicators
- [x] T063 [US2] Add // STAGE: rpc_submit annotation on RPC operations
- [x] T064 [US2] Add // WHY: RPC forwards to leader via gossip annotation
- [x] T065 [US2] Add commitment level explanations (Processed/Confirmed/Finalized)
- [x] T065f [US2] Add // HOW: annotations explaining RPC simulation and forwarding mechanics
- [x] T065b [US2] Implement RPC unreachable error handling with retry logic and annotation
- [x] T065c [US2] Implement blockhash expiry detection with // DECISION: annotation
- [x] T065d [US2] Implement duplicate transaction (same signature) detection with // WHY: annotation
- [x] T065e [US2] Implement invalid transaction error handling (insufficient funds, nonce mismatch) with annotations

### Game Integration for Gate 2
- [x] T051b [US2+US6] Create Conveyor component in packages/frontend/src/game/Conveyor.tsx with // STAGE: poh_tick
- [x] T051c [US2+US6] Implement conveyor movement syncing with RPC simulation events

**Checkpoint**: Gate 2 (RPC Submit) fully functional and testable independently

---

## Phase 5: User Story 3 - Validator Execution & Block Production (Priority: P1)

**Goal**: Learner runs local validator, observes transaction processing, block production, and voting

**Independent Test**: Learner submits transactions, observes validator logs showing execution, PoH tick progression, block packing, and vote submission.

### Implementation for User Story 3

- [x] T066 [US3] Implement validator execution logic in packages/native/src/validator.rs
- [x] T067 [US3] Implement banking stage for transaction processing
- [x] T068 [US3] Implement PoH tick generation in packages/native/src/poh.rs
- [x] T069 [US3] Implement block production with entries and transactions
- [x] T070 [US3] Implement leader selection with stake-weighted schedule
- [x] T071 [US3] Implement vote submission with vote tower lockout
- [x] T072 [US3] Create ValidatorService in packages/frontend/src/services/validator.ts
- [x] T073 [US3] Implement startValidator, stopValidator, getValidatorState methods
- [x] T074 [US3] Create Gate3 component in packages/frontend/src/gates/gate3-validator-process.tsx
- [x] T075 [US3] Add validator startup UI with initialization logs
- [x] T076 [US3] Add transaction submission to validator UI
- [x] T077 [US3] Add validator execution logs display
- [x] T078 [US3] Add block production visualization with entries and transactions
- [x] T079 [US3] Add vote submission display with lockout and tower depth
- [x] T080 [US3] Create BlockLifecycle diagram component in packages/frontend/src/components/diagrams/BlockLifecycle.tsx
- [x] T081 [US3] Add Mermaid diagram for validator processing flow
- [x] T082 [US3] Add // STAGE: validator_execute annotation at execution
- [x] T083 [US3] Add // WHY: Validator executes transactions sequentially annotation
- [x] T084 [US3] Add // DECISION: leader selected via stake-weighted schedule annotation
- [x] T085 [US3] Add // DECISION: vote tower depth=32 lockout annotation
- [x] T085b [US3] Add // HOW: annotations explaining validator execution and block production mechanics

### Game Integration for Gate 3
- [x] T066b [US3+US6] Create QCStation component in packages/frontend/src/game/QCStation.tsx with // DECISION: vote tower lockout=32
- [x] T066c [US3+US6] Implement QC inspection syncing with validator vote events

**Checkpoint**: Gate 3 (Validator Process) fully functional and testable independently

---

## Phase 6: User Story 4 - Block Finalization & Commitment (Priority: P2)

**Goal**: Learner tracks block from production to finalization, understands commitment levels and fork choice

**Independent Test**: Learner queries block commitment status over time, observing progression from Processed to Confirmed to Finalized.

### Implementation for User Story 4

- [x] T086 [US4] Implement commitment tracking in packages/native/src/validator.rs
- [x] T087 [US4] Implement supermajority vote counting (2/3 stake weight)
- [x] T088 [US4] Implement fork choice rule (heaviest fork selection)
- [x] T089 [US4] Implement block finalization with rooted=true status
- [x] T090 [US4] Create FinalizationService in packages/frontend/src/services/finalization.ts
- [x] T091 [US4] Implement trackCommitment method with status updates
- [x] T092 [US4] Create Gate4 component in packages/frontend/src/gates/gate4-block-finalize.tsx
- [x] T093 [US4] Add block commitment tracking UI with progress visualization
- [x] T094 [US4] Add commitment level display (Processed/Confirmed/Finalized)
- [x] T095 [US4] Add vote threshold explanation display
- [x] T096 [US4] Add // WHY: 2/3 stake weight required for finalization annotation
- [x] T097 [US4] Add // DECISION: fork choice rule selected heaviest fork annotation
- [x] T097b [US4] Add // HOW: annotations explaining commitment tracking and finalization mechanics
- [x] T098 [US4] Add fork visualization with losing fork discard display
- [x] T098b [US4] Implement insufficient stake for supermajority scenario with annotation

### Game Integration for Gate 4
- [x] T086b [US4+US6] Create Shipment component in packages/frontend/src/game/Shipment.tsx with // STAGE: block_finalize
- [x] T086c [US4+US6] Implement shipment dispatch syncing with block finalization events

**Checkpoint**: Gate 4 (Block Finalize) fully functional and testable independently

---

## Phase 7: User Story 5 - Fork Resolution & Network Dynamics (Priority: P2)

**Goal**: Learner creates and observes fork scenarios, understands how Solana resolves competing histories

**Independent Test**: Learner runs multi-validator cluster, creates network partition, observes fork choice, vote switching, and slashing.

### Implementation for User Story 5

- [x] T099 [US5] Implement multi-validator cluster simulation in packages/native/src/simulation.rs
- [x] T100 [US5] Implement network partition simulation
- [x] T101 [US5] Implement competing fork creation
- [x] T102 [US5] Implement fork choice with heaviest fork rule
- [x] T103 [US5] Implement slashing condition detection
- [x] T104 [US5] Implement partition healing and chain convergence
- [x] T105 [US5] Create ForkService in packages/frontend/src/services/fork.ts
- [x] T106 [US5] Create Gate5 component in packages/frontend/src/gates/gate5-fork-resolution.tsx
- [x] T107 [US5] Add fork creation UI with competing chain visualization
- [x] T108 [US5] Add validator vote display across forks
- [x] T109 [US5] Add fork choice resolution display
- [x] T110 [US5] Add slashing condition display with explanation
- [x] T111 [US5] Create ForkResolution diagram component in packages/frontend/src/components/diagrams/ForkResolution.tsx
- [x] T112 [US5] Add Mermaid diagram for fork resolution flow
- [x] T113 [US5] Add // DECISION: heaviest fork (by stake weight) wins annotation
- [x] T114 [US5] Add // WHY: slashing deters equivocation annotation
- [x] T114b [US5] Add // HOW: annotations explaining fork resolution and slashing mechanics
- [x] T115 [US5] Add partition healing and convergence visualization

### Game Integration for Gate 5
- [x] T099b [US5+US6] Add defective batch (fork) visualization to Factory/Conveyor with // REF: fork_resolution.rs
- [x] T099c [US5+US6] Implement fork resolution game mechanics with slashing display

**Checkpoint**: Gate 5 (Fork Resolution) fully functional and testable independently

---

## Phase 8: User Story 6 - Manufacturing Game Integration (Priority: P2)

**Goal**: Cross-cutting game state management and persistence (gate-specific components integrated in Phases 3-7)

**Independent Test**: Learner progresses through all 5 gates with unified game state persisted across sessions.

### Implementation for User Story 6

- [x] T116 [US6] Create GameStateService in packages/frontend/src/services/gameState.ts
- [x] T117 [US6] Implement game state persistence to localStorage
- [x] T118 [US6] Create useGameState hook in packages/frontend/src/game/useGameState.ts
- [x] T119 [US6] Implement game state visualization panel (overview across all gates)
- [x] T120 [US6] Integrate game components with simulation engine events
- [x] T120b [US6] Create ShiftSchedule component in packages/frontend/src/game/ShiftSchedule.tsx with // REF: leader_schedule.rs mapping Shift=Leader Schedule
- [x] T120c [US6] Create QualityMetrics component in packages/frontend/src/game/QualityMetrics.tsx with // REF: vote_tower.rs mapping Quality Metrics=Vote Tower/Lockout

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
| Convergence 1 | 23 | 0 |
| Convergence 2 | 16 | 0 |
| **Total** | **196** | **12** |

---

## Phase 10: Convergence

**Purpose**: Close gaps between spec/plan/tasks and actual codebase implementation

- [x] T149 CRITICAL: Wire Dashboard.tsx to render gate components (Gate1TxSigning through Gate5ForkResolution) based on selectedGate instead of placeholder text per FR-006a (missing)
- [x] T150 Create packages/frontend/src/services/crypto.ts with Ed25519Service (keypair generation, signing, verification with annotation callbacks) per T033-T036 (missing)
- [x] T151 Create packages/frontend/src/services/transaction.ts with TransactionBuilder (transaction creation, serialization, base58 encoding) per T037-T038 (missing)
- [x] T152 Create packages/frontend/src/services/validator.ts with ValidatorService (startValidator, stopValidator, getValidatorState) per T072-T073 (missing)
- [x] T153 Create packages/frontend/src/services/finalization.ts with FinalizationService (trackCommitment, commitment progression) per T090-T091 (missing)
- [x] T154 Create packages/frontend/src/services/fork.ts with ForkService (fork creation, resolution, slashing detection) per T105 (missing)
- [x] T155 Create packages/frontend/src/services/gameState.ts with GameStateService (game state CRUD, persistence orchestration) per T116 (missing)
- [x] T156 Create packages/frontend/src/game/ShiftSchedule.tsx mapping Shift=Leader Schedule with // REF: leader_schedule.rs annotation per T120b (missing)
- [x] T157 Create packages/frontend/src/game/QualityMetrics.tsx mapping Quality Metrics=Vote Tower/Lockout with // REF: vote_tower.rs annotation per T120c (missing)
- [x] T158 Create packages/shared/types/native.ts with napi-rs TypeScript interfaces (SimulationResult, PohTick, SlashingEvent, ValidatorConfig, ProcessResult, ValidatorState) per T025b (missing)
- [x] T159 Create packages/shared/types/diagrams.ts with diagram data contracts (TransactionFlowData, BlockLifecycleData, ForkResolutionData) per T025c (missing)
- [x] T160 Add data-testid="gate{N}-visualization" attributes to all 5 gate components per FR-008 (missing)
- [x] T161 Create Gate1Diagram.tsx through Gate5Diagram.tsx components per FR-008 naming convention (missing)
- [ ] T162 Import @mermaid-js/mermaid-react and render actual SVG diagrams instead of pre strings in TransactionFlow.tsx, BlockLifecycle.tsx, ForkResolution.tsx per FR-008 (missing)
- [x] T163 Create logs/ directory and implement JSONL execution log writing for each gate (logs/gate{N}-execution.log) per FR-008 (missing)
- [x] T164 Wire AnnotationPanel onAnnotationClick to show cross-reference details and navigate to source refs per FR-012 (partial)
- [x] T165 Add semantic color coding (Green=finalized, Yellow=processing, Red=forked, Blue=PoH) to Gates 1-3 visualizations per FR-003 (partial)
- [x] T166 Implement frame-by-frame PoH tick animation with requestAnimationFrame in Conveyor component per FR-003 (partial)
- [x] T167 Add "Step Forward" button to SimulationControls for manual tick advancement per T136b (partial)
- [x] T168 Connect speed slider in Dashboard to actual simulation engine instead of no-op handlers per T137 (partial)
- [x] T169 Rewrite gate2.test.ts through gate5.test.ts to import and exercise actual services instead of inline mocks per T144 (missing)
- [x] T170 Add npm scripts test:gate1 through test:gate5 to root package.json per T144b (missing)
- [x] T171 Add clickable // REF: cross-reference links in AnnotationPanel that navigate to source file locations per T135 (missing)

---

## Phase 11: Convergence

**Purpose**: Close remaining gaps between spec/plan/tasks and actual codebase implementation

- [x] T172 Import @mermaid-js/mermaid-react and render actual SVG diagrams instead of pre strings in TransactionFlow.tsx, BlockLifecycle.tsx, ForkResolution.tsx, Gate2Diagram.tsx, Gate4Diagram.tsx per FR-008 (missing)
- [x] T173 Add private key mask/unmask toggle with security warning to Gate2 through Gate5 components per T138 (missing)
- [x] T174 Create user-facing error display component and wire to all gate components for error-without-halting behavior per T139 (missing)
- [x] T175 Wire Dashboard.tsx to useProgress hook so handleGateComplete calls completeGate and gate progression persists per T140 (partial)
- [x] T176 Wire Dashboard.tsx to useProgress and useGameState hooks for learner progress and game state persistence across sessions per T141 (partial)
- [x] T177 Wire executionLog service to gate components so annotations are written to logs/gate{N}-execution.log per FR-008 (missing)
- [x] T178 Run all gate tests via npm run test:gate1 through npm run test:gate5 and verify pass/fail behavior per T145 (missing)
- [x] T179 Apply consistent semantic color coding (Green=finalized, Yellow=processing, Red=forked, Blue=PoH) across all diagram and game visualization components per T133 (partial)
- [x] T180 Replace hardcoded fake sourceRef values in annotation calls with actual file paths and line numbers per T135 (partial)
- [x] T181 Wire Dashboard simulation controls (slow-motion toggle, step button) to useSimulation hook instead of no-op handlers per T136/T136b (partial)
- [x] T182 Add inline tooltips on diagram nodes/edges for FR-012 three-view annotation compliance (missing)
- [ ] T183 Run quickstart.md validation scenarios and document results per T142 (missing)
- [ ] T184 Perform constitution compliance review against all 6 core principles and document findings per T143 (missing)
- [ ] T185 Build mapping fidelity verification script to validate // REF: cross-refs for all game components per T146 (missing)
- [ ] T186 Implement performance budget verification for visualization updates within 100ms and PoH animation at target frame rate per T147b (missing)
- [ ] T187 Add game state versioning and migration strategy to storage service for localStorage/IndexedDB per T148 (missing)
