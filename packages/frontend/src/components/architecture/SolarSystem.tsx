// SolarSystem - Hover expansion showing sub-components radiating outward
// Sub-components orbit around the parent component like a solar system

import { useState, useEffect, useRef } from 'react'
import type { ArchitectureComponent } from './data/components'

// // STAGE: solar_system
interface SolarSystemProps {
  component: ArchitectureComponent
  onSubClick: (subId: string) => void
  onDismiss: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  networking: 'text-cyan-400 border-cyan-500 bg-cyan-900/60',
  tpu: 'text-blue-400 border-blue-500 bg-blue-900/60',
  tvu: 'text-purple-400 border-purple-500 bg-purple-900/60',
  runtime: 'text-yellow-400 border-yellow-500 bg-yellow-900/60',
  consensus: 'text-green-400 border-green-500 bg-green-900/60',
  storage: 'text-orange-400 border-orange-500 bg-orange-900/60',
  programs: 'text-pink-400 border-pink-500 bg-pink-900/60',
}

export function SolarSystem({ component, onSubClick, onDismiss }: SolarSystemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const colors = CATEGORY_COLORS[component.category] || CATEGORY_COLORS.networking

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  // Position sub-components in a circle around the parent
  const subCount = component.subComponents.length
  const radius = 100 // px from center
  const angleStep = (2 * Math.PI) / Math.max(subCount, 1)

  return (
    <div
      ref={containerRef}
      className={`
        absolute inset-0 z-40 flex items-center justify-center
        transition-opacity duration-200
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      onMouseLeave={onDismiss}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 rounded-xl" />

      {/* Parent component (center) */}
      <div className={`
        relative z-10 flex flex-col items-center justify-center
        w-20 h-20 rounded-xl border-2 ${colors}
        shadow-lg
      `}>
        <span className="text-2xl">{component.icon}</span>
        <span className="text-[10px] font-semibold mt-1 text-center leading-tight">
          {component.name}
        </span>
      </div>

      {/* Sub-components (orbiting) */}
      {component.subComponents.map((sub, i) => {
        const angle = angleStep * i - Math.PI / 2 // Start from top
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        return (
          <button
            key={sub.id}
            onClick={() => onSubClick(sub.id)}
            className={`
              absolute z-20 flex flex-col items-center justify-center
              w-16 h-16 rounded-lg border
              bg-gray-800 border-gray-600 hover:border-white
              transition-all duration-300 cursor-pointer
              hover:scale-125 hover:z-30
              ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
            `}
            style={{
              transform: `translate(${x}px, ${y}px)`,
              transitionDelay: `${i * 50}ms`,
            }}
            title={sub.detail.purpose}
          >
            <span className="text-lg">{sub.icon}</span>
            <span className="text-[8px] text-gray-300 mt-0.5 text-center leading-tight">
              {sub.name}
            </span>
          </button>
        )
      })}

      {/* Orbit ring (visual) */}
      {subCount > 0 && (
        <div
          className="absolute z-0 border border-gray-700/50 rounded-full"
          style={{
            width: radius * 2,
            height: radius * 2,
          }}
        />
      )}
    </div>
  )
}
