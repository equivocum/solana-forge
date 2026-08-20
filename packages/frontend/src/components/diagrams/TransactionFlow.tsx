// TransactionFlow Diagram Component - Mermaid diagram for transaction signing flow
// // STAGE: diagram_transaction_flow

import type { TransactionFlowData } from '@shared/types'
import { MermaidDiagram } from './MermaidDiagram'

interface TransactionFlowProps {
  data: TransactionFlowData
}

export function TransactionFlow({ data }: TransactionFlowProps) {
  const mermaidDefinition = `
graph TD
    A[Generate Keypair] --> B[Create Transaction]
    B --> C[Sign Transaction]
    C --> D[Submit to RPC]
    D --> E[RPC Validates]
    E --> F[Forward to Leader]

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
      title="Transaction Flow Diagram"
    />
  )
}
