// ParticleMapView.tsx - React shell for particle map view
// STAGE: particle_view
// WHY: Owns selection/hover state, mounts canvas + ZoomPanel, connects to D3 simulation
// HOW: Renders container for D3 simulation and delegates interactions to parent handlers

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useForceSimulation } from './useForceSimulation'
import { buildParticleGraph } from './useParticleGraph'
import { readMotionPreference } from './motionPreferences'
import { useTourState } from './useTourState'
import { CATEGORY_HEX } from '../../../services/componentTheme'
import { ZoomPanel } from '../ZoomPanel'
import { ConnectionPopover } from './ConnectionPopover'
import type { ArchitectureComponent } from '../data/components'
import type { ParticleLink } from './useParticleGraph'

// Import responsive styles
import '../../../styles/particle-map.css'

// ─────────────────────────────────────────────────────────────────────────────
// ParticleMapViewProps - Matches existing view contract (6 props)
// ─────────────────────────────────────────────────────────────────────────────
export interface ParticleMapViewProps {
  components: ArchitectureComponent[]
  activeComponent: string | null
  highlightedComponent: string | null
  currentStepId: string | null
  onComponentClick: (_component: ArchitectureComponent) => void
  onComponentHover: (_component: ArchitectureComponent | null) => void
  onSubClick: (_parent: ArchitectureComponent, _subId: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// ParticleMapView - Main component
// ─────────────────────────────────────────────────────────────────────────────
export function ParticleMapView({
  components,
  activeComponent,
  highlightedComponent,
  currentStepId,
  onComponentClick,
  onComponentHover,
  onSubClick,
}: ParticleMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedComponent, setSelectedComponent] = useState<ArchitectureComponent | null>(null)
  const [zoomedSubId, setZoomedSubId] = useState<string | null>(null)
  const [popoverLink, setPopoverLink] = useState<ParticleLink | null>(null)
  const [popoverAnchor, setPopoverAnchor] = useState<{ x: number; y: number } | null>(null)

  // Memoize graph data — only rebuild when components change
  const graph = useMemo(() => buildParticleGraph(components), [components])

  // Motion profile (static — read once)
  const motion = useMemo(() => readMotionPreference({ matches: false } as MediaQueryList), [])

  // Force-graph controller ref
  const controllerRef = useRef<{ current: any }>({ current: null })

  // Tour state management
  const [tourHighlight, setTourHighlight] = useState<string | null>(null)
  useTourState({
    currentStepId,
    onHighlight: setTourHighlight,
    onFocus: (componentId, _subId) => {
      controllerRef.current.current?.focusComponent(componentId, motion)
    },
    motion,
  })

  // Memoize callbacks to avoid unnecessary re-init
  const handleNodeClick = useCallback((refId: string, kind: 'component' | 'sub') => {
    if (kind === 'component') {
      const comp = components.find(c => c.id === refId)
      if (comp) {
        setSelectedComponent(comp)
        onComponentClick(comp)
      }
    } else {
      const [parentId, subId] = refId.split('/')
      const parent = components.find(c => c.id === parentId)
      if (parent && subId) {
        setSelectedComponent(parent)
        setZoomedSubId(subId)
        onSubClick(parent, subId)
      }
    }
  }, [components, onComponentClick, onSubClick])

  const handleNodeHover = useCallback((refId: string | null, kind?: 'component' | 'sub') => {
    if (kind === 'component') {
      const comp = components.find(c => c.id === refId)
      onComponentHover(comp || null)
    } else {
      onComponentHover(null)
    }
  }, [components, onComponentHover])

  const handleLinkClick = useCallback((link: ParticleLink, event?: MouseEvent) => {
    const anchor = event
      ? { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY }
      : { x: 0, y: 0 }
    setPopoverLink(link)
    setPopoverAnchor(anchor)
  }, [])

  const handleLinkHover = useCallback(() => {}, [])

  // D3 simulation instance
  const simulationRef = useForceSimulation(containerRef, {
    graph,
    theme: CATEGORY_HEX,
    motion,
    highlightId: tourHighlight || highlightedComponent || activeComponent,
    onNodeClick: handleNodeClick,
    onNodeHover: handleNodeHover,
    onLinkClick: handleLinkClick,
    onLinkHover: handleLinkHover,
  })

  // Sync controller ref
  useEffect(() => {
    controllerRef.current = simulationRef
  }, [simulationRef])

  const handleZoomClose = useCallback(() => {
    setSelectedComponent(null)
    setZoomedSubId(null)
  }, [])

  return (
    <div className="h-full flex flex-col particle-map-container">
      {/* Canvas container — D3 simulation renders here */}
      <div
        ref={containerRef}
        className="particle-map-canvas flex-1 bg-gray-900 rounded-lg"
        style={{ minHeight: 0 }}
      />

      {/* Zoom panel overlay */}
      {selectedComponent && (
        <ZoomPanel
          component={selectedComponent}
          initialSubId={zoomedSubId}
          onClose={handleZoomClose}
        />
      )}

      {/* Connection explanation popover */}
      {popoverLink && popoverAnchor && (
        <ConnectionPopover
          link={popoverLink}
          fromComponent={components.find(c => c.id === popoverLink.source) || components[0]}
          toComponent={components.find(c => c.id === popoverLink.target) || components[0]}
          anchor={popoverAnchor}
          onClose={() => {
            setPopoverLink(null)
            setPopoverAnchor(null)
          }}
        />
      )}
    </div>
  )
}
