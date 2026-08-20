// PipelineStage - Individual stage node in the pipeline
// Shows icon, label, status with visual feedback for completed/active/pending states

import type { PipelineStageInfo } from './PipelineView'

// // STAGE: pipeline_stage_component
interface PipelineStageProps {
  stage: PipelineStageInfo
  isCompleted: boolean
  isActive: boolean
  isPending: boolean
  onClick: () => void
}

export function PipelineStage({
  stage,
  isCompleted,
  isActive,
  isPending,
  onClick
}: PipelineStageProps) {
  // // STAGE: pipeline_stage_styling
  const getStageStyles = () => {
    if (isCompleted) {
      return 'bg-green-900/50 border-green-500 shadow-lg shadow-green-500/20'
    }
    if (isActive) {
      return 'bg-blue-900/50 border-blue-500 shadow-lg shadow-blue-500/30 animate-pulse'
    }
    return 'bg-gray-800 border-gray-600 hover:border-gray-500'
  }

  const getIconStyles = () => {
    if (isCompleted) return 'text-green-400'
    if (isActive) return 'text-blue-400'
    void isPending // used for styling logic
    return 'text-gray-500'
  }

  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center
        w-16 h-16 rounded-xl border-2
        transition-all duration-300 cursor-pointer
        ${getStageStyles()}
      `}
      title={`${stage.label} — ${stage.solanaComponent}`}
    >
      {/* // STAGE: pipeline_stage_icon */}
      <span className={`text-2xl ${getIconStyles()}`}>
        {stage.icon}
      </span>

      {/* // STAGE: pipeline_stage_status */}
      {/* Status indicator */}
      {isCompleted && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-[8px]">✓</span>
        </div>
      )}
      {isActive && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
        </div>
      )}

      {/* // STAGE: pipeline_stage_tooltip */}
      {/* Hover tooltip */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
          {stage.solanaComponent}
        </div>
      </div>
    </button>
  )
}
