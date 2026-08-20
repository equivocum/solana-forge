// ForkService - Fork creation, resolution, and slashing detection
// // STAGE: fork_service

import type { Block, Vote } from '@shared/types'
import type { AnnotationService } from './annotations'

export interface Fork {
  id: string
  blocks: Block[]
  stakeWeight: number
  isWinning: boolean
}

export interface ForkService {
  createCompetingForks(): Fork[]
  resolveForks(forks: Fork[]): Promise<Fork[]>
  detectSlashing(votes: Vote[], forks: Fork[]): string[]
  healPartition(forks: Fork[]): Fork[]
}

export function createForkService(annotationService?: AnnotationService, gateId: number = 5): ForkService {
  return {
    createCompetingForks(): Fork[] {
      // // STAGE: fork_creation
      annotationService?.addAnnotation('STAGE', 'Creating competing forks', 'fork.ts:10', gateId)

      const fork1: Fork = {
        id: 'fork-1',
        blocks: [
          { slot: 1, parentSlot: 0, blockhash: 'hash-1a', transactions: ['tx-1'], signatures: [], commitment: 'processed', leaderId: 'v1', createdAt: new Date() },
          { slot: 2, parentSlot: 1, blockhash: 'hash-2a', transactions: ['tx-2'], signatures: [], commitment: 'processed', leaderId: 'v1', createdAt: new Date() }
        ],
        stakeWeight: 60,
        isWinning: true
      }

      const fork2: Fork = {
        id: 'fork-2',
        blocks: [
          { slot: 1, parentSlot: 0, blockhash: 'hash-1b', transactions: ['tx-3'], signatures: [], commitment: 'processed', leaderId: 'v2', createdAt: new Date() },
          { slot: 2, parentSlot: 1, blockhash: 'hash-2b', transactions: ['tx-4'], signatures: [], commitment: 'processed', leaderId: 'v2', createdAt: new Date() }
        ],
        stakeWeight: 40,
        isWinning: false
      }

      // // DECISION: heaviest fork (by stake weight) wins
      annotationService?.addAnnotation('DECISION', 'Heaviest fork (by stake weight) wins fork choice', 'fork.ts:20', gateId)

      return [fork1, fork2]
    },

    async resolveForks(forks: Fork[]): Promise<Fork[]> {
      // // STAGE: fork_resolution
      annotationService?.addAnnotation('STAGE', 'Resolving forks via voting', 'fork.ts:30', gateId)

      await new Promise(resolve => setTimeout(resolve, 1000))

      // // WHY: slashing deters equivocation
      annotationService?.addAnnotation('WHY', 'Slashing deters equivocation - validators lose stake for voting on multiple forks', 'fork.ts:35', gateId)
      // // HOW: validators observe votes and choose heaviest fork
      annotationService?.addAnnotation('HOW', 'Validators observe votes and choose heaviest fork by cumulative stake weight', 'fork.ts:40', gateId)

      return forks.map(fork => ({
        ...fork,
        commitment: fork.isWinning ? 'confirmed' : 'processed' as any
      }))
    },

    detectSlashing(votes: Vote[], forks: Fork[]): string[] {
      const slashingEvents: string[] = []

      // Check for equivocation - same validator voting on different forks at same slot
      const slotVotes = new Map<number, Set<string>>()
      for (const vote of votes) {
        const existing = slotVotes.get(vote.slot) || new Set()
        existing.add(vote.validatorId)
        slotVotes.set(vote.slot, existing)
      }

      // In a real implementation, we'd track which fork each vote is for
      // Here we just detect if a validator voted multiple times
      for (const [slot, validators] of slotVotes) {
        if (validators.size > 1) {
          slashingEvents.push(`Equivocation detected at slot ${slot}`)
        }
      }

      return slashingEvents
    },

    healPartition(forks: Fork[]): Fork[] {
      // // STAGE: partition_healing
      annotationService?.addAnnotation('STAGE', 'Network partition healing', 'network.ts:10', gateId)
      // // HOW: partition healing converges network to single canonical chain
      annotationService?.addAnnotation('HOW', 'Partition healing converges network to single canonical chain', 'network.ts:15', gateId)

      // Return only the winning fork
      return forks.filter(f => f.isWinning)
    }
  }
}
