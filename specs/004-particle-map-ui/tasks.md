---

description: "Task list for Particle Bubble Map UI feature"
---

# Tasks: Particle Bubble Map UI

**Input**: Design documents from `/specs/004-particle-map-ui/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Phase 9 (Migration) is organized by incremental steps for safe, non-breaking transitions.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

<!--===========================================================================
  IMPORTANT: The tasks below are ACTUAL tasks for this feature based on:
  - User stories from spec.md (with their priorities P1, P2)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Interfaces from contracts/
  - Decisions from research.md

  Tasks ARE organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
===========================================================================-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Add `force-graph` dependency to package.json and install
- [x] T002 [P] Create shared ViewMode type in `src/types/viewMode.ts`
- [x] T003 [P] Extract CATEGORY_COLORS and SUB_CATEGORY_COLORS to `src/services/componentTheme.ts` with hex twins
- [x] T004 [P] Create connection explanations composer in `src/services/connectionExplanations.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Implement graph builder `useParticleGraph.ts` in `src/components/architecture/ParticleMap/` with annotated execution comments per Principle III
- [x] T006 Implement zone mapping and cluster forces in `src/components/architecture/ParticleMap/forces/` with annotated execution comments per Principle III
- [x] T007 Implement canvas wrapper `useForceGraphInstance.ts` in `src/components/architecture/ParticleMap/` with annotated execution comments per Principle III
- [x] T008 Implement bubble painter in `src/components/architecture/ParticleMap/painting/bubblePainter.ts` with annotated execution comments per Principle III
- [x] T009 Implement spine particle config in `src/components/architecture/ParticleMap/painting/spineParticles.ts` with annotated execution comments per Principle III
- [x] T010 Implement camera module in `src/components/architecture/ParticleMap/camera.ts` with annotated execution comments per Principle III
- [x] T011 Implement motion preferences reader in `src/components/architecture/ParticleMap/motionPreferences.ts` with annotated execution comments per Principle III
- [x] T012 Extend data-consistency tests in `tests/data-consistency.test.ts` with inventory parity checks
- [x] T042 Add annotated execution comments (`// WHY:`, `// HOW:`, `// REF:`, `// DECISION:`, `// BYTES:`) to all new modules in `src/components/architecture/ParticleMap/`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Living Validator Constellation (Priority: P1) 🎯 MVP

**Goal**: Every component and sub-component appears as exactly one bubble, with continuous ambient motion and transaction particles streaming along the lifecycle path

**Independent Test**: Open the new mode, confirm within seconds that the scene is in motion and that every modeled component and sub-component is present exactly once, clustered correctly

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [P] [US1] Create unit tests for graph builder and zone mapping in `tests/particleMap.test.ts`

### Implementation for User Story 1

- [x] T014 [P] [US1] Create ParticleMapView shell in `src/components/architecture/ParticleMap/ParticleMapView.tsx`
- [x] T015 [US1] Integrate ParticleMapView into ArchitectureView mode switch in `src/components/architecture/ArchitectureView.tsx`
- [x] T016 [US1] Add Particles toggle button in `src/App.tsx`
- [x] T017 [US1] Implement ambient motion and particle streaming via force-graph configuration in `src/components/architecture/ParticleMap/useForceGraphInstance.ts`
- [x] T018 [US1] Verify inventory parity with automated consistency checks

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Touch Reveals Meaning (Priority: P1)

**Goal**: Hovering produces immediate animation and neighborhood emphasis; clicking opens existing audited educational material

**Independent Test**: Hover ten random bubbles and observe consistent animated feedback; click ten random bubbles and connections and confirm correct, cited explanations open

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️


### Implementation for User Story 2

