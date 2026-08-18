# Simulation API Contracts: Solana Block Lifecycle Learning Game

**Date**: 2026-08-18 | **Branch**: `001-solana-block-lifecycle-game`

## Overview

Defines the API contracts for the in-process Solana simulation engine.

## Transaction API

### CreateTransaction

```typescript
interface CreateTransactionRequest {
  feePayer: string; // base58 public key
  instructions: Instruction[];
  recentBlockhash: string; // base58
}

interface CreateTransactionResponse {
  transaction: Transaction;
  signature: string; // base58
  serializedSize: number;
}
```

**Validation Rules**:
- feePayer must be valid ed25519 public key
- instructions array must not be empty
- recentBlockhash must be valid base58

### SignTransaction

```typescript
interface SignTransactionRequest {
  transaction: Transaction;
  keypair: Keypair;
}

interface SignTransactionResponse {
  signedTransaction: Transaction;
  signature: Signature;
  signingTime: number; // ms
}
```

**Validation Rules**:
- Keypair must match feePayer or be authorized signer
- Transaction must not be already signed by this keypair

### SubmitTransaction

```typescript
interface SubmitTransactionRequest {
  signedTransaction: Transaction;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

interface SubmitTransactionResponse {
  signature: string; // base58
  status: 'pending' | 'processing';
  simulationResult?: SimulationResult;
}
```

**Validation Rules**:
- Transaction must be signed
- Blockhash must not be expired
- Fee payer must have sufficient balance

### SimulateTransaction

```typescript
interface SimulateTransactionRequest {
  signedTransaction: Transaction;
  sigVerify?: boolean;
  replaceRecentBlockhash?: boolean;
}

interface SimulateTransactionResponse {
  success: boolean;
  logs: string[];
  unitsConsumed: number;
  returnData?: string;
  error?: string;
}
```

## Block API

### GetBlock

```typescript
interface GetBlockRequest {
  slot: number;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

interface GetBlockResponse {
  block: Block;
  transactions: Transaction[];
  signatures: string[];
}
```

### GetSlot

```typescript
interface GetSlotRequest {
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

interface GetSlotResponse {
  slot: number;
  parentSlot: number;
  slotIndex: number;
  slotsInEpoch: number;
}
```

### GetRecentBlockhash

```typescript
interface GetRecentBlockhashRequest {
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

interface GetRecentBlockhashResponse {
  blockhash: string; // base58
  feeCalculator: {
    lamportsPerSignature: number;
  };
  lastValidSlot: number;
}
```

## Validator API

### GetValidatorInfo

```typescript
interface GetValidatorInfoRequest {
  validatorId: string; // base58
}

interface GetValidatorInfoResponse {
  validator: Validator;
  stake: number;
  lastVoteSlot: number;
  voteTower: number[];
  isActive: boolean;
}
```

### GetVoteAccounts

```typescript
interface GetVoteAccountsRequest {
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

interface GetVoteAccountsResponse {
  current: VoteAccount[];
  delinquent: VoteAccount[];
}

interface VoteAccount {
  votePubkey: string;
  nodePubkey: string;
  activatedStake: number;
  lastVote: number;
  rootSlot: number;
}
```

### GetLeaderSchedule

```typescript
interface GetLeaderScheduleRequest {
  slot?: number;
  identity?: string;
}

interface GetLeaderScheduleResponse {
  leaderSchedule: Record<string, number[]>;
  currentLeader: string;
  nextLeader: string;
}
```

## Vote API

### GetVote

```typescript
interface GetVoteRequest {
  validatorId: string;
  slot: number;
}

interface GetVoteResponse {
  vote: Vote;
  lockout: number;
  towerDepth: number;
  isFinalized: boolean;
}
```

### GetCommitment

```typescript
interface GetCommitmentRequest {
  slot: number;
}

interface GetCommitmentResponse {
  commitment: 'processed' | 'confirmed' | 'finalized';
  confirmationCount: number;
  totalStake: number;
  votingStake: number;
  supermajorityStake: number;
}
```

## PoH API

### GetPohTick

```typescript
interface GetPohTickRequest {
  currentSlot?: number;
}

interface GetPohTickResponse {
  slot: number;
  hash: string; // base58
  tickHeight: number;
  ticksPerSlot: number;
  hashChain: string[]; // last N hashes
}
```

### GetPohHistory

```typescript
interface GetPohHistoryRequest {
  startSlot: number;
  endSlot: number;
}

interface GetPohHistoryResponse {
  ticks: PohTick[];
  totalSlots: number;
  averageTickTime: number; // ms
}
```

## Error Responses

### Standard Error

```typescript
interface SimulationError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

### Error Codes

| Code | Description |
|------|-------------|
| INVALID_SIGNATURE | Transaction signature verification failed |
| BLOCKHASH_EXPIRED | Transaction blockhash is no longer valid |
| INSUFFICIENT_FUNDS | Fee payer has insufficient lamports |
| INVALID_INSTRUCTION | Instruction data or accounts invalid |
| PROGRAM_ERROR | On-chain program error |
| TIMEOUT | Simulation timed out |
| INVALID_VALIDATOR | Validator ID not found |

## Rate Limiting

**Contract Rules**:
- No rate limiting for local simulation
- All operations synchronous or promise-based
- Maximum 1000 transactions per slot (matching Solana limit)
- Maximum 64 instructions per transaction
- Maximum 128 signatures per transaction

## Event Contracts

### TransactionEvent

```typescript
interface TransactionEvent {
  type: 'transaction_submitted' | 'transaction_processed' | 'transaction_confirmed' | 'transaction_finalized' | 'transaction_failed';
  signature: string;
  slot?: number;
  timestamp: Date;
  error?: string;
}
```

### BlockEvent

```typescript
interface BlockEvent {
  type: 'block_produced' | 'block_confirmed' | 'block_finalized';
  slot: number;
  blockhash: string;
  transactionCount: number;
  timestamp: Date;
}
```

### VoteEvent

```typescript
interface VoteEvent {
  type: 'vote_cast' | 'vote_confirmed' | 'vote_finalized';
  validatorId: string;
  slot: number;
  lockout: number;
  timestamp: Date;
}
```

### PohEvent

```typescript
interface PohEvent {
  type: 'poh_tick' | 'poh_reset';
  slot: number;
  hash: string;
  tickHeight: number;
  timestamp: Date;
}
```
