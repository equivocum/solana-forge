# Feature Specification: Particle Bubble Map UI

**Feature Branch**: `feature/<issue>-particle-map-ui` (issue to be created per Git Flow at implementation kickoff)

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: "I want to change the UI and convert it to a map of bubles/particles and make all nodes/components particles with related (inter)connections between them, educational material for each step. all subs have to be near parents. hovering over them, has anymation, clicking through them, opens educations material, explanations of the data flow."

## Clarifications

### Session 2026-08-26

- Q: Should the particle/bubble map replace the two existing view modes or be added alongside them? → A: Added as a third selectable view mode alongside Pipeline Flow and Layered View, both of which remain unchanged
- Q: How should the bubbles behave when idle (no user interaction)? → A: Full particle simulation feel — constant ambient floating plus transaction particles streaming along connections continuously
- Q: What should clicking a bubble open as its educational material? → A: The existing audited content panels (purpose, role, how-it-works, metrics) including their pinned Agave v4.2.1 citations, reused verbatim
- Q: How should the guided tour behave in relation to the new particle map? → A: The guided tour runs on all three view modes; in the particle map each step focuses/highlights its bound bubble
- Q: When exploring the particle map, should the learner be able to pan and zoom the scene, and how do bubble labels stay readable? → A: Free panning by dragging and zooming via scroll/pinch; labels show on hover at any zoom level and persist visibly once zoomed in close enough
- Q: How should component clusters be arranged spatially in the particle map? → A: Soft lifecycle-ordered zones (ingress → tpu-pipeline → tvu-replay → runtime-shared → consensus → storage-networking) with bubbles drifting freely inside their zone
- Q: Should bubbles and connections be operable via keyboard in the particle map? → A: Deferred — this feature ships pointer/touch interaction only; keyboard operability may be revisited later
- Q: Should the guided-tour step-advance defect be repaired as part of this feature? → A: Yes — fix it in this feature; US4-AC1 ("unchanged") is read as "unregressed", so all three modes get complete 21-step tours

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Living Validator Constellation (Priority: P1)

A learner opens the new view mode and sees the validator as a living constellation: every component floats as a distinct bubble, sub-components hover near their parents, connections trace the relationships between them, and streams of transaction particles travel the pipeline continuously — conveying that a validator is a busy, interconnected machine rather than a static block diagram.

**Why this priority**: The living map is the core deliverable; without it there is nothing to hover, click, or tour. It carries the entire visual-first promise of the product.

**Independent Test**: Open the new mode, confirm within seconds that the scene is in motion and that every modeled component and sub-component is present exactly once, clustered correctly. Delivers the standalone "validator as a living system" experience.

**Acceptance Scenarios**:

1. **Given** the new view mode, **When** the learner opens it and watches without interacting, **Then** bubbles exhibit continuous gentle floating motion and never freeze into a static diagram
2. **Given** the new view mode, **When** the learner observes the connections, **Then** transaction particles visibly travel along the submission-to-finalization path continuously
3. **Given** the component model, **When** the learner inspects the map, **Then** every component and every sub-component appears as exactly one bubble, with each sub-component positioned adjacent to (or within) its parent's neighborhood at all times
4. **Given** the connections model, **When** the learner inspects the map, **Then** every modeled connection is depicted between the corresponding bubbles, preserving its direction and label

---

### User Story 2 - Touch Reveals Meaning (Priority: P1)

A curious learner hovers over a bubble and sees it come alive — emphasis animation, highlighted links to related bubbles — then clicks it and lands in the verified educational material explaining what that component does and why it matters. Clicking a connection explains that specific data-flow hop.

**Why this priority**: Interaction converts the spectacle into learning; it is the difference between a screensaver and an educational tool. It depends only on Story 1's rendering being in place.

**Independent Test**: Hover ten random bubbles and observe consistent animated feedback; click ten random bubbles and connections and confirm correct, cited explanations open. Delivers self-directed exploration value.

**Acceptance Scenarios**:

1. **Given** any bubble, **When** the learner hovers over it, **Then** the bubble responds immediately with visible animation and its incident connections and neighbor bubbles are emphasized while unrelated content recedes
2. **Given** any component bubble, **When** the learner clicks it, **Then** the audited educational material for that component opens unchanged, including at least one working pinned v4.2.1 citation
3. **Given** any sub-component bubble, **When** the learner clicks it, **Then** its own audited sub-component material opens, including its citations
4. **Given** any connection, **When** the learner hovers or clicks it, **Then** a short explanation of that data-flow hop opens (what travels, why), carrying the pinned citation where the audit established one

---

### User Story 3 - One Tour, Every View (Priority: P2)

