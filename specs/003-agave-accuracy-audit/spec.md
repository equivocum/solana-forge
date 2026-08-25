# Feature Specification: Agave Accuracy Audit

**Feature Branch**: `003-agave-accuracy-audit`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "Audit and correct Solana Forge's Solana validator architecture visualization so it exactly matches a real validator (Anza's Agave client, pinned release v4.2.1). Every claim must be independently researched and verified against the Agave source code, cited by exact file and line via permanent GitHub links. Fill gaps in coverage, fix the transaction lifecycle ordering, add the missing vote return path, restructure the guided tour, document all findings, and apply every change through git flow with step-by-step verification."

## Clarifications

### Session 2026-08-25

- Q: How should forwarding be represented given "Gulf Stream" is an informal concept name rather than code? → A: One merged node named "Forwarding (Gulf Stream)" consolidating today's `gulf-stream` and `forwarding` components (id `forwarding` retained); mechanics attributed to real stages; duplicated leader-schedule content moves under `epoch-schedule`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trustworthy Transaction Lifecycle (Priority: P1)

A learner traces the guided tour of a transaction through the validator and relies on it being true. Today several steps misrepresent what actually happens inside a real validator (e.g., deduplication shown in the wrong pipeline stage, execution shown committing durable state before the ledger clock records it). The learner must be able to trust that each step matches reality.

**Why this priority**: Correctness is the product. An educational visualization that teaches wrong mechanics is worse than none; this story fixes the highest-risk factual errors on the main path.

**Independent Test**: Walk the corrected guided tour end-to-end; for each step, open its citation link and confirm the described behavior matches the referenced source lines. Delivers a factually accurate core narrative even if nothing else ships.

**Acceptance Scenarios**:

1. **Given** the corrected tour, **When** the learner reaches the step where transactions are checked for duplicates and blockhash freshness, **Then** the step places those checks inside the transaction-processing engine's scheduling/consumption context, not in signature verification
2. **Given** the corrected tour, **When** the learner reaches execution and ledger-clock steps, **Then** the tour shows execution results being recorded into the proof-of-history stream immediately per batch, with durable state persistence shown as a later, asynchronous commitment
3. **Given** the corrected tour, **When** the learner inspects any step's explanation, **Then** no step describes removed capabilities (such as graphics-hardware signature offload) as current behavior

---

### User Story 2 - Complete Vote Return Path and Finalization (Priority: P1)

A learner finishes the tour understanding not just block production and validation, but how votes travel back into the cluster and how a slot becomes finalized. Today the story ends at voting with no return path; finalization appears as an unexplained storage write.

