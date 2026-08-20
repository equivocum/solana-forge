// AnnotationFeed - Live feed of educational annotations
// Shows color-coded annotations with type icons and expandable content

import type { Annotation, AnnotationType } from '@shared/types'

// // STAGE: annotation_feed
interface AnnotationFeedProps {
  annotations: Annotation[]
}

const TYPE_COLORS: Record<AnnotationType, string> = {
  STAGE: 'bg-blue-900/50 text-blue-300 border-blue-700',
  WHY: 'bg-green-900/50 text-green-300 border-green-700',
  HOW: 'bg-purple-900/50 text-purple-300 border-purple-700',
  REF: 'bg-amber-900/50 text-amber-300 border-amber-700',
  DECISION: 'bg-pink-900/50 text-pink-300 border-pink-700',
  BYTES: 'bg-orange-900/50 text-orange-300 border-orange-700',
}

const TYPE_ICONS: Record<AnnotationType, string> = {
  STAGE: '🎯',
  WHY: '❓',
  HOW: '⚙️',
  REF: '🔗',
  DECISION: '⚖️',
  BYTES: '🔢',
}

export function AnnotationFeed({ annotations }: AnnotationFeedProps) {
  if (annotations.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
        Start the pipeline to see annotations
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {annotations.map((annotation) => (
        <AnnotationItem key={annotation.id} annotation={annotation} />
      ))}
    </div>
  )
}

// // STAGE: annotation_item
function AnnotationItem({ annotation }: { annotation: Annotation }) {
  const colorClass = TYPE_COLORS[annotation.type] || TYPE_COLORS.STAGE
  const icon = TYPE_ICONS[annotation.type] || '📝'

  return (
    <div className={`rounded-lg border p-3 ${colorClass}`}>
      <div className="flex items-start gap-2">
        <span className="text-sm mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">
              {annotation.type}
            </span>
            <span className="text-[10px] opacity-50">
              {annotation.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm leading-snug">{annotation.content}</p>
          {annotation.sourceRef && (
            <p className="text-[10px] opacity-50 mt-1 font-mono">
              // REF: {annotation.sourceRef}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
