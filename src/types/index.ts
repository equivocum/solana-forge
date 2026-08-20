// Shared TypeScript interfaces for solana-forge

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

// === Annotation ===

export interface Annotation {
  id: string;
  type: AnnotationType;
  content: string;
  sourceRef: string;
  timestamp: Date;
}

export type AnnotationType = 'STAGE' | 'WHY' | 'HOW' | 'REF' | 'DECISION' | 'BYTES';
