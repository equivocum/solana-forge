# Data Model: Particle Bubble Map UI

Feature: `/specs/004-particle-map-ui/spec.md` · Date: 2026-08-26

The particle map adds **presentation-layer entities only**. Every factual entity (Component, SubComponent, Connection, SimulationStep, Citation) is reused unchanged from the audited model in `src/components/architecture/data/`. This document defines the derived view model and its validation rules.

## Derived Entities

### ParticleNode
One bubble on the map. Built 1:1 from model entries — never authored by hand.

| Field | Type | Source / Rule |
|-------|------|---------------|
| `id` | `string` | Component: unchanged `component.id`. Sub: `"<parentId>/<subId>"` (namespaced, collision-free) |
| `kind` | `'component' \| 'sub'` | Derived from presence of parent |
| `refId` | `string` | Original `component.id` or `sub.id` for lookup back into audited content |
| `parentId` | `string?` | Set iff `kind === 'sub'`; must reference an existing component node |
| `zone` | `ZoneId` | Pure mapping from `pipeline` + `layer` (see ZoneDef); total — every node gets exactly one zone |
| `sizeVal` | `number` | Visual weight: components > subs; constant per kind (no data meaning) |
| `label` | `string` | `component.name` / `sub.name` verbatim |
| `category` | `ComponentCategory` | Copied for color lookup; equals `layer` in current data |

Validation: ids unique across all nodes; every `parentId` resolves; count = Σ components + Σ subComponents (SC-001).

### ParticleLink
One drawn connection.

| Field | Type | Source / Rule |
|-------|------|---------------|
| `id` | `string` | `"<from>-><to>#<label>"` (model may repeat endpoint pairs with different labels) |
| `source` / `target` | `string` | Endpoint ParticleNode ids (components only; connections never target subs in current model) |
| `label` | `string` | Verbatim `Connection.label` |
| `type` | `'data' \| 'control' \| 'shared'` | Verbatim |
| `onSpine` | `boolean` | True iff edge belongs to `TX_LIFECYCLE_PATH` traversal ⇒ eligible for directional particles |

Validation: endpoints exist among component nodes; link set ⊇ ALL_CONNECTIONS exactly (no extras).

### ZoneDef
Soft spatial anchors implementing FR-012's lifecycle zones.

| Field | Value |
|-------|-------|
| `ZoneId` | `'ingress' \| 'tpu-pipeline' \| 'tvu-replay' \| 'runtime-shared' \| 'consensus' \| 'storage-networking'` (derived; final naming fixed at implementation) |
| `anchor` | `{x, y}` layout-space coordinates ordered left→right along the journey |
| `members` | Node ids assigned by mapping function |

Mapping rule (pure): `pipeline='tpu'` → tpu-pipeline; `'tvu'` → tvu-replay; `'shared'` → runtime-shared; entry-point networking components (`rpc-api`, ingress) → ingress; storage/consensus layers → their zones. Ordering follows TX_LIFECYCLE_PATH progression so the tour camera travels left→right.

### MapViewState
Ephemeral UI state (not persisted; existing annotation persistence untouched).

| Field | Purpose |
|-------|---------|
| `hoveredId` | Drives painter emphasis + neighbor highlight (FR-006/FR-011) |
| `selectedComponent` / `initialSubId` | Feeds reused ZoomPanel |
| `linkPopover: {linkId, anchor}` | Connection explanation surface (FR-009) |
| `focusedStepId` | Tour step currently commanding the camera (FR-013) |

State transitions: idle → hover(node/link) → select(component→ZoomPanel | link→popover) → dismiss → idle; tour-active overrides hover precedence (spec Edge Cases).

## Entity Relationships

```text
ArchitectureComponent 1 ─── * SubComponent          (existing, unchanged)
        │ 1                    │ 1
        │                      └── * ParticleNode (kind='sub', parentId)
        └── * ParticleNode (kind='component')
ParticleNode * ── ParticleLink * ── ParticleNode     (from ALL_CONNECTIONS)
TX_LIFECYCLE_PATH ▷ marks ParticleLink.onSpine       (21 hops)
SimulationStep.componentId ▷ ParticleNode(refId)     (camera focus binding)
```

## Content Contracts (no new facts)

- Bubble click → ZoomPanel receives the original `ArchitectureComponent` object (verbatim audited fields + refs).
- Sub click → same panel, `initialSubId` preselects the drill-down.
- Link popover text = `composeHopExplanation(link)` output built from `Connection.label` + endpoints' `purpose`/`role` strings; citation rendered iff either endpoint has `refs`. No free-written copy anywhere in the feature.
