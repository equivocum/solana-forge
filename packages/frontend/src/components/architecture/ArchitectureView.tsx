// ArchitectureView - Main container with pipeline/layered views
// C4-style Solana validator architecture with zoom, solar system, and simulation

import { useState, useCallback } from 'react'
import { PipelineFlowView } from './PipelineFlowView'
import { LayeredView } from './LayeredView'
import { ZoomPanel } from './ZoomPanel'
import { TransactionBubble } from './TransactionBubble'
import { SimulationSidebar } from './SimulationSidebar'
import { ALL_COMPONENTS, TX_LIFECYCLE_PATH, SIMULATION_STEPS } from './data'
import type { ArchitectureComponent } from './data/components'
import { useAnnotations } from '../../hooks/useAnnotations'

// // STAGE: architecture_view
type ViewMode = 'pipeline' | 'layered'

interface ArchitectureViewProps {
  viewMode: ViewMode
  isSimulating: boolean
  tourActive: boolean
  simSpeed: number
  slowMotion: boolean
  simStep: number
  onSimStepChange: (step: number) => void
  onPause: () => void
  onNext: () => void
  onBack: () => void
  onResume: () => void
}

export function ArchitectureView({
  viewMode,
  isSimulating,
  tourActive,
  simSpeed,
  slowMotion,
  simStep,
  onSimStepChange,
  onPause,
  onNext,
  onBack,
  onResume,
}: ArchitectureViewProps) {
  // // STAGE: architecture_state
  const [activeComponent, setActiveComponent] = useState<string | null>(null)
  const [hoveredComponent, setHoveredComponent] = useState<ArchitectureComponent | null>(null)
  const [zoomedComponent, setZoomedComponent] = useState<ArchitectureComponent | null>(null)
  const [zoomedSubId, setZoomedSubId] = useState<string | null>(null)

  const { addAnnotation } = useAnnotations()

  // // STAGE: architecture_handlers
  const handleComponentClick = useCallback((comp: ArchitectureComponent) => {
    setZoomedComponent(comp)
    setActiveComponent(comp.id)
    addAnnotation('STAGE', `Exploring: ${comp.name} — ${comp.detail.purpose}`, comp.id, 1)
  }, [addAnnotation])

  const handleComponentHover = useCallback((comp: ArchitectureComponent | null) => {
    setHoveredComponent(comp)
  }, [])

  const handleZoomClose = useCallback(() => {
    setZoomedComponent(null)
    setZoomedSubId(null)
    setActiveComponent(null)
  }, [])

  const handleSubClick = useCallback((parent: ArchitectureComponent, subId: string) => {
    const sub = parent.subComponents.find(s => s.id === subId)
    if (sub) {
      setZoomedComponent(parent)
      setZoomedSubId(subId)
      setActiveComponent(parent.id)
      addAnnotation('STAGE', `Exploring sub-component: ${sub.name} — ${sub.detail.purpose}`, subId, 1)
    }
  }, [addAnnotation])

  // Sync simStep with activeComponent for highlighting
  const handleSimStepChangeWrapper = useCallback((step: number) => {
    onSimStepChange(step)
    const componentId = TX_LIFECYCLE_PATH[step]
    if (componentId) {
      setActiveComponent(componentId)
      setHoveredComponent(ALL_COMPONENTS.find(c => c.id === componentId) || null)
    }
  }, [onSimStepChange])

  // // STAGE: architecture_render
  return (
    <div className="h-full flex min-h-0">
      {/* Main content area */}
      <div className="flex-1 bg-gray-800/30 rounded-xl p-4 min-w-0">
        {viewMode === 'pipeline' ? (
          <PipelineFlowView
            activeComponent={activeComponent}
            highlightedComponent={hoveredComponent?.id || null}
            currentStepId={TX_LIFECYCLE_PATH[simStep] || null}
            onComponentClick={handleComponentClick}
            onComponentHover={handleComponentHover}
            onSubClick={handleSubClick}
            txPath={TX_LIFECYCLE_PATH}
            txPosition={simStep}
          />
        ) : (
          <LayeredView
            activeComponent={activeComponent}
            highlightedComponent={hoveredComponent?.id || null}
            currentStepId={TX_LIFECYCLE_PATH[simStep] || null}
            onComponentClick={handleComponentClick}
            onComponentHover={handleComponentHover}
            onSubClick={handleSubClick}
          />
        )}
      </div>

      {/* // STAGE: architecture_overlays */}
      {/* Transaction bubble (when simulating) */}
      {isSimulating && (
        <TransactionBubble
          isRunning={isSimulating}
          currentStep={simStep}
          components={ALL_COMPONENTS}
          speed={simSpeed}
        />
      )}

      {/* Simulation sidebar (when tour is active) */}
      {tourActive && (
        <div className="w-80 ml-4 flex-shrink-0">
          <SimulationSidebar
            isRunning={isSimulating}
            speed={simSpeed}
            slowMotion={slowMotion}
            currentStep={simStep}
            totalSteps={SIMULATION_STEPS.length}
            onStepChange={handleSimStepChangeWrapper}
            onPause={onPause}
            onResume={onResume}
            onNext={onNext}
            onBack={onBack}
          />
        </div>
      )}

      {/* Zoom panel (on click) */}
      {zoomedComponent && (
        <ZoomPanel
          component={zoomedComponent}
          initialSubId={zoomedSubId}
          onClose={handleZoomClose}
        />
      )}
    </div>
  )
}
