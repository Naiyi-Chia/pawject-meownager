# Pawject Meownager — Implementation-Ready Specification

Status: In progress

This document translates the approved GDD into implementation contracts for Codex. Product behavior remains governed by the canonical design docs under `/docs`.

## 1. Game State Architecture

### Decision

Use **one canonical Root `GameState` with modular child state domains**.

The engine should treat the root state as the authoritative snapshot for a single run, while keeping responsibilities separated internally.

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
- event contract,
- mutation API,
- meter semantics,
- hidden-flag semantics,
- scoring formulas,
- PMP scoring logic.

These remain open and must be specified before gameplay implementation relies on them.

## 2. Run State vs Meta State

### Decision

Keep **single-run runtime state** and **cross-run persistent meta state** separate.

`GameState` represents only the current run and is reset when a new run starts.

`MetaState` represents data that persists across runs.

Illustrative shape only:

```ts
interface MetaState {
  playCount: number;
  bestScore: number;
  unlockedEndings: string[];
  discoveredEasterEggs: string[];
}
```

### Why

- Run data and meta progression have different lifecycles.
- New Game should reset `GameState` without erasing player history.
- Deterministic run tests should not be polluted by previous runs.
- MVP localStorage persistence can focus on `MetaState`.
- Future settings / achievements can later introduce a higher-level `AppState` if needed without changing the run contract.

### MVP persistence boundary

For MVP:

- `GameState` = current-run snapshot / runtime state.
- `MetaState` = cross-run local persistence.
- No mid-run cloud save is required.

## Open Decisions

- Exact `GameState` child domains
- Event state mutation model
- Hidden flag representation
- Meter effect representation
- Evidence representation
- Scoring contribution representation
- PMP tag / coverage representation
- Event trigger / consequence rules
