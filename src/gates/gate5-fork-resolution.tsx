// Gate 5: Fork Resolution & Network Dynamics
// // STAGE: gate5_fork_resolution

import { useState } from 'react'
import { useAnnotations } from '../hooks/useAnnotations'
import { useKeypair } from '../hooks/useKeypair'
import { KeypairContextPanel } from '../components/KeypairContextPanel'
import type { Block } from '@/types'

interface Fork {
  id: string
  blocks: Block[]
  stakeWeight: number
  isWinning: boolean
}

interface Gate5Props {
  onComplete: () => void
  'data-testid'?: string
}

export function Gate5ForkResolution({ onComplete, 'data-testid': testId }: Gate5Props) {
  const { addAnnotation } = useAnnotations()
  const keypair = useKeypair()
  const [forks, setForks] = useState<Fork[]>([])
  const [resolved, setResolved] = useState(false)

  const handleCreateForks = () => {
    // // STAGE: fork_creation
    addAnnotation('STAGE', 'Creating competing forks', 'services/fork.ts', 5)
    
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
    
    setForks([fork1, fork2])
    // // DECISION: heaviest fork (by stake weight) wins
    addAnnotation('DECISION', 'Heaviest fork (by stake weight) wins fork choice', 'services/fork.ts', 5)
  }

  const handleResolveForks = async () => {
    // // STAGE: fork_resolution
    addAnnotation('STAGE', 'Resolving forks via voting', 'services/fork.ts', 5)
    
    // Simulate voting and resolution
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setForks(prev => prev.map(fork => ({
      ...fork,
      commitment: fork.isWinning ? 'confirmed' : 'processed'
    })))
    
    // // WHY: slashing deters equivocation
    addAnnotation('WHY', 'Slashing deters equivocation - validators lose stake for voting on multiple forks', 'services/fork.ts', 5)
    // // HOW: validators observe votes and choose heaviest fork
    addAnnotation('HOW', 'Validators observe votes and choose heaviest fork by cumulative stake weight', 'services/fork.ts', 5)
    
    setResolved(true)
  }

  const handleHealPartition = () => {
    // // STAGE: partition_healing
    addAnnotation('STAGE', 'Network partition healing', 'services/fork.ts', 5)
    
    // Remove losing fork
    setForks(prev => prev.filter(f => f.isWinning))
    // // HOW: partition healing and chain convergence
    addAnnotation('HOW', 'Partition healing converges network to single canonical chain', 'services/fork.ts', 5)
  }

  return (
    <div className="space-y-6" data-testid={testId}>
      <h2 className="text-2xl font-bold">Gate 5: Fork Resolution</h2>
      
      {/* Create Forks */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">1. Create Competing Forks</h3>
        <button
          onClick={handleCreateForks}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
        >
          Create Forks
        </button>
        
        {forks.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {forks.map(fork => (
              <div key={fork.id} className={`p-3 rounded ${
                fork.isWinning ? 'bg-green-800' : 'bg-red-800'
              }`}>
                <h4 className="font-semibold">{fork.id}</h4>
                <p className="text-sm">Stake: {fork.stakeWeight}%</p>
                <p className="text-sm">Blocks: {fork.blocks.length}</p>
                {fork.isWinning && <span className="text-green-400">✓ Winning</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Resolve Forks */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">2. Resolve Forks</h3>
        <button
          onClick={handleResolveForks}
          disabled={forks.length === 0 || resolved}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded disabled:opacity-50"
        >
          {resolved ? 'Resolved' : 'Resolve Forks'}
        </button>
      </div>
      
      {/* Heal Partition */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">3. Heal Network Partition</h3>
        <button
          onClick={handleHealPartition}
          disabled={!resolved}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded disabled:opacity-50"
        >
          Heal Partition
        </button>
      </div>
      
      {/* Complete Gate */}
      {resolved && forks.length === 1 && (
        <button
          onClick={onComplete}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 rounded font-bold text-lg"
        >
          Complete Gate 5
        </button>
      )}

      {/* Keypair Reference (from Gate 1) */}
      {keypair && <KeypairContextPanel keypair={keypair} />}
    </div>
  )
}
