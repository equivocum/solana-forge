import type { AnnotationType } from '@/types'

export const ANNOTATION_COLORS: Record<AnnotationType, string> = {
  STAGE: 'bg-blue-900/50 text-blue-300 border-blue-700',
  WHY: 'bg-green-900/50 text-green-300 border-green-700',
  HOW: 'bg-purple-900/50 text-purple-300 border-purple-700',
  REF: 'bg-amber-900/50 text-amber-300 border-amber-700',
  DECISION: 'bg-pink-900/50 text-pink-300 border-pink-700',
  BYTES: 'bg-orange-900/50 text-orange-300 border-orange-700',
}

export const ANNOTATION_ICONS: Record<AnnotationType, string> = {
  STAGE: '🎯',
  WHY: '❓',
  HOW: '⚙️',
  REF: '🔗',
  DECISION: '⚖️',
  BYTES: '🔢',
}
