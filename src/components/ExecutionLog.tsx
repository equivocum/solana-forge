// ExecutionLog Component - Sequential execution steps with expandable annotations
// // STAGE: execution_log

import type { Annotation } from '@/types'

interface ExecutionStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'completed' | 'error'
  timestamp?: Date
  annotationIds?: string[]
}

interface ExecutionLogProps {
  steps: ExecutionStep[]
  annotations: Annotation[]
}

export function ExecutionLog({ steps, annotations }: ExecutionLogProps) {
  if (steps.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>No execution steps yet.</p>
      </div>
    )
  }

  const getStepColor = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-900/30'
      case 'active': return 'border-blue-500 bg-blue-900/30'
      case 'error': return 'border-red-500 bg-red-900/30'
      default: return 'border-gray-600 bg-gray-800'
    }
  }

  const getStatusIcon = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'completed': return '✓'
      case 'active': return '▶'
      case 'error': return '✗'
      default: return '○'
    }
  }

  return (
    <div className="h-full overflow-auto">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-600" />
        
        <div className="space-y-4">
          {steps.map((step) => {
            const stepAnnotations = annotations.filter(
              a => step.annotationIds?.includes(a.id)
            )
            
            return (
              <div key={step.id} className="relative pl-10">
                {/* Status indicator */}
                <div className={`absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${getStepColor(step.status)}`}>
                  {getStatusIcon(step.status)}
                </div>
                
                {/* Step content */}
                <div className={`p-3 rounded-lg border ${getStepColor(step.status)}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{step.label}</span>
                    {step.timestamp && (
                      <span className="text-xs text-gray-400">
                        {step.timestamp.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Annotations for this step */}
                  {stepAnnotations.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {stepAnnotations.map(annotation => (
                        <div key={annotation.id} className="text-sm text-gray-300">
                          // {annotation.type}: {annotation.content}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
