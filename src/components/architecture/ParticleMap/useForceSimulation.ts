// useForceSimulation.ts - Raw D3 force simulation + canvas render loop
// STAGE: particle_canvas_wrapper
// WHY: Replaces force-graph library with direct D3 + Canvas for full rendering control
// HOW: React hook that owns canvas element, render loop, zoom/hit detection

import { useRef, useEffect, useState, useMemo } from 'react'
import { forceSimulation, forceLink, forceCenter, forceCollide, forceManyBody } from 'd3-force'
import { zoom, zoomIdentity } from 'd3-zoom'
import type { ZoomTransform } from 'd3-zoom'
import { quadtree } from 'd3-quadtree'
import { select } from 'd3-selection'
import type { GraphData, ParticleLink, ParticleNode } from './useParticleGraph'
import type { MotionProfile } from './motionPreferences'
import { drawBubble } from './painting/bubblePainter'
import { scaleByMotion } from './painting/spineParticles'
import { createClusterForce } from './forces/clusterForces'
import { createZoneForce, createAmbientDriftForce } from './forces/zoneForces'

// ─────────────────────────────────────────────────────────────────────────────
// ForceGraphController - Public API for controlling the simulation
// ─────────────────────────────────────────────────────────────────────────────
export interface ForceGraphController {
  setData(_graph: GraphData): void
  focusComponent(id: string, _motion: MotionProfile): void
  resetView(_motion: MotionProfile): void
  setHover(_id: string | null): void
  destroy(): void
}

// ─────────────────────────────────────────────────────────────────────────────
// ComponentThemeHex - Hex color tokens for canvas painting
// ─────────────────────────────────────────────────────────────────────────────
export interface ComponentThemeHex {
  [category: string]: { fill: string; glow: string; label: string }
}

// ─────────────────────────────────────────────────────────────────────────────
// SpineParticle - Animated particle along a spine link
// ─────────────────────────────────────────────────────────────────────────────
interface SpineParticle {
  linkIndex: number
  progress: number  // 0-1 along the link
  speed: number
}

