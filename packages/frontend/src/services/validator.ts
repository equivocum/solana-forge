// ValidatorService - Validator lifecycle management
// // STAGE: validator_service

import type { Validator, ValidatorState, Block, Vote } from '@shared/types'
import type { AnnotationService } from './annotations'

export interface ValidatorService {
  startValidator(): Promise<void>
  stopValidator(): void
  getValidatorState(): ValidatorState
  processTransaction(txBytes: Uint8Array): { success: boolean; signature?: string; unitsConsumed: number }
  produceBlock(slot: number): Block | null
  castVote(slot: number): Vote
}

export function createValidatorService(annotationService?: AnnotationService, gateId: number = 3): ValidatorService {
  let running = false
  let state: ValidatorState = {
    id: 'validator-1',
    slot: 0,
    transactionsProcessed: 0,
    blocksProduced: 0,
    votesCast: 0
  }

  return {
    async startValidator(): Promise<void> {
      // // STAGE: validator_startup
      annotationService?.addAnnotation('STAGE', 'Starting validator node', 'validator.ts:15', gateId)
      running = true
      // // WHY: validator must initialize before processing transactions
      annotationService?.addAnnotation('WHY', 'Validator initializes banking stage and vote tower before processing', 'validator.ts:18', gateId)
    },

    stopValidator(): void {
      running = false
    },

    getValidatorState(): ValidatorState {
      return { ...state }
    },

    processTransaction(txBytes: Uint8Array): { success: boolean; signature?: string; unitsConsumed: number } {
      if (!running) return { success: false, unitsConsumed: 0 }

      state.transactionsProcessed++
      const signature = `sig-${state.slot}-${state.transactionsProcessed}`

      return {
        success: true,
        signature,
        unitsConsumed: 150
      }
    },

    produceBlock(slot: number): Block | null {
      if (!running) return null

      state.slot = slot
      state.blocksProduced++

      // // DECISION: leader selected via stake-weighted schedule
      annotationService?.addAnnotation('DECISION', `Leader selected via stake-weighted schedule for slot ${slot}`, 'validator.ts:30', gateId)

      return {
        slot,
        parentSlot: slot - 1,
        blockhash: `blockhash-${slot}`,
        transactions: [],
        signatures: [],
        commitment: 'processed',
        leaderId: state.id,
        createdAt: new Date()
      }
    },

    castVote(slot: number): Vote {
      state.votesCast++

      // // DECISION: vote tower depth=32 lockout
      annotationService?.addAnnotation('DECISION', 'Vote tower depth=32 lockout, committing to fork', 'validator.ts:40', gateId)

      return {
        validatorId: state.id,
        slot,
        lockout: 32,
        hash: `vote-hash-${slot}`,
        timestamp: new Date()
      }
    }
  }
}
