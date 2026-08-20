// SolarSystem - Inline expansion showing sub-components as a row below parent
// Appears on hover, dismisses when mouse leaves

import { useState, useEffect } from 'react'
import type { ArchitectureComponent } from './data/components'

// // STAGE: solar_system
interface SolarSystemProps {
  component: ArchitectureComponent
  onSubClick: (subId: string) => void
  onDismiss: () => void
}

export function SolarSystem({ component, onSubClick, onDismiss }: SolarSystemProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  return (
    <div
      className={`
        w-full py-2 px-4
        transition-all duration-200
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
      onMouseLeave={onDismiss}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-gray-500 uppercase tracking-wide mr-1">
          {component.name} →
        </span>
        {component.subComponents.map((sub, i) => (
          <button
            key={sub.id}
            onClick={() => onSubClick(sub.id)}
            className={`
              flex items-center gap-1.5 px-2 py-1 rounded-md border
              bg-gray-800/80 border-gray-600 hover:border-white
              transition-all duration-200 cursor-pointer
              hover:scale-105 hover:bg-gray-700/80
              ${isVisible ? 'opacity-100' : 'opacity-0'}
            `}
            style={{ transitionDelay: `${i * 30}ms` }}
            title={sub.detail.purpose}
          >
            <span className="text-sm">{sub.icon}</span>
            <span className="text-[10px] text-gray-300">{sub.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
