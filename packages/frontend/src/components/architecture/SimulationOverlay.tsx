// SimulationOverlay - Guided tour mode with step-by-step annotations
// Drives the transaction through the full lifecycle with educational annotations

import { useState, useEffect, useRef } from 'react'
import { SIMULATION_STEPS } from './data/simulation-steps'
import type { SimulationStep } from './data/simulation-steps'

// // STAGE: simulation_overlay
interface SimulationOverlayProps {
  isRunning: boolean
  speed: number
  slowMotion: boolean
  currentStep: number
  onStepChange: (step: number) => void
  onStart?: () => void
  onPause: () => void
  onReset?: () => void
}

export function SimulationOverlay({
  isRunning,
  speed,
  slowMotion,
  currentStep,
  onStepChange,
  onPause,
}: SimulationOverlayProps) {
  const [activeAnnotation, setActiveAnnotation] = useState<SimulationStep | null>(null)
  const timerRef = useRef<number | null>(null)

  // // STAGE: simulation_timer
  // Auto-advance steps when running
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    const step = SIMULATION_STEPS[currentStep]
    if (!step) {
      // Simulation complete
      onPause()
      return
    }

    setActiveAnnotation(step)

    const duration = slowMotion ? step.duration * 4 : step.duration / speed

    timerRef.current = window.setInterval(() => {
      const nextStep = currentStep + 1
      if (nextStep >= SIMULATION_STEPS.length) {
        onPause()
        return
      }
      onStepChange(nextStep)
    }, duration)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRunning, currentStep, speed, slowMotion, onStepChange, onPause])

  // // STAGE: simulation_annotation_display
  // Display current step annotation
  if (!activeAnnotation) return null

  return (
    <div className="fixed top-20 right-4 z-40 w-80">
      {/* // STAGE: simulation_step_card */}
      <div className="bg-gray-900/95 border border-gray-600 rounded-xl p-4 shadow-2xl">
        {/* Step header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-blue-400">
            Step {currentStep + 1}/{SIMULATION_STEPS.length}
          </span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-400">{activeAnnotation.title}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 mb-3">{activeAnnotation.description}</p>

        {/* Annotations */}
        <div className="space-y-2">
          {activeAnnotation.annotation.map((ann, i) => (
            <AnnotationBadge key={i} annotation={ann} index={i} />
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / SIMULATION_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// // STAGE: annotation_badge
const TYPE_COLORS: Record<string, string> = {
  STAGE: 'bg-blue-900/50 text-blue-300 border-blue-700',
  WHY: 'bg-green-900/50 text-green-300 border-green-700',
  HOW: 'bg-purple-900/50 text-purple-300 border-purple-700',
  REF: 'bg-amber-900/50 text-amber-300 border-amber-700',
  DECISION: 'bg-pink-900/50 text-pink-300 border-pink-700',
  BYTES: 'bg-orange-900/50 text-orange-300 border-orange-700',
}

const TYPE_ICONS: Record<string, string> = {
  STAGE: '🎯',
  WHY: '❓',
  HOW: '⚙️',
  REF: '🔗',
  DECISION: '⚖️',
  BYTES: '🔢',
}

function AnnotationBadge({ annotation, index }: { annotation: { type: string; content: string; sourceRef: string }; index: number }) {
  const colorClass = TYPE_COLORS[annotation.type] || TYPE_COLORS.STAGE
  const icon = TYPE_ICONS[annotation.type] || '📝'

  return (
    <div
      className={`rounded-lg border p-2 ${colorClass} transition-all duration-300`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-2">
        <span className="text-xs mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase opacity-70">{annotation.type}</span>
          <p className="text-xs leading-snug mt-0.5">{annotation.content}</p>
          <p className="text-[9px] opacity-50 mt-0.5 font-mono">// REF: {annotation.sourceRef}</p>
        </div>
      </div>
    </div>
  )
}