A learner following the guided tour can take it in any of the three view modes. In the particle map, each step pulls its bound bubble into focus so the narrated journey from submission to finalization works identically across presentations.

**Why this priority**: The tour is the product's spine ("signing to finalization"); making it work in the new mode protects the continuity promise while keeping the story slice independent of exploration features.

**Independent Test**: Start the tour in each of the three modes and walk all steps end-to-end; in the particle map confirm each step focuses its component. Delivers presentation-independent narrative.

**Acceptance Scenarios**:

1. **Given** the particle map, **When** the learner starts the guided tour, **Then** each step highlights and visually focuses the bubble(s) bound to that step while narration plays
2. **Given** any of the three view modes, **When** the learner advances through the full tour, **Then** all steps complete without dead ends and navigation controls behave identically
3. **Given** a tour step whose subject sits inside a dense cluster, **When** the step activates, **Then** its bubble is brought forward clearly enough that the learner can identify it without searching manually

---

### User Story 4 - Three Modes, One Truth (Priority: P2)

A returning learner switches between Pipeline Flow, Layered View, and the particle map and finds one consistent, accurate world: same components, same connections, same educational content, same visual language for lifecycle states. Nothing learned in one mode contradicts another.

**Why this priority**: Adding a third representation risks divergence (stale counts, inconsistent styling, broken annotations); this story guards the integrity that the accuracy audit established.

**Independent Test**: Cross-check the three modes against the shared component/connection/tour data and run the automated consistency checks; sample identical items in different modes and compare. Delivers long-term maintainability confidence.

**Acceptance Scenarios**:

1. **Given** the two existing view modes, **When** the learner uses them after this feature ships, **Then** their behavior and content are unchanged from before
2. **Given** the automated data-consistency suite, **When** it runs, **Then** it verifies that the particle map's bubble set matches the component model one-to-one and that every connection is rendered
3. **Given** lifecycle-state coloring conventions (processing/finalized/fork/PoH), **When** the learner compares the particle map with the older modes, **Then** the same semantic colors are used for the same meanings

---

### Edge Cases

- What happens when a component has no sub-components? It renders as a single bubble with no nested cluster; nothing empty or broken is shown.
- What happens when the learner clicks rapidly during heavy motion? Selection must remain reliable — the click registers on the intended bubble regardless of drift, and the opened material stays stable until dismissed.
- What happens when hovering sweeps quickly across many bubbles? Feedback updates smoothly without flickering, sticking, or leaving stale highlights behind.
- What happens when the learner's device requests reduced motion? The idle simulation calms to minimal, non-distracting movement while all information (clustering, connections, particles' paths) stays legible.
- What happens on small windows? Clusters may compress and labels abbreviate, but no bubble becomes unreachable and no connection disappears.
- What happens when a tour step targets a component while the learner is mid-hover elsewhere? The step's focus takes precedence and hover state clears cleanly.
- The shared tour step-advance logic (`App.tsx` `handleSimStepChange` and `SimulationSidebar`) currently caps manual step navigation at 17 of 21 steps and bypasses highlight synchronization; this defect is repaired within this feature so that all three view modes support the full 21-step tour end-to-end.

## Requirements *(mandatory)*

### Functional Requirements

**Particle Map Rendering**

- **FR-001**: The product MUST offer a third view mode that renders every validator component and sub-component as an individual interactive bubble/particle, matching the underlying model one-to-one — no missing, duplicated, or extra elements
- **FR-002**: Each sub-component bubble MUST remain positioned adjacent to or within its parent's neighborhood throughout all motion
- **FR-003**: All modeled connections MUST be depicted between their corresponding bubbles, preserving direction, label, and kind
- **FR-004**: With no user input, the scene MUST exhibit continuous ambient motion — bubbles drifting gently within their clusters (motion visible within 5 s per SC-002, frame rate ≥ 30 fps) — and transaction particles MUST stream continuously along the transaction lifecycle path
- **FR-005**: Visual grouping and lifecycle coloring MUST reuse the established semantic color language of the existing views (same meaning = same color across modes)

**Interaction & Learning Loop**

- **FR-006**: Hovering a bubble MUST produce a visible animation within 100 ms on that bubble and emphasize its incident connections and neighboring bubbles
- **FR-007**: Clicking a component bubble MUST open that component's audited educational material verbatim — purpose, role, internal mechanics, metrics — including at least one working pinned v4.2.1 citation
- **FR-008**: Clicking a sub-component bubble MUST open that sub-component's own audited material, including its citations
- **FR-009**: Interacting with a connection MUST present a short explanation of that data-flow hop (what travels, why it goes there), citing the pinned source where the audit established one
- **FR-010**: Educational content shown in the particle map MUST be identical to the content shown for the same element in the other view modes; no paraphrasing, no divergence

