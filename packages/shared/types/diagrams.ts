// Diagram data contracts for Mermaid.js visualization
// // STAGE: diagram_types

import type { Annotation, CommitmentLevel } from './index'

export interface TransactionFlowData {
  steps: TransactionFlowStep[]
  currentStep: number
}

export interface TransactionFlowStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'completed' | 'error'
  annotation?: Annotation
}

export interface BlockLifecycleData {
  slot: number
  stages: BlockStage[]
  currentStage: number
}

export interface BlockStage {
  id: string
  label: string
  commitment: CommitmentLevel
  timestamp?: Date
}

export interface ForkResolutionData {
  forks: Fork[]
  resolvedForkId?: string
}

export interface Fork {
  id: string
  slot: number
  stakeWeight: number
  transactions: string[]
  isWinning: boolean
}
