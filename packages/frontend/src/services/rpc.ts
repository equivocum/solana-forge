// RPC Service - Transaction submission and querying
// // STAGE: rpc_service

import type {
  Transaction,
  Block,
  CommitmentLevel,
  SimulationResult,
  Validator,
  Vote
} from '@shared/types'

export interface RpcService {
  // Transaction operations
  submitTransaction(tx: Transaction, commitment?: CommitmentLevel): Promise<SubmitResult>
  simulateTransaction(tx: Transaction): Promise<SimulationResult>
  getSignatureStatus(signature: string): Promise<TransactionStatus>
  
  // Block operations
  getBlock(slot: number, commitment?: CommitmentLevel): Promise<Block | null>
  getRecentBlockhash(commitment?: CommitmentLevel): Promise<BlockhashResult>
  
  // Validator operations
  getValidators(): Promise<Validator[]>
  getVoteAccounts(): Promise<VoteAccount[]>
  getLeaderSchedule(): Promise<LeaderSchedule>
  
  // Commitment tracking
  pollSignature(signature: string, commitment: CommitmentLevel): Promise<TransactionStatus>
  
  // Events
  onTransactionStatus(callback: (status: TransactionStatusEvent) => void): () => void
}

export interface SubmitResult {
  signature: string
  status: 'pending' | 'processing'
  simulationResult?: SimulationResult
}

export interface TransactionStatus {
  signature: string
  status: 'pending' | 'processing' | 'confirmed' | 'finalized' | 'failed'
  slot?: number
  error?: string
  confirmationStatus?: CommitmentLevel
}

export interface TransactionStatusEvent {
  type: 'status_change'
  signature: string
  status: TransactionStatus['status']
  slot?: number
  timestamp: Date
}

export interface BlockhashResult {
  blockhash: string
  lastValidSlot: number
  feeCalculator: {
    lamportsPerSignature: number
  }
}

export interface VoteAccount {
  votePubkey: string
  nodePubkey: string
  activatedStake: number
  lastVote: number
  rootSlot: number
}

export interface LeaderSchedule {
  leaderSchedule: Record<string, number[]>
  currentLeader: string
  nextLeader: string
}

export function createRpcService(): RpcService {
  // Internal state
  const transactions = new Map<string, Transaction>()
  const blocks = new Map<number, Block>()
  const statusCallbacks = new Set<(status: TransactionStatusEvent) => void>()

  function notifyStatusChange(event: TransactionStatusEvent) {
    statusCallbacks.forEach(cb => cb(event))
  }

  return {
    async submitTransaction(tx: Transaction, commitment: CommitmentLevel = 'processed'): Promise<SubmitResult> {
      // Store transaction
      transactions.set(tx.signature, { ...tx, status: 'processing' })
      
      // Notify status change
      notifyStatusChange({
        type: 'status_change',
        signature: tx.signature,
        status: 'processing',
        timestamp: new Date()
      })

      // Simulate first
      const simulation = await this.simulateTransaction(tx)
      
      return {
        signature: tx.signature,
        status: 'processing',
        simulationResult: simulation
      }
    },

    async simulateTransaction(tx: Transaction): Promise<SimulationResult> {
      // Mock simulation - in real implementation, this calls native module
      return {
        success: true,
        logs: [
          'Program 11111111111111111111111111111111 invoke [1]',
          'Program 11111111111111111111111111111111 success'
        ],
        unitsConsumed: 150
      }
    },

    async getSignatureStatus(signature: string): Promise<TransactionStatus> {
      const tx = transactions.get(signature)
      if (!tx) {
        return {
          signature,
          status: 'failed',
          error: 'Transaction not found'
        }
      }
      
      return {
        signature,
        status: tx.status,
        slot: tx.status === 'confirmed' ? 100 : undefined
      }
    },

    async getBlock(slot: number, commitment: CommitmentLevel = 'processed'): Promise<Block | null> {
      return blocks.get(slot) || null
    },

    async getRecentBlockhash(commitment: CommitmentLevel = 'processed'): Promise<BlockhashResult> {
      return {
        blockhash: 'recentBlockhash11111111111111111111111111111111',
        lastValidSlot: 150,
        feeCalculator: {
          lamportsPerSignature: 5000
        }
      }
    },

    async getValidators(): Promise<Validator[]> {
      return [
        {
          id: 'validator-1',
          stake: 1000000,
          isLeader: true,
          voteTower: [],
          lastVoteSlot: 0
        }
      ]
    },

    async getVoteAccounts(): Promise<VoteAccount[]> {
      return [
        {
          votePubkey: 'vote-pubkey-1',
          nodePubkey: 'node-pubkey-1',
          activatedStake: 1000000,
          lastVote: 0,
          rootSlot: 0
        }
      ]
    },

    async getLeaderSchedule(): Promise<LeaderSchedule> {
      return {
        leaderSchedule: {
          'validator-1': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        },
        currentLeader: 'validator-1',
        nextLeader: 'validator-1'
      }
    },

    async pollSignature(signature: string, commitment: CommitmentLevel): Promise<TransactionStatus> {
      // Mock polling - in real implementation, this polls until commitment reached
      const tx = transactions.get(signature)
      if (!tx) {
        return {
          signature,
          status: 'failed',
          error: 'Transaction not found'
        }
      }

      // Simulate commitment progression
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (commitment === 'processed') {
        tx.status = 'confirmed'
        return { signature, status: 'confirmed', slot: 100 }
      } else if (commitment === 'confirmed') {
        tx.status = 'finalized'
        return { signature, status: 'finalized', slot: 100 }
      }
      
      return { signature, status: tx.status }
    },

    onTransactionStatus(callback: (status: TransactionStatusEvent) => void): () => void {
      statusCallbacks.add(callback)
      return () => statusCallbacks.delete(callback)
    }
  }
}
