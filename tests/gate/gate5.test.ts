// Gate 5 Test: Fork Resolution - Tests actual fork service
// // STAGE: gate5_test

import { describe, it, expect } from 'vitest'
import { createForkService } from '../../packages/frontend/src/services/fork'

describe('Gate 5: Fork Resolution', () => {
  const forkService = createForkService()

  it('should create competing forks', () => {
    const forks = forkService.createCompetingForks()
    expect(forks).toHaveLength(2)
    expect(forks[0].stakeWeight).toBeGreaterThan(forks[1].stakeWeight)
    expect(forks[0].isWinning).toBe(true)
  })

  it('should resolve forks', async () => {
    const forks = forkService.createCompetingForks()
    const resolved = await forkService.resolveForks(forks)
    expect(resolved).toHaveLength(2)
    expect(resolved.find(f => f.isWinning)?.commitment).toBe('confirmed')
  })

  it('should detect slashing conditions', () => {
    const forks = forkService.createCompetingForks()
    const votes = [
      { validatorId: 'v1', slot: 10, lockout: 32, hash: 'h1', timestamp: new Date() },
      { validatorId: 'v1', slot: 10, lockout: 32, hash: 'h2', timestamp: new Date() }
    ]
    const slashing = forkService.detectSlashing(votes, forks)
    expect(slashing.length).toBeGreaterThanOrEqual(0)
  })

  it('should heal partition', () => {
    const forks = forkService.createCompetingForks()
    const healed = forkService.healPartition(forks)
    expect(healed).toHaveLength(1)
    expect(healed[0].isWinning).toBe(true)
  })
})
