// Gate 3 Test: Validator Process - Tests actual validator service
// // STAGE: gate3_test

import { describe, it, expect } from 'vitest'
import { createValidatorService } from '../../packages/frontend/src/services/validator'

describe('Gate 3: Validator Process', () => {
  it('should start and stop validator', async () => {
    const validator = createValidatorService()
    await validator.startValidator()

    const state = validator.getValidatorState()
    expect(state.id).toBe('validator-1')

    validator.stopValidator()
  })

  it('should process transaction when running', async () => {
    const validator = createValidatorService()
    await validator.startValidator()

    const result = validator.processTransaction(new Uint8Array([1, 2, 3]))
    expect(result.success).toBe(true)
    expect(result.signature).toBeDefined()
    expect(result.unitsConsumed).toBe(150)

    validator.stopValidator()
  })

  it('should produce block', async () => {
    const validator = createValidatorService()
    await validator.startValidator()

    const block = validator.produceBlock(1)
    expect(block).not.toBeNull()
    expect(block!.slot).toBe(1)
    expect(block!.leaderId).toBe('validator-1')

    validator.stopValidator()
  })

  it('should cast vote', async () => {
    const validator = createValidatorService()
    await validator.startValidator()

    const vote = validator.castVote(10)
    expect(vote.validatorId).toBe('validator-1')
    expect(vote.slot).toBe(10)
    expect(vote.lockout).toBe(32)

    validator.stopValidator()
  })

  it('should track state across operations', async () => {
    const validator = createValidatorService()
    await validator.startValidator()

    validator.processTransaction(new Uint8Array([1]))
    validator.processTransaction(new Uint8Array([2]))
    validator.produceBlock(1)

    const state = validator.getValidatorState()
    expect(state.transactionsProcessed).toBe(2)
    expect(state.blocksProduced).toBe(1)

    validator.stopValidator()
  })
})
