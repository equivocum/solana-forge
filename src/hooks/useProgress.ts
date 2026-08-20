// useProgress Hook - React hook for learner progress tracking
// // STAGE: progress_hook

import { useState, useCallback, useEffect } from 'react'
import type { GateProgress, GateMetrics } from '@/types'
import { createStorageService } from '../services/storage'

interface UseProgressReturn {
  progress: GateProgress
  currentGate: number
  completedGates: number[]
  isGateCompleted: (gateId: number) => boolean
  isGateActive: (gateId: number) => boolean
  isGateLocked: (gateId: number) => boolean
  startGate: (gateId: number) => Promise<void>
  completeGate: (gateId: number) => Promise<void>
  updateGateMetrics: (gateId: number, metrics: Partial<GateMetrics>) => Promise<void>
  resetProgress: () => Promise<void>
}

export function useProgress(): UseProgressReturn {
  const [progress, setProgress] = useState<GateProgress>({
    currentGate: 1,
    completedGates: [],
    gateData: {}
  })
  const storage = createStorageService()

  // Load progress on mount
  useEffect(() => {
    storage.getProgress().then(setProgress)
  }, [])

  const isGateCompleted = useCallback(
    (gateId: number): boolean => {
      return progress.completedGates.includes(gateId)
    },
    [progress.completedGates]
  )

  const isGateActive = useCallback(
    (gateId: number): boolean => {
      return progress.currentGate === gateId
    },
    [progress.currentGate]
  )

  const isGateLocked = useCallback(
    (gateId: number): boolean => {
      if (gateId === 1) return false
      return !progress.completedGates.includes(gateId - 1)
    },
    [progress.completedGates]
  )

  const startGate = useCallback(async (gateId: number) => {
    const newProgress: GateProgress = {
      ...progress,
      currentGate: gateId,
      gateData: {
        ...progress.gateData,
        [gateId]: {
          gateId,
          status: 'active',
          startedAt: new Date(),
          completedAt: null,
          annotations: [],
          metrics: {
            timeSpent: 0,
            annotationsViewed: 0,
            errorsEncountered: 0,
            stepsCompleted: 0
          }
        }
      }
    }
    setProgress(newProgress)
    await storage.saveProgress(newProgress)
  }, [progress, storage])

  const completeGate = useCallback(async (gateId: number) => {
    const gateState = progress.gateData[gateId]
    if (!gateState) return

    const newProgress: GateProgress = {
      currentGate: Math.max(progress.currentGate, gateId + 1),
      completedGates: [...new Set([...progress.completedGates, gateId])],
      gateData: {
        ...progress.gateData,
        [gateId]: {
          ...gateState,
          status: 'completed',
          completedAt: new Date()
        }
      }
    }
    setProgress(newProgress)
    await storage.saveProgress(newProgress)
  }, [progress, storage])

  const updateGateMetrics = useCallback(async (gateId: number, metrics: Partial<GateMetrics>) => {
    const gateState = progress.gateData[gateId]
    if (!gateState) return

    const newProgress: GateProgress = {
      ...progress,
      gateData: {
        ...progress.gateData,
        [gateId]: {
          ...gateState,
          metrics: {
            ...gateState.metrics,
            ...metrics
          }
        }
      }
    }
    setProgress(newProgress)
    await storage.saveProgress(newProgress)
  }, [progress, storage])

  const resetProgress = useCallback(async () => {
    const defaultProgress: GateProgress = {
      currentGate: 1,
      completedGates: [],
      gateData: {}
    }
    setProgress(defaultProgress)
    await storage.saveProgress(defaultProgress)
  }, [storage])

  return {
    progress,
    currentGate: progress.currentGate,
    completedGates: progress.completedGates,
    isGateCompleted,
    isGateActive,
    isGateLocked,
    startGate,
    completeGate,
    updateGateMetrics,
    resetProgress
  }
}
