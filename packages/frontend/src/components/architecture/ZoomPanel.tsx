// ZoomPanel - Full detail view for a component
// Shows purpose, role, how it works, why it matters, sub-components, and internals

import { useState } from 'react'
import type { ArchitectureComponent, SubComponent } from './data/components'

// // STAGE: zoom_panel
interface ZoomPanelProps {
  component: ArchitectureComponent
  initialSubId?: string | null
  onClose: () => void
}

export function ZoomPanel({ component, initialSubId, onClose }: ZoomPanelProps) {
  const [selectedSub, setSelectedSub] = useState<SubComponent | null>(() => {
    if (initialSubId) {
      return component.subComponents.find(s => s.id === initialSubId) || null
    }
    return null
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* // STAGE: zoom_panel_header */}
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{component.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">{component.name}</h2>
                <p className="text-sm text-gray-400 mt-1">{component.detail.purpose}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* // STAGE: zoom_panel_content */}
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {selectedSub ? (
            /* Sub-component detail view */
            <SubComponentDetail
              sub={selectedSub}
              onBack={() => setSelectedSub(null)}
            />
          ) : (
            /* Main component detail */
            <div className="space-y-6">
              {/* Role */}
              <Section title="Role">
                <p className="text-gray-300 text-sm leading-relaxed">{component.detail.role}</p>
              </Section>

              {/* How it works - Step by step */}
              <Section title={`How It Works: ${component.detail.howItWorks.title}`}>
                <ol className="space-y-2">
                  {component.detail.howItWorks.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-gray-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </Section>

              {/* Why it matters */}
              <Section title="Why It Matters">
                <p className="text-gray-300 text-sm leading-relaxed">{component.detail.whyItMatters}</p>
              </Section>

              {/* Key metrics */}
              {component.detail.metrics && component.detail.metrics.length > 0 && (
                <Section title="Key Metrics">
                  <div className="grid grid-cols-2 gap-2">
                    {component.detail.metrics.map((metric, i) => (
                      <div key={i} className="bg-gray-800 rounded-lg p-3 text-sm">
                        <span className="text-gray-300">{metric}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Sub-components */}
              {component.subComponents.length > 0 && (
                <Section title={`Sub-Components (${component.subComponents.length})`}>
                  <div className="grid grid-cols-2 gap-3">
                    {component.subComponents.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSub(sub)}
                        className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-left transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{sub.icon}</span>
                          <span className="font-semibold text-white text-sm">{sub.name}</span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{sub.detail.purpose}</p>
                      </button>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// // STAGE: zoom_section
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  )
}

// // STAGE: zoom_sub_component_detail
function SubComponentDetail({ sub, onBack }: { sub: SubComponent; onBack: () => void }) {
  const [expandedInternals, setExpandedInternals] = useState<string[]>([])

  const toggleInternal = (title: string) => {
    setExpandedInternals(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
      >
        ← Back to {sub.name}
      </button>

      {/* Sub-component header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{sub.icon}</span>
        <div>
          <h2 className="text-xl font-bold text-white">{sub.name}</h2>
          <p className="text-sm text-gray-400">{sub.detail.purpose}</p>
        </div>
      </div>

      {/* Role */}
      <Section title="Role">
        <p className="text-gray-300 text-sm leading-relaxed">{sub.detail.role}</p>
      </Section>

      {/* How it works */}
      <Section title={`How It Works: ${sub.detail.howItWorks.title}`}>
        <ol className="space-y-2">
          {sub.detail.howItWorks.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-gray-300">{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Why it matters */}
      <Section title="Why It Matters">
        <p className="text-gray-300 text-sm leading-relaxed">{sub.detail.whyItMatters}</p>
      </Section>

      {/* Metrics */}
      {sub.detail.metrics && sub.detail.metrics.length > 0 && (
        <Section title="Key Metrics">
          <div className="grid grid-cols-2 gap-2">
            {sub.detail.metrics.map((metric, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-3 text-sm">
                <span className="text-gray-300">{metric}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Level 3: Internals */}
      {sub.internals && sub.internals.length > 0 && (
        <Section title="Internals (Level 3)">
          <div className="space-y-2">
            {sub.internals.map((internal, i) => (
              <div key={i} className="bg-gray-800 rounded-lg">
                <button
                  onClick={() => toggleInternal(internal.title)}
                  className="w-full p-3 flex items-center justify-between text-left"
                >
                  <span className="text-sm font-medium text-white">{internal.title}</span>
                  <span className="text-gray-400 text-xs">
                    {expandedInternals.includes(internal.title) ? '▾' : '▸'}
                  </span>
                </button>
                {expandedInternals.includes(internal.title) && (
                  <div className="px-3 pb-3 border-t border-gray-700">
                    <p className="text-sm text-gray-300 mt-2">{internal.content}</p>
                    {internal.formula && (
                      <div className="mt-2 bg-gray-900 rounded p-2 font-mono text-xs text-green-400">
                        {internal.formula}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
