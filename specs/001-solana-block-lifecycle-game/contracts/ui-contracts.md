# UI Contracts: Solana Block Lifecycle Learning Game

**Date**: 2026-08-18 | **Branch**: `001-solana-block-lifecycle-game`

## Overview

Defines the interface contracts between UI components, simulation engine, and storage layer.

## Component Contracts

### Dashboard Component

**Props**: None (root component)

**State**:
- currentGate: number (1-5)
- simulationStatus: 'idle' | 'running' | 'paused'
- annotations: Annotation[]

**Callbacks**:
- onGateChange(gate: number): void
- onSimulationStart(): void
- onSimulationPause(): void
- onSimulationResume(): void

### GateSelector Component

**Props**:
- currentGate: number
- completedGates: number[]
- onGateSelect: (gate: number) => void

**Render Contract**:
- Gates 1-5 displayed as buttons/links
- Completed gates show checkmark
- Current gate highlighted
- Locked gates grayed out

### AnnotationPanel Component

**Props**:
- annotations: Annotation[]
- onAnnotationClick: (annotation: Annotation) => void

**Render Contract**:
- Live feed of annotations
- Clickable items for cross-references
- Color-coded by type (STAGE=blue, WHY=green, DECISION=purple, BYTES=orange)

### ExecutionLog Component

**Props**:
- steps: ExecutionStep[]
- annotations: Annotation[]

**Render Contract**:
- Sequential list of execution steps
- Expandable annotations per step
- Timestamps for each step

### SimulationControls Component

**Props**:
- status: 'idle' | 'running' | 'paused'
- speed: number
- slowMotion: boolean
- onStart: () => void
- onPause: () => void
- onResume: () => void
- onSpeedChange: (speed: number) => void
- onSlowMotionToggle: () => void

**Render Contract**:
- Start/Pause/Resume buttons based on status
- Speed slider (0.25x - 4x)
- Slow-motion toggle button

## Simulation Engine Contract

### SimulationEngine Interface

```typescript
interface SimulationEngine {
  // Lifecycle
  start(): Promise<void>
  pause(): void
  resume(): void
  stop(): void

  // Configuration
  setTickRate(ms: number): void
  setSpeedMultiplier(factor: number): void
  enableSlowMotion(enabled: boolean): void

  // Transaction submission
  submitTransaction(tx: Transaction): Promise<string>

  // State queries
  getSlot(): number
  getTransactions(): Transaction[]
  getBlocks(): Block[]
  getVotes(): Vote[]

  // Events
  onTick(callback: (slot: number) => void): void
  onBlock(callback: (block: Block) => void): void
  onVote(callback: (vote: Vote) => void): void
  onAnnotation(callback: (annotation: Annotation) => void): void
}
```

### Contract Rules

1. **Tick Rate**: Default 400ms per tick (matching Solana slot time)
2. **Speed Multiplier**: 0.25x (slow) to 4x (fast)
3. **Slow Motion**: When enabled, each tick pauses for manual advancement
4. **Events**: All callbacks must be synchronous, non-blocking
5. **State**: Engine state must be queryable at any time

## Storage Contract

### StorageService Interface

```typescript
interface StorageService {
  // Progress
  getProgress(): Promise<GateProgress>
  saveProgress(progress: GateProgress): Promise<void>

  // Game State
  getGameState(): Promise<GameState>
  saveGameState(state: GameState): Promise<void>

  // Transaction History
  getTransactions(): Promise<Transaction[]>
  addTransaction(tx: Transaction): Promise<void>

  // Annotation Log
  getAnnotations(): Promise<Annotation[]>
  addAnnotation(annotation: Annotation): Promise<void>

  // Block History
  getBlocks(): Promise<Block[]>
  addBlock(block: Block): Promise<void>
}
```

### Contract Rules

1. **localStorage**: Used for progress, preferences, game state (< 5MB)
2. **IndexedDB**: Used for transactions, annotations, blocks (large data)
3. **Last-write-wins**: No conflict resolution (per clarification)
4. **JSON serialization**: All values serialized as JSON

## Native Module Contract

### SimulationNative Interface (Rust via napi-rs)

```typescript
interface SimulationNative {
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
```

### Contract Rules

1. **Fidelity**: Full Agave internals (banking stage, gossip, Turbine, PoH service, vote tower)
2. **Determinism**: Gate 5 uses deterministic simulation
3. **Callbacks**: Native module calls TypeScript callbacks for annotations
4. **Error Handling**: Native errors propagated as TypeScript exceptions

## Gate Contracts

### Gate 1 Contract: Tx Signing

**Input**: None (generates keypair)

**Output**:
- keypair: Keypair
- signature: string
- verified: boolean

**Annotations**: STAGE, WHY, BYTES

### Gate 2 Contract: RPC Submit

**Input**: Transaction

**Output**:
- signature: string
- status: 'processed' | 'confirmed' | 'finalized'

**Annotations**: STAGE, WHY, REF

### Gate 3 Contract: Validator Process

**Input**: Transaction[]

**Output**:
- block: Block
- vote: Vote

**Annotations**: STAGE, WHY, DECISION

### Gate 4 Contract: Block Finalize

**Input**: Block

**Output**:
- commitment: 'finalized'
- rooted: boolean

**Annotations**: STAGE, WHY, DECISION

### Gate 5 Contract: Fork Resolution

**Input**: None (creates forks)

**Output**:
- forks: Block[][]
- resolvedFork: Block
- slashingEvents: SlashingEvent[]

**Annotations**: STAGE, WHY, DECISION
