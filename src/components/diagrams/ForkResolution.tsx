// ForkResolution Diagram Component - Mermaid diagram for fork resolution flow
// // STAGE: diagram_fork_resolution

import type { ForkResolutionData } from '@/types'
import { MermaidDiagram } from './MermaidDiagram'

interface ForkResolutionProps {
  data: ForkResolutionData
}

export function ForkResolution({ data: _data }: ForkResolutionProps) {
  const mermaidDefinition = `
graph TD
    A[Network Partition] --> B[Fork 1: 60% stake]
    A --> C[Fork 2: 40% stake]
    B --> D[Validators Vote]
    C --> D
    D --> E{Fork Choice}
    E -->|Heaviest| F[Winning Fork]
    E -->|Lighter| G[Losing Fork]
    G --> H[Slashing]
    F --> I[Finalization]

    style A fill:#EF4444
    style B fill:#22C55E
    style C fill:#EF4444
    style D fill:#3B82F6
    style E fill:#F59E0B
    style F fill:#22C55E
    style G fill:#EF4444
    style H fill:#EF4444
    style I fill:#22C55E
  `.trim()

  return (
    <MermaidDiagram
      definition={mermaidDefinition}
      title="Fork Resolution Diagram"
    />
  )
}
