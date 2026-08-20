// ErrorDisplay Component - User-facing error display without halting
// // STAGE: error_display

import { useState } from 'react'

interface ErrorDisplayProps {
  error: Error | string | null
  onDismiss?: () => void
  gateId?: number
}

export function ErrorDisplay({ error, onDismiss, gateId }: ErrorDisplayProps) {
  const [expanded, setExpanded] = useState(false)

  if (!error) return null

  const message = typeof error === 'string' ? error : error.message
  const stack = typeof error === 'object' && error.stack ? error.stack : null

  return (
    <div className="p-4 bg-red-900/50 border border-red-600 rounded-lg" role="alert">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-red-400 font-semibold flex items-center gap-2">
            <span className="text-lg">⚠</span>
            Error{gateId ? ` in Gate ${gateId}` : ''}
          </h4>
          <p className="text-red-300 text-sm mt-1">{message}</p>

          {/* // WHY: Errors mirror real Solana behavior for educational display */}
          <p className="text-xs text-red-400/70 mt-2 italic">
            // WHY: This error mirrors real Solana RPC/validator behavior for educational purposes
          </p>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {stack && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              {expanded ? 'Hide' : 'Details'}
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-300 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {expanded && stack && (
        <pre className="mt-3 p-3 bg-red-950 rounded text-xs text-red-300 overflow-auto max-h-40">
          {stack}
        </pre>
      )}
    </div>
  )
}

// Error boundary hook for gate components
export function useGateError() {
  const [error, setError] = useState<Error | string | null>(null)

  const captureError = (err: unknown) => {
    if (err instanceof Error) {
      setError(err)
    } else if (typeof err === 'string') {
      setError(err)
    } else {
      setError('An unknown error occurred')
    }
  }

  const clearError = () => setError(null)

  return { error, captureError, clearError }
}
