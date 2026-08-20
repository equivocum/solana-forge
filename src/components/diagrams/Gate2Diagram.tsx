// Gate2Diagram - RPC Flow Diagram wrapper per FR-008
// // STAGE: gate2_diagram

import type { TransactionFlowData } from '@/types'
import { MermaidDiagram } from './MermaidDiagram'

interface Gate2DiagramProps {
  data?: TransactionFlowData
}

export function Gate2Diagram({ data: _data }: Gate2DiagramProps) {
  const mermaidDefinition = `
graph TD
    A[Signed Transaction] --> B[RPC Receive]
    B --> C[Simulate]
    C --> D[Preflight Checks]
    D --> E[Forward to Leader]
    E --> F[Subscribe Status]

    style A fill:#3B82F6
    style B fill:#10B981
    style C fill:#8B5CF6
    style D fill:#F59E0B
    style E fill:#EC4899
    style F fill:#F97316
  `.trim()

  return (
    <MermaidDiagram
      definition={mermaidDefinition}
      title="RPC Processing Diagram"
    />
  )
}
