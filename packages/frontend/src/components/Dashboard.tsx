// Dashboard Component - Main layout with gate selector and content area
// // STAGE: dashboard

import { useState } from 'react'
import { GateSelector } from './GateSelector'
import { AnnotationPanel } from './AnnotationPanel'
import { ExecutionLog } from './ExecutionLog'
import { SimulationControls } from './SimulationControls'
import { useAnnotations } from '../hooks/useAnnotations'
import { useProgress } from '../hooks/useProgress'
import { useGameState } from '../game/useGameState'
import { useSimulation } from '../hooks/useSimulation'
import { Gate1TxSigning } from '../gates/gate1-tx-signing'
import { Gate2RpcSubmit } from '../gates/gate2-rpc-submit'
import { Gate3ValidatorProcess } from '../gates/gate3-validator-process'
import { Gate4BlockFinalize } from '../gates/gate4-block-finalize'
import { Gate5ForkResolution } from '../gates/gate5-fork-resolution'

interface DashboardProps {
  currentGate: number
  completedGates: number[]
}

export function Dashboard({ currentGate, completedGates }: DashboardProps) {
  const { currentGate: progressGate, completedGates: progressCompleted, completeGate, startGate } = useProgress()
  const gameState = useGameState()
  const sim = useSimulation(null)

  const [selectedGate, setSelectedGate] = useState(progressGate)
  const { annotations, addAnnotation } = useAnnotations()

  const handleGateComplete = async () => {
    addAnnotation('STAGE', `Gate ${selectedGate} completed`, `dashboard.tsx:${selectedGate}`, selectedGate)
    await completeGate(selectedGate)
  }

  const handleGateSelect = async (gate: number) => {
    setSelectedGate(gate)
    await startGate(gate)
  }

  const renderGateContent = () => {
    switch (selectedGate) {
      case 1:
        return <Gate1TxSigning onComplete={handleGateComplete} data-testid="gate1-visualization" />
      case 2:
        return <Gate2RpcSubmit onComplete={handleGateComplete} data-testid="gate2-visualization" />
      case 3:
        return <Gate3ValidatorProcess onComplete={handleGateComplete} data-testid="gate3-visualization" />
      case 4:
        return <Gate4BlockFinalize onComplete={handleGateComplete} data-testid="gate4-visualization" />
      case 5:
        return <Gate5ForkResolution onComplete={handleGateComplete} data-testid="gate5-visualization" />
      default:
        return <Gate1TxSigning onComplete={handleGateComplete} data-testid="gate1-visualization" />
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
      {/* Left sidebar - Gate selector */}
      <div className="col-span-2 bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Learning Gates</h2>
        <GateSelector
          currentGate={progressGate}
          completedGates={progressCompleted}
          onGateSelect={handleGateSelect}
        />
      </div>

      {/* Main content area */}
      <div className="col-span-6 bg-gray-800 rounded-lg p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Gate {selectedGate} Content</h2>

        {/* Gate-specific content */}
        <div className="flex-1 bg-gray-900 rounded-lg p-4 overflow-auto">
          {renderGateContent()}
        </div>

        {/* Simulation controls */}
        <div className="mt-4">
          <SimulationControls
            status={sim.state.status}
            speed={sim.state.speedMultiplier}
            slowMotion={sim.state.slowMotionEnabled}
            onStart={() => sim.start()}
            onPause={() => sim.pause()}
            onResume={() => sim.resume()}
            onSpeedChange={(s) => sim.setSpeed(s)}
            onSlowMotionToggle={() => sim.toggleSlowMotion()}
            onStep={() => sim.step()}
          />
        </div>
      </div>

      {/* Right sidebar - Annotations and execution log */}
      <div className="col-span-4 flex flex-col gap-4">
        {/* Annotation panel */}
        <div className="flex-1 bg-gray-800 rounded-lg p-4 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Annotations</h2>
          <AnnotationPanel
            annotations={annotations}
            onAnnotationClick={(a) => addAnnotation('REF', `Cross-ref: ${a.sourceRef}`, a.sourceRef, a.gateId)}
          />
        </div>

        {/* Execution log */}
        <div className="flex-1 bg-gray-800 rounded-lg p-4 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Execution Log</h2>
          <ExecutionLog
            steps={annotations.map((a) => ({
              id: a.id,
              label: `${a.type}: ${a.content}`,
              status: 'completed' as const,
              timestamp: a.timestamp
            }))}
            annotations={annotations}
          />
        </div>
      </div>
    </div>
  )
}
