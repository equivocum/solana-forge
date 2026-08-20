// AnnotationFeed - Live feed of educational annotations
// Shows color-coded annotations with type icons and expandable content

import type { Annotation } from '@/types'
import { ANNOTATION_COLORS, ANNOTATION_ICONS } from '../../services/annotationTheme'

// // STAGE: annotation_feed
interface AnnotationFeedProps {
  annotations: Annotation[]
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
  const colorClass = ANNOTATION_COLORS[annotation.type] || ANNOTATION_COLORS.STAGE
  const icon = ANNOTATION_ICONS[annotation.type] || '📝'

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
