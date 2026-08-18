# Data Model: Solana Block Lifecycle Learning Game

**Date**: 2026-08-18 | **Branch**: `001-solana-block-lifecycle-game`

## Overview

Defines core entities, their attributes, relationships, and state transitions for the learning simulation and manufacturing game.

## Core Entities

### 1. Learner

Represents the primary user interacting with the learning tool.

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Unique learner identifier |
| name | string | Display name (optional) |
| progress | GateProgress | Current gate and completion status |
| preferences | LearnerPreferences | UI and simulation settings |
| createdAt | Date | Session start time |

**State Transitions**: None (immutable identity)

### 2. GateProgress

Tracks learner progression through the 5 learning gates.

| Field | Type | Description |
|-------|------|-------------|
| currentGate | number (1-5) | Currently active gate |
| completedGates | number[] | Array of completed gate numbers |
| gateData | Record<number, GateState> | Per-gate state and metrics |

**State Transitions**:
- `currentGate` increments when previous gate passes verification
- `completedGates` appends gate number on completion
- `gateData[gate]` updates with each interaction

### 3. GateState

Per-gate learner state and metrics.

| Field | Type | Description |
|-------|------|-------------|
| gateId | number (1-5) | Gate identifier |
| status | 'locked' \| 'active' \| 'completed' | Gate status |
| startedAt | Date | When gate was started |
| completedAt | Date | When gate was completed (null if incomplete) |
| annotations | Annotation[] | Annotations encountered |
| metrics | GateMetrics | Performance and learning metrics |

**State Transitions**:
- `locked` -> `active`: When previous gate completed (or gate 1 at start)
- `active` -> `completed`: When gate verification passes

### 4. GateMetrics

Performance and learning metrics per gate.

| Field | Type | Description |
|-------|------|-------------|
| timeSpent | number (ms) | Total time on gate |
| annotationsViewed | number | Count of annotations inspected |
| errorsEncountered | number | Count of errors encountered |
| stepsCompleted | number | Steps finished in gate |
| quizScore | number (0-100) | Optional quiz score |

### 5. SimulationState

Current state of the in-process Solana simulation.

| Field | Type | Description |
|-------|------|-------------|
| status | 'idle' \| 'running' \| 'paused' \| 'error' | Simulation state |
| currentSlot | number | Current PoH slot |
| tickRate | number (ms) | Milliseconds per tick (400 default) |
| speedMultiplier | number | Speed factor (0.25-4.0) |
| slowMotionEnabled | boolean | Whether slow-motion is active |
| transactions | Transaction[] | Pending transactions |
| blocks | Block[] | Produced blocks |
| votes | Vote[] | Validator votes |

**State Transitions**:
- `idle` -> `running`: Learner initiates simulation
- `running` -> `paused`: Learner pauses or slow-motion step
- `paused` -> `running`: Learner resumes
- `running` -> `error`: Simulation error occurs

### 6. Transaction

Represents a signed Solana transaction (Raw Material in game).

| Field | Type | Description |
|-------|------|-------------|
| signature | string (base58) | Transaction signature |
| feePayer | string (base58) | Fee payer public key |
| instructions | Instruction[] | Transaction instructions |
| blockhash | string (base58) | Recent blockhash |
| signatures | Signature[] | Ed25519 signatures |
| status | 'pending' \| 'processing' \| 'confirmed' \| 'finalized' \| 'failed' | Tx status |
| createdAt | Date | Creation timestamp |

**State Transitions**:
- `pending` -> `processing`: Submitted to RPC
- `processing` -> `confirmed`: Validator executes and votes
- `confirmed` -> `finalized`: Supermajority votes received
- `processing` -> `failed`: Execution error

### 7. Instruction

A single Solana instruction within a transaction.

| Field | Type | Description |
|-------|------|-------------|
| programId | string (base58) | Program to invoke |
| keys | AccountMeta[] | Account keys with roles |
| data | Uint8Array | Instruction data bytes |

### 8. AccountMeta

Account reference in an instruction.

| Field | Type | Description |
|-------|------|-------------|
| pubkey | string (base58) | Account public key |
| isSigner | boolean | Whether account signs |
| isWritable | boolean | Whether account is modified |

### 9. Block

A produced Solana block (Shipment in game).

| Field | Type | Description |
|-------|------|-------------|
| slot | number | Block slot number |
| parentSlot | number | Parent block slot |
| blockhash | string (base58) | Block hash |
| transactions | string[] | Transaction signatures in block |
| signatures | string[] | Validator signatures |
| commitment | 'processed' \| 'confirmed' \| 'finalized' | Commitment level |
| leaderId | string (base58) | Leader validator public key |
| createdAt | Date | Production timestamp |

**State Transitions**:
- Created with `commitment=processed`
- `processed` -> `confirmed`: Vote received from leader
- `confirmed` -> `finalized`: 2/3 supermajority votes