**Why this priority**: Finalization is the destination of the entire journey ("signing to finalization" is the app's promise). Without the vote loop, the central question — "when is my transaction irreversible?" — has no answer.

**Independent Test**: Follow the tour from a produced block through vote generation, vote propagation, vote ingestion by other validators, confirmation thresholds, and root advancement; confirm each hop exists and cites real machinery. Delivers a complete end-to-end narrative.

**Acceptance Scenarios**:

1. **Given** the corrected visualization, **When** the learner reaches the voting step, **Then** the diagram shows the validator's own vote being published outward and other validators' votes arriving back through both gossip and received blocks
2. **Given** the corrected visualization, **When** the learner examines confirmation, **Then** the distinction between optimistic confirmation and finalization (root advancement) is visible, including the lockout mechanism that produces it
3. **Given** the corrected visualization, **When** the learner reaches the final step, **Then** finalization shows fork pruning and asynchronous state consolidation rather than a synchronous state write triggered by voting

---

### User Story 3 - Full Validator Coverage (Priority: P2)

A learner exploring the component map encounters every major service a real validator runs, including the network entry points and consensus support services currently absent from the model. New components appear as first-class diagram nodes when they are independent services; thread-level mechanics stay inside detail panels.

**Why this priority**: Gaps silently mislead ("where do clients submit transactions?"). Coverage completes the mental model but depends on Story 1's corrections being in place.

**Independent Test**: Open the component index and locate the client-facing submission service, the gossip-vote receiver, and the outbound vote publisher; click each for details. Delivers a complete component inventory.

**Acceptance Scenarios**:

1. **Given** the component map, **When** the learner looks for where a user-submitted transaction enters the system, **Then** a dedicated remote-interface component exists as the true entry point, connected onward into the ingestion pipeline
2. **Given** the component map, **When** the learner inspects the two new consensus-support components (inbound vote listener, outbound vote publisher), **Then** each explains its distinct role with citations
3. **Given** any existing component, **When** the learner opens its detail panel, **Then** internal mechanics shown there correspond to named threads/services in the real implementation (e.g., the dedicated vote worker inside transaction processing)

---

### User Story 4 - Verifiable Citations Everywhere (Priority: P2)

A skeptical learner (or contributor) clicks any factual claim in the app and lands on the exact lines in the pinned Agave release that prove it. Citations are stable permalinks that never rot because they pin a released tag.

**Why this priority**: Verifiability converts "trust me" into "check yourself", which is the difference between an authoritative resource and a blog post.

**Independent Test**: Sample ten factual claims across different components; click each citation; confirm it opens the pinned repository at the claimed file and line and that the line supports the claim.

**Acceptance Scenarios**:

1. **Given** any component detail panel, **When** the learner clicks a source reference, **Then** the browser opens the pinned release of the Agave repository scrolled to the referenced file and line
2. **Given** the audit report, **When** a reviewer checks any listed finding, **Then** both the incorrect old claim and the corrected claim carry resolvable citations
3. **Given** a claim that could not be verified against the pinned source, **When** the learner reads that part of the UI, **Then** the claim is either absent or explicitly labeled as a simplification

---

### User Story 5 - Documented Audit Trail (Priority: P3)

A future contributor wants to understand what was wrong, why it was wrong, what standard was used, and what changed — without redoing the research. A findings report lives alongside the other feature specs.

**Why this priority**: Preserves institutional knowledge and makes future re-audits (e.g., against a newer release) incremental instead of from-scratch.

**Independent Test**: Read the report cold and answer: which claims were wrong, what fixed them, and where is it proven? Delivers lasting value independent of the code changes.

**Acceptance Scenarios**:

1. **Given** the report, **When** a contributor scans the findings table, **Then** each row identifies the affected component, the misconception, the correction, and the proving citation
2. **Given** the report, **When** a contributor wants to re-audit against a newer Agave release, **Then** the pinned-version methodology section explains exactly how to repeat the process

---

### Edge Cases

- What happens when official documentation contradicts the source code? Source code wins; the divergence is noted in the report.
- What happens when behavior differs between recent releases (e.g., features gated but not yet active on mainnet, such as the next-generation consensus protocol)? The visualization models mainnet-active behavior of the pinned release and may mention gated futures explicitly as notes, never as current flow.
- What happens if a claim is true historically but false today? It must be corrected to present-day behavior; historical context may be kept in the report, not in the tour.
- What happens when a correction would break the automated data-consistency tests? Tests are updated in the same change unit so the suite always reflects the intended new invariant.
- How does the system handle unverifiable third-party explanations (blogs, talks)? They may inform research but never stand as the sole basis for a claim kept in the app.

## Requirements *(mandatory)*

### Functional Requirements

**Accuracy Standard**

- **FR-001**: All architectural claims, flows, and component descriptions MUST accurately represent the behavior of the Agave validator client at pinned release v4.2.1
- **FR-002**: Every factual claim retained in the visualization MUST carry at least one citation resolving to a permanent GitHub URL of the form `<agave-repository>/blob/v4.2.1/<path>#L<line>` (with line range where appropriate), verified during this audit
- **FR-003**: Where the pinned source and any secondary material conflict, the pinned source MUST govern; conflicts MUST be recorded in the findings report
- **FR-004**: Claims that cannot be verified against the pinned source MUST either be removed or explicitly labeled in-app as simplifications

**Lifecycle Corrections**

- **FR-005**: The transaction lifecycle sequence MUST place duplicate-suppression and blockhash-freshness checks within the transaction-processing engine's scheduling/consumption context, and remove them from the signature-verification step (which performs signature checking plus packet-level duplicate filtering)
- **FR-006**: The runtime execution layer MUST be represented as a library exercised inside both the block-production path (transaction processing workers) and the block-verification path (replay), not as a standalone pipeline stage between them and state storage
- **FR-007**: The lifecycle MUST show executed batches being recorded into the proof-of-history stream immediately upon execution completion, with the ledger clock running continuously and independently (tick generation), and slot completion handing accumulated entries to broadcast
- **FR-008**: Durable state persistence MUST be depicted as asynchronous relative to execution (deferred write-back consolidated around freeze/root boundaries), including in the leader path

**Vote Path & Finalization**

- **FR-009**: The model MUST include the complete vote return path: own vote generation gated by fork-choice rules (lockouts, thresholds, propagation check), publication outward, inbound votes arriving via gossip and via received blocks, threshold tracking for optimistic confirmation, lockout-based root advancement, and fork pruning
- **FR-010**: The model MUST distinguish optimistic confirmation from finalization and show the lockout mechanism (initial short lockout doubling per consecutive confirmation up to a bounded stack depth) that produces them

**Coverage Additions**

- **FR-011**: Three missing independent services MUST become first-class diagram nodes: the client-facing remote interface (true transaction entry point), the inbound cluster-vote listener, and the outbound vote publisher — connected per the hybrid depth rule (independent services as nodes; intra-component threads as detail-panel items)
- **FR-012**: Detail panels MUST reflect the real internal structure of their components, including: the dedicated vote worker and scheduler/worker split inside transaction processing; the ledger-clock recorder/service split; Merkle-root-signed erasure-coded fragments with chained roots for propagation; fragment signature verification against the scheduled leader for the slot; replay's parallel fork and transaction processing; and stake-weighted, seed-derived leader scheduling computed one epoch ahead
- **FR-013**: Content describing graphics-hardware signature offload MUST be removed everywhere; verification is CPU-parallel at the pinned release
- **FR-014**: Forwarding MUST be represented as a single first-class node named "Forwarding (Gulf Stream)", consolidating today's separate `gulf-stream` and `forwarding` components (id `forwarding` retained for stability). Its content MUST present Gulf Stream as the informal name for Solana's mempool-less push model while attributing all mechanics to real code paths (client/RPC push toward upcoming leaders, validator-side one-hop Forwarding Stage fed by signature verification, blockhash expiry bounding transaction lifetime instead of mempool dwell). Leader-schedule content duplicated there MUST move under `epoch-schedule`. Content claiming validators execute transactions ahead of their scheduled slots or that processing priority follows the forwarding validator's stake MUST NOT appear (buffering precedes leadership; execution ordering is fee/priority-based)

**Guided Tour**

- **FR-015**: The guided tour MUST be restructured (approximately twenty steps, count flexible) to cover the full corrected lifecycle including the vote return path and finalization, ordered by actual data flow
- **FR-016**: Tour steps whose subject component changes identity or position MUST be renumbered/re-targeted so navigation controls and annotations stay coherent

**Documentation & Consistency**

- **FR-017**: A findings report MUST exist under the feature directory listing every discrepancy found: affected component(s), the prior claim, the misconception classification, the correction, and proving citations for both sides
- **FR-018**: The automated data-consistency tests MUST be updated so the component set, connection set, and tour-step sequence remain mutually consistent under the corrected model
- **FR-019**: The project README's architecture summary MUST be updated to match the corrected model

**Process Constraints (user-mandated)**

- **FR-020**: All work MUST occur on the feature branch created from `main`; direct commits to `main` are forbidden
- **FR-021**: Each logical correction MUST be committed as its own conventional commit (docs/fix/chore), enabling item-by-item review
- **FR-022**: After every applied change, the full automated test suite and type-checking MUST pass before proceeding to the next change; failures block further work until resolved
- **FR-023**: Merging to `main` MUST happen only after all success criteria are met and the branch is reviewed as a whole

### Key Entities *(include if feature involves data)*

- **Component**: A validator building block shown on the diagram; attributes include identity, category/layer, purpose, role, mechanics description, sub-items, and citations. Some components are newly added (remote interface, vote listener, vote publisher); many are corrected.
- **Connection**: A directed data-flow edge between components with a label and kind; the union forms the pipeline topology, now including the vote return loop.
- **SimulationStep**: One guided-tour stop bound to a component with title, narration annotations, and ordering; the sequence is restructured.
- **AuditFinding**: One recorded discrepancy: location(s) affected, prior claim, classification (incorrect / misleading simplification / missing), correction, and paired citations (before-evidence where applicable, after-evidence mandatory).
- **Citation**: A pinned-release permalink plus optional line range and note; the sole acceptable evidence type.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of guided-tour steps trace a data flow consistent with the pinned-source behavior, as evidenced by per-step citations in the audit report
- **SC-002**: Every component detail panel contains at least one working citation that opens the pinned repository at the claimed file and line (sampled verification of at least 10 across categories passes 10/10)
- **SC-003**: Zero findings from the report remain unaddressed — each is either corrected in the app or explicitly dispositioned (labeled simplification / deferred with rationale) in the report
- **SC-004**: A first-time learner can follow one continuous tour from transaction submission to finalization, including how confirmation returns via the vote loop, without encountering a dead-end step
- **SC-005**: After every applied change the automated consistency suite passes fully, and the final merged state passes the suite plus static checks with zero failures
- **SC-006**: The report enables a contributor to re-audit against a future release by following its methodology section alone, without access to this session

## Assumptions

- The pinned Agave release v4.2.1 and its Git history remain publicly accessible on GitHub for the foreseeable future; permalinks pinning the tag are treated as stable
- Mainnet consensus at the pinned release remains the tower-based protocol; the successor protocol present in code but inactive on mainnet is out of scope for modeling, mentioned at most as a labeled forward-looking note
- Existing presentation (two view modes, annotation badge types, zoom-panel interaction pattern, visual styling) is retained; this feature corrects content and topology, not the interaction design
- Content language remains English; no localization work is included
- The existing automated consistency tests continue to define the minimum structural contract between data files and will be evolved, not deleted
- Research effort already invested in this session (architecture mapping of the pinned release) is a valid starting corpus, but every individual claim must still be re-verified against exact source lines during implementation
