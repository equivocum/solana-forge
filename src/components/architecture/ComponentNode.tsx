// ComponentNode - Individual architecture component card
// Shows icon, name, one-line description. Click to zoom, hover for solar system preview.

import { useState, useCallback } from 'react'
import type { ArchitectureComponent } from './data/components'
import { CATEGORY_COLORS, SUB_CATEGORY_COLORS } from '../../services/componentTheme'

// // STAGE: component_node
interface ComponentNodeProps {
  component: ArchitectureComponent
  isActive?: boolean
  isHighlighted?: boolean
  isCurrentStep?: boolean
  onClick: (component: ArchitectureComponent) => void
  onHover?: (component: ArchitectureComponent | null) => void
  onSubClick?: (parent: ArchitectureComponent, subId: string) => void
  size?: 'sm' | 'md' | 'lg'
}

export function ComponentNode({
  component,
  isActive = false,
  isHighlighted = false,
  isCurrentStep = false,
  onClick,
  onHover,
  onSubClick,
  size = 'md'
}: ComponentNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const colors = CATEGORY_COLORS[component.category] || CATEGORY_COLORS.networking
  const subColors = SUB_CATEGORY_COLORS[component.category] || SUB_CATEGORY_COLORS.networking

  const showSolar = isHovered && component.subComponents.length > 0

  const sizeClasses = {
    sm: 'min-w-[5rem] min-h-[5rem] px-2 py-2 text-xs',
    md: 'min-w-[7rem] min-h-[7rem] px-3 py-3 text-sm',
    lg: 'min-w-[9rem] min-h-[9rem] px-4 py-4 text-base',
  }

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    onHover?.(component)
  }, [component, onHover])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    onHover?.(null)
  }, [onHover])

  // // STAGE: node_styling
  const getStateClasses = () => {
    if (isCurrentStep) {
      return `
        bg-yellow-900 border-yellow-400
        ring-2 ring-yellow-400/80
        shadow-lg shadow-yellow-500/40
        scale-110
        animate-pulse
      `
    }
    if (isActive) {
      return `
        ${colors.activeBg} ${colors.activeBorder}
        ring-2 ring-white/80
        shadow-lg shadow-white/20
        scale-105
      `
    }
    if (isHighlighted || isHovered) {
      return `
        ${colors.activeBg} ${colors.activeBorder}
        shadow-md shadow-white/10
        scale-105
      `
    }
    return `${colors.bg} ${colors.border}`
  }

  // Position sub-components in a circle around the parent
  const subCount = component.subComponents.length
  const radius = 70
  const angleStep = (2 * Math.PI) / Math.max(subCount, 1)

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main component button */}
      <button
        onClick={() => onClick(component)}
        className={`
          relative flex flex-col items-center justify-center
          rounded-xl border-2 transition-all duration-200 cursor-pointer
          ${sizeClasses[size]}
          ${getStateClasses()}
        `}
        title={`${component.name} — Click to explore`}
      >
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

      {/* Solar system overlay — sub-components orbiting the parent */}
      {showSolar && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          {/* Orbit ring */}
          <div
            className="absolute border border-gray-700/40 rounded-full pointer-events-none"
            style={{
              width: radius * 2,
              height: radius * 2,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Sub-components */}
          {component.subComponents.map((sub, i) => {
            const angle = angleStep * i - Math.PI / 2
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius

            return (
              <button
                key={sub.id}
                onClick={(e) => {
                  e.stopPropagation()
                  onSubClick?.(component, sub.id)
                }}
                className={`
                  absolute z-50 pointer-events-auto
                  flex flex-col items-center justify-center
                  w-14 h-14 rounded-lg border
                  transition-all duration-200 cursor-pointer
                  hover:scale-110 hover:z-50
                  ${subColors}
                `}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  transitionDelay: `${i * 30}ms`,
                }}
                title={sub.detail.purpose}
              >
                <span className="text-base">{sub.icon}</span>
                <span className="text-[7px] mt-0.5 text-center leading-tight max-w-[3.5rem] truncate">
                  {sub.name}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
