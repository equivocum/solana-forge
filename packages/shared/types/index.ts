// Shared TypeScript interfaces for Solana Block Lifecycle Learning Game
// Based on data-model.md entities

// === Core Identity ===

export interface Learner {
  id: string;
  name?: string;
  progress: GateProgress;
  preferences: LearnerPreferences;
  createdAt: Date;
}

export interface LearnerPreferences {
  slowMotionDefault: boolean;
  speedMultiplier: number;
  annotationsEnabled: boolean;
}

// === Gate Progress ===

export interface GateProgress {
  currentGate: number;
  completedGates: number[];
  gateData: Record<number, GateState>;
}

export interface GateState {
  gateId: number;
  status: 'locked' | 'active' | 'completed';
  startedAt: Date;
  completedAt: Date | null;
  annotations: Annotation[];
  metrics: GateMetrics;
}

export interface GateMetrics {
  timeSpent: number;
  annotationsViewed: number;
  errorsEncountered: number;
  stepsCompleted: number;
  quizScore?: number;
}

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

// === Keypair ===

export interface Keypair {
  publicKey: string;
  privateKey: Uint8Array;
  createdAt: Date;
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

// === Game State ===

export interface GameState {
  factory: FactoryState;
  conveyor: ConveyorState;
  qcStation: QCStationState;
  shipments: ShipmentRecord[];
  defectiveBatches: DefectiveBatch[];
}

export interface FactoryState {
  efficiency: number;
  workers: number;
  machines: Machine[];
}

export interface Machine {
  id: string;
  name: string;
  status: 'idle' | 'processing' | 'error';
}

export interface ConveyorState {
  items: ConveyorItem[];
  tickRate: number;
  position: number;
}

export interface ConveyorItem {
  id: string;
  transactionId: string;
  position: number;
  status: 'pending' | 'processing' | 'completed';
}

export interface QCStationState {
  inspectedCount: number;
  passCount: number;
  failCount: number;
}

export interface ShipmentRecord {
  id: string;
  itemId: string;
  timestamp: Date;
  quality: number;
}

export interface DefectiveBatch {
  id: string;
  reason: string;
  resolvedAt: Date | null;
  outcome: 'discarded' | 'recovered';
}

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

export interface SlashingEvent {
  validatorId: string;
  reason: string;
  slot: number;
  timestamp: Date;
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

// === Diagram Data Contracts ===

export interface TransactionFlowData {
  steps: TransactionFlowStep[];
  currentStep: number;
}

export interface TransactionFlowStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  annotation?: Annotation;
}

export interface BlockLifecycleData {
  slot: number;
  stages: BlockStage[];
  currentStage: number;
}

export interface BlockStage {
  id: string;
  label: string;
  commitment: CommitmentLevel;
  timestamp?: Date;
}

export interface ForkResolutionData {
  forks: Fork[];
  resolvedForkId?: string;
}

export interface Fork {
  id: string;
  slot: number;
  stakeWeight: number;
  transactions: string[];
  isWinning: boolean;
}

// === Event Types ===

export interface TransactionEvent {
  type: 'transaction_submitted' | 'transaction_processed' | 'transaction_confirmed' | 'transaction_finalized' | 'transaction_failed';
  signature: string;
  slot?: number;
  timestamp: Date;
  error?: string;
}

export interface BlockEvent {
  type: 'block_produced' | 'block_confirmed' | 'block_finalized';
  slot: number;
  blockhash: string;
  transactionCount: number;
  timestamp: Date;
}

export interface VoteEvent {
  type: 'vote_cast' | 'vote_confirmed' | 'vote_finalized';
  validatorId: string;
  slot: number;
  lockout: number;
  timestamp: Date;
}

export interface PohEvent {
  type: 'poh_tick' | 'poh_reset';
  slot: number;
  hash: string;
  tickHeight: number;
  timestamp: Date;
}
