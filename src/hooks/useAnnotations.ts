// useAnnotations Hook - React hook for annotation management
// // STAGE: annotations_hook

import { useState, useCallback } from 'react'
import type { Annotation, AnnotationType } from '@/types'
import { createAnnotationService } from '../services/annotations'
import { createExecutionLogService } from '../services/executionLog'

interface UseAnnotationsReturn {
  annotations: Annotation[]
  addAnnotation: (type: AnnotationType, content: string, sourceRef: string) => Annotation
  clearAnnotations: () => void
  getAnnotationsByType: (type: AnnotationType) => Annotation[]
  formatAnnotation: (annotation: Annotation) => string
  getColorForType: (type: AnnotationType) => string
}

export function useAnnotations(): UseAnnotationsReturn {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const service = createAnnotationService()
  const executionLog = createExecutionLogService()

  const addAnnotation = useCallback(
    (type: AnnotationType, content: string, sourceRef: string): Annotation => {
      const annotation = service.createAnnotation(type, content, sourceRef)
      setAnnotations(prev => [...prev, annotation])
      executionLog.logAnnotation(annotation).catch(() => {})
      return annotation
    },
    [service, executionLog]
  )

  const clearAnnotations = useCallback(() => {
    setAnnotations([])
  }, [])

  const getAnnotationsByType = useCallback(
    (type: AnnotationType): Annotation[] => {
      return annotations.filter(a => a.type === type)
    },
    [annotations]
  )

  const formatAnnotation = useCallback(
    (annotation: Annotation): string => {
      return service.formatAnnotation(annotation)
    },
    [service]
  )

  const getColorForType = useCallback(
    (type: AnnotationType): string => {
      return service.getColorForType(type)
    },
    [service]
  )

  return {
    annotations,
    addAnnotation,
    clearAnnotations,
    getAnnotationsByType,
    formatAnnotation,
    getColorForType
  }
}
