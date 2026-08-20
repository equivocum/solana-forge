// Storage Service - localStorage + IndexedDB implementation
// // STAGE: storage

import type { GateProgress, GameState, Transaction, Annotation, Block } from '@shared/types'

const STORAGE_KEYS = {
  PROGRESS: 'solana-learn:progress',
  PREFERENCES: 'solana-learn:preferences',
  GAME: 'solana-learn:game'
} as const

const DB_NAME = 'solana-learn'
const DB_VERSION = 1

// === IndexedDB Helper ===

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'signature' })
      }
      if (!db.objectStoreNames.contains('annotations')) {
        db.createObjectStore('annotations', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('blocks')) {
        db.createObjectStore('blocks', { keyPath: 'slot' })
      }
    }
  })
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function addToStore<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.add(item)
    
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// === Storage Service ===

export interface StorageService {
  // Progress
  getProgress(): Promise<GateProgress>
  saveProgress(progress: GateProgress): Promise<void>
  
  // Game State
  getGameState(): Promise<GameState>
  saveGameState(state: GameState): Promise<void>
  
  // Transaction History
  getTransactions(): Promise<Transaction[]>
  addTransaction(tx: Transaction): Promise<void>
  
  // Annotation Log
  getAnnotations(): Promise<Annotation[]>
  addAnnotation(annotation: Annotation): Promise<void>
  
  // Block History
  getBlocks(): Promise<Block[]>
  addBlock(block: Block): Promise<void>
}

export function createStorageService(): StorageService {
  return {
    // === Progress ===
    
    async getProgress(): Promise<GateProgress> {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.PROGRESS)
        if (data) {
          return JSON.parse(data)
        }
      } catch (e) {
        console.warn('Failed to load progress from localStorage:', e)
      }
      
      // Default progress
      return {
        currentGate: 1,
        completedGates: [],
        gateData: {}
      }
    },

    async saveProgress(progress: GateProgress): Promise<void> {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress))
    },

    // === Game State ===

    async getGameState(): Promise<GameState> {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.GAME)
        if (data) {
          return JSON.parse(data)
        }
      } catch (e) {
        console.warn('Failed to load game state from localStorage:', e)
      }
      
      // Default game state
      return {
        factory: { efficiency: 100, workers: 1, machines: [] },
        conveyor: { items: [], tickRate: 1, position: 0 },
        qcStation: { inspectedCount: 0, passCount: 0, failCount: 0 },
        shipments: [],
        defectiveBatches: []
      }
    },

    async saveGameState(state: GameState): Promise<void> {
      localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(state))
    },

    // === Transactions ===

    async getTransactions(): Promise<Transaction[]> {
      return getAllFromStore<Transaction>('transactions')
    },

    async addTransaction(tx: Transaction): Promise<void> {
      await addToStore<Transaction>('transactions', tx)
    },

    // === Annotations ===

    async getAnnotations(): Promise<Annotation[]> {
      return getAllFromStore<Annotation>('annotations')
    },

    async addAnnotation(annotation: Annotation): Promise<void> {
      await addToStore<Annotation>('annotations', annotation)
    },

    // === Blocks ===

    async getBlocks(): Promise<Block[]> {
      return getAllFromStore<Block>('blocks')
    },

    async addBlock(block: Block): Promise<void> {
      await addToStore<Block>('blocks', block)
    }
  }
}
