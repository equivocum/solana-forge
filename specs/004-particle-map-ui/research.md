# Research: Particle Bubble Map UI

Feature: `/specs/004-particle-map-ui/spec.md` · Date: 2026-08-26 · Branch: `feature/11-particle-map-ui`

All spec clarifications were resolved before planning (see spec `## Clarifications`, 7 decisions). This document resolves the technical unknowns identified in plan.md's Technical Context and records reuse inventory required by Principle VIII.

## D1 — Rendering library: `force-graph` (canvas + d3-force)

**Decision**: Use the `force-graph` npm package, wrapped once in a thin React hook/module. No React-binding subpackage.

**Rationale**: Verified against requirements one-for-one: HTML5-canvas force-directed graph powered by d3-force; built-in zoom/pan with animated programmatic camera (`centerAt(x,y,ms)`, `zoom(k,ms)`, `zoomToFit`); node *and* link hover/click callbacks (`onNodeHover/onNodeClick/onLinkHover/onLinkClick`); **directional link particles built in** (`linkDirectionalParticles/Speed/Width/Color`) — exactly the continuous transaction-stream requirement; per-frame custom painting for nodes/links/particles (`nodeCanvasObject`, `linkCanvasObject`, `linkDirectionalParticleCanvasObject`, `onRenderFramePre/Post`) enabling glow/bubble aesthetics; customizable d3 forces (`d3Force`) for parent-clustering and zone anchoring; pointer hit-area control (`nodePointerAreaPaint`); `autoPauseRedraw(false)` keeps the scene alive continuously. ~50 KB, MIT, actively maintained.

**Alternatives considered**:
- *React Flow (@xyflow/react)* — excellent editor-grade node UI but physics/motion is bolt-on; organic particle feel would be custom anyway.
- *Cytoscape.js* — mature, compound nodes map to parent clustering, but animation/particle streams and canvas aesthetics require fighting the style system.
- *PixiJS hand-rolled* — maximum visual control, maximum effort: physics, hit-testing, pan/zoom, labels all manual; violates "reliable lib to make it easier".
- *SVG/DOM bubbles* — simplest, but continuous particles + glows at 60 fps risk jank; no existing rAF/canvas pattern to lean on (verified: app has zero canvas/rAF usage today).
- Vanilla-vs-React wrapper: the imperative API dominates either way; a single own wrapper (`useForceGraphInstance`) avoids an extra dependency layer while matching the repo's plain-React component patterns.

## D2 — Continuous ambient motion without engine thrash

**Decision**: Keep the d3 simulation permanently at low alpha via a gentle custom jitter/brownian force and `d3VelocityDecay`; set `autoPauseRedraw(false)` so rendering never freezes. Lifecycle-path links get `linkDirectionalParticles` (speed scaled by motion profile); all other links stay static strokes.

**Rationale**: Satisfies SC-002 (motion ≤5 s, uninterrupted ≥60 s) without re-heating the full simulation every frame; particle cost scales only with spine edges (21 path hops).

**Alternatives**: reheat-per-interval (visible pulsing artifacts); pure CSS drift of DOM overlay (double coordinate systems, desyncs with pan/zoom).

## D3 — Clustering & lifecycle zones via custom forces

**Decision**: Three composed force configurations (pure functions, unit-tested):
1. `clusterForces` — attraction between each sub-component and its parent (parent = fixed-ish anchor with higher mass), satisfying FR-002 ("adjacent to or within parent's neighborhood").
2. `zoneForces` — soft x/y anchors per zone ordered along the journey (ingress → pipeline → consensus → storage), derived from each component's existing `pipeline` ('tpu' | 'tvu' | 'shared') + `layer` fields; low strength so boundaries are guides, not walls (FR-012).
3. Standard collision + weak link forces for non-overlap and legibility.

Zone membership is a pure mapping function exported for tests and consistency checks.

**Rationale**: Uses data that already exists (`pipeline`, `position`, `layer`) — zero new content authoring; keeps physics deterministic and testable independent of canvas.

## D4 — Shared color/theme extraction (Principle VIII)

