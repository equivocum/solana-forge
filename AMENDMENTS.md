# Amendments

Structured record of constitution changes per the Governance amendment process.

## v1.1.0 — 2026-08-25

**Type**: MINOR (new principle added; no existing principle removed or redefined)

### Added: Principle VII — Incremental Reviewable Changes

All changes are applied step by step. Each step must be fully complete — implemented, tested, and type-checked green, with no partial state carried forward — before the next step begins. Each committed change unit MUST remain within 500 changed lines for easier review; larger corrections MUST be split into ordered sub-commits.

**Rationale**: The Agave accuracy audit (issue [#8](https://github.com/equivocum/solana-forge/issues/8), branch `feature/8-agave-accuracy-audit`) produces many small factual corrections across shared data files. Bundled changes are hard to review item-by-item and risk leaving the suite red between commits. A hard size cap plus step-completeness keeps every commit independently reviewable and revertable.

**Review**: No contradiction with existing principles I–VI; complements Git Flow's conventional-commit requirement.

**Migration / impact on existing artifacts**:
- `specs/003-agave-accuracy-audit/spec.md`: new process constraint FR-024
- `specs/003-agave-accuracy-audit/tasks.md`: Organization header + Commit-discipline rule enforce ≤500-line, fully-complete commits; T022 split into six one-component sub-commits
- No code impact (principle is prospective)

## v1.2.0 — 2026-08-26

**Type**: MINOR (two new principles added; no existing principle removed or redefined)

### Added: Principle VIII — Reuse First, No Duplication

Before adding any new code, make a best effort to reuse existing components, hooks, services, styles, and data exports. When reuse is impossible, new code MUST be modular and extendable: single-responsibility modules, explicit interfaces, shared sources of truth for tokens/mappings (a value defined twice is a defect). Duplicating existing logic instead of extracting and sharing it is forbidden.

**Rationale**: Requested during particle-map planning (issue [#11](https://github.com/equivocum/solana-forge/issues/11)): the codebase already carries duplication (e.g., `ViewMode` declared in two files, category color maps living inside a view component) that this feature must not amplify.

**Review**: No contradiction with principles I–VII; strengthens VII by keeping change units small and shared modules stable.

### Added: Principle IX — Visual Excellence

Every user-facing surface MUST meet a high visual bar comparable to leading comparable products — deliberate motion, consistent color language, polished states (hover/focus/active), and coherent typography. Aesthetics are part of the definition of done, not decoration added later; UI work is not complete until it looks exceptional.

**Rationale**: The product is an educational visualization; presentation quality is inseparable from learning value (Principle II). The particle-map feature explicitly targets "amazing looking design comparable with available alternatives".

**Review**: No contradiction; operationalizes Principle II for all future surfaces.

**Migration / impact on existing artifacts**:
- `specs/004-particle-map-ui/*`: plan-level reuse inventory and modular structure follow Principle VIII; visual polish criteria embedded in tasks and quickstart per Principle IX
- Prospective only; no retroactive refactors mandated (existing duplication may be extracted opportunistically when touched)
