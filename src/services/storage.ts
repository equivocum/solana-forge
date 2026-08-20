// Storage Service - IndexedDB implementation
// // STAGE: storage

import type { Transaction, Annotation, Block } from '@/types'

const DB_NAME = 'solana-forge'
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
    async getTransactions(): Promise<Transaction[]> {
      return getAllFromStore<Transaction>('transactions')
    },

    async addTransaction(tx: Transaction): Promise<void> {
      await addToStore<Transaction>('transactions', tx)
    },

    async getAnnotations(): Promise<Annotation[]> {
      return getAllFromStore<Annotation>('annotations')
    },

    async addAnnotation(annotation: Annotation): Promise<void> {
      await addToStore<Annotation>('annotations', annotation)
    },

    async getBlocks(): Promise<Block[]> {
      return getAllFromStore<Block>('blocks')
    },

    async addBlock(block: Block): Promise<void> {
      await addToStore<Block>('blocks', block)
    }
  }
}
