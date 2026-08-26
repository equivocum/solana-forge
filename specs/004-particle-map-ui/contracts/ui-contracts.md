# UI Contracts: Particle Bubble Map UI

Feature: `/specs/004-particle-map-ui/spec.md` · Date: 2026-08-26

Interface contracts between the new ParticleMap module and the rest of the app. Signatures are normative for implementation and tasks; they encode the module boundaries required by Principle VIII (modular, extendable, no duplication).

## 1. Shared view-mode type (deduplication)

```ts
// src/types/viewMode.ts — single definition; App.tsx & ArchitectureView import from here
export type ViewMode = 'pipeline' | 'layered' | 'particles'
```

## 2. View contract (unchanged shape, third consumer)

```ts
// src/components/architecture/ParticleMap/ParticleMapView.tsx
export interface ParticleMapViewProps {
  components: ArchitectureComponent[]
  activeComponent: string | null          // tour/selection highlight (existing semantics)
  highlightedComponent: string | null     // hover echo from other views
  currentStepId: string | null            // TX_LIFECYCLE_PATH[step] → camera focus command
  onComponentClick: (component: ArchitectureComponent) => void
  onComponentHover: (component: ArchitectureComponent | null) => void
  onSubClick: (parent: ArchitectureComponent, subId: string) => void
}
```

ArchitectureView renders it in its mode switch with the same handlers already wired for the other two views.

## 3. Graph builder (pure)

```ts
// src/components/architecture/ParticleMap/useParticleGraph.ts
export interface ParticleNode { /* data-model.md */ }
export interface ParticleLink { /* data-model.md */ }
export interface GraphData { nodes: ParticleNode[]; links: ParticleLink[] }

export function buildParticleGraph(components: ArchitectureComponent[], links: Connection[]): GraphData
```

Guarantees (asserted by tests): unique node ids; every `parentId` resolves; link endpoints exist; `onSpine` marks exactly TX_LIFECYCLE_PATH edges.

## 4. Zones & clustering (pure)

```ts
// src/components/architecture/ParticleMap/forces/
export type ZoneId = 'ingress' | 'tpu-pipeline' | 'tvu-replay' | 'runtime-shared' | 'consensus' | 'storage-networking'
export function zoneOf(node: ParticleNode): ZoneId                       // total mapping
export function zoneAnchors(): Record<ZoneId, { x: number; y: number }> // ordered along lifecycle
export function clusterStrength(node: ParticleNode): number             // parent-attraction config
```

## 5. Canvas wrapper (only side-effectful boundary)

```ts
// src/components/architecture/ParticleMap/useForceGraphInstance.ts
export interface ForceGraphController {
  setData(graph: GraphData): void
  focusComponent(id: string, motion: MotionProfile): void   // animated centerAt + zoom
  resetView(motion: MotionProfile): void                    // zoomToFit
  setHover(id: string | null): void                         // painter emphasis sync
  destroy(): void
}
export function useForceGraphInstance(
  containerRef: RefObject<HTMLElement>,
  opts: {
    graph: GraphData
    theme: ComponentThemeHex
    motion: MotionProfile
    onNodeClick(refId: string, kind: 'component' | 'sub'): void
    onNodeHover(refId: string | null, kind?: 'component' | 'sub'): void
    onLinkClick(link: ParticleLink): void
    onLinkHover(link: ParticleLink | null): void
  },
): RefObject<ForceGraphController>
```

The `force-graph` library is referenced **only** inside this hook plus painters — swappable later without touching views or tests.

## 6. Painting (pure functions over canvas ctx)

```ts
// src/components/architecture/ParticleMap/painting/bubblePainter.ts
export function drawBubble(ctx: CanvasRenderingContext2D, node: ParticleNode,
                           state: { hovered: boolean; active: boolean; focused: boolean },
                           theme: ComponentThemeHex, scale: number): void

// spineParticles.ts
export const SPINE_PARTICLE_CONFIG: { speed: number; width: number } // scaled by MotionProfile
```

## 7. Theme extraction (single source of truth)

```ts
// src/services/componentTheme.ts
export interface CategoryColorTokens { bg: string; border: string; text: string; activeBg: string; activeBorder: string }
export const CATEGORY_COLORS: Record<ComponentCategory, CategoryColorTokens>       // moved from ComponentNode.tsx
export const SUB_CATEGORY_COLORS: Record<ComponentCategory, CategoryColorTokens>    // moved from ComponentNode.tsx
export function categoryHex(category: ComponentCategory): { fill: string; glow: string; label: string }
```

`ComponentNode.tsx` imports from here; painter uses the hex twins. Hue values remain identical across modes (spec FR-005/US4-AC3).

## 8. Connection explanations (pure composer)

```ts
// src/services/connectionExplanations.ts
export interface HopExplanation { title: string; body: string; citation: string | null }
export function composeHopExplanation(link: Connection, endpoints: { from: ArchitectureComponent; to: ArchitectureComponent }): HopExplanation
```

Body is assembled exclusively from `link.label` + endpoints' audited `detail.purpose`/`detail.role`; `citation` = first `refs` entry of either endpoint, else `null`.

## 9. Motion preferences

```ts
// src/components/architecture/ParticleMap/motionPreferences.ts
export interface MotionProfile { driftAmplitude: number; particleSpeed: number; cameraMs: number }
export function readMotionPreference(query: MediaQueryList): MotionProfile   // reduced-motion ⇒ calm profile
```
