// bubblePainter.ts - Node canvas painter (glow ring, icon-less label, state emphasis)
// STAGE: particle_painting
// WHY: Renders each bubble with visual emphasis based on hover/active/focus state
// HOW: Pure function that paints on CanvasRenderingContext2D

import type { ParticleNode } from '../useParticleGraph'
import type { ComponentThemeHex } from '../useForceSimulation'

// ─────────────────────────────────────────────────────────────────────────────
// Label visibility threshold: show labels at 150% of default zoom (0.8 * 1.5 = 1.2)
// ─────────────────────────────────────────────────────────────────────────────
export const LABEL_VISIBILITY_ZOOM_THRESHOLD = 1.2

// ─────────────────────────────────────────────────────────────────────────────
// drawBubble - Paints a single node bubble
// ─────────────────────────────────────────────────────────────────────────────
export function drawBubble(
  ctx: CanvasRenderingContext2D,
  node: ParticleNode,
  state: { hovered: boolean; active: boolean; focused: boolean; isNeighbor: boolean },
  theme: ComponentThemeHex,
  scale: number
): void {
  const colors = theme[node.category] || theme.networking
  const radius = node.sizeVal * scale

  // Skip if d3-force hasn't positioned the node yet
  if (node.x == null || node.y == null) return

  // Base circle
  ctx.beginPath()
  ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
  ctx.fillStyle = colors.fill
  ctx.fill()

  // Glow ring for hovered/active/focused/neighbor
  if (state.hovered || state.active || state.focused || state.isNeighbor) {
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius * 1.2, 0, Math.PI * 2)
    ctx.strokeStyle = state.hovered || state.active ? colors.glow : '#6b7280'
    ctx.lineWidth = state.hovered || state.active ? 2 : 1
    ctx.stroke()
  }

  // Label (components always visible; subs visible when zoomed >= 150%)
  const showLabel = node.kind === 'component' || scale >= LABEL_VISIBILITY_ZOOM_THRESHOLD
  if (showLabel) {
    ctx.fillStyle = colors.label
    ctx.font = `${10 * scale}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(node.label, node.x, node.y + radius + 12 * scale)
  }
}