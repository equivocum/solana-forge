// Factory Component - Maps to Validator
// // STAGE: factory

import type { FactoryState } from '@shared/types'

interface FactoryProps {
  state: FactoryState
}

export function Factory({ state }: FactoryProps) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-yellow-500">
      <h3 className="text-lg font-semibold mb-4">
        <span className="text-yellow-400">Factory</span>
        <span className="text-gray-400 text-sm ml-2">(Validator)</span>
        <span className="ml-2 text-xs bg-yellow-600/30 text-yellow-300 px-2 py-1 rounded">PROCESSING</span>
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Efficiency:</span>
          <span>{state.efficiency}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Workers:</span>
          <span>{state.workers}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Machines:</span>
          <span>{state.machines.length}</span>
        </div>
      </div>
      {/* // REF: client_signing.rs - Factory maps to Validator */}
    </div>
  )
}
