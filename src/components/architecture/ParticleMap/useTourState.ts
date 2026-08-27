// useTourState.ts - Tour state management for particle map
// STAGE: particle_tour_state
// WHY: Manages tour step highlighting and camera focus for the particle view
// HOW: Reads currentStepId from props, maps to component/sub focus targets

import { useEffect, useRef } from 'react'
import type { MotionProfile } from './motionPreferences'

// ─────────────────────────────────────────────────────────────────────────────
// TourStepTarget - What to focus on for a given tour step
// ─────────────────────────────────────────────────────────────────────────────
export interface TourStepTarget {
  componentId: string
  subId?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// useTourState - Manages tour highlighting and focus
// ─────────────────────────────────────────────────────────────────────────────
export function useTourState(opts: {
  currentStepId: string | null
  onHighlight: (_componentId: string | null) => void
  onFocus: (_componentId: string, _subId?: string) => void
  motion: MotionProfile
}) {
  const prevStepRef = useRef<string | null>(null)
  const { currentStepId, onHighlight, onFocus, motion } = opts

  useEffect(() => {
    const step = currentStepId
    if (step === prevStepRef.current) return
    prevStepRef.current = step

    if (!step) {
      onHighlight(null)
      return
    }

    // Parse step ID to extract component target
    // Step IDs follow pattern: "step-{n}" or "component-{id}"
    const componentMatch = step.match(/^component-(.+)$/)
    if (componentMatch) {
      const componentId = componentMatch[1]
      onHighlight(componentId)
      onFocus(componentId)
    }
  }, [currentStepId, onHighlight, onFocus, motion])
}