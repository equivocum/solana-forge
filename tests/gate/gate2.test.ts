// Gate 2 Test: RPC Submit - Tests actual RPC service
// // STAGE: gate2_test

import { describe, it, expect } from 'vitest'
import { createRpcService } from '../../packages/frontend/src/services/rpc'
import type { Transaction } from '../../packages/shared/types'

describe('Gate 2: RPC Submit', () => {
  const rpcService = createRpcService()

  const mockTransaction: Transaction = {
    signature: 'test-sig-123',
    feePayer: 'fee-payer-key',
    instructions: [{
      programId: '11111111111111111111111111111111',
      keys: [{ pubkey: 'account-1', isSigner: true, isWritable: true }],
      data: new Uint8Array([1, 2, 3])
    }],
    blockhash: 'recent-blockhash',
    signatures: [],
    status: 'pending',
    createdAt: new Date()
  }

  it('should submit transaction to RPC', async () => {
    const result = await rpcService.submitTransaction(mockTransaction)
    expect(result.signature).toBe('test-sig-123')
    expect(result.status).toBe('processing')
  })

  it('should simulate transaction', async () => {
    const result = await rpcService.simulateTransaction(mockTransaction)
    expect(result.success).toBe(true)
    expect(result.unitsConsumed).toBeGreaterThan(0)
  })

  it('should get signature status', async () => {
    await rpcService.submitTransaction(mockTransaction)
    const status = await rpcService.getSignatureStatus('test-sig-123')
    expect(status.signature).toBe('test-sig-123')
    expect(['pending', 'processing', 'confirmed', 'finalized']).toContain(status.status)
  })

  it('should poll commitment status', async () => {
    await rpcService.submitTransaction(mockTransaction)
    const status = await rpcService.pollSignature('test-sig-123', 'processed')
    expect(status.status).toBeDefined()
  })

  it('should get recent blockhash', async () => {
    const result = await rpcService.getRecentBlockhash()
    expect(result.blockhash).toBeDefined()
    expect(result.lastValidSlot).toBeGreaterThan(0)
  })
})
