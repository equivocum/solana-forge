// TransactionBuilder - Transaction creation and serialization
// // STAGE: transaction_builder

import type { Transaction, Instruction, AccountMeta } from '@shared/types'
import type { AnnotationService } from './annotations'

export interface TransactionBuilder {
  createTransaction(feePayer: string, instructions: Instruction[], recentBlockhash: string): Transaction
  serializeTransaction(tx: Transaction): Uint8Array
  addInstruction(tx: Transaction, instruction: Instruction): Transaction
}

export function createTransactionBuilder(annotationService?: AnnotationService, gateId: number = 1): TransactionBuilder {
  return {
    createTransaction(feePayer: string, instructions: Instruction[], recentBlockhash: string): Transaction {
      // // STAGE: transaction_creation
      annotationService?.addAnnotation('STAGE', 'Creating transaction payload', 'transaction.ts:10', gateId)

      const signature = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

      return {
        signature,
        feePayer,
        instructions,
        blockhash: recentBlockhash,
        signatures: [],
        status: 'pending',
        createdAt: new Date()
      }
    },

    serializeTransaction(tx: Transaction): Uint8Array {
      // // STAGE: transaction_serialization
      annotationService?.addAnnotation('STAGE', 'Serializing transaction to bytes', 'transaction.ts:20', gateId)

      // Simplified serialization - in production would use @solana/web3.js
      const data = JSON.stringify({
        feePayer: tx.feePayer,
        instructions: tx.instructions,
        blockhash: tx.blockhash
      })

      return new TextEncoder().encode(data)
    },

    addInstruction(tx: Transaction, instruction: Instruction): Transaction {
      return {
        ...tx,
        instructions: [...tx.instructions, instruction]
      }
    }
  }
}

export function createInstruction(
  programId: string,
  keys: AccountMeta[],
  data: Uint8Array
): Instruction {
  return { programId, keys, data }
}

export function createAccountMeta(
  pubkey: string,
  isSigner: boolean,
  isWritable: boolean
): AccountMeta {
  return { pubkey, isSigner, isWritable }
}
