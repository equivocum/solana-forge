// ExecutionLogService - IndexedDB-backed JSONL execution logging
// // STAGE: execution_log_service

import type { Annotation } from '@shared/types'

const DB_NAME = 'solana-learn-logs'
const DB_VERSION = 1
const STORE_NAME = 'execution-logs'

export interface ExecutionLogEntry {
  id: string
  gateId: number
  timestamp: Date
  type: string
  content: string
  sourceRef: string
}

export interface ExecutionLogService {
  logAnnotation(gateId: number, annotation: Annotation): Promise<void>
  getLogs(gateId: number): Promise<ExecutionLogEntry[]>
  exportAsJsonl(gateId: number): Promise<string>
  clearLogs(gateId: number): Promise<void>
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('gateId', 'gateId', { unique: false })
      }
    }
  })
}

export function createExecutionLogService(): ExecutionLogService {
  return {
    async logAnnotation(gateId: number, annotation: Annotation): Promise<void> {
      const db = await openDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)

        const entry: ExecutionLogEntry = {
          id: `${gateId}-${annotation.id}`,
          gateId,
          timestamp: annotation.timestamp,
          type: annotation.type,
          content: annotation.content,
          sourceRef: annotation.sourceRef
        }

        const request = store.put(entry)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    },

    async getLogs(gateId: number): Promise<ExecutionLogEntry[]> {
      const db = await openDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const index = store.index('gateId')
        const request = index.getAll(gateId)

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    },

    async exportAsJsonl(gateId: number): Promise<string> {
      const logs = await this.getLogs(gateId)
      return logs
        .map(log => JSON.stringify({
          timestamp: log.timestamp.toISOString(),
          gate: log.gateId,
          type: log.type,
          content: log.content,
          ref: log.sourceRef
        }))
        .join('\n')
    },

    async clearLogs(gateId: number): Promise<void> {
      const logs = await this.getLogs(gateId)
      const db = await openDB()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)

        for (const log of logs) {
          store.delete(log.id)
        }

        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      })
    }
  }
}
