// Conveyor Component - Maps to PoH with animated tick progression
// // STAGE: conveyor

import { useState, useEffect, useRef } from 'react'
import type { ConveyorState } from '@shared/types'

interface ConveyorProps {
  state: ConveyorState
  isRunning?: boolean
  onTick?: () => void
}

export function Conveyor({ state, isRunning = false, onTick }: ConveyorProps) {
  const [tickCount, setTickCount] = useState(0)
  const [hashChain, setHashChain] = useState<string[]>([])
  const animationRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(0)

  // PoH tick animation
  useEffect(() => {
    if (!isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    const tickInterval = 400 // 400ms per tick (matching Solana slot time)

    const animate = (timestamp: number) => {
      if (timestamp - lastTickRef.current >= tickInterval) {
        lastTickRef.current = timestamp
        setTickCount(prev => prev + 1)

        // Generate mock hash
        const newHash = `0x${Array.from({ length: 16 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('')}`

        setHashChain(prev => {
          const updated = [...prev, newHash]
          return updated.slice(-8) // Keep last 8 hashes
        })

        onTick?.()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, onTick])

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        <span className="text-blue-400">Conveyor (PoH)</span>
        {isRunning && (
          <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">RUNNING</span>
        )}
      </h3>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Tick Count:</span>
          <span className="text-blue-400 font-mono">{tickCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Items on belt:</span>
          <span>{state.items.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Tick rate:</span>
          <span>{state.tickRate}</span>
        </div>
      </div>

      {/* Hash chain visualization */}
      <div className="mt-4">
        <h4 className="text-sm text-gray-400 mb-2">Hash Chain:</h4>
        <div className="flex flex-wrap gap-1">
          {hashChain.map((hash, i) => (
            <div
              key={i}
              className="text-xs font-mono px-2 py-1 bg-blue-900/30 rounded border border-blue-700"
              title={hash}
            >
              {hash.substring(0, 8)}...
            </div>
          ))}
          {hashChain.length === 0 && (
            <span className="text-xs text-gray-500">No ticks yet</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-100"
            style={{ width: `${Math.min((tickCount % 64) * (100 / 64), 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Slot progress: {tickCount % 64}/64 ticks
        </p>
      </div>

      {/* // STAGE: poh_tick - Conveyor represents PoH tick progression */}
    </div>
  )
}
