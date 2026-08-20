// MermaidDiagram - Shared component for rendering Mermaid.js SVG diagrams with tooltips
// // STAGE: mermaid_diagram

import { useEffect, useRef, useState, useCallback } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose'
})

interface MermaidDiagramProps {
  definition: string
  title?: string
  className?: string
  tooltips?: Record<string, string>
}

let mermaidCounter = 0

export function MermaidDiagram({ definition, title, className = '', tooltips }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const idRef = useRef(`mermaid-${++mermaidCounter}`)

  useEffect(() => {
    let cancelled = false

    const render = async () => {
      try {
        const { svg: renderedSvg } = await mermaid.render(idRef.current, definition)
        if (!cancelled) {
          setSvg(renderedSvg)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Diagram render failed')
          setSvg('')
        }
      }
    }

    render()

    return () => {
      cancelled = true
    }
  }, [definition])

  // Attach tooltip handlers to SVG nodes
  useEffect(() => {
    if (!containerRef.current || !tooltips) return

    const svgEl = containerRef.current.querySelector('svg')
    if (!svgEl) return

    const nodes = svgEl.querySelectorAll('.node, .edgePath, .edgeLabel')
    const cleanups: (() => void)[] = []

    nodes.forEach(node => {
      const titleEl = node.querySelector('title')
      const nodeText = titleEl?.textContent || ''

      // Find matching tooltip
      const tooltipEntry = Object.entries(tooltips).find(([key]) =>
        nodeText.toLowerCase().includes(key.toLowerCase())
      )

      if (tooltipEntry) {
        const handleMouseEnter = (e: Event) => {
          const rect = (e.target as Element).getBoundingClientRect()
          const containerRect = containerRef.current!.getBoundingClientRect()
          setTooltip({
            text: tooltipEntry[1],
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top - 8
          })
        }

        const handleMouseLeave = () => setTooltip(null)

        node.addEventListener('mouseenter', handleMouseEnter)
        node.addEventListener('mouseleave', handleMouseLeave)
        cleanups.push(() => {
          node.removeEventListener('mouseenter', handleMouseEnter)
          node.removeEventListener('mouseleave', handleMouseLeave)
        })
      }
    })

    return () => cleanups.forEach(fn => fn())
  }, [svg, tooltips])

  return (
    <div className={`p-4 bg-gray-800 rounded-lg ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="bg-white rounded p-4 overflow-auto relative">
        {error ? (
          <pre className="text-sm text-red-800 whitespace-pre-wrap">{error}</pre>
        ) : svg ? (
          <div
            ref={containerRef}
            className="mermaid-diagram"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="text-gray-400 text-sm">Loading diagram...</div>
        )}

        {/* Tooltip overlay */}
        {tooltip && (
          <div
            className="absolute z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg pointer-events-none max-w-xs"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  )
}
