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

## 3. Root GameState Domains

### Decision

MVP uses six first-level domains:

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

### Domain responsibilities

- `run` — scenario identity, phase/progression, current event, run seed, decision/history references.
- `project` — the five visible project meters and overall project status.
- `world` — hidden world state, reactive flags, relationship/trust data, and other narrative consequences.
- `player` — Action Points, undo usage, and other run-scoped player resources.
- `evidence` — discovered clues and Evidence Board state.
- `scoring` — Project Performance, PM Judgment, PMP-aligned accumulators, and other score inputs needed for ending evaluation.

Exact child fields remain subject to later decisions.

### Future character-domain rule

For MVP, character trust / relationship data remains under `world` rather than creating a separate first-level `characters` domain.

If future scenarios introduce sufficiently complex NPC state or behavior, the model may evolve to:

```ts
interface GameState {
  run: RunState;
  project: ProjectState;
  world: WorldState;
  characters: CharacterState;
  player: PlayerState;
  evidence: EvidenceState;
  scoring: ScoringState;
}
```

This is a **Future architecture option**, not an MVP requirement.

### Why

- Six domains are clear enough to prevent a monolithic state object.
- They map to product concepts rather than implementation details.
- Keeping characters under `world` avoids premature abstraction for a small fixed cast.
- The boundary remains easy to refactor later if NPC complexity materially increases.

## 4. Event State Mutation Model

### Decision

MVP uses a **declarative Effect system**.

Events and choices describe **what effect should happen**. They do not directly mutate `GameState` with event-specific code.

Conceptual flow:

```text
Player Choice
→ Effect[]
→ Effect Resolver
→ GameState
```

Illustrative event data:

```json
{
  "effects": [
    { "type": "meter_delta", "target": "morale", "value": -10 },
    { "type": "set_flag", "key": "burnout", "value": true }
  ]
}
```

The exact allowed effect types, target identifiers, validation rules, and bounds are defined by later sections of this specification.

### MVP guardrail

Do **not** embed arbitrary JavaScript callbacks or custom executable handlers inside normal event content.

Avoid event definitions such as:

```ts
onSelect: (state) => {
  state.project.morale -= 10;
  state.world.flags.burnout = true;
}
```

All standard gameplay consequences should pass through a whitelisted, testable Effect Resolver.

### Why

- Keeps event content data-driven.
- Makes event schemas validateable.
- Supports deterministic unit tests and replay/debug traces.
- Prevents product rules from leaking into UI components or one-off callbacks.
- Makes later content authoring safer for both humans and agents.
- Forces new behavior to become an explicit engine capability instead of hidden ad-hoc code.

### Future hybrid option

A hybrid model may be introduced later if a genuinely unique mechanic cannot be expressed through the declarative effect vocabulary.

If introduced, custom handlers must be:

- explicit,
- whitelisted,
- implemented in engine code rather than authored as arbitrary code inside JSON,
- used only when extending the declarative model would be materially worse.

This is a **Future architecture option**, not an MVP escape hatch.

## 5. Semantic Typed Effects

### Decision

Scenario and Event content uses **semantic typed effects**, not arbitrary state-path mutation.

Effects describe product meaning. The Effect Resolver owns the mapping from that meaning to the internal `GameState` structure.

Illustrative examples:

```json
{ "type": "meter_delta", "meter": "cat_morale", "value": -10 }
```

```json
{ "type": "flag_set", "flag": "burnout_pressure", "value": true }
```

```json
{ "type": "ap_delta", "value": 1 }
```

```json
{ "type": "evidence_add", "evidenceId": "earth-science-report-01" }
```

Conceptually, the engine may represent the union as:

```ts
type Effect =
  | MeterDeltaEffect
  | FlagSetEffect
  | TrustDeltaEffect
  | APDeltaEffect
  | EvidenceAddEffect
  | StatusSetEffect
  | ScoreContributionEffect;
```

The list above is illustrative, not yet the final MVP vocabulary.

### Content-contract guardrail

Scenario/Event authors must not use generic paths such as:

```json
{
  "type": "set",
  "path": "world.flags.burnout",
  "value": true
}
```

or:

```json
{
  "type": "delta",
  "path": "project.meters.morale",
  "value": -10
}
```

Event content should not need to know internal `GameState` paths.

If an engineering-only migration/debug utility later requires a generic patch operation, it may exist outside the scenario content contract. It must not become a normal authored Effect type.

### Why

- Decouples scenario content from internal state layout.
- Makes JSON Schema / TypeScript validation stronger.
- Allows the engine to centralize clamping, validation, logging, and telemetry.
- Reduces refactor cost when state internals change.
- Prevents agents or content authors from mutating arbitrary runtime state.
- Makes each Effect type represent an explicit product capability.

## Open Decisions

- Final MVP Effect vocabulary and target identifiers
- Hidden flag representation
- Meter effect bounds / preview behavior
- Evidence representation
- Scoring contribution representation
- PMP tag / coverage representation
- Event trigger / consequence rules
