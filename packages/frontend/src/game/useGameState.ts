// useGameState Hook - React hook for game state management
// // STAGE: game_state_hook

import { useState, useCallback, useEffect } from 'react'
import type { GameState, FactoryState, ConveyorState, QCStationState, ShipmentRecord, DefectiveBatch } from '@shared/types'
import { createStorageService } from '../services/storage'

interface UseGameStateReturn {
  gameState: GameState
  updateFactory: (updates: Partial<FactoryState>) => Promise<void>
  updateConveyor: (updates: Partial<ConveyorState>) => Promise<void>
  updateQCStation: (updates: Partial<QCStationState>) => Promise<void>
  addShipment: (shipment: ShipmentRecord) => Promise<void>
  addDefectiveBatch: (batch: DefectiveBatch) => Promise<void>
  resetGameState: () => Promise<void>
}

export function useGameState(): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState>({
    factory: { efficiency: 100, workers: 1, machines: [] },
    conveyor: { items: [], tickRate: 1, position: 0 },
    qcStation: { inspectedCount: 0, passCount: 0, failCount: 0 },
    shipments: [],
    defectiveBatches: []
  })
  
  const storage = createStorageService()

  // Load game state on mount
  useEffect(() => {
    storage.getGameState().then(setGameState)
  }, [])

  const updateFactory = useCallback(async (updates: Partial<FactoryState>) => {
    setGameState(prev => ({
      ...prev,
      factory: { ...prev.factory, ...updates }
    }))
    await storage.saveGameState(gameState)
  }, [gameState, storage])

  const updateConveyor = useCallback(async (updates: Partial<ConveyorState>) => {
    setGameState(prev => ({
      ...prev,
      conveyor: { ...prev.conveyor, ...updates }
    }))
    await storage.saveGameState(gameState)
  }, [gameState, storage])

  const updateQCStation = useCallback(async (updates: Partial<QCStationState>) => {
    setGameState(prev => ({
      ...prev,
      qcStation: { ...prev.qcStation, ...updates }
    }))
    await storage.saveGameState(gameState)
  }, [gameState, storage])

  const addShipment = useCallback(async (shipment: ShipmentRecord) => {
    setGameState(prev => ({
      ...prev,
      shipments: [...prev.shipments, shipment]
    }))
    await storage.saveGameState(gameState)
  }, [gameState, storage])

  const addDefectiveBatch = useCallback(async (batch: DefectiveBatch) => {
    setGameState(prev => ({
      ...prev,
      defectiveBatches: [...prev.defectiveBatches, batch]
    }))
    await storage.saveGameState(gameState)
  }, [gameState, storage])

  const resetGameState = useCallback(async () => {
    const defaultState: GameState = {
      factory: { efficiency: 100, workers: 1, machines: [] },
      conveyor: { items: [], tickRate: 1, position: 0 },
      qcStation: { inspectedCount: 0, passCount: 0, failCount: 0 },
      shipments: [],
      defectiveBatches: []
    }
    setGameState(defaultState)
    await storage.saveGameState(defaultState)
  }, [storage])

  return {
    gameState,
    updateFactory,
    updateConveyor,
    updateQCStation,
    addShipment,
    addDefectiveBatch,
    resetGameState
  }
}
