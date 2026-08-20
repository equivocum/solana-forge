// SimulationSidebar - Guided tour annotations in a right sidebar layout
// Replaces the floating overlay with a dedicated layout element

import { useState, useEffect, useRef } from 'react'
import { SIMULATION_STEPS } from './data/simulation-steps'
import type { SimulationStep } from './data/simulation-steps'

interface SimulationSidebarProps {
  isRunning: boolean
  speed: number
  slowMotion: boolean
  currentStep: number
  totalSteps: number
  onStepChange: (step: number) => void
  onPause: () => void
  onResume: () => void
  onNext: () => void
  onBack: () => void
}

export function SimulationSidebar({
  isRunning,
  speed,
  slowMotion,
  currentStep,
  totalSteps,
  onStepChange,
  onPause,
  onResume,
  onNext,
  onBack,
}: SimulationSidebarProps) {
  const [activeAnnotation, setActiveAnnotation] = useState<SimulationStep | null>(null)
  const timerRef = useRef<number | null>(null)

  // Auto-advance steps when running
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      // Keep activeAnnotation visible when paused
      return
    }

    const step = SIMULATION_STEPS[currentStep]
    if (!step) {
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

  // Set initial annotation when not yet running
  useEffect(() => {
    if (!activeAnnotation) {
      const step = SIMULATION_STEPS[currentStep]
      if (step) setActiveAnnotation(step)
    }
  }, [currentStep, activeAnnotation])

  if (!activeAnnotation) return null

  return (
    <div className="h-full flex flex-col bg-gray-900/95 border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-blue-400">
            Step {currentStep + 1}/{totalSteps}
          </span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-400 truncate">{activeAnnotation.title}</span>
        </div>
        <p className="text-sm text-gray-300">{activeAnnotation.description}</p>
      </div>

      {/* Scrollable annotations */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {activeAnnotation.annotation.map((ann, i) => (
          <AnnotationBadge key={i} annotation={ann} index={i} />
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex-shrink-0 px-4 pb-2">
        <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            disabled={currentStep === 0}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-xs font-medium text-white transition-colors"
          >
            ← Back
          </button>

          {isRunning ? (
            <button
              onClick={onPause}
              className="flex-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 rounded-md text-xs font-medium text-white transition-colors"
            >
              ⏸ Pause
            </button>
          ) : (
            <button
              onClick={onResume}
              className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-md text-xs font-medium text-white transition-colors"
            >
              ▶ Resume
            </button>
          )}

          <button
            onClick={onNext}
            disabled={currentStep >= totalSteps - 1}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-xs font-medium text-white transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}

// Annotation badge with clickable source reference
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

  // Extract file path from sourceRef URL for display
  const displayRef = annotation.sourceRef
    .replace('https://github.com/anza-xyz/agave/blob/v3.1.8/', '')
    .replace('https://github.com/', '')

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
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[9px] opacity-50 font-mono">// REF: {displayRef}</span>
            <a
              href={annotation.sourceRef}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              title="Open in GitHub"
            >
              ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
