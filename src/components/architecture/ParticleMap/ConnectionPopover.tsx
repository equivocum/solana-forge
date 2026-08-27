// ConnectionPopover.tsx - Popover for connection explanation on click/hover
// STAGE: particle_interaction
// WHY: Shows explanation of data-flow hop when clicking/hovering a connection (FR-009)
// HOW: Lightweight popover styled with existing annotation tokens

import { composeHopExplanation } from '../../../services/connectionExplanations'
import type { ParticleLink } from './useParticleGraph'
import type { ArchitectureComponent } from '../data/components'

// ─────────────────────────────────────────────────────────────────────────────
// ConnectionPopoverProps
// ─────────────────────────────────────────────────────────────────────────────
export interface ConnectionPopoverProps {
  link: ParticleLink
  fromComponent: ArchitectureComponent
  toComponent: ArchitectureComponent
  anchor: { x: number; y: number }
  onClose: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// ConnectionPopover - Renders explanation for a data-flow hop
// ─────────────────────────────────────────────────────────────────────────────
export function ConnectionPopover({
  link,
  fromComponent,
  toComponent,
  anchor,
  onClose,
}: ConnectionPopoverProps) {
  const explanation = composeHopExplanation(
    { from: link.source, to: link.target, label: link.label, type: link.type },
    { from: fromComponent, to: toComponent }
  )

  return (
    <div
      className="absolute z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-3 max-w-xs"
      style={{ left: anchor.x, top: anchor.y }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-blue-300">{explanation.title}</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xs"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <p className="text-xs text-gray-300 mb-2">{explanation.body}</p>

      {/* Citation chip */}
      {explanation.citation && (
        <a
          href={explanation.citation}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-[10px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded border border-blue-700/50 hover:bg-blue-800/50"
        >
          Agave v4.2.1
        </a>
      )}
    </div>
  )
}