### 10. Vote

A validator's vote on a block (QC Station in game).

| Field | Type | Description |
|-------|------|-------------|
| validatorId | string (base58) | Voting validator |
| slot | number | Voted slot |
| lockout | number | Lockout depth (default 32) |
| hash | string (base58) | Vote hash |
| timestamp | Date | Vote time |

### 11. Validator

Represents a validator in the simulation (Factory in game).

| Field | Type | Description |
|-------|------|-------------|
| id | string (base58) | Validator public key |
| stake | number | Stake amount |
| isLeader | boolean | Whether currently leader |
| voteTower | number[] | Vote tower slots |
| lastVoteSlot | number | Last voted slot |

### 12. Keypair

Ed25519 keypair for signing (generated at Gate 1).

| Field | Type | Description |
|-------|------|-------------|
| publicKey | string (base58) | Public key |
| privateKey | Uint8Array | Private key bytes (masked by default) |
| createdAt | Date | Generation timestamp |

### 13. Annotation

Educational annotation attached to simulation events.

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Unique annotation ID |
| type | 'STAGE' \| 'WHY' \| 'HOW' \| 'REF' \| 'DECISION' \| 'BYTES' | Annotation type |
| content | string | Annotation text |
| sourceRef | string | Code reference (file:line) |
| timestamp | Date | When annotation was created |
| gateId | number (1-5) | Associated gate |

### 14. GameState

Manufacturing game state (persisted to localStorage/IndexedDB).

| Field | Type | Description |
|-------|------|-------------|
| factory | FactoryState | Factory configuration |
| conveyor | ConveyorState | Conveyor belt state |
| qcStation | QCStationState | QC inspection state |
| shipments | ShipmentRecord[] | Completed shipments |
| defectiveBatches | DefectiveBatch[] | Forked batches |

### 15. FactoryState

Factory configuration (maps to Validator).

| Field | Type | Description |
|-------|------|-------------|
| efficiency | number (0-100) | Processing efficiency |
| workers | number | Simulated workers |
| machines | Machine[] | Processing machines |

### 16. ConveyorState

Conveyor belt state (maps to PoH).

| Field | Type | Description |
|-------|------|-------------|
| items | ConveyorItem[] | Items on belt |
| tickRate | number | Items per tick |
| position | number | Current position |

### 17. QCStationState

Quality control station (maps to Voting).

| Field | Type | Description |
|-------|------|-------------|
| inspectedCount | number | Items inspected |
| passCount | number | Items passed |
| failCount | number | Items failed |

### 18. ShipmentRecord

Completed shipment (maps to Finalized Block).

| Field | Type | Description |
|-------|------|-------------|
| id | string | Shipment ID |
| itemId | string | Source item |
| timestamp | Date | Completion time |
| quality | number | Quality score |

### 19. DefectiveBatch

Forked batch (maps to Fork).

| Field | Type | Description |
|-------|------|-------------|
| id | string | Batch ID |
| reason | string | Fork reason |
| resolvedAt | Date | Resolution timestamp |
| outcome | 'discarded' \| 'recovered' | Resolution outcome |

## Relationships

```
Learner 1--1 GateProgress
GateProgress 1--* GateState
GateState *--* Annotation

SimulationState 1--* Transaction
SimulationState 1--* Block
SimulationState 1--* Vote
SimulationState 1--* Validator

Transaction *--* Instruction
Instruction *--* AccountMeta

Block *--* Transaction (via signatures)
Block 1--1 Validator (leader)
Vote *--1 Validator
Vote *--1 Block (voted slot)

GameState 1--1 FactoryState
GameState 1--1 ConveyorState
GameState 1--1 QCStationState
GameState 1--* ShipmentRecord
GameState 1--* DefectiveBatch
```

## Storage Schema

### localStorage Keys

| Key | Value Type | Description |
|-----|------------|-------------|
| `solana-learn:progress` | GateProgress | Learner progress |
| `solana-learn:preferences` | LearnerPreferences | UI preferences |
| `solana-learn:game` | GameState | Manufacturing game state |

### IndexedDB Stores

| Store | Value Type | Description |
|-------|------------|-------------|
| `transactions` | Transaction | Transaction history |
| `annotations` | Annotation | Annotation log |
| `blocks` | Block | Block history |

## Validation Rules

### Transaction
- signature must be unique
- feePayer must be valid ed25519 public key
- instructions array must not be empty
- blockhash must be valid base58

### Block
- slot must be > parentSlot
- transactions must reference valid Transaction signatures
- commitment can only advance forward (processed -> confirmed -> finalized)

### Vote
- validatorId must reference valid Validator
- slot must be > validator's lastVoteSlot
- lockout must be >= 32 (tower depth)

### Keypair
- publicKey must be valid ed25519 public key
- privateKey must be 32 bytes
- publicKey derived from privateKey must match
