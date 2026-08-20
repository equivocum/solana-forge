// useAnnotations Hook - React hook for annotation management
// // STAGE: annotations_hook

import { useState, useCallback, useEffect } from 'react'
import type { Annotation, AnnotationType } from '@shared/types'
import { createAnnotationService } from '../services/annotations'
import { createExecutionLogService } from '../services/executionLog'

interface UseAnnotationsReturn {
  annotations: Annotation[]
  addAnnotation: (type: AnnotationType, content: string, sourceRef: string, gateId: number) => Annotation
  clearAnnotations: () => void
  getAnnotationsByGate: (gateId: number) => Annotation[]
  getAnnotationsByType: (type: AnnotationType) => Annotation[]
  formatAnnotation: (annotation: Annotation) => string
  getColorForType: (type: AnnotationType) => string
}

export function useAnnotations(): UseAnnotationsReturn {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const service = createAnnotationService()
  const executionLog = createExecutionLogService()

  const addAnnotation = useCallback(
    (type: AnnotationType, content: string, sourceRef: string, gateId: number): Annotation => {
      const annotation = service.createAnnotation(type, content, sourceRef, gateId)
      setAnnotations(prev => [...prev, annotation])
      // Write to execution log asynchronously (fire-and-forget)
      executionLog.logAnnotation(gateId, annotation).catch(() => {})
      return annotation
    },
    [service, executionLog]
  )

  const clearAnnotations = useCallback(() => {
    setAnnotations([])
  }, [])

  const getAnnotationsByGate = useCallback(
    (gateId: number): Annotation[] => {
      return annotations.filter(a => a.gateId === gateId)
    },
    [annotations]
  )

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
    getAnnotationsByGate,
    getAnnotationsByType,
    formatAnnotation,
    getColorForType
  }
}
