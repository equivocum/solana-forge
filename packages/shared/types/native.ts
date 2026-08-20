// napi-rs TypeScript interfaces for Rust native module interop
// // STAGE: native_types

export interface SimulationResult {
  success: boolean
  logs: string[]
  unitsConsumed: number
  returnData?: string
  error?: string
}

export interface PohTick {
  slot: number
  hash: string
  tickHeight: number
  ticksPerSlot: number
  hashChain: string[]
}

export interface SlashingEvent {
  validatorId: string
  reason: string
  slot: number
  timestamp: Date
}

export interface ValidatorConfig {
  id: string
  stake: number
  isLeader: boolean
}

export interface ProcessResult {
  success: boolean
  signature?: string
  error?: string
  unitsConsumed: number
}

export interface ValidatorState {
  id: string
  slot: number
  transactionsProcessed: number
  blocksProduced: number
  votesCast: number
}

export interface NativeBlock {
  slot: number
  parentSlot: number
  blockhash: string
  transactions: string[]
  signatures: string[]
  commitment: string
  leaderId: string
}

export interface NativeVote {
  validatorId: string
  slot: number
  lockout: number
  hash: string
}

export interface SimulationNative {
  initValidator(config: ValidatorConfig): void
  processTransaction(txBytes: Uint8Array): ProcessResult
  produceBlock(slot: number): NativeBlock | null
  castVote(validatorId: string, slot: number): NativeVote
  getPohTick(): PohTick
  getValidatorState(): ValidatorState
}
