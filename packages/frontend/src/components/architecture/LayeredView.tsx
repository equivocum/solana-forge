// LayeredView - OSI-style stacked layers showing full architecture hierarchy
// Toggle between this and PipelineFlowView

import { ComponentNode } from './ComponentNode'
import type { ArchitectureComponent } from './data/components'
import { LAYERS } from './data/components'

// // STAGE: layered_view
interface LayeredViewProps {
  activeComponent: string | null
  highlightedComponent: string | null
  currentStepId: string | null
  onComponentClick: (component: ArchitectureComponent) => void
  onComponentHover: (component: ArchitectureComponent | null) => void
  onSubClick: (parent: ArchitectureComponent, subId: string) => void
}

const LAYER_CONFIG = [
  { key: 'programs', label: 'Core Programs', icon: '📦', color: 'border-pink-600/50 bg-pink-900/10' },
  { key: 'storage', label: 'Storage Layer', icon: '💾', color: 'border-orange-600/50 bg-orange-900/10' },
  { key: 'consensus', label: 'Consensus Layer', icon: '🤝', color: 'border-green-600/50 bg-green-900/10' },
  { key: 'runtime', label: 'Runtime / Execution', icon: '⚡', color: 'border-yellow-600/50 bg-yellow-900/10' },
  { key: 'tpu', label: 'TPU (Leader Mode)', icon: '🏦', color: 'border-blue-600/50 bg-blue-900/10' },
  { key: 'tvu', label: 'TVU (Validator Mode)', icon: '🔄', color: 'border-purple-600/50 bg-purple-900/10' },
  { key: 'networking', label: 'Networking Layer', icon: '🌐', color: 'border-cyan-600/50 bg-cyan-900/10' },
]

export function LayeredView({
  activeComponent,
  highlightedComponent,
  currentStepId,
  onComponentClick,
  onComponentHover,
  onSubClick,
}: LayeredViewProps) {
  return (
    <div className="space-y-2">
      {/* // STAGE: layered_title */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Layered Architecture</span>
        <span className="text-xs text-gray-500">(Bottom = foundation, Top = application)</span>
      </div>

      {/* // STAGE: layered_stack */}
      <div className="space-y-1">
        {LAYER_CONFIG.map((layer) => {
          const components = LAYERS[layer.key as keyof typeof LAYERS] || []
          if (components.length === 0) return null

          return (
            <div
              key={layer.key}
              className={`rounded-lg border p-3 ${layer.color}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{layer.icon}</span>
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                  {layer.label}
                </span>
                <span className="text-[10px] text-gray-500">
                  ({components.length} components)
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {components.map((comp) => (
                  <ComponentNode
                    key={comp.id}
                    component={comp}
                    isActive={activeComponent === comp.id}
                    isHighlighted={highlightedComponent === comp.id}
                    isCurrentStep={currentStepId === comp.id}
                    onClick={onComponentClick}
                    onHover={onComponentHover}
                    onSubClick={onSubClick}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* // STAGE: layered_connections */}
      <div className="mt-4 bg-gray-800/30 rounded-lg p-3">
        <h4 className="text-xs font-semibold text-gray-400 mb-2">Data Flow Direction</h4>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span className="px-2 py-1 bg-cyan-900/30 rounded">Networking</span>
          <span>↓</span>
          <span className="px-2 py-1 bg-blue-900/30 rounded">TPU/TVU</span>
          <span>↓</span>
          <span className="px-2 py-1 bg-yellow-900/30 rounded">Runtime</span>
          <span>↓</span>
          <span className="px-2 py-1 bg-green-900/30 rounded">Consensus</span>
          <span>↓</span>
          <span className="px-2 py-1 bg-orange-900/30 rounded">Storage</span>
        </div>
      </div>
    </div>
  )
}
