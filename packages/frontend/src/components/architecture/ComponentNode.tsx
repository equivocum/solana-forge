// ComponentNode - Individual architecture component card
// Shows icon, name, one-line description. Click to zoom, hover for solar system preview.

import { useState, useRef, useCallback } from 'react'
import type { ArchitectureComponent } from './data/components'

// // STAGE: component_node
interface ComponentNodeProps {
  component: ArchitectureComponent
  isActive?: boolean
  isHighlighted?: boolean
  isCurrentStep?: boolean
  onClick: (component: ArchitectureComponent) => void
  onHover?: (component: ArchitectureComponent | null) => void
  size?: 'sm' | 'md' | 'lg'
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; activeBg: string; activeBorder: string }> = {
  networking: { bg: 'bg-cyan-950/60', border: 'border-cyan-700/50', text: 'text-cyan-300', activeBg: 'bg-cyan-900', activeBorder: 'border-cyan-400' },
  tpu: { bg: 'bg-blue-950/60', border: 'border-blue-700/50', text: 'text-blue-300', activeBg: 'bg-blue-900', activeBorder: 'border-blue-400' },
  tvu: { bg: 'bg-purple-950/60', border: 'border-purple-700/50', text: 'text-purple-300', activeBg: 'bg-purple-900', activeBorder: 'border-purple-400' },
  runtime: { bg: 'bg-yellow-950/60', border: 'border-yellow-700/50', text: 'text-yellow-300', activeBg: 'bg-yellow-900', activeBorder: 'border-yellow-400' },
  consensus: { bg: 'bg-green-950/60', border: 'border-green-700/50', text: 'text-green-300', activeBg: 'bg-green-900', activeBorder: 'border-green-400' },
  storage: { bg: 'bg-orange-950/60', border: 'border-orange-700/50', text: 'text-orange-300', activeBg: 'bg-orange-900', activeBorder: 'border-orange-400' },
  programs: { bg: 'bg-pink-950/60', border: 'border-pink-700/50', text: 'text-pink-300', activeBg: 'bg-pink-900', activeBorder: 'border-pink-400' },
}

export function ComponentNode({
  component,
  isActive = false,
  isHighlighted = false,
  isCurrentStep = false,
  onClick,
  onHover,
  size = 'md'
}: ComponentNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const hoverTimeoutRef = useRef<number | null>(null)
  const colors = CATEGORY_COLORS[component.category] || CATEGORY_COLORS.networking

  const sizeClasses = {
    sm: 'min-w-[5rem] min-h-[5rem] px-2 py-2 text-xs',
    md: 'min-w-[7rem] min-h-[7rem] px-3 py-3 text-sm',
    lg: 'min-w-[9rem] min-h-[9rem] px-4 py-4 text-base',
  }

  const handleMouseEnter = useCallback(() => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsHovered(true)
      onHover?.(component)
    }, 400)
  }, [component, onHover])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setIsHovered(false)
    onHover?.(null)
  }, [onHover])

  // // STAGE: node_styling
  // Determine visual state classes
  const getStateClasses = () => {
    if (isCurrentStep) {
      // Current step in simulation — brightest, pulsing glow
      return `
        bg-yellow-900 border-yellow-400
        ring-2 ring-yellow-400/80
        shadow-lg shadow-yellow-500/40
        scale-110
        animate-pulse
      `
    }
    if (isActive) {
      // Selected/clicked — solid glow
      return `
        ${colors.activeBg} ${colors.activeBorder}
        ring-2 ring-white/80
        shadow-lg shadow-white/20
        scale-105
      `
    }
    if (isHighlighted || isHovered) {
      // Hovered or highlighted — bright border
      return `
        ${colors.activeBg} ${colors.activeBorder}
        shadow-md shadow-white/10
        scale-105
      `
    }
    // Default state
    return `${colors.bg} ${colors.border}`
  }

  return (
    <button
      onClick={() => onClick(component)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative flex flex-col items-center justify-center
        rounded-xl border-2 transition-all duration-200 cursor-pointer
        ${sizeClasses[size]}
        ${getStateClasses()}
      `}
      title={`${component.name} — Click to explore`}
    >
      {/* // STAGE: node_status_badge */}
      {/* Status badge */}
      {isCurrentStep && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-yellow-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
            CURRENT
          </div>
        </div>
      )}
      {isActive && !isCurrentStep && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-white text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full">
            SELECTED
          </div>
        </div>
      )}

      {/* Icon */}
      <span className={`text-2xl mb-1 transition-transform duration-200 ${isCurrentStep ? 'scale-125' : ''}`}>
        {component.icon}
      </span>

      {/* Name */}
      <span className={`font-semibold ${isCurrentStep ? 'text-yellow-200' : colors.text} text-center leading-tight`}>
        {component.name}
      </span>

      {/* Sub-component count */}
      {component.subComponents.length > 0 && (
        <span className="text-[10px] text-gray-500 mt-0.5">
          {component.subComponents.length} sub
        </span>
      )}

      {/* Click hint on hover */}
      {isHovered && !isCurrentStep && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          <span className="text-[8px] text-gray-400 bg-gray-900 px-1 rounded">
            click to explore
          </span>
        </div>
      )}
    </button>
  )
}
