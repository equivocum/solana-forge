# Contract: Guided Tour & Inspector UX

**Scope**: Behavior visible to learners; unchanged interaction patterns, corrected content. Consumers: `ArchitectureView` (tour engine), `SimulationSidebar`, `ZoomPanel`, `TransactionBubble`.

## T-1. Tour session

- Start: sidebar shows Step 1 of ~20 bound to `rpc-api`; transaction bubble appears at that node.
- Next/Back/pause/resume/speed controls behave exactly as today (002 behavior preserved); only the step list and targets change.
- Manual Back/Next must update the sidebar highlight (regression guard from 002).

## T-2. Step content

Every step displays, at minimum:
- numbered title matching its position,
- narration with badges: `STAGE:` (lifecycle phase from data-model transitions), `WHY:` (rationale), `REF:` ≥1 pinned citation link — clickable, opens GitHub at v4.2.1 anchor.
- Steps covering consensus moments additionally carry `DECISION:` badges (inputs → outcome), e.g., fork-choice switch decision, root advancement.

## T-3. Bubble traversal

- Bubble follows TX_LIFECYCLE_PATH order; at vote-loop steps it may traverse VOTE_FLOW edges (gossip hop) before returning toward finalization steps.
- No step may target a component id absent from ALL_COMPONENTS (render-time invariant).

## T-4. Component inspector (ZoomPanel / click)

- Clicking any node opens detail: purpose/role/how/why + sub-components + refs list rendered as clickable citations (grammar per data contract C-1).
- New nodes must be inspectable identically to existing ones; LayeredView must place them: rpc-api→networking, cluster-info-vote-listener & voting-service→consensus.

## T-5. Regression guards

- `pnpm test` green; `npx tsc --noEmit` clean after every applied change (FR-022).
- Existing annotation persistence/storage services untouched; no IndexedDB schema changes.
