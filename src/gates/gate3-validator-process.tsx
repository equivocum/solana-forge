// Gate 3: Validator Execution & Block Production
// // STAGE: gate3_validator_process

import { useState } from 'react'
import { useAnnotations } from '../hooks/useAnnotations'
import { useKeypair } from '../hooks/useKeypair'
import { KeypairContextPanel } from '../components/KeypairContextPanel'
import type { Block, Vote } from '@/types'

interface Gate3Props {
  onComplete: () => void
  'data-testid'?: string
}

export function Gate3ValidatorProcess({ onComplete, 'data-testid': testId }: Gate3Props) {
  const { addAnnotation } = useAnnotations()
  const keypair = useKeypair()
  const [validatorRunning, setValidatorRunning] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [votes, setVotes] = useState<Vote[]>([])

  const handleStartValidator = () => {
    // // STAGE: validator_startup
    addAnnotation('STAGE', 'Starting validator node', 'services/validator.ts', 3)
    setValidatorRunning(true)
    // // WHY: validator must initialize before processing transactions
    addAnnotation('WHY', 'Validator must initialize banking stage and vote tower before processing', 'services/validator.ts', 3)
  }

  const handleProcessTransaction = () => {
    if (!validatorRunning) return
    
    // // STAGE: validator_execute
    addAnnotation('STAGE', 'Validator executing transaction', 'services/validator.ts', 3)
    
    // Simulate block production
    const newBlock: Block = {
      slot: blocks.length + 1,
      parentSlot: blocks.length,
      blockhash: `blockhash-${Date.now()}`,
      transactions: [`tx-${Date.now()}`],
      signatures: [],
      commitment: 'processed',
      leaderId: 'validator-1',
      createdAt: new Date()
    }
    
    setBlocks(prev => [...prev, newBlock])
    // // DECISION: leader selected via stake-weighted schedule
    addAnnotation('DECISION', `Leader selected via stake-weighted schedule for slot ${newBlock.slot}`, 'services/validator.ts', 3)
  }

  const handleCastVote = () => {
    if (blocks.length === 0) return
    
    const lastBlock = blocks[blocks.length - 1]
    // // STAGE: vote_submission
    addAnnotation('STAGE', 'Validator casting vote', 'services/validator.ts', 3)
    
    const newVote: Vote = {
      validatorId: 'validator-1',
      slot: lastBlock.slot,
      lockout: 32,
      hash: `vote-hash-${Date.now()}`,
      timestamp: new Date()
    }
    
    setVotes(prev => [...prev, newVote])
    // // DECISION: vote tower depth=32 lockout
    addAnnotation('DECISION', 'Vote tower depth=32 lockout, committing to fork', 'services/validator.ts', 3)
  }

  return (
    <div className="space-y-6" data-testid={testId}>
      <h2 className="text-2xl font-bold">Gate 3: Validator Process</h2>
      
      {/* Start Validator */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">1. Start Validator</h3>
        <button
          onClick={handleStartValidator}
          disabled={validatorRunning}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded disabled:opacity-50"
        >
          {validatorRunning ? 'Validator Running' : 'Start Validator'}
        </button>
      </div>
      
      {/* Process Transaction */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">2. Process Transaction</h3>
        <button
          onClick={handleProcessTransaction}
          disabled={!validatorRunning}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded disabled:opacity-50"
        >
          Process Transaction
        </button>
        
        {blocks.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm text-gray-400">Produced Blocks:</h4>
            {blocks.map(block => (
              <div key={block.slot} className="p-2 bg-gray-700 rounded text-sm">
                Slot {block.slot} | Hash: {block.blockhash.substring(0, 20)}...
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Cast Vote */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">3. Cast Vote</h3>
        <button
          onClick={handleCastVote}
          disabled={blocks.length === 0}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded disabled:opacity-50"
        >
          Cast Vote
        </button>
        
        {votes.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm text-gray-400">Votes Cast:</h4>
            {votes.map((vote, idx) => (
              <div key={idx} className="p-2 bg-gray-700 rounded text-sm">
                Slot {vote.slot} | Lockout: {vote.lockout}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Complete Gate */}
      {votes.length > 0 && (
        <button
          onClick={onComplete}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 rounded font-bold text-lg"
        >
          Complete Gate 3
        </button>
      )}

      {/* Keypair Reference (from Gate 1) */}
      {keypair && <KeypairContextPanel keypair={keypair} />}
    </div>
  )
}
