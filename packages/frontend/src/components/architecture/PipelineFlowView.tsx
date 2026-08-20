// PipelineFlowView - TPU (top) and TVU (bottom) horizontal pipelines
// Shows the dual-pipeline architecture with shared layers connecting them

import { ComponentNode } from './ComponentNode'
import type { ArchitectureComponent } from './data/components'
import { TPU_PIPELINE, TVU_PIPELINE, SHARED_COMPONENTS } from './data/components'

// // STAGE: pipeline_flow_view
interface PipelineFlowViewProps {
  activeComponent: string | null
  highlightedComponent: string | null
  currentStepId: string | null
  onComponentClick: (component: ArchitectureComponent) => void
  onComponentHover: (component: ArchitectureComponent | null) => void
  onSubClick: (parent: ArchitectureComponent, subId: string) => void
  txPath: string[]
  txPosition: number
}

export function PipelineFlowView({
  activeComponent,
  highlightedComponent,
  currentStepId,
  onComponentClick,
  onComponentHover,
  onSubClick,
  txPath,
  txPosition,
}: PipelineFlowViewProps) {
  return (
    <div className="space-y-4">
      {/* TPU Pipeline */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-900/30 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-sm font-bold text-blue-400 uppercase tracking-wide">TPU Pipeline</span>
          <span className="text-xs text-gray-500">(Leader Mode — Block Production)</span>
          <span className="text-[10px] text-gray-600 ml-auto">6 stages</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap pb-2">
          {TPU_PIPELINE.map((comp, i) => {
            const isCurrentStepComp = currentStepId === comp.id
            const isVisited = txPath.indexOf(comp.id) < txPosition && txPath.indexOf(comp.id) >= 0

            return (
              <div key={comp.id} className="flex items-center gap-1">
                <ComponentNode
                  component={comp}
                  isActive={activeComponent === comp.id}
                  isHighlighted={highlightedComponent === comp.id}
                  isCurrentStep={isCurrentStepComp}
                  onClick={onComponentClick}
                  onHover={onComponentHover}
                  onSubClick={onSubClick}
                  size="md"
                />
                {i < TPU_PIPELINE.length - 1 && (
                  <FlowArrow isActive={isCurrentStepComp} isVisited={isVisited} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Shared Layers */}
      <div className="grid grid-cols-4 gap-3">
        <SharedLayer
          title="Networking"
          icon="🌐"
          color="cyan"
          components={SHARED_COMPONENTS.filter(c => c.layer === 'networking')}
          activeComponent={activeComponent}
          highlightedComponent={highlightedComponent}
          currentStepId={currentStepId}
          onComponentClick={onComponentClick}
          onComponentHover={onComponentHover}
          onSubClick={onSubClick}
        />
        <SharedLayer
          title="Runtime"
          icon="⚡"
          color="yellow"
          components={SHARED_COMPONENTS.filter(c => c.layer === 'runtime')}
          activeComponent={activeComponent}
          highlightedComponent={highlightedComponent}
          currentStepId={currentStepId}
          onComponentClick={onComponentClick}
          onComponentHover={onComponentHover}
          onSubClick={onSubClick}
        />
        <SharedLayer
          title="Consensus"
          icon="🤝"
          color="green"
          components={SHARED_COMPONENTS.filter(c => c.layer === 'consensus')}
          activeComponent={activeComponent}
          highlightedComponent={highlightedComponent}
          currentStepId={currentStepId}
          onComponentClick={onComponentClick}
          onComponentHover={onComponentHover}
          onSubClick={onSubClick}
        />
        <SharedLayer
          title="Storage"
          icon="💾"
          color="orange"
          components={SHARED_COMPONENTS.filter(c => c.layer === 'storage')}
          activeComponent={activeComponent}
          highlightedComponent={highlightedComponent}
          currentStepId={currentStepId}
          onComponentClick={onComponentClick}
          onComponentHover={onComponentHover}
          onSubClick={onSubClick}
        />
      </div>

      {/* TVU Pipeline */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-900/30 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-purple-500 rounded-full" />
          <span className="text-sm font-bold text-purple-400 uppercase tracking-wide">TVU Pipeline</span>
          <span className="text-xs text-gray-500">(Validator Mode — Block Verification)</span>
          <span className="text-[10px] text-gray-600 ml-auto">5 stages</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap pb-2">
          {TVU_PIPELINE.map((comp, i) => {
            const isCurrentStepComp = currentStepId === comp.id
            const isVisited = txPath.indexOf(comp.id) < txPosition && txPath.indexOf(comp.id) >= 0

            return (
              <div key={comp.id} className="flex items-center gap-1">
                <ComponentNode
                  component={comp}
                  isActive={activeComponent === comp.id}
                  isHighlighted={highlightedComponent === comp.id}
                  isCurrentStep={isCurrentStepComp}
                  onClick={onComponentClick}
                  onHover={onComponentHover}
                  onSubClick={onSubClick}
                  size="md"
                />
                {i < TVU_PIPELINE.length - 1 && (
                  <FlowArrow isActive={isCurrentStepComp} isVisited={isVisited} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Core Programs */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-pink-900/30 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-pink-500 rounded-full" />
          <span className="text-sm font-bold text-pink-400 uppercase tracking-wide">Core Programs</span>
          <span className="text-xs text-gray-500">(Compiled into validator binary)</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {SHARED_COMPONENTS.filter(c => c.layer === 'programs').map((comp) => (
            <ComponentNode
              key={comp.id}
              component={comp}
              isActive={activeComponent === comp.id}
              isHighlighted={highlightedComponent === comp.id}
              isCurrentStep={currentStepId === comp.id}
              onClick={onComponentClick}
              onHover={onComponentHover}
              onSubClick={onSubClick}
              size="md"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// // STAGE: flow_arrow
function FlowArrow({ isActive, isVisited }: { isActive: boolean; isVisited: boolean }) {
  return (
    <div className={`
      flex items-center justify-center w-8 h-8 rounded-full
      transition-all duration-300
      ${isActive ? 'bg-yellow-500 text-black scale-125 shadow-lg shadow-yellow-500/50' : ''}
      ${isVisited ? 'bg-green-600 text-white' : ''}
      ${!isActive && !isVisited ? 'bg-gray-800 text-gray-600' : ''}
    `}>
      <span className="text-lg">→</span>
    </div>
  )
}

// // STAGE: shared_layer
function SharedLayer({
  title,
  icon,
  color,
  components,
  activeComponent,
  highlightedComponent,
  currentStepId,
  onComponentClick,
  onComponentHover,
  onSubClick,
}: {
  title: string
  icon: string
  color: string
  components: ArchitectureComponent[]
  activeComponent: string | null
  highlightedComponent: string | null
  currentStepId: string | null
  onComponentClick: (component: ArchitectureComponent) => void
  onComponentHover: (component: ArchitectureComponent | null) => void
  onSubClick: (parent: ArchitectureComponent, subId: string) => void
}) {
  const borderColors: Record<string, string> = {
    cyan: 'border-cyan-900/30',
    yellow: 'border-yellow-900/30',
    green: 'border-green-900/30',
    orange: 'border-orange-900/30',
  }

  return (
    <div className={`bg-gray-800/30 rounded-lg p-3 border ${borderColors[color] || 'border-gray-700/30'}`}>
      <div className="flex items-center gap-1 mb-3">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-semibold text-gray-400 uppercase">{title}</span>
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
}
