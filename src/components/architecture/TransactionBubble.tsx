// TransactionBubble - Animated transaction moving through the pipeline
// Shows the transaction's journey from client to finalization

import { useEffect, useState } from 'react'
import type { ArchitectureComponent } from './data/components'
import { TX_LIFECYCLE_PATH } from './data/connections'

// // STAGE: transaction_bubble
interface TransactionBubbleProps {
  isRunning: boolean
  currentStep: number
  components: ArchitectureComponent[]
  speed?: number
}

export function TransactionBubble({ isRunning, currentStep, components }: TransactionBubbleProps) {
  const [hash, setHash] = useState('')

  // Generate a mock transaction hash
  useEffect(() => {
    const generateHash = () => {
      return `0x${Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`
    }
    setHash(generateHash())
  }, [currentStep])

  const currentComponentId = TX_LIFECYCLE_PATH[currentStep]
  const currentComponent = components.find(c => c.id === currentComponentId)

  if (!currentComponent) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      {/* // STAGE: bubble_container */}
      <div className="bg-gray-900 border border-gray-600 rounded-xl p-3 shadow-2xl shadow-blue-500/20">
        <div className="flex items-center gap-3">
          {/* Transaction icon */}
          <div className="relative">
            <span className="text-2xl">📋</span>
            {isRunning && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
            )}
          </div>

          {/* Transaction info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Transaction</span>
              <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded text-white">
                Step {currentStep + 1}/{TX_LIFECYCLE_PATH.length}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{hash}</p>
          </div>

          {/* Current stage */}
          <div className="ml-4 flex items-center gap-2">
            <span className="text-lg">{currentComponent.icon}</span>
            <div>
              <p className="text-xs font-semibold text-white">{currentComponent.name}</p>
              <p className="text-[10px] text-gray-400">{currentComponent.detail.purpose.slice(0, 60)}...</p>
            </div>
          </div>

          {/* Progress */}
          <div className="ml-4">
            <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / TX_LIFECYCLE_PATH.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
