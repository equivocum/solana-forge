// Gate 4: Block Finalization & Commitment
// // STAGE: gate4_block_finalize

import { useState } from 'react'
import { useAnnotations } from '../hooks/useAnnotations'
import { createStorageService } from '../services/storage'
import type { Block, CommitmentLevel, Keypair } from '@shared/types'

const toHex = (b: Uint8Array) => Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('')

interface Gate4Props {
  onComplete: () => void
  'data-testid'?: string
}

export function Gate4BlockFinalize({ onComplete, 'data-testid': testId }: Gate4Props) {
  const { addAnnotation } = useAnnotations()
  const [blocks, setBlocks] = useState<Block[]>([])
  const [tracking, setTracking] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [keypair, setKeypair] = useState<Keypair | null>(null)

  useState(() => {
    const storage = createStorageService()
    storage.getProgress().then(progress => {
      const gate1Data = progress.gateData?.[1]
      if (gate1Data && (gate1Data as any).keypair) {
        setKeypair((gate1Data as any).keypair)
      }
    })
  })

  const handleProduceBlocks = () => {
    // // STAGE: produce_blocks
    addAnnotation('STAGE', 'Producing blocks for finalization tracking', 'services/finalization.ts', 4)
    
    const newBlocks: Block[] = Array.from({ length: 5 }, (_, i) => ({
      slot: blocks.length + i + 1,
      parentSlot: blocks.length + i,
      blockhash: `blockhash-${Date.now()}-${i}`,
      transactions: [`tx-${i}`],
      signatures: [],
      commitment: 'processed' as CommitmentLevel,
      leaderId: 'validator-1',
      createdAt: new Date()
    }))
    
    setBlocks(prev => [...prev, ...newBlocks])
  }

  const handleTrackFinalization = async () => {
    // // STAGE: commitment_tracking
    addAnnotation('STAGE', 'Tracking block commitment progression', 'services/finalization.ts', 4)
    setTracking(true)
    
    // Simulate commitment progression
    for (let i = 0; i < blocks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setBlocks(prev => prev.map((block, idx) => {
        if (idx !== i) return block
        
        // Advance commitment level
        if (block.commitment === 'processed') {
          return { ...block, commitment: 'confirmed' as CommitmentLevel }
        } else if (block.commitment === 'confirmed') {
          return { ...block, commitment: 'finalized' as CommitmentLevel }
        }
        return block
      }))
    }
    
    // // WHY: 2/3 stake weight required for finalization
    addAnnotation('WHY', '2/3 stake weight required for finalization (supermajority)', 'services/finalization.ts', 4)
    // // DECISION: fork choice rule selected heaviest fork
    addAnnotation('DECISION', 'Fork choice rule selected heaviest fork by stake weight', 'services/finalization.ts', 4)
    setTracking(false)
  }

  return (
    <div className="space-y-6" data-testid={testId}>
      <h2 className="text-2xl font-bold">Gate 4: Block Finalize</h2>
      
      {/* Produce Blocks */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">1. Produce Blocks</h3>
        <button
          onClick={handleProduceBlocks}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
        >
          Produce Blocks
        </button>
        
        {blocks.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm text-gray-400">Blocks:</h4>
            {blocks.map(block => (
              <div key={block.slot} className={`p-2 rounded text-sm ${
                block.commitment === 'finalized' ? 'bg-green-800' :
                block.commitment === 'confirmed' ? 'bg-yellow-800' : 'bg-gray-700'
              }`}>
                Slot {block.slot} | Commitment: {block.commitment}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Track Finalization */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">2. Track Finalization</h3>
        <button
          onClick={handleTrackFinalization}
          disabled={blocks.length === 0 || tracking}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded disabled:opacity-50"
        >
          {tracking ? 'Tracking...' : 'Track Finalization'}
        </button>
      </div>
      
      {/* Complete Gate */}
      {blocks.some(b => b.commitment === 'finalized') && (
        <button
          onClick={onComplete}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 rounded font-bold text-lg"
        >
          Complete Gate 4
        </button>
      )}

      {/* Keypair Reference (from Gate 1) */}
      {keypair && (
        <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-4">
            <span className="text-blue-400">Keypair Context</span>
            <span className="ml-2 text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded">REF: crypto.ts</span>
          </h3>
          <div className="p-3 bg-gray-700 rounded">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Private Key (from Gate 1):</label>
              <button
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {showPrivateKey ? 'Hide' : 'Show'}
              </button>
            </div>
            {showPrivateKey ? (
              <p className="font-mono text-sm text-red-400 break-all">
                ⚠️ {typeof keypair.privateKey === 'string' ? keypair.privateKey : toHex(keypair.privateKey)}
              </p>
            ) : (
              <p className="font-mono text-sm text-gray-500">••••••••••••••••</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
