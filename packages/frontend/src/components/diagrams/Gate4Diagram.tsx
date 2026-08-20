// Gate4Diagram - Block Finalization Diagram wrapper per FR-008
// // STAGE: gate4_diagram

import type { BlockLifecycleData } from '@shared/types'
import { MermaidDiagram } from './MermaidDiagram'

interface Gate4DiagramProps {
  data?: BlockLifecycleData
}

export function Gate4Diagram({ data }: Gate4DiagramProps) {
  const mermaidDefinition = `
graph TD
    A[Block Produced] --> B[Processed]
    B --> C[Leader Vote]
    C --> D[Confirmed]
    D --> E[2/3 Supermajority]
    E --> F[Finalized]

    style A fill:#3B82F6
    style B fill:#F59E0B
    style C fill:#8B5CF6
    style D fill:#F59E0B
    style E fill:#EC4899
    style F fill:#22C55E
  `.trim()

  return (
    <MermaidDiagram
      definition={mermaidDefinition}
      title="Block Finalization Diagram"
    />
  )
}
