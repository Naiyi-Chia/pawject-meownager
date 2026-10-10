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

## 6. Typed Hidden Flag Registry

### Decision

Hidden flags use a **typed registry** rather than unrestricted key-value pairs or an all-boolean map.

Each hidden flag must be formally registered with:

- a stable key,
- an explicit value type,
- allowed values or bounds where relevant,
- a default value,
- a short semantic description.

Illustrative definitions:

```ts
type HiddenFlagDefinition =
  | {
      key: "burnout_pressure";
      type: "boolean";
      default: false;
    }
  | {
      key: "speak_up_safety";
      type: "enum";
      values: ["low", "medium", "high"];
      default: "medium";
    }
  | {
      key: "baseline_alignment";
      type: "enum";
      values: ["aligned", "uncertain", "broken"];
      default: "uncertain";
    };
```

For MVP, supported value categories should stay intentionally small:

- `boolean`
- `enum`
- bounded numeric values only when a genuine product need exists

### Event usage

Events may set only registered flags and only to values valid for that flag.

```json
{
  "type": "flag_set",
  "flag": "speak_up_safety",
  "value": "low"
}
```

Invalid examples include:

```json
{ "type": "flag_set", "flag": "speak_up_safety", "value": "bad" }
```

and any unknown / misspelled flag key.

### Hidden flag boundary

Hidden flags represent **discrete hidden world conditions** that influence reactive content, branching, consequences, or endings.

Do not use the flag registry as a generic dumping ground for all runtime values.

Examples of data that should remain outside flags:

- character trust / relationships → structured data under `world`
- Action Points / undo → `player`
- visible project meters / status → `project`
- Evidence Board state → `evidence`
- scores / judgment / PMP profile → `scoring`

### Why

- Prevents mutually contradictory boolean flags from accidentally modeling a state machine.
- Prevents free-form values such as `low`, `LOW`, `poor`, and `bad` from meaning the same thing inconsistently.
- Supports strong TypeScript / JSON Schema validation and autocomplete.
- Makes trigger rules safer and easier to inspect.
- Improves telemetry consistency.
- Keeps hidden-state semantics explicit and reviewable as product behavior.

## 7. Meter Simulation and Player-Facing Visibility

### Decision

Use **precise internal simulation values** with **qualitative player-facing feedback**.

The five visible project meters use numeric internal values so effects, scoring, tests, and balancing remain deterministic. The player-facing UI should not routinely expose exact deltas.

MVP internal meter model:

```text
Range: 0–100
Effect input: numeric delta
Resolver behavior: clamp final value to 0–100
```

Illustrative authored effect:

```json
{
  "type": "meter_delta",
  "meter": "cat_morale",
  "value": -12
}
```

The player should normally see an approximate consequence such as:

```text
😼 Cat Morale ↓
Significant morale pressure
```

rather than:

```text
Cat Morale -12
```

### Visibility is separate from simulation truth

An effect's actual numeric impact and what the player is allowed to know are separate concerns.

Normal consequences may be previewed qualitatively, while latent consequences may remain hidden.

### Product rule

**Simulation truth is precise; player-facing information may be intentionally approximate or incomplete.**

This supports practical shortcuts and latent risk: a short-term attractive option must not be undermined by the UI revealing every hidden downstream cost in advance.

### Why

- Preserves deterministic simulation and balancing.
- Prevents the game from becoming spreadsheet optimization.
- Better reflects real PM decisions, where impacts are often directional rather than numerically certain.
- Allows visible trade-offs without exposing hidden consequences.
- Keeps scoring/test logic independent from presentation wording.

## 8. Effect Visibility States

### Decision

MVP uses exactly three player-facing visibility states for authored effects:

```ts
type EffectVisibility = "preview" | "post_choice" | "latent";
```

Semantics:

- `preview` — the player receives a qualitative indication before choosing; the consequence is also visible after resolution.
- `post_choice` — the effect is not previewed before choosing, but its consequence is surfaced immediately after the choice resolves.
- `latent` — the effect is neither previewed nor immediately revealed; it may surface later through dialogue, reactive events, evidence, crises, or ending logic.

Illustrative effects:

```json
{
  "type": "meter_delta",
  "meter": "mission_budget",
  "value": -8,
  "visibility": "preview"
}
```

```json
{
  "type": "meter_delta",
  "meter": "mission_risk",
  "value": 10,
  "visibility": "latent"
}
```

### Guardrail

Visibility controls **information disclosure**, not whether the simulation effect is applied. A `latent` effect still updates the underlying `GameState` when resolved; it is simply withheld from immediate player feedback.

Do not add free-form per-effect reveal scripting in MVP. If a latent consequence later becomes narratively visible, that should happen through normal Event / Trigger / Evidence content rather than bespoke visibility callbacks.

### Why

- Maps cleanly to anticipated trade-offs, discovered consequences, and hidden downstream risk.
- Supports Practical Shortcut design without giving away every latent penalty.
- Keeps player information intentionally incomplete while preserving deterministic simulation.
- Avoids a premature before/after/reveal rules engine.

## 9. Qualitative Meter Magnitude Thresholds

### Decision

MVP uses **one shared qualitative magnitude table across all five project meters**.

The player-facing magnitude is derived from the absolute numeric delta:

```text
|Δ| = 0      → no displayed change
|Δ| = 1–5    → slight
|Δ| = 6–10   → moderate
|Δ| ≥ 11     → significant
```

Direction is derived separately from the sign of the effect:

```text
+8  → moderate increase
-14 → significant decrease
```

The qualitative magnitude is therefore derived by the engine rather than authored independently in Event JSON.

### Guardrail

Do not allow normal scenario content to override the derived magnitude with a free-form field such as `displayMagnitude` in MVP.

