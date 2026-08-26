# Quickstart: Particle Bubble Map UI — Validation Guide

Feature: `/specs/004-particle-map-ui/spec.md` · Prereqs: Node ≥ 20, npm

## Setup

```bash
git checkout feature/11-particle-map-ui
npm install            # adds force-graph
npm run dev            # Vite dev server (port 3000 per README)
```

## Automated checks

```bash
npm test               # vitest: existing 15 consistency tests + new particle-map suite must pass
npx tsc --noEmit       # strict type-check green
npm run lint           # eslint clean
```

New automated coverage (maps to SC-001): `tests/particleMap.test.ts` asserts graph-builder inventory parity (every component + sub exactly once, parent links resolve, link set ⊇ model), zone mapping totality, and hop-explanation composition from audited fields only.

## Manual validation scenarios

Run scenarios in order; each cites the spec criterion it proves. The app opens on Pipeline Flow — switch via the new **Particles** toggle next to Pipeline/Layered.

### S1 — Living constellation (US1 / SC-002)
1. Open the Particles mode, hands off.
2. ✅ Within ~5 s bubbles are visibly drifting; clusters hold together.
3. Watch 60 s: luminous particles travel continuously along the submission→finalization spine (rpc-api → … → tower-bft/finalization), never freezing.

### S2 — Inventory & clustering (US1-AC3/4, US4-AC2 / SC-001)
1. Zoom out to fit-all; compare against Layered View counts (31 components + subs).
2. ✅ Every component bubble appears once; each sub-bubble stays adjacent to its parent while drifting; every modeled connection is drawn with direction arrows and its label on hover.
3. `npm test` inventory-parity suite green.

### S3 — Zones read as a journey (FR-012)
1. At overview zoom, squint: left→right you can follow ingress → TPU pipeline → TVU/replay → consensus → storage.
2. ✅ Zone membership matches the lifecycle narrative; boundaries are soft (bubbles wander inside, never jump zones).

### S4 — Hover feedback (US2-AC1 / FR-006 / SC-004)
1. Sweep the cursor across ≥10 bubbles quickly.
2. ✅ Each responds immediately (glow/scale-up) with no flicker or stuck highlights; neighbors + incident links emphasize while distant content recedes.
3. 60 s continuous interaction on an ordinary laptop: no stutter (SC-004).

### S5 — Click-to-learn parity (US2-AC2/3 / FR-007/008/010 / SC-003)
1. Click 10 random component bubbles and 3 random sub-bubbles.
2. ✅ ZoomPanel opens with the same audited purpose/role/how-it-works/metrics text as in other modes; ≥1 pinned v4.2.1 citation resolves to the claimed file+line.
3. Sub clicks preselect that sub's drill-down section.

### S6 — Connection explanations (US2-AC4 / FR-009)
1. Hover/click any link (e.g., `broadcast → blockstore`, `cluster-info-vote-listener → tower-bft`).
2. ✅ Popover explains what travels and why, using only audited wording; citation chip appears where endpoints carry refs and opens the pinned release.

### S7 — Tour across three modes (US3 / FR-013 / SC-005)
1. Start the guided tour in Pipeline, Layered, then Particles mode.
2. ✅ All 21 steps complete in each mode without dead ends; in Particles the camera eases to each step's bubble and dims unrelated clusters so the focus is unmistakable — no manual searching.
3. Regression guard: manual Next/Back highlights correctly too (known App.tsx step-cap defect fixed under D5).

### S8 — Mode coexistence & semantics (US4 / FR-005/014 / SC-006)
1. Toggle modes repeatedly mid-tour and mid-hover.
2. ✅ Same element = same name, facts, citations, category colors across all three modes; old two modes behave exactly as before this feature.

### S9 — Reduced motion & small windows (FR-015/016)
1. Enable OS "reduce motion"; reload Particles mode.
2. ✅ Drift calms to near-still, particles slow/sparse, camera cuts instantly — clusters/zones/paths stay legible.
3. Shrink window: labels abbreviate but nothing becomes unreachable or disappears.

## Definition of Done signals

- All S1–S9 checked; `npm test && npx tsc --noEmit && npm run lint` clean.
- Each implementation commit ≤500 changed lines, suite green between steps (constitution VII).
- Visual bar (constitution IX): side-by-side against a leading graph viz (e.g., Obsidian graph view / GitHub's dependency graph) the scene reads as deliberate, polished, coherent — not prototype-grade.