**Navigation**

- **FR-011**: The particle map MUST support free panning (drag) and zooming (scroll/pinch) across the full scene; bubble labels MUST be visible while hovering at any zoom level and MUST remain permanently visible once the view is zoomed to ≥ 150% of default zoom

**Spatial Organization**

- **FR-012**: Component clusters MUST settle within soft zones following the transaction lifecycle order defined by zoneAnchors() (ingress → tpu-pipeline → tvu-replay → runtime-shared → consensus → storage-networking); bubbles drift freely inside their zone, and zone boundaries guide placement without acting as rigid walls

For the avoidance of doubt, "soft zone" means the zone force attracts nodes toward the zone anchor with configurable strength; no hard boundary is enforced. Compliance is verified by the zone assignment being total (every node gets exactly one zone) — see data-model.md ZoneDef validation.

**Guided Tour Integration**

- **FR-013**: The guided tour MUST be startable in the particle map; each step MUST highlight and visually focus the bubble(s) bound to that step, with navigation behavior identical across all three modes

**Coexistence & Accessibility**

- **FR-014**: The two existing view modes MUST remain available with their current behavior and content unregressed
- **FR-015**: When the learner's environment signals reduced-motion preference, the idle simulation MUST reduce to minimal movement while preserving legibility of clusters, connections, and particle paths
- **FR-016**: At small viewport sizes the map MAY compress spacing and abbreviate labels (abbreviation shall not truncate more than 30% of label length) but MUST NOT hide or strand any bubble or connection
- **FR-017**: The automated data-consistency suite MUST be extended so the particle map cannot ship with a bubble set that diverges from the component/connection model

**Process Constraints (constitution-mandated)**

- **FR-018**: All work MUST occur on a feature branch created from `main` per Git Flow, tracked by a GitHub issue, committed as conventional commits, with each change unit kept within 500 changed lines and tests plus type-checking green before the next step begins

### Key Entities *(include if feature involves data)*

- **ParticleMap**: The new presentation of the existing architecture model; defines how components, sub-components, and connections become bubbles, links, and particle streams — including cluster membership (child→parent), motion behavior, and focus/highlight states. Adds no new factual content.
- **Component / SubComponent**: Reused from the audited model; gain presentation attributes (bubble size/emphasis relative to parent, cluster position) without changing identity or content.
- **Connection**: Reused directed edge; gains an interactable explanation surface (hop description + optional citation).
- **SimulationStep**: Reused tour step; gains mode-independent binding so any view mode can focus its subject.
- **Citation**: Reused pinned-release permalink; mandatory wherever audited content is displayed, now also on connection explanations where evidence exists.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% inventory parity — every modeled component and sub-component appears exactly once as a bubble and every connection is drawn, verified by the extended automated consistency checks passing with zero failures
- **SC-002**: Motion is observable within 5 seconds of opening the view with zero interaction, and transaction particles are seen traversing successive lifecycle hops continuously over at least one minute of observation
- **SC-003**: Sampled verification — clicking 10 randomly chosen bubbles and 3 randomly chosen connections opens the correct explanation each time, and every sampled explanation's citation link opens the pinned release at the claimed file and line (13/13 pass)
- **SC-004**: Hover feedback is perceptibly immediate on every bubble, and animation remains smooth throughout a 60-second session on a 2020 MacBook Air M1 (or equivalent baseline) at full dataset size — no stutter, no frozen frames
- **SC-005**: A first-time learner completes the full guided tour in the particle map from submission to finalization without dead-end steps or manual searching for the focused bubble
- **SC-006**: Mode switching among the three views never shows contradictory content — identical elements inspected side-by-side match in naming, facts, citations, and lifecycle colors

## Assumptions

- Desktop web usage patterns match the existing application; mobile-specific layouts are out of scope beyond graceful compression (FR-016)
- Keyboard operability of the particle map is explicitly deferred to a future feature; this feature guarantees pointer/touch interaction only
- No new educational copy is authored in this feature; the audited text corpus from the architecture audit is the single content source, reused verbatim (any unverifiable claim remains labeled as a simplification under the audit's rules)
- Current data scale (roughly sixty bubbles and dozens of connections) is the performance target; significant model growth would require revisiting the smoothness criterion (SC-004)
- The guided tour's step definitions continue to apply unchanged; only their visual focusing behavior adapts per view mode
- Existing annotation badge types and inspector interaction patterns carry over so learners meet familiar controls in the new mode
