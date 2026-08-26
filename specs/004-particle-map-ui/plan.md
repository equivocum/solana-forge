# Implementation Plan: Particle Bubble Map UI

**Branch**: `feature/11-particle-map-ui` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-particle-map-ui/spec.md` (clarified across two sessions, 2026-08-26)

## Summary

Add a third view mode — a living particle/bubble map of the validator: every component and sub-component renders as an animated bubble clustered near its parent inside soft lifecycle-ordered zones; transaction particles stream continuously along the lifecycle path; pan/zoom navigation with progressive label disclosure; hovering animates and highlights neighborhoods; clicking opens the existing audited educational panels (ZoomPanel) or a connection-hop explanation. The guided tour works in all three modes by flying the camera to each step's bubble.

Technical approach: render with the **force-graph** canvas library (d3-force physics underneath) wrapped in one thin React module; reuse the app's existing view contract (6 props), ZoomPanel, useAnnotations, SimulationSidebar plumbing, and data exports unchanged. Extract shared color maps into a common theme module consumed by both DOM views and the canvas painter (Principle VIII).

## Technical Context

**Language/Version**: TypeScript 5.9 (strict) on React 18.3, ES2020 target

**Primary Dependencies**: Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`, no config file), vitest 3 + Testing Library/jsdom. **New**: `force-graph` (~50 KB, MIT, canvas renderer + d3-force engine, maintained, 2.1k★)

**Storage**: N/A (no persistence added; existing IndexedDB annotation service reused as-is)

**Testing**: vitest (jsdom env, `tests/**/*.test.ts`) — extend `tests/data-consistency.test.ts` pattern; pure layout/theme functions unit-testable without canvas

**Target Platform**: Desktop web (existing app baseline), pointer/touch input, dark theme

**Performance Goals**: Smooth continuous animation at full dataset (~63 bubbles, ~55 links): steady frame pacing on an ordinary laptop for 60 s sessions (SC-004); motion visible ≤5 s after mount (SC-002)

**Constraints**: Pointer-only this feature (keyboard deferred per spec clarification); reduced-motion preference must calm the scene (FR-015→FR-013 group); no new educational copy (reuse audited text verbatim); ≤500-line change units (constitution VII)

**Scale/Scope**: 1 new view mode, ~8–10 new modules under `src/components/architecture/particle/`, 2 shared extractions, 1 dependency addition, test suite extension

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Progressive Complexity | ✅ Pass | Tour narrative order preserved; zones follow submission→finalization journey |
| II. Visual-First Learning | ✅ Pass | This feature *is* a visualization; Principle IX raises the bar further |
| III. Annotated Execution | ✅ N/A | No learner-facing code annotations changed |
| IV. Decision Points Exposed | ✅ Pass | Consensus cluster remains first-class; connection explanations name decisions where audited content does |
| V. Cryptography Transparency | ✅ N/A | Presentation layer only |
| VI. RPC/Validator Separation | ✅ Pass | Model untouched; rpc-api stays an internal node per issue #8 outcome |
| VII. Incremental Reviewable Changes | ✅ Pass | Work decomposed into ≤500-line units; painter/forces/layout are separate modules |
| VIII. Reuse First, No Duplication *(new)* | ✅ Pass | Reuse inventory executed (see research.md D4/D6): ViewMode deduplicated, color maps extracted to shared module, ZoomPanel/annotations/sidebar reused verbatim |
| IX. Visual Excellence *(new)* | ✅ Pass | Design targets contemporary graph-viz quality: glow/bloom accents, eased camera flights, spring-damped motion, coherent hover/focus states |

No violations. Post-design re-check: structure below keeps single-responsibility modules; no gate drifts.

## Project Structure

### Documentation (this feature)

```text
specs/004-particle-map-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output — decisions & rationale
├── data-model.md        # Phase 1 output — particle-map presentation entities
├── quickstart.md        # Phase 1 output — validation guide
├── contracts/
│   └── ui-contracts.md  # Module interface contracts (TypeScript signatures)
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── App.tsx                                # MODIFIED: ViewMode union → 'particles', third toggle button (dedupe type)
├── types/
│   └── viewMode.ts                        # NEW: single shared `ViewMode` definition (replaces two copies)
├── services/
│   ├── componentTheme.ts                  # NEW: extracted CATEGORY_COLORS/SUB_CATEGORY_COLORS (+ hex twins for canvas)
│   └── connectionExplanations.ts          # NEW: pure hop-explanation composer from existing audited fields
└── components/architecture/
    ├── ArchitectureView.tsx               # MODIFIED: switch dispatch, render ParticleMapView
    ├── index.ts                           # MODIFIED: barrel export
    ├── ComponentNode.tsx                  # MODIFIED: import colors from shared theme (logic unchanged)
    ├── ParticleMap/
    │   ├── ParticleMapView.tsx            # NEW: React shell — owns selection/hover state, mounts canvas + ZoomPanel
    │   ├── useParticleGraph.ts            # NEW: builds {nodes,links} from existing data exports (pure)
    │   ├── useForceGraphInstance.ts       # NEW: thin force-graph lifecycle wrapper (init/configure/destroy, ref API)
    │   ├── forces/
    │   │   ├── clusterForces.ts           # NEW: parent-attraction force (subs ↔ parent)
    │   │   └── zoneForces.x               # NEW: soft lifecycle-zone x/y anchors (pure config builders)
    │   ├── painting/
    │   │   ├── bubblePainter.ts           # NEW: node canvas painter (glow ring, icon-less label, state emphasis)
    │   │   └── spineParticles.ts          # NEW: lifecycle-path particle stream config + custom painter accents
    │   ├── camera.ts                      # NEW: focus/reset commands over animated centerAt/zoom (tour + click-to-focus)
    │   └── motionPreferences.ts           # NEW: prefers-reduced-motion reader → motion profile (drift/particle speed)
tests/
├── data-consistency.test.ts               # EXTENDED: bubble inventory parity via useParticleGraph (pure import)
└── particleMap.test.ts                    # NEW: zone assignment, cluster mapping, explanation composer unit tests
```

**Structure Decision**: Single web-app project (existing layout). New code is isolated in one feature module `src/components/architecture/ParticleMap/` with pure logic separated from canvas side effects (`forces/`, `painting/`, hooks) so everything except the thin library wrapper stays unit-testable and swappable. Shared tokens live in `services/` next to `annotationTheme.ts`, matching established patterns.
