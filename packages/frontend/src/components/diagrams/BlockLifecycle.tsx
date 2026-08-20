// BlockLifecycle Diagram Component - Mermaid diagram for validator processing flow
// // STAGE: diagram_block_lifecycle

import type { BlockLifecycleData } from '@shared/types'
import { MermaidDiagram } from './MermaidDiagram'

interface BlockLifecycleProps {
  data: BlockLifecycleData
}

export function BlockLifecycle({ data }: BlockLifecycleProps) {
  const mermaidDefinition = `
graph TD
    A[Transaction Received] --> B[Banking Stage]
    B --> C[Execute Transaction]
    C --> D[Record Entry]
    D --> E[Produce Block]
    E --> F[Vote on Block]
    F --> G[Block Finalized]

    style A fill:#3B82F6
    style B fill:#10B981
    style C fill:#8B5CF6
    style D fill:#F59E0B
    style E fill:#EC4899
    style F fill:#F97316
    style G fill:#22C55E
  `.trim()

  return (
    <MermaidDiagram
      definition={mermaidDefinition}
      title="Block Lifecycle Diagram"
    />
  )
}
