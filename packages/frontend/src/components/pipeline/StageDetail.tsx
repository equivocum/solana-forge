// StageDetail - Detailed explanation of the current pipeline stage
// Shows Solana component, manufacturing metaphor, and full technical description

import type { PipelineStageInfo } from './PipelineView'

// // STAGE: stage_detail
interface StageDetailProps {
  stage: PipelineStageInfo
}

export function StageDetail({ stage }: StageDetailProps) {
  // // STAGE: stage_detail_render
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{stage.icon}</span>
        <div>
          <h3 className="text-lg font-bold text-white">{stage.label}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">
              {stage.solanaComponent}
            </span>
            <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded">
              {stage.metaphor}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-900 rounded-lg p-4">
        <p className="text-sm text-gray-300 leading-relaxed">
          {stage.description}
        </p>
      </div>

      {/* Full technical detail */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          How It Works
        </h4>
        <p className="text-sm text-gray-300 leading-relaxed">
          {stage.detail}
        </p>
      </div>

      {/* // STAGE: stage_detail_mapping */}
      {/* Manufacturing metaphor mapping */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Manufacturing Analogy
        </h4>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-yellow-400">📦</span>
          <span className="text-gray-400">→</span>
          <span className="text-white">Raw material enters the production line</span>
        </div>
      </div>
    </div>
  )
}
