// Ed25519Service - Cryptographic operations with annotation support
// // STAGE: crypto_service

import * as ed25519 from '@noble/ed25519'
import type { Keypair } from '@shared/types'
import type { AnnotationService } from './annotations'

const toHex = (b: Uint8Array) => Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('')
const toBase64 = (b: Uint8Array) => btoa(String.fromCharCode(...b))

export interface Ed25519Service {
  generateKeypair(annotate?: boolean): Promise<Keypair>
  sign(message: Uint8Array, privateKey: Uint8Array, annotate?: boolean): Promise<Uint8Array>
  verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array, annotate?: boolean): Promise<boolean>
  getPublicKey(privateKey: Uint8Array): Promise<Uint8Array>
}

export function createEd25519Service(annotationService?: AnnotationService, gateId: number = 1): Ed25519Service {
  return {
    async generateKeypair(annotate: boolean = true): Promise<Keypair> {
      // // STAGE: keypair_generation
      annotationService?.addAnnotation('STAGE', 'Generating Ed25519 keypair', 'crypto.ts:12', gateId)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const privateKey = (ed25519.utils as any).randomSecretKey()
      const publicKey = await ed25519.getPublicKeyAsync(privateKey)

      // // WHY: ed25519 signing proves ownership without revealing private key
      annotationService?.addAnnotation('WHY', 'Ed25519 signing proves ownership without revealing private key', 'crypto.ts:16', gateId)
      // // BYTES: shows raw key bytes
      annotationService?.addAnnotation('BYTES', `Public key: ${toHex(publicKey)}`, 'crypto.ts:17', gateId)

      return {
        publicKey: toBase64(publicKey),
        privateKey: privateKey,
        createdAt: new Date()
      }
    },

    async sign(message: Uint8Array, privateKey: Uint8Array, annotate: boolean = true): Promise<Uint8Array> {
      // // STAGE: message_signing
      annotationService?.addAnnotation('STAGE', 'Signing message with private key', 'crypto.ts:25', gateId)

      const signature = await ed25519.signAsync(message, privateKey)

      // // BYTES: shows raw signature bytes
      annotationService?.addAnnotation('BYTES', `Signature: ${toHex(signature)}`, 'crypto.ts:28', gateId)

      return signature
    },

    async verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array, annotate: boolean = true): Promise<boolean> {
      // // STAGE: signature_verification
      annotationService?.addAnnotation('STAGE', 'Verifying signature', 'crypto.ts:34', gateId)

      const isValid = await ed25519.verifyAsync(signature, message, publicKey)

      if (isValid) {
        // // WHY: verification confirms signer owns private key
        annotationService?.addAnnotation('WHY', 'Verification confirms signer owns the private key', 'crypto.ts:38', gateId)
      }

      return isValid
    },

    async getPublicKey(privateKey: Uint8Array): Promise<Uint8Array> {
      return ed25519.getPublicKeyAsync(privateKey)
    }
  }
}
