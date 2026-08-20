# Research: Guided Tour Fixes

**Branch**: `002-guided-tour-fixes` | **Date**: 2026-08-20

## Decision 1: State management for pause/resume

**Decision**: Add `tourActive` boolean to App.tsx state, separate from `isSimulating`

**Rationale**: `tourActive` distinguishes "tour started" from "tour playing". When `tourActive=true` and `isSimulating=false`, the UI shows "Resume" instead of "Start". This preserves the step index across pause/resume cycles without complex state machines.

**Alternatives considered**:
- Zustand state library — overkill for 2 new state variables
- useReducer — more complex than needed for simple boolean toggles
- Single `isSimulating` with step history — loses step on pause

## Decision 2: Sidebar as layout element vs overlay

**Decision**: Render sidebar as a flex child in the main layout, not a fixed/absolute overlay

**Rationale**: A layout element reserves space and never overlaps content. The floating overlay (`fixed top-20 right-4`) covered Storage/AccountsDB components. A flex child with `w-80 flex-shrink-0` takes 320px and the main content area shrinks to accommodate it.

**Alternatives considered**:
- CSS Grid — equivalent but flex is simpler for conditional rendering
- Portal overlay — defeats the purpose of non-overlapping
- Dynamic repositioning — complex, fragile on resize

## Decision 3: Source reference display format

**Decision**: Dual format — `// REF: <file:line>` monospace text + clickable "↗" icon

**Rationale**: Satisfies constitution's `// REF:` annotation standard while providing actionable links. The icon approach keeps the display clean and avoids cluttering with full URLs.

**Alternatives considered**:
- Full URL display — verbose, clutters the sidebar
- Only icon — loses `// REF:` context required by constitution
- Tooltip on hover — less discoverable, no direct click

## Decision 4: Page max-width constraint

**Decision**: `max-w-[1400px] mx-auto` on the content wrapper

**Rationale**: On wide viewports (1920px+), content stretches too thin. 1400px provides comfortable reading width while leaving room for the sidebar (320px) + diagram (~1080px).

**Alternatives considered**:
- 1200px — too narrow when sidebar is open
- 1600px — still stretches on most monitors
- No max-width — original problem persists

## Decision 5: Dynamic height layout

**Decision**: Flexbox column layout with `flex-1` instead of `calc(100vh - 57px)`

**Rationale**: Fixed height causes scrollbars when content exceeds viewport (e.g., Core Programs wrapping to 2 rows with sidebar). Flexbox lets the main content area grow/shrink dynamically.

**Alternatives considered**:
- `overflow-y-auto` on main — adds scrollbar, not desired
- `min-h-screen` with absolute positioning — fragile, breaks on resize

## Decision 6: Core Programs sizing

**Decision**: Change from `size="lg"` (144px min) to `size="md"` (112px min)

**Rationale**: Core Programs was the only section using `lg` size. When sidebar takes 320px, the `min-w-[9rem]` prevented cards from fitting. Using `md` matches TPU/TVU pipeline components for consistency.

**Alternatives considered**:
- Keep `lg` but reduce `min-w` — inconsistent with other sections
- Use `sm` — too small for programs display
- Responsive size based on viewport — over-engineered
