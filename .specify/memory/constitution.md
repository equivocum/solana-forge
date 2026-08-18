# Solana Learn Lab Constitution

## Core Principles

### I. Progressive Complexity
Start with single transaction signing → layer RPC submission → validator processing → block finalization → fork resolution. Each layer builds on prior, never skipping steps. Learner must reproduce each stage locally before advancing.

### II. Visual-First Learning
Every Solana concept (PoH ticks, vote propagation, leader schedule, Merkle roots) must have: Mermaid diagram, terminal ASCII visualization, or step animation. No concept taught without visual representation of the block lifecycle.

### III. Annotated Execution
Every code line/command carries inline `// WHY:` and `// HOW:` comments mapping to block lifecycle stage. Cross-references: `// see: validator.rs:process_block()`. Annotations must explain the cryptographic or consensus purpose, not just syntax.

### IV. Decision Points Exposed
Make consensus decisions visible: leader selection (stake-weighted), vote tower (lockout), fork choice (heaviest fork), slashing conditions. Log each decision with `DECISION:` prefix showing inputs, weights, and outcome.

### V. Cryptography Transparency
Expose: keypair generation (ed25519), message signing, signature verification, hash chaining (PoH), Merkle tree construction, account hashing. Show raw bytes at each step. No black-box crypto operations.

### VI. RPC/Validator Separation
Enforce architectural boundary: **Client** builds/signs tx → **RPC** forwards, simulates, subscribes → **Validator** executes, votes, produces blocks. No direct client→validator calls. Each layer has distinct responsibility and failure modes.

## Visualization Standards

All visualizations must follow these standards:
- **Flowcharts**: Mermaid.js syntax for block lifecycle, consensus flow, fork resolution
- **Terminal State**: ASCII/ANSI diagrams showing account state, PoH ticks, vote towers
- **Color Coding**: Green=finalized, Yellow=processing, Red=forked, Blue=PoH ticks
- **Frame-by-Frame**: PoH tick visualization shows hash chain progression per slot
- **Cross-References**: Every diagram includes `// REF: <file:line>` linking to implementation

## Annotation Standards

Code and command annotations follow this format:
- **Stage Header**: `// STAGE: <lifecycle-phase>` at function/module entry (e.g., `STAGE: tx_signing`, `STAGE: rpc_submit`, `STAGE: validator_execute`, `STAGE: block_finalize`, `STAGE: fork_resolution`)
- **Why Inline**: `// WHY: <consensus-or-crypto-reason>` on non-obvious lines
- **Cross-Reference**: `// REF: <file:line>` linking related concepts across layers
- **Decision Marker**: `// DECISION: <consensus-point> inputs=<...> outcome=<...>` at every consensus branch
- **Byte Visibility**: `// BYTES: <hex>` showing raw cryptographic material where educational

## Game Architecture Constraints

The manufacturing game must maintain 1:1 mapping to Solana concepts:
- **Factory** = Validator (block producer)
- **Conveyor Belt** = PoH (continuous hash chain, fixed tick rate)
- **Raw Material** = Transaction (user-submitted, signed payload)
- **QC Station** = Voting (validator votes on valid blocks)
- **Shipment** = Finalized Block (committed, rooted in fork choice)
- **Defective Batch** = Fork (competing history, resolved by heaviest fork)
- **Shift Schedule** = Leader Schedule (stake-weighted, epoch-based)
- **Quality Metrics** = Vote Tower / Lockout (commitment depth)

No game mechanic may exist without direct Solana counterpart. All game state transitions must be annotated with corresponding Solana runtime transition.

## Learning Milestone Gates

Progression requires passing each gate with working code + visualization:

| Gate | Name | Requirement | Verification |
|------|------|-------------|--------------|
| 1 | **Tx Signing** | Generate keypair, sign message, verify signature locally | `npm run test:gate1` shows ed25519 sign/verify |
| 2 | **RPC Submit** | Build tx, send via RPC, receive signature, poll status | `npm run test:gate2` shows RPC response + simulation |
| 3 | **Validator Process** | Run local validator, submit tx, observe logs: execute → vote → produce | `npm run test:gate3` captures validator log stages |
| 4 | **Block Finalize** | Confirm block rooted, query finalized slot, show fork choice | `npm run test:gate4` shows commitment level = Finalized |
| 5 | **Fork Resolution** | Create competing forks, observe heaviest-fork win, log slashing | `npm run test:gate5` demonstrates fork choice rule |

Each gate must produce: working code, Mermaid diagram, terminal visualization, annotated execution log.

## Governance

### Structured Amendment Process
- **Proposal**: Document change with rationale in `AMENDMENTS.md` including affected principles/sections
- **Review**: Verify no principle contradiction; assess impact on existing gates/visualizations/annotations
- **Versioning**: Semantic versioning — MAJOR for principle removal/redefinition, MINOR for new principle/section, PATCH for clarifications
- **Migration**: Note all code/docs impacted; provide migration steps for each affected gate
- **Approval**: Self-approval with 24-hour reflection period for MAJOR changes; immediate for MINOR/PATCH

### Compliance Review
Before each milestone gate implementation:
- Verify code follows all 6 core principles
- Confirm visualization standards met
- Validate annotation standards applied
- Check game architecture mapping holds
- Run gate tests to confirm progression

### Git Flow Process
All changes to this constitution and project code MUST follow Git Flow:
1. **Issue**: Create GitHub issue describing the change and rationale
2. **Branch**: Create feature branch from `main` named `feature/<issue-number>-<short-description>`
3. **Commit**: Make changes with conventional commits (feat/fix/docs/chore)
4. **PR**: Open Pull Request referencing issue; require CI pass and self-review
5. **Merge**: Squash merge to `main` after approval; delete branch

**Version**: 1.0.1 | **Ratified**: 2026-08-18 | **Last Amended**: 2026-08-18