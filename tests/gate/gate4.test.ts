// Gate 4 Test: Block Finalize - Tests actual finalization service
// // STAGE: gate4_test

import { describe, it, expect } from 'vitest'
import { createFinalizationService } from '../../packages/frontend/src/services/finalization'
import type { Block } from '../../packages/shared/types'

describe('Gate 4: Block Finalize', () => {
  const finalizationService = createFinalizationService()

  const mockBlock: Block = {
    slot: 1,
    parentSlot: 0,
    blockhash: 'blockhash-1',
    transactions: ['tx-1'],
    signatures: [],
    commitment: 'processed',
    leaderId: 'validator-1',
    createdAt: new Date()
  }

  it('should track commitment progression', async () => {
    const result = await finalizationService.trackCommitment(mockBlock)
    expect(result.commitment).toBe('finalized')
  })

  it('should get commitment status', async () => {
    await finalizationService.trackCommitment({ ...mockBlock, slot: 2 })
    const status = finalizationService.getCommitmentStatus(2)
    expect(status).toBe('finalized')
  })

  it('should return null for unknown slot', () => {
    const status = finalizationService.getCommitmentStatus(999)
    expect(status).toBeNull()
  })
})
