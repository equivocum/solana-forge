// Simulation Engine Interface - Core simulation abstraction
// // STAGE: simulation_interface

import type {
  Transaction,
  Block,
  Vote,
  Annotation,
  SimulationState,
  SimulationResult,
  PohTick,
  ValidatorState,
  ValidatorConfig,
  ProcessResult
} from '@/types'

export interface SimulationEngine {
  // Lifecycle
  start(): Promise<void>
  pause(): void
  resume(): void
  stop(): void

  // Configuration
  setTickRate(ms: number): void
  setSpeedMultiplier(factor: number): void
  enableSlowMotion(enabled: boolean): void
  step(): void // Manual tick advancement for slow-motion

  // Transaction submission
  submitTransaction(tx: Transaction): Promise<string>
  simulateTransaction(tx: Transaction): Promise<SimulationResult>

  // State queries
  getState(): SimulationState
  getSlot(): number
  getTransactions(): Transaction[]
  getBlocks(): Block[]
  getVotes(): Vote[]
  getPohTick(): PohTick
  getValidatorState(): ValidatorState

  // Events
  onTick(callback: (slot: number) => void): () => void
  onBlock(callback: (block: Block) => void): () => void
  onVote(callback: (vote: Vote) => void): () => void
  onAnnotation(callback: (annotation: Annotation) => void): () => void
  onTransaction(callback: (tx: Transaction) => void): () => void
}

export interface SimulationEngineConfig {
  tickRate: number // Default: 400ms (matching Solana slot time)
  speedMultiplier: number // 0.25x - 4x
  slowMotionEnabled: boolean
  validatorConfig: ValidatorConfig
}

export const DEFAULT_SIMULATION_CONFIG: SimulationEngineConfig = {
  tickRate: 400,
  speedMultiplier: 1,
  slowMotionEnabled: false,
  validatorConfig: {
    id: 'validator-1',
    stake: 1000000,
    isLeader: true
  }
}

// Native module interface (implemented in Rust via napi-rs)
export interface SimulationNative {
  // Initialize validator simulation
  initValidator(config: ValidatorConfig): void

  // Process transaction
  processTransaction(txBytes: Uint8Array): ProcessResult

  // Produce block
  produceBlock(slot: number): Block | null

  // Cast vote
  castVote(validatorId: string, slot: number): Vote

  // Get PoH tick
  getPohTick(): PohTick

  // Get state
  getValidatorState(): ValidatorState
}
