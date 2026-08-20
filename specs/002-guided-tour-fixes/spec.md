# Feature Specification: Guided Tour Fixes

**Feature Branch**: `002-guided-tour-fixes`

**Created**: 2026-08-20

**Status**: Draft

**Input**: User description: "Fix the guided tour - pause/resume functionality, annotation persistence, clickable source links, and overlay positioning"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pause and Resume Tour (Priority: P1)

As a learner using the guided tour, I want to pause the tour at any step and resume from where I left off, so I can study a component in detail without losing my progress.

**Why this priority**: This is the core usability issue. Without resume, the tour is effectively a one-shot experience — any interruption forces a full restart, which is frustrating and wastes time.

**Independent Test**: Start the guided tour, advance to step 5, click Pause, verify the step 5 annotation remains visible, click Resume, verify the tour continues from step 6.

**Acceptance Scenarios**:

1. **Given** the guided tour is playing at step N, **When** the user clicks Pause, **Then** the tour stops advancing and the current step's annotation remains visible
2. **Given** the guided tour is paused at step N, **When** the user clicks Resume, **Then** the tour continues advancing from step N+1 with instant resume (no delay)
3. **Given** the guided tour is paused at step N, **When** the user clicks Reset, **Then** the tour returns to step 0 and the "Start" state
4. **Given** the guided tour is paused, **When** the user changes the speed or slow-motion toggle, **Then** the new speed applies when the tour is resumed
5. **Given** the guided tour is active (playing or paused), **When** the user clicks Next, **Then** the tour advances to the next step manually
6. **Given** the guided tour is active at step N > 0, **When** the user clicks Back, **Then** the tour returns to the previous step

---

### User Story 2 - Persistent Annotations When Paused (Priority: P1)

As a learner, I want the current step's annotation to remain visible when the tour is paused, so I can read and study the details without the annotation disappearing.

**Why this priority**: Annotations are the primary learning content. If they vanish on pause, the user loses the context they were studying.

**Independent Test**: Start the guided tour, advance to any step, click Pause, verify the annotation card with all badges (STAGE, WHY, HOW, REF, DECISION, BYTES) remains visible and readable.

**Acceptance Scenarios**:

1. **Given** the guided tour is playing and showing step N's annotation, **When** the user clicks Pause, **Then** step N's annotation remains visible with all its badges
2. **Given** the tour is paused and annotation is visible, **When** the user hovers over annotation badges, **Then** the badges remain readable and interactive

---

### User Story 3 - Clickable Source Code Links (Priority: P2)

As a learner, I want to click on source code references in the annotation to open the exact file in the Agave GitHub repository, so I can read the actual implementation.

**Why this priority**: Source references are a key educational feature. Without clickable links, users must manually copy-paste URLs, which is tedious and error-prone.

**Independent Test**: Start the guided tour, advance to any step, locate a source reference badge, click the link, verify it opens the correct Agave repository file in a new browser tab.

**Acceptance Scenarios**:

1. **Given** the guided tour is showing a step with source references, **When** the user clicks a source reference link, **Then** the corresponding Agave repository page opens in a new browser tab
2. **Given** a source reference is displayed, **When** the user hovers over it, **Then** visual feedback indicates it is clickable (e.g., underline, color change)
3. **Given** a source reference contains a line number anchor (e.g., `#L31`), **When** the user clicks it, **Then** the browser scrolls to that specific line in the file

---

### User Story 4 - Sidebar Layout (Priority: P2)

As a learner, I want the tour annotations displayed in a dedicated right sidebar instead of a floating overlay, so I can see both the current step's annotation and the full architecture diagram simultaneously without any overlap.

**Why this priority**: The floating overlay covers Storage/AccountsDB components on the right side of the diagram. A sidebar is a layout element that never covers content.

**Independent Test**: Start the guided tour at any step, verify the sidebar displays annotations on the right side and no architecture components are covered.

**Acceptance Scenarios**:

1. **Given** the guided tour is active, **When** viewing the sidebar, **Then** all architecture components in the diagram remain visible and are not covered by the sidebar
2. **Given** the sidebar contains many annotations for a step, **When** the content exceeds the available height, **Then** the sidebar scrolls internally

---

### Edge Cases

- What happens when the user pauses at the last step (step 18)? The Resume button should complete the tour.
- What happens when the browser window is resized while the tour is paused? The overlay should reposition to stay visible and non-intrusive.
- What happens when a source reference URL is malformed or the GitHub repo is unavailable? The link should still be clickable but handle errors gracefully (browser will show 404).
- What happens on mobile viewports? The overlay should adapt to smaller screens without covering the entire diagram.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST preserve the current step index when the tour is paused, allowing resume from the same position
- **FR-002**: System MUST display "Resume" button when paused, "Pause" button when playing, and "Next"/"Back" buttons for manual step navigation at all times during the tour
- **FR-003**: System MUST keep the current step's annotation visible and fully rendered while the tour is paused
- **FR-004**: System MUST render source references in dual format: `// REF: <file:line>` as monospace text + a clickable "Open in GitHub" icon linking to the full URL with `target="_blank"` and `rel="noopener noreferrer"`
- **FR-005**: System MUST apply visual hover effects (underline, color change) to the clickable "Open in GitHub" icon to indicate interactivity
- **FR-006**: System MUST render tour annotations in a dedicated right sidebar that is a layout element, not a floating overlay, ensuring zero overlap with architecture components
- **FR-007**: System MUST allow internal scrolling of the sidebar when annotation content exceeds available vertical space
- **FR-008**: System MUST maintain existing functionality: play, pause, reset, speed control (0.5x/1x/2x), slow-motion toggle
- **FR-009**: System MUST constrain page content to a maximum width of 1400px and center it horizontally on wider viewports

### Key Entities

- **Simulation State**: Current step index, playing/paused/stopped status, speed multiplier, slow-motion flag
- **Annotation**: Step title, description, typed badges (STAGE, WHY, HOW, REF, DECISION, BYTES), each with content and source reference URL
- **Source Reference**: Dual-format display — `// REF: <file:line>` monospace text + clickable "Open in GitHub" icon linking to full URL

## Clarifications

### Session 2026-08-20

- Q: How should the annotation overlay avoid covering architecture components? → A: Dedicated right sidebar layout element instead of floating overlay
- Q: What format should source code references use? → A: Both — `// REF: <file:line>` as primary display + clickable "Open in GitHub" icon
- Q: What happens when the user clicks Resume after pausing? → A: Instant resume (no delay) + manual Next/Back buttons for step-by-step navigation
- Q: Should the page content stretch to full viewport width on wide screens? → A: No — page content should have max-width (1400px) and be centered horizontally

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can pause and resume the guided tour without losing progress — verified by pausing at step N and resuming to continue from N+1
- **SC-002**: Annotations remain visible for at least 100% of the time the tour is paused — zero disappearances on pause
- **SC-003**: 100% of source references in annotations are clickable and open the correct GitHub URL in a new tab
- **SC-004**: The sidebar covers 0% of architecture component cards when the tour is active at any step
- **SC-005**: The annotation overlay handles up to 6 annotation badges per step without overflowing the viewport

## Assumptions

- The user is on a desktop browser with standard viewport (1280px+ width)
- The Agave GitHub repository URLs are stable and accessible
- The existing simulation step data (18 steps with source references) is accurate and does not need modification
- The architecture diagram layout (pipeline flow and layered view) remains unchanged
- Mobile responsiveness is a secondary concern — desktop experience is prioritized