// ─────────────────────────────────────────────────────────────────────────────
// useForceSimulation - React hook for raw D3 + Canvas
// ─────────────────────────────────────────────────────────────────────────────
export function useForceSimulation(
  containerRef: { current: HTMLElement | null },
  opts: {
    graph: GraphData
    theme: ComponentThemeHex
    motion: MotionProfile
    highlightId: string | null
    onNodeClick: (_refId: string, _kind: 'component' | 'sub') => void
    onNodeHover: (_refId: string | null, _kind?: 'component' | 'sub') => void
    onLinkClick: (_link: ParticleLink, _event?: MouseEvent) => void
    onLinkHover: (_link: ParticleLink | null) => void
  }
): { current: ForceGraphController | null } {
  const controllerRef = useRef<ForceGraphController | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const simulationRef = useRef<ReturnType<typeof forceSimulation<ParticleNode, ParticleLink>> | null>(null)
  const zoomRef = useRef<ReturnType<typeof zoom<HTMLCanvasElement, unknown>> | null>(null)
  const transformRef = useRef<ZoomTransform>(zoomIdentity)
  const animationFrameRef = useRef<number>(0)
  const spineParticlesRef = useRef<SpineParticle[]>([])

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)

  // Refs for values read inside the canvas paint callbacks (avoid stale closures)
  const optsRef = useRef(opts)
  const hoveredNodeIdRef = useRef<string | null>(null)
  const activeNodeIdRef = useRef<string | null>(null)
  const neighborIdsRef = useRef<Set<string>>(new Set())

  // Sync refs from render values
  useEffect(() => {
    optsRef.current = opts
    hoveredNodeIdRef.current = hoveredNodeId
    activeNodeIdRef.current = activeNodeId
  })

  // Compute neighbor IDs of the currently hovered node
  const neighborIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>()
    const neighbors = new Set<string>()
    for (const link of opts.graph.links) {
      if (link.source === hoveredNodeId) neighbors.add(link.target)
      if (link.target === hoveredNodeId) neighbors.add(link.source)
    }
    return neighbors
  }, [hoveredNodeId, opts.graph.links])

  // Keep neighborIdsRef in sync
  useEffect(() => {
    neighborIdsRef.current = neighborIds
  }, [neighborIds])

  // Initialize D3 simulation ONCE — all changing values read from refs
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let destroyed = false
    let resizeObserver: ResizeObserver | null = null

    // Create canvas element
    const canvas = document.createElement('canvas')
    canvas.className = 'particle-map-canvas'
    canvas.style.display = 'block'
    canvas.style.position = 'relative'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    container.appendChild(canvas)
    canvasRef.current = canvas

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Setup d3-force simulation
    const o = optsRef.current
    const nodes = o.graph.nodes as ParticleNode[]
    const links = o.graph.links as ParticleLink[]

    // Create forces
    const clusterForce = createClusterForce(nodes)
    const zoneForce = createZoneForce(nodes)
    const ambientForce = createAmbientDriftForce(nodes, o.motion.driftAmplitude)
    const linkForce = forceLink<ParticleNode, ParticleLink>(links)
      .id(d => d.id)
      .distance(100)
      .strength(0.3)
    const centerForce = forceCenter(0, 0)
    const collideForce = forceCollide<ParticleNode>().radius(d => d.sizeVal + 2)
    const chargeForce = forceManyBody<ParticleNode>().strength(-50)

    // Create simulation
    const simulation = forceSimulation<ParticleNode, ParticleLink>(nodes)
      .force('link', linkForce)
      .force('center', centerForce)
      .force('collide', collideForce)
      .force('charge', chargeForce)
      .force('cluster', clusterForce)
      .force('zone', zoneForce)
      .force('ambient', ambientForce)
      .alphaDecay(0.02)
      .velocityDecay(0.4)

    simulationRef.current = simulation

    // Setup d3-zoom with d3-selection
    const selection = select(canvas)
    const d3Zoom = zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.3, 5])
      .on('zoom', (event) => {
        transformRef.current = event.transform
      })

    zoomRef.current = d3Zoom
    selection.call(d3Zoom)

    // Initialize spine particles
    const spineConfig = scaleByMotion(o.motion)
    spineParticlesRef.current = links
      .filter(l => l.onSpine)
      .map((_, i) => ({
        linkIndex: i,
        progress: Math.random(),
        speed: spineConfig.speed * 0.01,
      }))

    // Resize handling
    const updateSize = () => {
      if (destroyed || !container) return
      const w = container.clientWidth
      const h = container.clientHeight
      if (w > 0 && h > 0) {
        canvas.width = w * window.devicePixelRatio
        canvas.height = h * window.devicePixelRatio
        canvas.style.width = `${w}px`
        canvas.style.height = `${h}px`
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
    }

    // Wait for container to have non-zero dimensions
    const hasDimensions = container.clientWidth > 0 && container.clientHeight > 0

    if (hasDimensions) {
      updateSize()
    } else {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          if (width > 0 && height > 0 && !destroyed) {
            resizeObserver?.disconnect()
            resizeObserver = null
            updateSize()
            return
          }
        }
      })
      resizeObserver.observe(container)
    }

    // Additional resize observer for ongoing size changes
    const ongoingResizeObserver = new ResizeObserver(() => {
      if (!destroyed) updateSize()
    })
    ongoingResizeObserver.observe(container)

    // Hit detection with quadtree
    const getNodeAtPoint = (x: number, y: number): ParticleNode | null => {
      const transform = transformRef.current
      // Convert screen coordinates to simulation coordinates
      const simX = (x - transform.x) / transform.k
      const simY = (y - transform.y) / transform.k

      const tree = quadtree<ParticleNode>(
        nodes,
        d => d.x ?? 0,
        d => d.y ?? 0
      )

      let found: ParticleNode | null = null
      tree.visit((node, x0, y0, x1, y1) => {
        void x0; void y0; void x1; void y1
        if (!node.length) {
          const d = node.data
          const dx = (d.x ?? 0) - simX
          const dy = (d.y ?? 0) - simY
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < d.sizeVal) {
            found = d
            return true
          }
        }
        return false
      })

      return found
    }

    // Mouse event handlers
    const handleMouseMove = (event: MouseEvent) => {
      if (destroyed) return
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const node = getNodeAtPoint(x, y)

      if (node) {
        optsRef.current.onNodeHover(node.refId, node.kind)
        setHoveredNodeId(node.id)
        canvas.style.cursor = 'pointer'
      } else {
        optsRef.current.onNodeHover(null)
        setHoveredNodeId(null)
        canvas.style.cursor = 'grab'
      }
    }

    const handleClick = (event: MouseEvent) => {
      if (destroyed) return
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const node = getNodeAtPoint(x, y)

      if (node) {
        optsRef.current.onNodeClick(node.refId, node.kind)
        setActiveNodeId(node.id)
      }
    }

    const handleMouseLeave = () => {
      if (destroyed) return
      optsRef.current.onNodeHover(null)
      setHoveredNodeId(null)
      canvas.style.cursor = 'grab'
    }

    // Link hit detection
    const getLinkAtPoint = (x: number, y: number): ParticleLink | null => {
      const transform = transformRef.current
      const simX = (x - transform.x) / transform.k
      const simY = (y - transform.y) / transform.k

      for (const link of links) {
        const sourceId = typeof link.source === 'object' ? (link.source as ParticleNode).id : link.source
        const targetId = typeof link.target === 'object' ? (link.target as ParticleNode).id : link.target
        const sourceNode = nodes.find(n => n.id === sourceId)
        const targetNode = nodes.find(n => n.id === targetId)
        if (!sourceNode || !targetNode) continue

        const sx = sourceNode.x ?? 0
        const sy = sourceNode.y ?? 0
        const tx = targetNode.x ?? 0
        const ty = targetNode.y ?? 0

        // Point-to-line-segment distance
        const dx = tx - sx
        const dy = ty - sy
        const lenSq = dx * dx + dy * dy
        if (lenSq === 0) continue

        let t = ((simX - sx) * dx + (simY - sy) * dy) / lenSq
        t = Math.max(0, Math.min(1, t))

        const closestX = sx + t * dx
        const closestY = sy + t * dy
        const dist = Math.sqrt((simX - closestX) ** 2 + (simY - closestY) ** 2)

        if (dist < 5) {
          return link
        }
      }
      return null
    }

    const handleMouseMoveForLinks = (event: MouseEvent) => {
      if (destroyed) return
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const link = getLinkAtPoint(x, y)
      optsRef.current.onLinkHover(link)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mousemove', handleMouseMoveForLinks)
    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    // Render loop
    const render = () => {
      if (destroyed) return

      const w = canvas.width / window.devicePixelRatio
      const h = canvas.height / window.devicePixelRatio
      const transform = transformRef.current
      const currentOpts = optsRef.current
      const currentHovered = hoveredNodeIdRef.current
      const currentActive = activeNodeIdRef.current
      const currentNeighbors = neighborIdsRef.current

      // Clear canvas
      ctx.clearRect(0, 0, w, h)
      ctx.save()

      // Apply zoom transform
      ctx.translate(transform.x, transform.y)
      ctx.scale(transform.k, transform.k)

      // Draw links
      for (const link of links) {
        const sourceId = typeof link.source === 'object' ? (link.source as ParticleNode).id : link.source
        const targetId = typeof link.target === 'object' ? (link.target as ParticleNode).id : link.target
        const sourceNode = nodes.find(n => n.id === sourceId)
        const targetNode = nodes.find(n => n.id === targetId)
        if (!sourceNode || !targetNode) continue
        if (sourceNode.x == null || sourceNode.y == null || targetNode.x == null || targetNode.y == null) continue

        ctx.beginPath()
        ctx.moveTo(sourceNode.x, sourceNode.y)
        ctx.lineTo(targetNode.x, targetNode.y)
        ctx.strokeStyle = '#4b5563'
        ctx.lineWidth = 1
        ctx.setLineDash([2, 2])
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Draw spine particles
      const spineConfig = scaleByMotion(currentOpts.motion)
      for (const particle of spineParticlesRef.current) {
        const spineLinks = links.filter(l => l.onSpine)
        const link = spineLinks[particle.linkIndex]
        if (!link) continue

        const sourceId = typeof link.source === 'object' ? (link.source as ParticleNode).id : link.source
        const targetId = typeof link.target === 'object' ? (link.target as ParticleNode).id : link.target
        const sourceNode = nodes.find(n => n.id === sourceId)
        const targetNode = nodes.find(n => n.id === targetId)
        if (!sourceNode || !targetNode) continue
        if (sourceNode.x == null || sourceNode.y == null || targetNode.x == null || targetNode.y == null) continue

        // Update particle position
        particle.progress += particle.speed
        if (particle.progress >= 1) particle.progress -= 1

        const x = sourceNode.x + (targetNode.x - sourceNode.x) * particle.progress
        const y = sourceNode.y + (targetNode.y - sourceNode.y) * particle.progress

        ctx.beginPath()
        ctx.arc(x, y, spineConfig.width, 0, Math.PI * 2)
        ctx.fillStyle = spineConfig.color
        ctx.fill()
      }

      // Draw nodes
      for (const node of nodes) {
        const isHighlighted = !currentOpts.highlightId ||
          node.id === currentOpts.highlightId ||
          node.refId === currentOpts.highlightId

        drawBubble(ctx, node, {
          hovered: node.id === currentHovered,
          active: node.id === currentActive,
          focused: isHighlighted,
          isNeighbor: currentNeighbors.has(node.id),
        }, currentOpts.theme, 1)
      }

      ctx.restore()

      animationFrameRef.current = requestAnimationFrame(render)
    }

    // Start render loop
    animationFrameRef.current = requestAnimationFrame(render)

    // Initial fit
    requestAnimationFrame(() => {
      if (!destroyed && canvas) {
        const w = canvas.width / window.devicePixelRatio
        const h = canvas.height / window.devicePixelRatio
        const bounds = getBounds(nodes)
        if (bounds) {
          const padding = 50
          const scaleX = (w - padding * 2) / (bounds.maxX - bounds.minX || 1)
          const scaleY = (h - padding * 2) / (bounds.maxY - bounds.minY || 1)
          const scale = Math.min(scaleX, scaleY, 1.5)
          const centerX = (bounds.minX + bounds.maxX) / 2
          const centerY = (bounds.minY + bounds.maxY) / 2

          const targetTransform = zoomIdentity
            .translate(w / 2, h / 2)
            .scale(scale)
            .translate(-centerX, -centerY)

          selection.call(d3Zoom.transform, targetTransform)
          transformRef.current = targetTransform
        }
      }
    })

    // Controller implementation
    const focusComponent = (id: string, motion: MotionProfile) => {
      const node = nodes.find(n => n.id === id || n.refId === id)
      if (node && typeof node.x === 'number' && typeof node.y === 'number') {
        const w = canvas.width / window.devicePixelRatio
        const h = canvas.height / window.devicePixelRatio

        const targetTransform = zoomIdentity
          .translate(w / 2, h / 2)
          .scale(1.6)
          .translate(-node.x, -node.y)

        selection.transition()
          .duration(motion.cameraMs)
          .call(d3Zoom.transform, targetTransform)
      }
    }

    controllerRef.current = {
      setData: (_graph: GraphData) => {
        // Update simulation data
        const newNodes = _graph.nodes as ParticleNode[]
        const newLinks = _graph.links as ParticleLink[]

        simulation.nodes(newNodes)
        linkForce.links(newLinks)

        // Rebuild spine particles
        spineParticlesRef.current = newLinks
          .filter(l => l.onSpine)
          .map((_, i) => ({
            linkIndex: i,
            progress: Math.random(),
            speed: spineConfig.speed * 0.01,
          }))

        simulation.alpha(0.3).restart()
      },
      focusComponent,
      resetView: (_motion: MotionProfile) => {
        const w = canvas.width / window.devicePixelRatio
        const h = canvas.height / window.devicePixelRatio
        const bounds = getBounds(nodes)

        if (bounds) {
          const padding = 50
          const scaleX = (w - padding * 2) / (bounds.maxX - bounds.minX || 1)
          const scaleY = (h - padding * 2) / (bounds.maxY - bounds.minY || 1)
          const scale = Math.min(scaleX, scaleY, 1.5)
          const centerX = (bounds.minX + bounds.maxX) / 2
          const centerY = (bounds.minY + bounds.maxY) / 2

          const targetTransform = zoomIdentity
            .translate(w / 2, h / 2)
            .scale(scale)
            .translate(-centerX, -centerY)

          selection.transition()
            .duration(_motion.cameraMs)
            .call(d3Zoom.transform, targetTransform)
        }
      },
      setHover: (_id: string | null) => {
        setHoveredNodeId(_id)
      },
      destroy: () => {
        destroyed = true
        cancelAnimationFrame(animationFrameRef.current)
        simulation.stop()
        resizeObserver?.disconnect()
        ongoingResizeObserver.disconnect()
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mousemove', handleMouseMoveForLinks)
        canvas.removeEventListener('click', handleClick)
        canvas.removeEventListener('mouseleave', handleMouseLeave)
        canvas.remove()
        canvasRef.current = null
        simulationRef.current = null
        zoomRef.current = null
      },
    }

    return () => {
      destroyed = true
      cancelAnimationFrame(animationFrameRef.current)
      simulation.stop()
      resizeObserver?.disconnect()
      ongoingResizeObserver.disconnect()
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mousemove', handleMouseMoveForLinks)
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      canvas.remove()
      canvasRef.current = null
      simulationRef.current = null
      zoomRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- initialize once

  // Update graph data when it changes (without recreating the instance)
  useEffect(() => {
    if (simulationRef.current) {
      const nodes = opts.graph.nodes as ParticleNode[]
      const links = opts.graph.links as ParticleLink[]

      simulationRef.current.nodes(nodes)
      const linkForce = simulationRef.current.force('link') as ReturnType<typeof forceLink<ParticleNode, ParticleLink>>
      if (linkForce) {
        linkForce.links(links)
      }

      // Rebuild spine particles
      const spineConfig = scaleByMotion(opts.motion)
      spineParticlesRef.current = links
        .filter(l => l.onSpine)
        .map((_, i) => ({
          linkIndex: i,
          progress: Math.random(),
          speed: spineConfig.speed * 0.01,
        }))

      simulationRef.current.alpha(0.3).restart()
    }
  }, [opts.graph, opts.motion])

  return controllerRef
}

// ─────────────────────────────────────────────────────────────────────────────
// getBounds - Computes bounding box of all nodes
// ─────────────────────────────────────────────────────────────────────────────
function getBounds(nodes: ParticleNode[]): { minX: number; minY: number; maxX: number; maxY: number } | null {
  if (nodes.length === 0) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const node of nodes) {
    if (node.x != null && node.y != null) {
      minX = Math.min(minX, node.x)
      minY = Math.min(minY, node.y)
      maxX = Math.max(maxX, node.x)
      maxY = Math.max(maxY, node.y)
    }
  }

  if (minX === Infinity) return null
  return { minX, minY, maxX, maxY }
}
