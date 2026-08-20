# Tasks: Guided Tour Fixes

**Branch**: `002-guided-tour-fixes` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Task 1: Add page max-width container (FR-009)

**Files**: `packages/frontend/src/App.tsx`
**Priority**: P2

Add `max-w-[1400px] mx-auto` wrapper around the main content area so page content doesn't stretch on wide viewports.

- [ ] Wrap `<ArchitectureView>` in `<div className="max-w-[1400px] mx-auto h-full">`

---

## Task 2: Add tour state management to App.tsx (FR-001, FR-002)

**Files**: `packages/frontend/src/App.tsx`
**Priority**: P1

Add `tourActive` state to distinguish "tour started" from "tour playing". Add `onSimResume`, `onSimNext`, `onSimBack` handlers. Update button logic.

- [ ] Add `tourActive` state (boolean, default false)
- [ ] Add `handleSimResume` — sets `isSimulating=true` (keeps simStep)
- [ ] Add `handleSimNext` — increments simStep (clamped to max)
- [ ] Add `handleSimBack` — decrements simStep (clamped to 0)
- [ ] Update `handleSimStart` to also set `tourActive=true`
- [ ] Update `handleSimReset` to also set `tourActive=false`
- [ ] Update header buttons: show Resume/Reset/Next/Back when tourActive && !isSimulating
- [ ] Pass new handlers as props to ArchitectureView

---

## Task 3: Create SimulationSidebar component (FR-003, FR-004, FR-005, FR-006, FR-007)

**Files**: `packages/frontend/src/components/architecture/SimulationSidebar.tsx` (NEW)
**Priority**: P1

Replace the floating overlay with a sidebar component. Includes clickable source references.

- [ ] Create `SimulationSidebar.tsx` with interface matching plan spec
- [ ] Render step counter, title, description, annotation badges, progress bar
- [ ] Add Next/Back/Resume/Pause/Reset buttons in sidebar footer
- [ ] Update `AnnotationBadge` to render `// REF: <file:line>` as monospace text
- [ ] Add clickable "Open in GitHub" icon (`<a>` with `target="_blank"`, `rel="noopener noreferrer"`)
- [ ] Add hover effects on the clickable icon (underline, color change)
- [ ] Add `overflow-y-auto` for internal scrolling when content exceeds height
- [ ] Timer logic: when `isRunning`, auto-advance steps; when paused, keep annotation visible

---

## Task 4: Update ArchitectureView to use SimulationSidebar (FR-006)

**Files**: `packages/frontend/src/components/architecture/ArchitectureView.tsx`
**Priority**: P1

Replace SimulationOverlay with SimulationSidebar. Change layout to flex with conditional sidebar.

- [ ] Import SimulationSidebar instead of SimulationOverlay
- [ ] Change main content div to `flex` layout
- [ ] Add sidebar container: `w-80 ml-4 flex-shrink-0` (conditional on isSimulating)
- [ ] Pass new props (onResume, onNext, onBack) to SimulationSidebar
- [ ] Remove old SimulationOverlay import and usage

---

## Task 5: Remove old SimulationOverlay.tsx

**Files**: `packages/frontend/src/components/architecture/SimulationOverlay.tsx`
**Priority**: P1

- [ ] Delete SimulationOverlay.tsx (replaced by SimulationSidebar.tsx)

---

## Task 6: Update barrel exports

**Files**: `packages/frontend/src/components/architecture/index.ts`
**Priority**: P1

- [ ] Export SimulationSidebar instead of SimulationOverlay

---

## Task 7: Verify TypeScript and tests

**Files**: N/A
**Priority**: P2

- [ ] Run `npx tsc --noEmit` — verify no new errors
- [ ] Run `pnpm run test` — verify 21+ tests pass
- [ ] Manual verification: dev server starts, tour works end-to-end

---

## Task 8: Git Flow commit

**Files**: N/A
**Priority**: P2

- [ ] Create GitHub issue for this feature
- [ ] Commit with conventional commit message
- [ ] Push branch and create PR
- [ ] Squash merge to main
