// GateSelector Component - Gate navigation with status indicators
// // STAGE: gate_selector

interface GateSelectorProps {
  currentGate: number
  completedGates: number[]
  onGateSelect: (gate: number) => void
}

const gateNames = [
  'Tx Signing',
  'RPC Submit',
  'Validator Process',
  'Block Finalize',
  'Fork Resolution'
]

export function GateSelector({ currentGate, completedGates, onGateSelect }: GateSelectorProps) {
  const isGateCompleted = (gate: number) => completedGates.includes(gate)
  const isGateActive = (gate: number) => gate === currentGate
  const isGateLocked = (gate: number) => {
    if (gate === 1) return false
    return !completedGates.includes(gate - 1)
  }

  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map(gate => {
        const completed = isGateCompleted(gate)
        const active = isGateActive(gate)
        const locked = isGateLocked(gate)

        return (
          <button
            key={gate}
            onClick={() => !locked && onGateSelect(gate)}
            disabled={locked}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              locked
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : completed
                ? 'bg-green-800 hover:bg-green-700 text-white'
                : active
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">
                Gate {gate}: {gateNames[gate - 1]}
              </span>
              {completed && (
                <span className="text-green-400">✓</span>
              )}
              {locked && (
                <span className="text-gray-500">🔒</span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
