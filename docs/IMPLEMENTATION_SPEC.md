# Pawject Meownager — Implementation-Ready Specification

Status: In progress

This document translates the approved GDD into implementation contracts for Codex. Product behavior remains governed by the canonical design docs under `/docs`.

## 1. Game State Architecture

### Decision

Use **one canonical Root `GameState` with modular child state domains**.

The engine should treat the root state as the authoritative snapshot for a run, while keeping responsibilities separated internally.

Illustrative shape only — field names and exact contracts are not yet final:

```ts
interface GameState {
  run: RunState;
  project: ProjectState;
  world: WorldState;
  player: PlayerState;
  evidence: EvidenceState;
  scoring: ScoringState;
}
```

### Why

- Keeps save/load/debug snapshots straightforward.
- Avoids a single flat object becoming unmanageable.
- Supports deterministic event tests and replay reproduction.
- Avoids premature complexity from independent system-owned state stores.
- Leaves room for future systems without forcing them into UI components.

### Guardrail

This decision defines **state ownership and shape strategy only**. It does not yet define:

- exact child domains,
- persistence boundaries,
- event contract,
- mutation API,
- meter semantics,
- hidden-flag semantics,
- scoring formulas,
- PMP scoring logic.

These remain open and must be specified before gameplay implementation relies on them.

## Open Decisions

- Runtime state vs cross-run meta state boundary
- Event state mutation model
- Hidden flag representation
- Meter effect representation
- Evidence representation
- Scoring contribution representation
- PMP tag / coverage representation
- Event trigger / consequence rules
