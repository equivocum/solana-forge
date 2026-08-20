import { useState, useEffect } from 'react'
import { createStorageService } from '../services/storage'
import type { Keypair } from '@/types'

export function useKeypair(): Keypair | null {
  const [keypair, setKeypair] = useState<Keypair | null>(null)

  useEffect(() => {
    const storage = createStorageService()
    storage.getProgress().then(progress => {
      const gate1Data = progress.gateData?.[1]
      if (gate1Data && (gate1Data as any).keypair) {
        setKeypair((gate1Data as any).keypair)
      }
    })
  }, [])

  return keypair
}

export const toHex = (b: Uint8Array) =>
  Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('')
