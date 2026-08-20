// Gate 1: Transaction Signing & Submission
// // STAGE: gate1_tx_signing

import { useState } from 'react'
import { useAnnotations } from '../hooks/useAnnotations'
import type { Keypair } from '@/types'
import * as ed25519 from '@noble/ed25519'

const toHex = (b: Uint8Array) => Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('')
const toBase64 = (b: Uint8Array) => btoa(String.fromCharCode(...b))
const fromBase64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0))

interface Gate1Props {
  onComplete: () => void
  'data-testid'?: string
}

export function Gate1TxSigning({ onComplete, 'data-testid': testId }: Gate1Props) {
  const { addAnnotation } = useAnnotations()
  const [keypair, setKeypair] = useState<Keypair | null>(null)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState<string | null>(null)
  const [verified, setVerified] = useState<boolean | null>(null)

  const handleGenerateKeypair = async () => {
    // // STAGE: keypair_generation
    addAnnotation('STAGE', 'Generating Ed25519 keypair', 'services/crypto.ts', 1)
    
    const privateKey = ed25519.utils.randomSecretKey()
    const publicKey = await ed25519.getPublicKeyAsync(privateKey)
    
    const newKeypair: Keypair = {
      publicKey: toBase64(publicKey),
      privateKey: privateKey,
      createdAt: new Date()
    }
    
    setKeypair(newKeypair)
    // // WHY: ed25519 signing proves ownership without revealing private key
    addAnnotation('WHY', 'Ed25519 signing proves ownership without revealing private key', 'services/crypto.ts', 1)
    // // BYTES: shows raw key bytes
    addAnnotation('BYTES', `Public key: ${toHex(publicKey)}`, 'services/crypto.ts', 1)
  }

  const handleSign = async () => {
    if (!keypair || !message) return
    
    // // STAGE: message_signing
    addAnnotation('STAGE', 'Signing message with private key', 'services/crypto.ts', 1)
    
    const messageBytes = new TextEncoder().encode(message)
    const signatureBytes = await ed25519.signAsync(messageBytes, keypair.privateKey)
    
    setSignature(toBase64(signatureBytes))
    // // BYTES: shows raw signature bytes
    addAnnotation('BYTES', `Signature: ${toHex(signatureBytes)}`, 'services/crypto.ts', 1)
  }

  const handleVerify = async () => {
    if (!keypair || !message || !signature) return
    
    // // STAGE: signature_verification
    addAnnotation('STAGE', 'Verifying signature', 'services/crypto.ts', 1)
    
    const messageBytes = new TextEncoder().encode(message)
    const signatureBytes = fromBase64(signature)
    const publicKeyBytes = fromBase64(keypair.publicKey)
    
    const isValid = await ed25519.verifyAsync(signatureBytes, messageBytes, publicKeyBytes)
    setVerified(isValid)
    
    if (isValid) {
      // // WHY: verification confirms signer owns private key
      addAnnotation('WHY', 'Verification confirms signer owns the private key', 'services/crypto.ts', 1)
    }
  }

  return (
    <div className="space-y-6" data-testid={testId}>
      <h2 className="text-2xl font-bold">Gate 1: Transaction Signing</h2>
      
      {/* Keypair Generation */}
      <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold mb-4">
          <span className="text-blue-400">1.</span> Generate Keypair
          <span className="ml-2 text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded">STAGE: keypair_generation</span>
        </h3>
        <button
          onClick={handleGenerateKeypair}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
        >
          Generate Keypair
        </button>
        
        {keypair && (
          <div className="mt-4 space-y-2">
            <div className="p-3 bg-gray-700 rounded">
              <label className="text-sm text-gray-400">Public Key:</label>
              <p className="font-mono text-sm break-all">{keypair.publicKey}</p>
            </div>
            
            <div className="p-3 bg-gray-700 rounded">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Private Key:</label>
                <button
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  {showPrivateKey ? 'Hide' : 'Show'}
                </button>
              </div>
              {showPrivateKey ? (
                <p className="font-mono text-sm text-red-400 break-all">
                  ⚠️ {typeof keypair.privateKey === 'string' ? keypair.privateKey : toHex(keypair.privateKey)}
                </p>
              ) : (
                <p className="font-mono text-sm text-gray-500">••••••••••••••••</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Message Signing */}
      <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-purple-500">
        <h3 className="text-lg font-semibold mb-4">
          <span className="text-purple-400">2.</span> Sign Message
          <span className="ml-2 text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded">WHY: ed25519 proves ownership</span>
        </h3>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message to sign"
          className="w-full p-2 bg-gray-700 rounded mb-4"
        />
        <button
          onClick={handleSign}
          disabled={!keypair || !message}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded disabled:opacity-50"
        >
          Sign Message
        </button>
        
        {signature && (
          <div className="mt-4 p-3 bg-gray-700 rounded">
            <label className="text-sm text-gray-400">Signature:</label>
            <p className="font-mono text-sm break-all">{signature}</p>
          </div>
        )}
      </div>
      
      {/* Signature Verification */}
      <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-green-500">
        <h3 className="text-lg font-semibold mb-4">
          <span className="text-green-400">3.</span> Verify Signature
          <span className="ml-2 text-xs bg-green-600/30 text-green-300 px-2 py-1 rounded">STAGE: verification</span>
        </h3>
        <button
          onClick={handleVerify}
          disabled={!keypair || !message || !signature}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded disabled:opacity-50"
        >
          Verify Signature
        </button>
        
        {verified !== null && (
          <div className={`mt-4 p-3 rounded ${verified ? 'bg-green-800' : 'bg-red-800'}`}>
            {verified ? '✓ Signature is valid!' : '✗ Signature is invalid!'}
          </div>
        )}
      </div>
      
      {/* Complete Gate */}
      {verified && (
        <button
          onClick={onComplete}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 rounded font-bold text-lg"
        >
          Complete Gate 1
        </button>
      )}
    </div>
  )
}
