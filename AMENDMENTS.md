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
