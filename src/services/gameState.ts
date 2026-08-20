// GameStateService - Game state CRUD and persistence orchestration
// // STAGE: game_state_service

import type { GameState, FactoryState, ConveyorState, QCStationState, ShipmentRecord, DefectiveBatch } from '@/types'
import { createStorageService, type StorageService } from './storage'

export interface GameStateService {
  getGameState(): Promise<GameState>
  updateFactory(updates: Partial<FactoryState>): Promise<void>
  updateConveyor(updates: Partial<ConveyorState>): Promise<void>
  updateQCStation(updates: Partial<QCStationState>): Promise<void>
  addShipment(shipment: ShipmentRecord): Promise<void>
  addDefectiveBatch(batch: DefectiveBatch): Promise<void>
  resetGameState(): Promise<void>
}

const DEFAULT_GAME_STATE: GameState = {
  factory: { efficiency: 100, workers: 1, machines: [] },
  conveyor: { items: [], tickRate: 1, position: 0 },
  qcStation: { inspectedCount: 0, passCount: 0, failCount: 0 },
  shipments: [],
  defectiveBatches: []
}

export function createGameStateService(storage?: StorageService): GameStateService {
  const store = storage || createStorageService()
  let currentState: GameState = { ...DEFAULT_GAME_STATE }

  // Load on init
  store.getGameState().then(s => { currentState = s })

  async function save(): Promise<void> {
    await store.saveGameState(currentState)
  }

  return {
    async getGameState(): Promise<GameState> {
      currentState = await store.getGameState()
      return { ...currentState }
    },

    async updateFactory(updates: Partial<FactoryState>): Promise<void> {
      currentState.factory = { ...currentState.factory, ...updates }
      await save()
    },

    async updateConveyor(updates: Partial<ConveyorState>): Promise<void> {
      currentState.conveyor = { ...currentState.conveyor, ...updates }
      await save()
    },

    async updateQCStation(updates: Partial<QCStationState>): Promise<void> {
      currentState.qcStation = { ...currentState.qcStation, ...updates }
      await save()
    },

    async addShipment(shipment: ShipmentRecord): Promise<void> {
      currentState.shipments = [...currentState.shipments, shipment]
      await save()
    },

    async addDefectiveBatch(batch: DefectiveBatch): Promise<void> {
      currentState.defectiveBatches = [...currentState.defectiveBatches, batch]
      await save()
    },

    async resetGameState(): Promise<void> {
      currentState = { ...DEFAULT_GAME_STATE }
      await save()
    }
  }
}
