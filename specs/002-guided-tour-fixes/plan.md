# Implementation Plan: Guided Tour Fixes

**Branch**: `002-guided-tour-fixes` | **Date**: 2026-08-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-guided-tour-fixes/spec.md`

## Summary

Fix 4 guided tour UX issues: (1) add pause/resume with state preservation, (2) keep annotations visible when paused, (3) make source references clickable with dual format, (4) replace floating overlay with right sidebar layout. Also add page max-width constraint.

## Technical Context

**Language/Version**: TypeScript 5.5 + React 18.3

**Primary Dependencies**: Vite 5.4, Tailwind CSS v4

**Storage**: N/A (in-memory state)

**Testing**: Vitest + Testing Library React

**Target Platform**: Desktop browser (1280px+)

**Project Type**: Web application (React SPA)

**Performance Goals**: 60fps animation, <100ms UI response

**Constraints**: Tailwind-only styling, no state management libraries

**Scale/Scope**: 1 new component, 3 files modified

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Progressive Complexity | ✅ PASS | Tour follows existing lifecycle order (18 steps) |
| II. Visual-First Learning | ✅ PASS | Sidebar enhances visual learning |
| III. Annotated Execution | ✅ PASS | Dual-format source refs satisfy annotation standard |
| IV. Decision Points Exposed | ✅ PASS | Decision annotations preserved |
| V. Cryptography Transparency | ✅ PASS | BYTES annotations preserved |
| VI. RPC/Validator Separation | ✅ PASS | No boundary changes |

**Gate verdict: PASS** — no violations.

## Project Structure

### Source Code

```text
packages/frontend/src/
├── App.tsx                          # MODIFY: add tourActive, max-width container, manual nav handlers
├── components/architecture/
│   ├── ArchitectureView.tsx         # MODIFY: use SimulationSidebar, flex layout with sidebar
│   ├── SimulationSidebar.tsx        # NEW: replaces SimulationOverlay.tsx (sidebar layout + clickable links)
│   └── data/
│       └── simulation-steps.ts      # NO CHANGE
```

## Layout Design

### Page layout (flexbox dynamic height)
```tsx
// App.tsx
<div className="min-h-screen bg-gray-900 text-white flex flex-col">
  <header className="... flex-shrink-0">...</header>
  <main className="p-4 flex-1 flex flex-col min-h-0">
    <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col min-h-0">
      <ArchitectureView ... />
    </div>
  </main>
</div>
```

### Sidebar layout
```tsx
// ArchitectureView.tsx
<div className="h-full flex min-h-0">
  <div className="flex-1 bg-gray-800/30 rounded-xl p-4 min-w-0">
    {/* Pipeline or Layered view */}
  </div>
  {tourActive && (
    <div className="w-80 ml-4 flex-shrink-0">
      <SimulationSidebar ... />
    </div>
  )}
</div>
```

### Button state machine
| State | Buttons shown |
|-------|--------------|
| `tourActive=false` | "▶ Guided Tour" |
| `tourActive=true, isSimulating=true` | "⏸ Pause" + "Next" + "Back" |
| `tourActive=true, isSimulating=false` | "▶ Resume" + "↺ Reset" + "Next" + "Back" |

## Complexity Tracking

No violations — no entries needed.
