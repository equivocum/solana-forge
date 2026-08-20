// AnnotationPanel Component - Live annotation feed with clickable cross-references
// // STAGE: annotation_panel

import { useState } from 'react'
import type { Annotation } from '@shared/types'

interface AnnotationPanelProps {
  annotations: Annotation[]
  onAnnotationClick: (annotation: Annotation) => void
}

const typeColors: Record<string, string> = {
  STAGE: 'bg-blue-600',
  WHY: 'bg-green-600',
  HOW: 'bg-purple-600',
  REF: 'bg-amber-600',
  DECISION: 'bg-pink-600',
  BYTES: 'bg-orange-600'
}

export function AnnotationPanel({ annotations, onAnnotationClick }: AnnotationPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (annotations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>No annotations yet. Start a simulation to see annotations.</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto space-y-2">
      {annotations.map(annotation => {
        const isExpanded = expandedId === annotation.id
        const isRef = annotation.type === 'REF'

        return (
          <div key={annotation.id}>
            <button
              onClick={() => {
                onAnnotationClick(annotation)
                if (isRef) {
                  setExpandedId(isExpanded ? null : annotation.id)
                }
              }}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                isExpanded ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${typeColors[annotation.type]}`}>
                  {annotation.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{annotation.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {isRef ? (
                      <span className="text-xs text-amber-400 underline cursor-pointer">
                        {annotation.sourceRef}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">{annotation.sourceRef}</span>
                    )}
                    <span className="text-xs text-gray-500">
                      Gate {annotation.gateId}
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded cross-reference details */}
            {isExpanded && (
              <div className="mt-1 p-3 bg-gray-600 rounded-lg border-l-2 border-amber-500">
                <p className="text-xs text-gray-300 mb-1">Source Reference:</p>
                <code className="text-xs text-amber-400 font-mono">{annotation.sourceRef}</code>
                <p className="text-xs text-gray-400 mt-2">{annotation.content}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
