// useSimulation Hook - React hook for simulation engine
// // STAGE: simulation_hook

import { useState, useEffect, useCallback, useRef } from 'react'
import type { SimulationState, Transaction, Block, Vote, Annotation } from '@shared/types'
import type { SimulationEngine } from '../services/simulation'

interface UseSimulationReturn {
  state: SimulationState
  start: () => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => void
  step: () => void
  submitTransaction: (tx: Transaction) => Promise<string>
  setSpeed: (speed: number) => void
  toggleSlowMotion: () => void
}

export function useSimulation(engine: SimulationEngine | null): UseSimulationReturn {
  const [state, setState] = useState<SimulationState>({
    status: 'idle',
    currentSlot: 0,
    tickRate: 400,
    speedMultiplier: 1,
    slowMotionEnabled: false,
    transactions: [],
    blocks: [],
    votes: []
  })

  const engineRef = useRef(engine)
  engineRef.current = engine

  // Subscribe to engine events
  useEffect(() => {
    if (!engine) return

    const unsubscribes = [
      engine.onTick((slot) => {
        setState(prev => ({ ...prev, currentSlot: slot }))
      }),
      engine.onTransaction((tx) => {
        setState(prev => ({
          ...prev,
          transactions: [...prev.transactions, tx]
        }))
      }),
      engine.onBlock((block) => {
        setState(prev => ({
          ...prev,
          blocks: [...prev.blocks, block]
        }))
      }),
      engine.onVote((vote) => {
        setState(prev => ({
          ...prev,
          votes: [...prev.votes, vote]
        }))
      })
    ]

    return () => {
      unsubscribes.forEach(unsub => unsub())
    }
  }, [engine])

  const start = useCallback(async () => {
    if (!engine) return
    await engine.start()
    setState(prev => ({ ...prev, status: 'running' }))
  }, [engine])

  const pause = useCallback(() => {
    if (!engine) return
    engine.pause()
    setState(prev => ({ ...prev, status: 'paused' }))
  }, [engine])

  const resume = useCallback(() => {
    if (!engine) return
    engine.resume()
    setState(prev => ({ ...prev, status: 'running' }))
  }, [engine])

  const stop = useCallback(() => {
    if (!engine) return
    engine.stop()
    setState(prev => ({ ...prev, status: 'idle' }))
  }, [engine])

  const step = useCallback(() => {
    if (!engine) return
    engine.step()
  }, [engine])

  const submitTransaction = useCallback(async (tx: Transaction): Promise<string> => {
    if (!engine) throw new Error('Engine not initialized')
    return engine.submitTransaction(tx)
  }, [engine])

  const setSpeed = useCallback((speed: number) => {
    if (!engine) return
    engine.setSpeedMultiplier(speed)
    setState(prev => ({ ...prev, speedMultiplier: speed }))
  }, [engine])

  const toggleSlowMotion = useCallback(() => {
    if (!engine) return
    const newEnabled = !state.slowMotionEnabled
    engine.enableSlowMotion(newEnabled)
    setState(prev => ({ ...prev, slowMotionEnabled: newEnabled }))
  }, [engine, state.slowMotionEnabled])

  return {
    state,
    start,
    pause,
    resume,
    stop,
    step,
    submitTransaction,
    setSpeed,
    toggleSlowMotion
  }
}
