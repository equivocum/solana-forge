# Research: Solana Block Lifecycle Learning Game

**Date**: 2026-08-18 | **Branch**: `001-solana-block-lifecycle-game`

## Summary

All NEEDS CLARIFICATION items resolved. Key decisions documented below with rationale and alternatives considered.

## Technical Decisions

### 1. napi-rs + Agave Crates Integration

**Decision**: Use napi-rs v3 to wrap Solana Agave crates (solana-poh, solana-runtime, solana-ledger, solana-vote-program) as native Node.js modules

**Rationale**:
- Agave crates are Rust-only; napi-rs provides FFI bridge to TypeScript
- Native execution preserves validator behavior fidelity
- Educational wrapper can expose callback hooks for annotations

**Alternatives Considered**:
- Reimplement validator logic in TypeScript: Rejected — would lose fidelity of real Solana internals
- Use @solana/web3.js SDK only: Rejected — doesn't expose internal validator state needed for annotations
- WebAssembly compilation: Rejected — napi-rs has better Rust integration and debugging support

### 2. React + Vite + TypeScript Frontend

**Decision**: Vite 5 with React 18+ and TypeScript 5+

**Rationale**:
- Spec confirms React + Vite + TypeScript
- Fast HMR for development iteration
- Strong TypeScript support for type safety
- Vite's native ESM development server

**Alternatives Considered**:
- Next.js: Rejected — unnecessary SSR/SSG complexity for local tool
- Create React App: Rejected — deprecated, slower builds
- Svelte/SvelteKit: Rejected — spec mandates React

### 3. Mermaid.js Integration

**Decision**: Use @mermaid-js/mermaid-react for diagram rendering

**Rationale**:
- Constitution requires Mermaid.js syntax for flowcharts
- React wrapper provides component-based integration
- Supports lifecycle diagrams, fork resolution visualization

**Alternatives Considered**:
- D3.js: Rejected — more complex, no Mermaid syntax support
- React Flow: Rejected — different paradigm, Constitution specifies Mermaid
- Raw SVG: Rejected — harder to maintain, no diagram-as-code approach

### 4. Ed25519 Keypair Generation

**Decision**: Use @noble/ed25519 for browser-compatible ed25519 operations

**Rationale**:
- Pure JavaScript implementation, no native dependencies
- Browser and Node.js compatible
- Matches Solana's ed25519 curve usage
- Supports keypair generation, signing, verification

**Alternatives Considered**:
- @solana/web3.js Ed25519Program: Rejected — higher level, less educational transparency
- tweetnacl: Rejected — older, less maintained
- node crypto module: Rejected — not browser compatible

### 5. Variable Speed Simulation

**Decision**: Custom simulation engine with configurable tick rate and animation frame control

**Rationale**:
- Spec requires variable speed with slow-motion toggle
- Default: real-time (~400ms/tick matching Solana's slot time)
- Slow-motion: 2-4 second ticks with step-by-step mode
- RequestAnimationFrame for smooth 60fps animations

**Alternatives Considered**:
- Fixed speed only: Rejected — user wants variable speed
- Web Worker based: Rejected — unnecessary complexity for educational tool
- Web Animations API: Rejected — less control over simulation state

### 6. Game State Persistence

**Decision**: localStorage with JSON serialization, IndexedDB fallback for large data

**Rationale**:
- Spec requires localStorage/IndexedDB persistence
- localStorage for small state (progress, preferences)
- IndexedDB for large state (transaction history, annotation logs)
- Last-write-wins per clarification (no conflict resolution)

**Alternatives Considered**`
- Server-side storage: Rejected — local-first requirement
- localStorage only: Rejected — size limits (~5MB) insufficient for transaction history
- IndexedDB only: Rejected — localStorage simpler for small state

### 7. Error Handling Strategy

**Decision**: Mirror real Solana error behavior with educational display, no halting

**Rationale**:
- User clarified: simulate real Solana experience, show errors for education
- RPC errors, transaction failures, validator errors all displayed
- Simulation continues to show downstream effects
- Annotations explain error context and resolution

**Alternatives Considered**:
- Halt on error: Rejected — user wants to see error propagation
- Skip errors: Rejected — loses educational value
- Two-mode (strict/lenient): Rejected — unnecessary complexity

## Dependencies Summary

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18+ | UI framework |
| vite | 5+ | Build tool |
| typescript | 5+ | Type safety |
| @mermaid-js/mermaid-react | latest | Diagram rendering |
| @noble/ed25519 | latest | Cryptographic operations |
| napi-rs | 3+ | Rust FFI bridge |
| solana-poh | (via napi) | PoH simulation |
| solana-runtime | (via napi) | Runtime simulation |
| solana-ledger | (via napi) | Ledger simulation |
| solana-vote-program | (via napi) | Vote program |
| vitest | latest | Unit testing |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| napi-rs build complexity | High | Use pre-built binaries where possible; provide build scripts |
| Agave crate version drift | Medium | Pin to v2.0.x; document upgrade path |
| Browser compatibility | Low | Target Chrome/Firefox/Safari; use feature detection |
| Performance with full fidelity | Medium | Variable speed toggle; frame skip in slow-motion |

## Open Questions Resolved

1. ~~How to integrate Rust Agave crates with TypeScript?~~ → napi-rs v3
2. ~~How to render Mermaid diagrams in React?~~ → @mermaid-js/mermaid-react
3. ~~How to handle ed25519 in browser?~~ → @noble/ed25519
4. ~~How to implement variable speed?~~ → Custom simulation engine with tick rate control
5. ~~How to persist game state?~~ → localStorage + IndexedDB with last-write-wins
