// ExecutionLogService - IndexedDB-backed JSONL execution logging
// // STAGE: execution_log_service

import type { Annotation } from '@/types'

const DB_NAME = 'solana-forge-logs'
const DB_VERSION = 1
const STORE_NAME = 'execution-logs'

export interface ExecutionLogEntry {
  id: string
  timestamp: Date
  type: string
  content: string
  sourceRef: string
}

export interface ExecutionLogService {
  logAnnotation(annotation: Annotation): Promise<void>
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export function createExecutionLogService(): ExecutionLogService {
  return {
    async logAnnotation(annotation: Annotation): Promise<void> {
      const db = await openDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)

        const entry: ExecutionLogEntry = {
          id: annotation.id,
          timestamp: annotation.timestamp,
          type: annotation.type,
          content: annotation.content,
          sourceRef: annotation.sourceRef
        }

        const request = store.put(entry)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }
  }
}