This prevents simulation truth and player-facing descriptions from drifting apart, such as a `-3` delta being manually labeled `significant`.

If playtesting later shows that a specific meter needs materially different sensitivity, per-meter thresholds may be introduced as a future tuning layer. That change should be evidence-driven rather than pre-optimized now.

### Why

- All five meters already share a normalized 0–100 internal scale.
- A common mapping is predictable, testable, and easy to balance.
- Keeps content authoring simpler and reduces subjective magnitude labeling.
- Preserves room for future per-meter tuning without making it an MVP requirement.

## 10. Evidence Definition and Runtime Instance

### Decision

Use **Static Evidence Definitions + Runtime Evidence Instances**.

Evidence content belongs to scenario authoring data, while discovery and lifecycle state belong to the current run.

Illustrative static definition:

```ts
interface EvidenceDefinition {
  id: string;
  title: string;
  sourceType: string;
  sourceLabel: string;
  content: string;
  truthCompatibility?: string[];
}
```

Illustrative runtime instance:

```ts
interface EvidenceInstance {
  evidenceId: string;
  discoveredAtEventId: string;
  status: EvidenceStatus;
  supersededBy?: string;
}
```

### Responsibility split

`EvidenceDefinition` answers:

- What is this evidence?
- Who / what is its source?
- What content should the player read?
- Under which Hidden Truth configurations may it be available?

`EvidenceInstance` answers:

- Has the player discovered it in this run?
- At which Event / progression point was it discovered?
- What is its current lifecycle state on the Evidence Board?

### GameState rule

`GameState.evidence` stores runtime references / metadata, not duplicate full narrative content.

This allows the same evidence definition to be:

- discovered at different moments in different runs,
- absent in some runs,
- superseded later,
- selected conditionally based on Hidden Truth while keeping authored content centralized.

### Why

- Separates static scenario content from mutable run state.
- Keeps run snapshots smaller and easier to debug.
- Supports deterministic Evidence Board testing.
- Avoids duplicating narrative text into `GameState`.
- Supports replay variation and Hidden Truth compatibility cleanly.

## 11. Evidence Lifecycle

### Decision

MVP Evidence Instances use a three-state lifecycle plus an optional replacement relationship:

```ts
type EvidenceStatus = "current" | "outdated" | "superseded";

interface EvidenceInstance {
  evidenceId: string;
  discoveredAtEventId: string;
  status: EvidenceStatus;
  supersededBy?: string;
}
```

Semantics:

- `current` — the evidence remains relevant to the player's present decision context.
- `outdated` — the evidence is older or no longer fully representative, but may still matter as historical context.
- `superseded` — a newer evidence item has formally replaced it as the stronger basis for the same decision context.

When `status` is `superseded`, `supersededBy` may reference the replacing `evidenceId`.

Illustrative runtime state:

```ts
{
  evidenceId: "launch-risk-report-v1",
  discoveredAtEventId: "S01-BOSS-INV-01",
  status: "superseded",
  supersededBy: "launch-risk-report-v2"
}
```

### Evidence Board rule

Superseded or outdated evidence is **not deleted from history**. The Evidence Board should preserve what the player knew at the time so conflicting, stale, and later-corrected information can remain inspectable.

This is especially important for Fake Green and Boss judgment, where the quality of the player's decision is evaluated against the evidence available at that moment rather than hindsight.

### MVP boundary

Do not introduce a general evidence-relationship graph in MVP.

Relationships such as `supports`, `contradicts`, or arbitrary graph edges remain Future options. Conflicting evidence can be presented side by side through authored content and board presentation without requiring a graph engine.

### Why

- Preserves the history of how a reasonable but outdated belief formed.
- Distinguishes merely old information from information explicitly replaced by newer evidence.
- Makes supersession inspectable without deleting evidence.
- Supports evidence-at-the-time judgment and replay/debug analysis.
- Provides enough structure for MVP without building a full evidence graph.

## 12. Evidence Discovery Progression Marker

### Decision

Evidence discovery is anchored to **game progression**, not to a real-world timestamp.

For MVP, `EvidenceInstance` stores the stable Event ID at which the evidence became available to the player:

```ts
interface EvidenceInstance {
  evidenceId: string;
  discoveredAtEventId: string;
  status: EvidenceStatus;
  supersededBy?: string;
}
```

Examples:

```ts
{
  evidenceId: "earth-science-report-01",
  discoveredAtEventId: "S01-BOSS-INV-02",
  status: "current"
}
```

Exploration discoveries should likewise reference the corresponding exploration Event ID rather than introducing a second gameplay clock.

### Judgment rule

When a Decision Package or Boss decision is evaluated, the engine should determine which evidence had been discovered by that decision point and evaluate PM Judgment against that available set.

Conceptually:

```text
Decision Event X
→ determine evidence discovered before / at X
→ evaluate judgment against that evidence set
→ do not use later evidence as hindsight
```

This supports the locked product rule that **judgment quality is based on evidence available at the time**.

### Telemetry boundary

Real-world timestamps may be captured later in analytics / telemetry logs for session analysis, but they are not part of the gameplay Evidence contract and must not affect deterministic run logic.

### Why

- Directly supports evidence-at-the-time PM Judgment scoring.
- Keeps replay and deterministic tests independent from wall-clock time.
- Uses Scenario Event IDs as the canonical progression anchors instead of inventing a second time system.
- Makes debug traces explainable: reviewers can see exactly which evidence existed before a specific decision.
- Keeps analytics concerns separate from product-state semantics.

## Open Decisions

- Final MVP Effect vocabulary and target identifiers
- Initial MVP hidden-flag registry entries and defaults
- Scoring contribution representation
- PMP tag / coverage representation
- Event trigger / consequence rules
