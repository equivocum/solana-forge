// FinalizationService - Block commitment tracking
// // STAGE: finalization_service

import type { Block, CommitmentLevel } from '@shared/types'
import type { AnnotationService } from './annotations'

export interface FinalizationService {
  trackCommitment(block: Block): Promise<Block>
  getCommitmentStatus(slot: number): CommitmentLevel | null
}

export function createFinalizationService(annotationService?: AnnotationService, gateId: number = 4): FinalizationService {
  const commitments = new Map<number, CommitmentLevel>()

  return {
    async trackCommitment(block: Block): Promise<Block> {
      // // STAGE: commitment_tracking
      annotationService?.addAnnotation('STAGE', 'Tracking block commitment progression', 'finalization.ts:10', gateId)

      let current: CommitmentLevel = 'processed'
      commitments.set(block.slot, current)

      // Simulate progression: processed -> confirmed -> finalized
      await new Promise(resolve => setTimeout(resolve, 500))
      current = 'confirmed'
      commitments.set(block.slot, current)

      await new Promise(resolve => setTimeout(resolve, 500))
      current = 'finalized'
      commitments.set(block.slot, current)

      // // WHY: 2/3 stake weight required for finalization
      annotationService?.addAnnotation('WHY', '2/3 stake weight required for finalization (supermajority)', 'finalization.ts:20', gateId)
      // // DECISION: fork choice rule selected heaviest fork
      annotationService?.addAnnotation('DECISION', 'Fork choice rule selected heaviest fork by stake weight', 'finalization.ts:25', gateId)

      return { ...block, commitment: current }
    },

    getCommitmentStatus(slot: number): CommitmentLevel | null {
      return commitments.get(slot) || null
    }
  }
}
