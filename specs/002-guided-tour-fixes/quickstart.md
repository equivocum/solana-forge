# Quickstart Validation: Guided Tour Fixes

**Branch**: `002-guided-tour-fixes` | **Date**: 2026-08-20

## Prerequisites

- Node.js 18+
- pnpm installed
- Dev server running: `pnpm dev`

## Validation Scenarios

### V1: Pause and Resume (FR-001, FR-002, SC-001)

1. Open http://localhost:3000
2. Click "▶ Guided Tour" — tour starts at step 1
3. Wait for step 3 to appear
4. Click "⏸ Pause" in header or sidebar
5. **Verify**: Step 3 annotation remains visible in sidebar
6. Click "▶ Resume" in header or sidebar
7. **Verify**: Tour continues from step 4

### V2: Manual Navigation (FR-002)

1. Start tour, pause at step 5
2. Click "Next →" in sidebar
3. **Verify**: Advances to step 6
4. Click "← Back" in sidebar
5. **Verify**: Returns to step 5

### V3: Clickable Source Links (FR-004, FR-005, SC-003)

1. Start tour, advance to any step with annotations
2. Locate a "↗" icon next to a `// REF:` line
3. Hover over the icon
4. **Verify**: Visual feedback (underline, color change)
5. Click the icon
6. **Verify**: Opens GitHub URL in new tab

### V4: Sidebar Layout (FR-006, FR-007, SC-004)

1. Start tour
2. **Verify**: Sidebar appears on right side (320px wide)
3. **Verify**: No architecture components are covered by sidebar
4. **Verify**: Main diagram area is narrower (flex-1)
5. Pause tour
6. **Verify**: Sidebar stays visible with annotation

### V5: Dynamic Height (FR-009)

1. Start tour
2. **Verify**: No vertical scrollbar on main content
3. Resize browser window shorter
4. **Verify**: Content adapts, sidebar scrolls internally if needed

### V6: Reset (FR-008)

1. Start tour, advance to step 10
2. Click "↺ Reset"
3. **Verify**: Returns to step 0, shows "▶ Guided Tour" button
4. **Verify**: Sidebar disappears

## Test Commands

```bash
# Run existing tests
pnpm run test

# Type check
npx tsc --noEmit

# Start dev server
pnpm dev
```

## Expected Results

- 21/29 tests pass (8 pre-existing ESLint failures)
- TypeScript compiles with no new errors
- All 6 validation scenarios pass
