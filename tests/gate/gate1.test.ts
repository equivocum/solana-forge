// Gate 1 Test: Transaction Signing
// // STAGE: gate1_test

import { describe, it, expect } from 'vitest'
import * as ed25519 from '@noble/ed25519'

describe('Gate 1: Transaction Signing', () => {
  it('should generate ed25519 keypair', async () => {
    const privateKey = ed25519.utils.randomSecretKey()
    const publicKey = await ed25519.getPublicKeyAsync(privateKey)
    
    expect(publicKey).toBeDefined()
    expect(publicKey.length).toBe(32)
  })

  it('should sign and verify message', async () => {
    const privateKey = ed25519.utils.randomSecretKey()
    const publicKey = await ed25519.getPublicKeyAsync(privateKey)
    
    const message = 'Hello, Solana!'
    const messageBytes = new TextEncoder().encode(message)
    
    const signature = await ed25519.signAsync(messageBytes, privateKey)
    expect(signature).toBeDefined()
    expect(signature.length).toBe(64)
    
    const isValid = await ed25519.verifyAsync(signature, messageBytes, publicKey)
    expect(isValid).toBe(true)
  })

  it('should fail verification with wrong key', async () => {
    const privateKey1 = ed25519.utils.randomSecretKey()
    const privateKey2 = ed25519.utils.randomSecretKey()
    const publicKey2 = await ed25519.getPublicKeyAsync(privateKey2)
    
    const message = 'Hello, Solana!'
    const messageBytes = new TextEncoder().encode(message)
    
    const signature = await ed25519.signAsync(messageBytes, privateKey1)
    const isValid = await ed25519.verifyAsync(signature, messageBytes, publicKey2)
    
    expect(isValid).toBe(false)
  })
})