**Decision**: Extract `CATEGORY_COLORS` / `SUB_CATEGORY_COLORS` from `ComponentNode.tsx:19-37` into `src/services/componentTheme.ts`, adding hex twins for canvas fills alongside the Tailwind class strings (single source keyed by category). Both `ComponentNode` (DOM) and the bubble painter (canvas) consume it. Annotation badge styling already centralized in `services/annotationTheme.ts` — reused as-is for connection-explanation badges.

**Rationale**: Canvas needs hex; DOM views need classes; duplicating hue mappings across two renderers would violate Principle VIII and risk mode drift (spec FR-010/US4).

## D5 — Guided-tour camera focus

**Decision**: Derive the focus target exactly like existing views do: `currentStepId → TX_LIFECYCLE_PATH[step] → componentId`, already delivered as view props by `ArchitectureView.tsx`. Camera commands (`camera.focusComponent(id)` = animated `centerAt(node)+zoom(1.6, ms)`; `reset()` = `zoomToFit`) live in one module consumed by both tour steps and click-to-focus. During tours, dim non-focused clusters slightly (painter state), keeping the focused bubble forward per US3-AC3.

**Discovered defect (fix within this feature's tour tasks)**: `App.tsx:46` caps step advance at `Math.min(s + 1, 17)` while there are 21 steps, and manual Next/Back bypasses the highlight wrapper — this breaks "full tour completes" (SC-005) in *all* modes. Correcting the cap and routing manual navigation through the same handler is a small, in-scope repair under FR-013 (tour parity).

**Alternatives**: separate tour-camera store (duplicate state paths — rejected, VIII).

## D6 — Interaction wiring & connection explanations

**Decision**: Adopt the existing 6-prop view contract verbatim (`activeComponent`, `highlightedComponent`, `currentStepId`, `onComponentClick`, `onComponentHover`, `onSubClick`) so ArchitectureView dispatch stays uniform. Clicking a component/sub bubble opens the existing `ZoomPanel` unchanged (it is view-independent: `{component, initialSubId?, onClose}`). Connection hover/click opens a lightweight popover styled with existing annotation tokens; its text is **composed purely from audited fields** (`Connection.label` + endpoints' `detail.purpose`/`role`) via `services/connectionExplanations.ts` — honoring the "no new educational copy" assumption — and shows a citation when either endpoint carries `refs`.

**Rationale**: Zero new panel systems, zero paraphrased facts; satisfies FR-007/008/009 and SC-003 sampling.

## D7 — Reduced motion

**Decision**: `motionPreferences.ts` reads the media query once (+ listens for changes) and returns a profile `{driftAmplitude, particleSpeed, cameraMs}` used by forces, painter, and camera. Reduced-motion ⇒ near-static drift, slow sparse particles, instant camera cuts; clustering/zones/paths remain fully legible (FR-015→FR-013 requirement).

## D8 — Testing strategy

**Decision**: Push all logic into pure modules (`useParticleGraph`, zone/cluster mappers, explanation composer, theme maps) so `tests/particleMap.test.ts` covers them headlessly; extend `tests/data-consistency.test.ts` with inventory-parity checks importing the same builder the view uses (SC-001 automated). Visual smoothness/aesthetics (SC-002/004, Principle IX) get a scripted manual QA pass in quickstart.md — not automatable reliably in jsdom.

## Reuse Inventory (Principle VIII ledger)

| Existing asset | Reuse in this feature |
|---|---|
| View contract props (ArchitectureView.tsx:45–87) | ParticleMapView consumes identical shape |
| ZoomPanel.tsx | Opens on any bubble click, verbatim |
| useAnnotations hook + annotationTheme service | Interaction logging + explanation popover badges |
| SimulationSidebar / App tour state | Unchanged; camera reacts via props |
| CATEGORY_COLORS / SUB_CATEGORY_COLORS | Extracted once, shared DOM+canvas |
| Data exports: ALL_COMPONENTS, LAYERS, ALL_CONNECTIONS, TX_LIFECYCLE_PATH | Sole inputs to graph builder & zones |
| Tailwind v4 utilities, dark palette, font stacks | Surrounding chrome (mode toggle, popovers) |

Deduplications performed by this feature: single `ViewMode` type module (currently declared twice: App.tsx:8, ArchitectureView.tsx:15); color maps moved out of ComponentNode.
