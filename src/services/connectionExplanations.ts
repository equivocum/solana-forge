// Pure composer for connection hop explanations
// STAGE: connection_explanations
// WHY: Composes educational text for data-flow hops using audited fields only
// HOW: Pure function that assembles body from link label + destination purpose

import type { Connection } from '../components/architecture/data/connections'
import type { ArchitectureComponent } from '../components/architecture/data/components'

export interface HopExplanation {
  title: string
  body: string
  citation: string | null
}

export function composeHopExplanation(
  link: Connection,
  endpoints: { from: ArchitectureComponent; to: ArchitectureComponent }
): HopExplanation {
  const { from, to } = endpoints

  // Title = link label (what travels)
  const title = link.label

  // Body = what travels + why it goes there (purpose of destination)
  const body = `${link.label} travel from ${from.name} to ${to.name}. ${to.detail.purpose}`

  // Citation = first refs entry from either endpoint, else null
  const citation = (from.refs && from.refs[0]) || (to.refs && to.refs[0]) || null

  return { title, body, citation }
}