- [x] T019 [P] [US2] Add unit tests for connection explanation composer in `tests/particleMap.test.ts`
- [x] T020 [US2] Implement node hover callbacks in `useForceGraphInstance.ts`
- [x] T021 [US2] Implement link hover callbacks in `useForceGraphInstance.ts`
- [x] T022 [US2] Add bubble emphasis and neighbor highlighting in `bubblePainter.ts`
- [x] T023 [US2] Implement node click to open ZoomPanel in `ParticleMapView.tsx`
- [x] T024 [US2] Implement link click to open connection explanation popover in `src/components/architecture/ParticleMap/ConnectionPopover.tsx` (new) and integrate into `useForceGraphInstance.ts`
- [x] T025 [US2] Style connection explanation popover using annotation tokens in `src/components/architecture/ParticleMap/ConnectionPopover.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - One Tour, Every View (Priority: P2)

**Goal**: Guided tour works in particle map with camera focusing on each step's bubble

**Independent Test**: Start the tour in each of the three view modes and walk all steps end-to-end; in the particle map confirm each step focuses its component

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [x] T026 [P] [US3] Add unit tests for camera focus logic in `tests/particleMap.test.ts`

### Implementation for User Story 3

- [x] T027 [US3] Implement tour step binding to camera focus in `ParticleMapView.tsx`
- [x] T028 [US3] Implement tour step highlighting and dimming of non-focused clusters
- [x] T029 [US3] Fix step-advance defect in `App.tsx` (cap at 17 → 21 steps)
- [x] T030 [US3] Ensure manual Next/Back navigation highlights correctly in `src/App.tsx` and `src/components/SimulationSidebar.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Three Modes, One Truth (Priority: P2)

**Goal**: Consistent content across all three view modes; no contradictory information

**Independent Test**: Cross-check the three modes against the shared component/connection/tour data and run the automated consistency checks

### Tests for User Story 4 (OPTIONAL - only if tests requested) ⚠️

- [x] T031 [P] [US4] Add cross-mode consistency tests in `tests/particleMap.test.ts`

### Implementation for User Story 4

- [x] T032 [US4] Verify lifecycle-state coloring conventions match across modes in `src/services/componentTheme.ts` and `src/components/architecture/ParticleMap/painting/bubblePainter.ts`
- [x] T033 [US4] Ensure educational content identical across modes (FR-010) in `src/services/connectionExplanations.ts` and `src/components/ZoomPanel.tsx`
- [x] T034 [US4] Run automated data-consistency suite for particle map bubble set via `npm test` (covers `tests/data-consistency.test.ts`)
- [ ] T035 [US4] Perform side-by-side manual verification of all three modes

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T036 [P] Implement reduced-motion preference handling in `motionPreferences.ts`
- [x] T037 [P] Add responsive layout adjustments for small viewports in `src/components/architecture/ParticleMap/ParticleMapView.tsx` and `src/styles/particle-map.css` (if needed)
- [x] T038 Code cleanup and refactoring per Principle VIII across `src/components/architecture/ParticleMap/` modules
- [x] T039 Performance optimization for smooth animation (SC-004) in `src/components/architecture/ParticleMap/useForceGraphInstance.ts` and `painting/bubblePainter.ts`
- [x] T040 [P] Update quickstart.md with final validation scenarios
- [ ] T041 Run quickstart.md validation end-to-end
- [x] T043 [P] Add performance benchmark for mount-to-motion ≤ 5 s (SC-002) in `tests/particleMap.test.ts`
- [x] T044 [P] Add citation-link resolution test for 13/13 pinned refs (SC-003) in `tests/particleMap.test.ts`
- [x] T045 [P] Add 60-second soak test for frame pacing (SC-004) in `tests/particleMap.test.ts`
- [x] T046 [P] Configure force-graph pan/zoom and label visibility thresholds (FR-011) in `src/components/architecture/ParticleMap/useForceGraphInstance.ts`

---

## Phase 8: Lint Cleanup & Polish

**Purpose**: Resolve all linting and type errors introduced or exposed by this feature

- [x] T047 Fix all ESLint errors in new ParticleMap modules (`src/components/architecture/ParticleMap/`)
- [x] T048 Fix all TypeScript strict mode warnings across new modules
- [x] T049 Fix pre-existing lint errors in `SimulationSidebar.tsx` and `TransactionBubble.tsx` if they affect new code paths
- [x] T050 Run `npm run lint` and `npx tsc --noEmit` clean — zero errors, zero warnings in new code

---

## Phase 9: force-graph → Raw D3 + Canvas Migration

**Purpose**: Replace the force-graph library with raw D3 + Canvas for full rendering control

