// Shared TypeScript interfaces for Solana Block Lifecycle Learning Game

// === Simulation State ===

export interface SimulationState {
  status: 'idle' | 'running' | 'paused' | 'error';
  currentSlot: number;
  tickRate: number;
  speedMultiplier: number;
  slowMotionEnabled: boolean;
  transactions: Transaction[];
  blocks: Block[];
  votes: Vote[];
}

// === Transaction ===

export interface Transaction {
  signature: string;
  feePayer: string;
  instructions: Instruction[];
  blockhash: string;
  signatures: Signature[];
  status: TransactionStatus;
  createdAt: Date;
}

export type TransactionStatus = 'pending' | 'processing' | 'confirmed' | 'finalized' | 'failed';

export interface Instruction {
  programId: string;
  keys: AccountMeta[];
  data: Uint8Array;
}

export interface AccountMeta {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
}

export interface Signature {
  publicKey: string;
  signature: Uint8Array;
}

// === Block ===

export interface Block {
  slot: number;
  parentSlot: number;
  blockhash: string;
  transactions: string[];
  signatures: string[];
  commitment: CommitmentLevel;
  leaderId: string;
  createdAt: Date;
}

export type CommitmentLevel = 'processed' | 'confirmed' | 'finalized';

// === Vote ===

export interface Vote {
  validatorId: string;
  slot: number;
  lockout: number;
  hash: string;
  timestamp: Date;
}

// === Validator ===

export interface Validator {
  id: string;
  stake: number;
  isLeader: boolean;
  voteTower: number[];
  lastVoteSlot: number;
}

// === Annotation ===

export interface Annotation {
  id: string;
  type: AnnotationType;
  content: string;
  sourceRef: string;
  timestamp: Date;
  gateId: number;
}

export type AnnotationType = 'STAGE' | 'WHY' | 'HOW' | 'REF' | 'DECISION' | 'BYTES';

// === Simulation API Types ===

export interface SimulationResult {
  success: boolean;
  logs: string[];
  unitsConsumed: number;
  returnData?: string;
  error?: string;
}

export interface PohTick {
  slot: number;
  hash: string;
  tickHeight: number;
  ticksPerSlot: number;
  hashChain: string[];
}

export interface ValidatorConfig {
  id: string;
  stake: number;
  isLeader: boolean;
}

export interface ProcessResult {
  success: boolean;
  signature?: string;
  error?: string;
  unitsConsumed: number;
}

export interface ValidatorState {
  id: string;
  slot: number;
  transactionsProcessed: number;
  blocksProduced: number;
  votesCast: number;
}
