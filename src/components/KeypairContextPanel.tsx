import { useState } from 'react'
import type { Keypair } from '@/types'
import { toHex } from '../hooks/useKeypair'

interface KeypairContextPanelProps {
  keypair: Keypair
}

export function KeypairContextPanel({ keypair }: KeypairContextPanelProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false)

  return (
    <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-blue-500">
      <h3 className="text-lg font-semibold mb-4">
        <span className="text-blue-400">Keypair Context</span>
        <span className="ml-2 text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded">REF: crypto.ts</span>
      </h3>
      <div className="p-3 bg-gray-700 rounded">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-400">Private Key (from Gate 1):</label>
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
  )
}
