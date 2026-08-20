# Data Model: Guided Tour Fixes

**Branch**: `002-guided-tour-fixes` | **Date**: 2026-08-20

## Entities

### SimulationState (App.tsx)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| viewMode | `'pipeline' \| 'layered'` | `'pipeline'` | Current diagram view |
| isSimulating | `boolean` | `false` | Whether tour is auto-advancing |
| tourActive | `boolean` | `false` | Whether tour has been started (persists across pause) |
| simSpeed | `number` | `1` | Speed multiplier (0.5, 1, 2) |
| slowMotion | `boolean` | `false` | Slow-motion toggle (4x duration) |
| simStep | `number` | `0` | Current step index (0-17) |

### State Transitions

```
[IDLE] --start--> [PLAYING]
[PLAYING] --pause--> [PAUSED]
[PLAYING] --complete--> [IDLE]
[PAUSED] --resume--> [PLAYING]
[PAUSED] --reset--> [IDLE]
[PAUSED] --next--> [PAUSED] (step+1)
[PAUSED] --back--> [PAUSED] (step-1)
```

### SimulationStep (simulation-steps.ts)

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Unique step identifier (e.g., 'step-1') |
| componentId | `string` | Architecture component ID to highlight |
| title | `string` | Step title |
| description | `string` | Step description |
| annotation[] | `Annotation[]` | Typed annotation badges |
| duration | `number` | Auto-advance delay in ms |

### Annotation

| Field | Type | Description |
|-------|------|-------------|
| type | `'STAGE' \| 'WHY' \| 'HOW' \| 'REF' \| 'DECISION' \| 'BYTES'` | Badge type |
| content | `string` | Annotation text |
| sourceRef | `string` | Full GitHub URL |

### ComponentNode (ComponentNode.tsx)

| Field | Type | Description |
|-------|------|-------------|
| component | `ArchitectureComponent` | Component data |
| isActive | `boolean` | Whether component is selected |
| isHighlighted | `boolean` | Whether component is hovered |
| isCurrentStep | `boolean` | Whether component is the current tour step |
| size | `'sm' \| 'md' \| 'lg'` | Card size (default: 'md') |

## Relationships

- SimulationState `contains` SimulationStep (via `simStep` index)
- SimulationStep `has many` Annotations
- Annotation `references` ArchitectureComponent (via `componentId`)
- SimulationSidebar `reads from` SimulationState (via props)
- PipelineFlowView `renders` ComponentNode[] (per pipeline section)