**⚠️ NOTE**: This phase was added after initial implementation revealed force-graph's opaque rendering internals caused persistent bugs. All force functions, data builders, painters, and UI components from the force-graph era are reused unchanged — only the simulation/rendering layer is replaced.

> **Note**: Phases 1–8 implement the particle map using the `force-graph` library. Phase 9 replaces
> the rendering layer with raw D3 + Canvas. All data builders, forces, painters, and UI components
> created in Phases 1–8 are reused unchanged — only the simulation/rendering hook is swapped.

### Step 1: Clean Up Dead Code (no behavior change)

- [x] T051 Delete `src/components/architecture/ParticleMap/camera.ts` (dead — never imported by anything)
- [x] T052 Remove `clusterForces()` factory function from `forces/clusterForces.ts` (dead — never imported)
- [x] T053 Remove `categoryHex()` function from `services/componentTheme.ts` (dead — never imported)
- [x] T054 Remove dead CSS classes from `styles/particle-map.css`: `.particle-map-zoom-panel`, `.particle-map-popover`, `.particle-map-label-abbreviated`
- [x] T055 Remove `isSmallViewport` state + `particle-map-small` class logic from `ParticleMapView.tsx` (class applied but no CSS definition)

**Checkpoint**: tsc, lint, tests pass unchanged

### Step 2: Install New Dependencies

- [x] T056 Add `d3-force`, `d3-zoom`, `d3-quadtree` to dependencies
- [x] T057 Add `@types/d3-force`, `@types/d3-zoom`, `@types/d3-quadtree` to devDependencies

**Checkpoint**: tsc clean, no new errors

### Step 3: Create `useForceSimulation.ts` (new file, nothing uses it yet)

- [x] T058 Create `src/components/architecture/ParticleMap/useForceSimulation.ts` — raw D3 force simulation + canvas render loop + zoom/hit detection
- [x] T059 Implement canvas creation and container attachment with ResizeObserver
- [x] T060 Implement d3.forceSimulation setup with existing forces (zone, cluster, ambient) + forceLink, forceCenter, forceCollide
- [x] T061 Implement d3.zoom for pan/zoom interaction
- [x] T062 Implement requestAnimationFrame render loop (clear → zoom transform → draw links → draw nodes)
- [x] T063 Implement d3.quadtree for hover/click hit detection
- [x] T064 Implement animated directional particles along onSpine links
- [x] T065 Expose ForceGraphController API (setData, focusComponent, resetView, setHover, destroy)

**Checkpoint**: tsc clean, app still uses old hook

### Step 4: Switch and Remove Old Hook

- [x] T066 Update `ParticleMapView.tsx` import from `useForceGraphInstance` to `useForceSimulation`
- [ ] T067 Verify visual rendering: bubbles visible, interactive, pan/zoom works
- [x] T068 Delete `src/components/architecture/ParticleMap/useForceGraphInstance.ts`
- [x] T069 Remove `force-graph` from package.json dependencies

**Checkpoint**: No references to force-graph remain in source

### Step 5: Update Tests and Docs

- [x] T070 Review and update `tests/particleMap.test.ts` for new simulation API
- [x] T071 Update `specs/004-particle-map-ui/plan.md` with new technical approach
- [x] T072 Update `specs/004-particle-map-ui/research.md` with D9 migration decision

**Checkpoint**: Full verification — tsc, lint, tests, visual

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 7)**: Depends on all desired user stories being complete
- **Lint Cleanup (Phase 8)**: Depends on Polish completion
- **Migration (Phase 9)**: Depends on Phase 8 completion — replaces rendering layer

### Migration Execution Order

Phase 9 tasks MUST be executed in order (Steps 1→2→3→4→5). Within each step, tasks marked [P] can run in parallel. Each step has a checkpoint that must pass before proceeding to the next.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Create unit tests for graph builder and zone mapping in tests/particleMap.test.ts"

# Launch all models for User Story 1 together:
Task: "Create ParticleMapView shell in src/components/architecture/ParticleMap/ParticleMapView.tsx"
Task: "Integrate ParticleMapView into ArchitectureView mode switch in src/components/architecture/ArchitectureView.tsx"
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

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence