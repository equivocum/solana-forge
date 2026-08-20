// Gate 2: RPC Processing & Simulation
// // STAGE: gate2_rpc_submit

import { useState } from 'react'
import { useAnnotations } from '../hooks/useAnnotations'
import { useKeypair } from '../hooks/useKeypair'
import { createRpcService } from '../services/rpc'
import { ErrorDisplay } from '../components/ErrorDisplay'
import { KeypairContextPanel } from '../components/KeypairContextPanel'
import type { Transaction, CommitmentLevel } from '@/types'

interface Gate2Props {
  onComplete: () => void
  'data-testid'?: string
}

export function Gate2RpcSubmit({ onComplete, 'data-testid': testId }: Gate2Props) {
  const { addAnnotation } = useAnnotations()
  const keypair = useKeypair()
  const [tx, setTx] = useState<Transaction | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ signature: string; status: string } | null>(null)
  const [commitment, setCommitment] = useState<CommitmentLevel>('processed')
  const [rpcError, setRpcError] = useState<Error | string | null>(null)

  const rpcService = createRpcService()

  const handleBuildTransaction = () => {
    // // STAGE: build_transaction
    addAnnotation('STAGE', 'Building transaction for RPC submission', 'services/transaction.ts', 2)
    
    const mockTx: Transaction = {
      signature: `tx-sig-${Date.now()}`,
      feePayer: 'fee-payer-pubkey',
      instructions: [{
        programId: '11111111111111111111111111111111',
        keys: [
          { pubkey: 'account-1', isSigner: true, isWritable: true }
        ],
        data: new Uint8Array([1, 2, 3])
      }],
      blockhash: 'recent-blockhash',
      signatures: [],
      status: 'pending',
      createdAt: new Date()
    }
    
    setTx(mockTx)
    // // WHY: transaction must be signed before RPC submission
    addAnnotation('WHY', 'Transaction must be signed before RPC submission', 'services/transaction.ts', 2)
  }

  const handleSubmit = async () => {
    if (!tx) return
    
    setSubmitting(true)
    // // STAGE: rpc_submit
    addAnnotation('STAGE', 'Submitting transaction to RPC node', 'services/rpc.ts', 2)
    
    try {
      const submitResult = await rpcService.submitTransaction(tx, commitment)
      setResult({
        signature: submitResult.signature,
        status: submitResult.status
      })
      
      // // WHY: RPC forwards to leader via gossip; does not execute
      addAnnotation('WHY', 'RPC forwards transaction to leader via gossip; does not execute', 'services/rpc.ts', 2)
      // // HOW: RPC validates signature and checks blockhash expiry
      addAnnotation('HOW', 'RPC validates signature and checks blockhash expiry before forwarding', 'services/rpc.ts', 2)
    } catch (error) {
      setRpcError(error instanceof Error ? error : String(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handlePollStatus = async () => {
    if (!result?.signature) return
    
    // // STAGE: commitment_polling
    addAnnotation('STAGE', 'Polling transaction commitment status', 'services/rpc.ts', 2)
    
    const status = await rpcService.pollSignature(result.signature, commitment)
    setResult(prev => prev ? { ...prev, status: status.status } : null)
    
    // // WHY: commitment levels indicate confirmation depth
    addAnnotation('WHY', 'Commitment levels indicate confirmation depth: Processed < Confirmed < Finalized', 'services/rpc.ts', 2)
  }

  return (
    <div className="space-y-6" data-testid={testId}>
      <h2 className="text-2xl font-bold">Gate 2: RPC Submit</h2>
      
      {/* Error Display */}
      <ErrorDisplay error={rpcError} onDismiss={() => setRpcError(null)} gateId={2} />
      
      {/* Build Transaction */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">1. Build Transaction</h3>
        <button
          onClick={handleBuildTransaction}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
        >
          Build Transaction
        </button>
        
        {tx && (
          <div className="mt-4 p-3 bg-gray-700 rounded">
            <label className="text-sm text-gray-400">Transaction Signature:</label>
            <p className="font-mono text-sm">{tx.signature}</p>
          </div>
        )}
      </div>
      
      {/* Submit to RPC */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">2. Submit to RPC</h3>
        
        <div className="mb-4">
          <label className="text-sm text-gray-400 mr-4">Commitment Level:</label>
          <select
            value={commitment}
            onChange={(e) => setCommitment(e.target.value as CommitmentLevel)}
            className="bg-gray-700 rounded px-2 py-1"
          >
            <option value="processed">Processed</option>
            <option value="confirmed">Confirmed</option>
            <option value="finalized">Finalized</option>
          </select>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!tx || submitting}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit to RPC'}
        </button>
        
        {result && (
          <div className="mt-4 p-3 bg-gray-700 rounded">
            <label className="text-sm text-gray-400">Status:</label>
            <p className="font-mono text-sm capitalize">{result.status}</p>
          </div>
        )}
      </div>
      
      {/* Poll Status */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">3. Poll Commitment Status</h3>
        <button
          onClick={handlePollStatus}
          disabled={!result?.signature}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded disabled:opacity-50"
        >
          Poll Status
        </button>
      </div>
      
      {/* Keypair Reference (from Gate 1) */}
      {keypair && <KeypairContextPanel keypair={keypair} />}

      {/* Complete Gate */}
      {result?.status === 'confirmed' || result?.status === 'finalized' ? (
        <button
          onClick={onComplete}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 rounded font-bold text-lg"
        >
          Complete Gate 2
        </button>
      ) : null}
    </div>
  )
}
