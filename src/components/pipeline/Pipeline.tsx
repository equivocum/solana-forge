// Pipeline - Horizontal visualization of all Solana transaction stages
// Shows stages as connected nodes with a transaction bubble moving through them

import { PipelineStage } from './PipelineStage'
import type { PipelineStageId, PipelineStageInfo } from './PipelineView'

// // STAGE: pipeline_component
interface PipelineProps {
  stages: PipelineStageInfo[]
  activeStage: PipelineStageId
  completedStages: PipelineStageId[]
  txPosition: number
  onStageClick: (stageId: PipelineStageId) => void
}

export function Pipeline({
  stages,
  activeStage,
  completedStages,
  txPosition,
  onStageClick
}: PipelineProps) {
  return (
    <div className="relative">
      {/* // STAGE: pipeline_track */}
      {/* Connection line behind stages */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 -translate-y-1/2 z-0" />

      {/* Progress line */}
      <div
        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 -translate-y-1/2 z-0 transition-all duration-500"
        style={{ width: `${(txPosition / (stages.length - 1)) * 100}%` }}
      />

      {/* // STAGE: pipeline_stages_row */}
      {/* Stage nodes */}
      <div className="relative z-10 flex justify-between items-center">
        {stages.map((stage) => {
          const isCompleted = completedStages.includes(stage.id)
          const isActive = stage.id === activeStage
          const isPending = !isCompleted && !isActive

          return (
            <div key={stage.id} className="flex items-center">
              <PipelineStage
                stage={stage}
                isCompleted={isCompleted}
                isActive={isActive}
                isPending={isPending}
                onClick={() => onStageClick(stage.id)}
              />
            </div>
          )
        })}
      </div>

      {/* // STAGE: pipeline_labels */}
      {/* Stage labels below */}
      <div className="relative z-10 flex justify-between items-start mt-3">
        {stages.map((stage) => {
          const isCompleted = completedStages.includes(stage.id)
          const isActive = stage.id === activeStage

          return (
            <div key={stage.id} className="text-center w-20">
              <p className={`text-xs font-medium ${isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                {stage.label}
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                {stage.metaphor}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
