# Implementation Plan: Particle Bubble Map UI

**Branch**: `feature/11-particle-map-ui` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-particle-map-ui/spec.md` (clarified across two sessions, 2026-08-26)

## Summary

Add a third view mode — a living particle/bubble map of the validator: every component and sub-component renders as an animated bubble clustered near its parent inside soft lifecycle-ordered zones; transaction particles stream continuously along the lifecycle path; pan/zoom navigation with progressive label disclosure; hovering animates and highlights neighborhoods; clicking opens the existing audited educational panels (ZoomPanel) or a connection-hop explanation. The guided tour works in all three modes by flying the camera to each step's bubble.

Technical approach: render with **raw D3 + Canvas** — `d3-force` for simulation, `d3-zoom` for pan/zoom, `d3-quadtree` for hit detection, native Canvas API for rendering. No third-party graph library wrapper. The original `force-graph` library was evaluated, prototyped, and replaced during implementation due to opaque rendering internals and difficult React integration (see research.md D9). Reuse the app's existing view contract (6 props), ZoomPanel, useAnnotations, SimulationSidebar plumbing, and data exports unchanged. Extract shared color maps into a common theme module consumed by both DOM views and the canvas painter (Principle VIII).

## Technical Context

**Language/Version**: TypeScript 5.9 (strict) on React 18.3, ES2020 target

**Primary Dependencies**: Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`, no config file), vitest 3 + Testing Library/jsdom. **New**: `d3-force` (~15 KB), `d3-zoom` (~5 KB), `d3-quadtree` (~3 KB) — all MIT, TypeScript types via `@types/d3-*`

**Storage**: N/A (no persistence added; existing IndexedDB annotation service reused as-is)

**Testing**: vitest (jsdom env, `tests/**/*.test.ts`) — extend `tests/data-consistency.test.ts` pattern; pure layout/theme functions unit-testable without canvas

**Target Platform**: Desktop web (existing app baseline), pointer/touch input, dark theme

**Performance Goals**: Smooth continuous animation at full dataset (~63 bubbles, ~55 links): steady frame pacing on an ordinary laptop for 60 s sessions (SC-004); motion visible ≤5 s after mount (SC-002)

**Constraints**: Pointer-only this feature (keyboard deferred per spec clarification); reduced-motion preference must calm the scene (FR-015); tour animations must also respect reduced-motion (FR-013); no new educational copy (reuse audited text verbatim); ≤500-line change units (constitution VII)

**Scale/Scope**: 1 new view mode, ~8–10 modules under `src/components/architecture/ParticleMap/`, 2 shared extractions, 3 dependency additions, test suite extension

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Progressive Complexity | ✅ Pass | Tour narrative order preserved; zones follow submission→finalization journey |
| II. Visual-First Learning | ✅ Pass | This feature *is* a visualization; Principle IX raises the bar further |
| III. Annotated Execution | ✅ Pass | T005–T011 + T042 mandate `// WHY:` / `// HOW:` annotations on all new ParticleMap modules |
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
├── research.md          # Phase 0 output — decisions & rationale (includes D9: force-graph → raw D3 migration)
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
    │   ├── useForceSimulation.ts          # NEW: raw D3 force simulation + canvas render loop + zoom/hit detection
    │   ├── forces/
    │   │   ├── clusterForces.ts           # NEW: parent-attraction force (subs ↔ parent)
    │   │   └── zoneForces.ts              # NEW: soft lifecycle-zone x/y anchors (pure config builders)
    │   ├── painting/
    │   │   ├── bubblePainter.ts           # NEW: node canvas painter (glow ring, icon-less label, state emphasis)
    │   │   └── spineParticles.ts          # NEW: lifecycle-path particle stream config + custom painter accents
    │   └── motionPreferences.ts           # NEW: prefers-reduced-motion reader → motion profile (drift/particle speed)
tests/
├── data-consistency.test.ts               # EXTENDED: bubble inventory parity via useParticleGraph (pure import)
└── particleMap.test.ts                    # NEW: zone assignment, cluster mapping, explanation composer unit tests
```

**Structure Decision**: Single web-app project (existing layout). New code is isolated in one feature module `src/components/architecture/ParticleMap/` with pure logic separated from canvas side effects (`forces/`, `painting/`, hooks) so everything stays unit-testable and swappable. The simulation hook (`useForceSimulation.ts`) owns the canvas element and render loop directly — no third-party graph library wrapper. Shared tokens live in `services/` next to `annotationTheme.ts`, matching established patterns.

## Planned Migration: force-graph → Raw D3 + Canvas

**Status**: ✅ COMPLETED (2026-08-27)

### force-graph → Raw D3 + Canvas (decision 2026-08-27)

The initial implementation uses the `force-graph` npm package (~50 KB, canvas renderer + d3-force engine). During debugging, two critical issues were discovered:

1. **Opaque rendering internals**: force-graph does NOT translate the canvas context to node positions before calling `nodeCanvasObject`. The library's own default renderer uses `node.x, node.y` explicitly, but custom callbacks must do the same — undocumented behavior that caused invisible nodes.
2. **Container sizing**: force-graph defaults to `window.innerWidth/Height` instead of the container's dimensions. Setting `.width()/.height()` is mandatory but not documented prominently. Combined with React lifecycle timing, this caused persistent sizing issues.

After fixing both bugs, the particle map still did not render due to additional undiscovered rendering pipeline issues. Rather than continue debugging a black-box library, the decision was made to replace it with raw D3 + Canvas — giving full control over the render loop, no hidden behavior, and simpler debugging.

**Migration completed (Phase 9, T051-T072)**:
- `camera.ts` deleted (dead code)
- `useForceGraphInstance.ts` replaced by `useForceSimulation.ts`
- `force-graph` dependency removed from package.json
- `d3-force`, `d3-zoom`, `d3-quadtree`, `d3-selection`, `d3-transition` added as direct dependencies
- All type definitions added (`@types/d3-*`)
- ESLint globals updated for `HTMLCanvasElement` and `devicePixelRatio`
