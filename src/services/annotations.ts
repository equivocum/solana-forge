// Annotation Service - Educational annotation management
// // STAGE: annotation_service

import type { Annotation, AnnotationType } from '@/types'

export interface AnnotationService {
  createAnnotation(
    type: AnnotationType,
    content: string,
    sourceRef: string,
    gateId: number
  ): Annotation
  
  addAnnotation(
    type: AnnotationType,
    content: string,
    sourceRef: string,
    gateId: number
  ): Annotation
  
  formatAnnotation(annotation: Annotation): string
  
  getColorForType(type: AnnotationType): string
  
  getIconForType(type: AnnotationType): string
}

export function createAnnotationService(): AnnotationService {
  const typeColors: Record<AnnotationType, string> = {
    STAGE: '#3B82F6',    // Blue
    WHY: '#10B981',      // Green
    HOW: '#8B5CF6',      // Purple
    REF: '#F59E0B',      // Amber
    DECISION: '#EC4899', // Pink
    BYTES: '#F97316'     // Orange
  }

  const typeIcons: Record<AnnotationType, string> = {
    STAGE: '🎯',
    WHY: '❓',
    HOW: '⚙️',
    REF: '🔗',
    DECISION: '⚖️',
    BYTES: '🔢'
  }

  return {
    createAnnotation(
      type: AnnotationType,
      content: string,
      sourceRef: string,
      gateId: number
    ): Annotation {
      return {
        id: crypto.randomUUID(),
        type,
        content,
        sourceRef,
        timestamp: new Date(),
        gateId
      }
    },

    addAnnotation(
      type: AnnotationType,
      content: string,
      sourceRef: string,
      gateId: number
    ): Annotation {
      return this.createAnnotation(type, content, sourceRef, gateId)
    },

    formatAnnotation(annotation: Annotation): string {
      const icon = typeIcons[annotation.type]
      return `${icon} // ${annotation.type}: ${annotation.content}`
    },

    getColorForType(type: AnnotationType): string {
      return typeColors[type]
    },

    getIconForType(type: AnnotationType): string {
      return typeIcons[type]
    }
  }
}
