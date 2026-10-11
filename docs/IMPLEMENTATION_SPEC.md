# Pawject Meownager — Implementation-Ready Specification

Status: Contract baseline; event content and tuning remain in progress.

This document translates the approved product design into implementation contracts for Codex. Product behavior remains governed by the canonical design docs under `/docs`.

If this document conflicts with the approved GDD, Scenario, Scoring, PMP Mapping, or Decision Log, the product document wins and this contract must be corrected before implementation continues.

## 1. Decision Rights

This document may make technical representation decisions when they do not change player-facing product behavior.

Technical representation includes:

- TypeScript / JSON data shapes,
- registries and identifiers,
- resolver boundaries,
- validation rules,
- deterministic aggregation mechanics,
- separation of runtime and authored data.

It must not independently change:

- gameplay trade-offs,
- hidden-state meaning,
- scoring intent or PM Style meaning,
- player information disclosure,
- event branching outcomes,
- PMP interpretation,
- MVP scope.

If a technical choice would change one of those product behaviors, stop and return to a product decision.

---

## 2. State Architecture

### Canonical run state

MVP uses one canonical root `GameState` with modular child domains:

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

Responsibilities:

- `run` — scenario identity, phase/progression, current event, run seed, decision/history references.
- `project` — five visible project meters plus overall project status.
- `world` — hidden flags, relationship/trust state, Hidden Truth, and narrative consequences.
- `player` — Action Points, undo usage, and other run-scoped resources.
- `evidence` — discovered Evidence instances and board lifecycle state.
- `scoring` — decision-scoring records and derived result accumulators.

For MVP, character relationship state stays under `world`; a separate first-level `characters` domain is Future architecture only.

### Run state vs meta state

`GameState` is single-run state and resets on New Game.

`MetaState` persists across runs:

```ts
interface MetaState {
  playCount: number;
  bestScore?: number;
  unlockedEndings: string[];
  discoveredEasterEggs: string[];
}
```

MVP persistence boundary:

- current run: runtime memory only,
- cross-run meta: localStorage,
- no cloud save,
- no required mid-run save.

---

## 3. Stable IDs and Registries

Authored content must reference stable semantic IDs rather than mutable display text or arbitrary object paths.

### Event ID

General format:

```text
S<scenario>-<namespace>-<sequence>
```

Examples:

```text
S01-CORE-01
S01-EXP-CAFE-01
S01-REACT-01
S01-BOSS-INV-01
S01-BOSS-DEC-01
```

MVP namespaces may include:

- `CORE`
- `EXP-<LOCATION>`
- `REACT`
- `LIGHT`
- `BOSS-INV`
- `BOSS-DEC`

Event ID is identity, not presentation order. Renaming or moving an event must not automatically change its ID. Gaps are preferable to renumbering released IDs.

### Meter IDs

The five project meters use these stable IDs:

```ts
type MeterId =
  | "schedule"
  | "cost"
  | "team"
  | "risk"
  | "stakeholder";
```

Player labels remain:

- `schedule` → Launch Window
- `cost` → Mission Budget
- `team` → Cat Morale
- `risk` → Mission Risk
- `stakeholder` → Earth–Meow Trust

Each meter definition owns its directionality so the engine never assumes that a larger number always means better:

```ts
interface MeterDefinition {
  id: MeterId;
  min: 0;
  max: 100;
  higherIsBetter: boolean;
}
```

For MVP:

- schedule / cost / team / stakeholder: `higherIsBetter = true`
- risk: `higherIsBetter = false`

### Project status

```ts
type ProjectStatus =
  | "on_track"
  | "at_risk"
  | "critical"
  | "uncertain";
```

Status is not a sixth meter and is never treated as spendable resource state.

### Other registries

The engine must also maintain typed registries for:

- hidden flags,
- relationships / trust targets,
- Evidence definitions,
- PMP skill tags.

Content may reference only registered IDs.

---

## 4. Declarative Effect System

Events and choices describe **what consequence happens**. They do not directly mutate `GameState` with event-specific callbacks.

```text
Player action
→ Effect[]
→ Effect Resolver
→ GameState
→ trigger evaluation
```

Normal authored content must not contain arbitrary JavaScript handlers or generic state-path mutation.

### Final MVP Effect vocabulary

```ts
type Effect =
  | MeterDeltaEffect
  | FlagSetEffect
  | TrustDeltaEffect
  | APDeltaEffect
  | EvidenceAddEffect
  | EvidenceStatusSetEffect
  | ProjectStatusSetEffect;
```

#### `meter_delta`

```ts
interface MeterDeltaEffect {
  type: "meter_delta";
  meter: MeterId;
  value: number;
  visibility: EffectVisibility;
}
```

Resolver clamps final meter values to 0–100.

#### `flag_set`

```ts
interface FlagSetEffect<K extends HiddenFlagKey = HiddenFlagKey> {
  type: "flag_set";
  flag: K;
  value: HiddenFlagValue<K>;
}
```

Flag changes do not directly render player-facing feedback. Their consequences become visible through normal narrative, meter, status, Evidence, or reactive Event content.

#### `trust_delta`

```ts
interface TrustDeltaEffect {
  type: "trust_delta";
  relationshipId: RelationshipId;
  value: number;
  visibility: EffectVisibility;
}
```

Bounds belong to the relationship definition rather than a universal trust scale.

#### `ap_delta`

```ts
interface APDeltaEffect {
  type: "ap_delta";
  value: number;
}
```

AP resolver enforces the approved phase gain and bank-cap rules.

#### `evidence_add`

```ts
interface EvidenceAddEffect {
  type: "evidence_add";
  evidenceId: EvidenceId;
}
```

Discovery records the current Event ID as `discoveredAtEventId`.

#### `evidence_status_set`

```ts
interface EvidenceStatusSetEffect {
  type: "evidence_status_set";
  evidenceId: EvidenceId;
  status: EvidenceStatus;
  supersededBy?: EvidenceId;
}
```

`supersededBy` is valid only when status is `superseded`.

#### `project_status_set`

```ts
interface ProjectStatusSetEffect {
  type: "project_status_set";
  status: ProjectStatus;
  visibility: EffectVisibility;
}
```

### Explicit non-effects

The following do **not** belong in the normal Effect union:

- scoring contributions,
- PMP tags,
- event progression / ordering,
- Hidden Truth selection,
- arbitrary `set(path, value)`,
- arbitrary `delta(path, value)`.

Scoring and learning metadata are recorded separately from state mutation.

---

## 5. Effect Visibility and Player Feedback

```ts
type EffectVisibility = "preview" | "post_choice" | "latent";
```

Semantics:

- `preview` — qualitative effect is visible before choosing and remains visible after resolution.
- `post_choice` — not shown before choosing; surfaced after resolution.
- `latent` — neither previewed nor immediately revealed; may surface later through normal content.

Visibility controls information disclosure, not whether the underlying state change applies.

### Meter magnitude mapping

MVP derives qualitative magnitude from absolute delta:

```text
|Δ| = 0      → no displayed change
|Δ| = 1–5    → slight
|Δ| = 6–10   → moderate
|Δ| ≥ 11     → significant
```

Direction is derived separately from the sign and the meter definition's `higherIsBetter` metadata.

Normal Event JSON must not override this with hand-authored magnitude labels.

Product rule:

> Simulation truth is precise; player-facing information may be intentionally approximate or incomplete.

---

## 6. Hidden Flag Registry

Hidden flags use typed definitions, not an unrestricted dictionary.

```ts
type HiddenFlagDefinition =
  | BooleanFlagDefinition
  | EnumFlagDefinition
  | BoundedNumberFlagDefinition;
```

Each definition requires:

- stable key,
- value type,
- allowed values or bounds,
- default value,
- short semantic description.

MVP should prefer `boolean` and `enum`; bounded numbers require a genuine scenario need.

Hidden flags model discrete hidden world conditions only. Do not store meters, AP, Evidence instances, relationships, or score state in this registry.

### Scenario 01 initial registry baseline

Only flags supported by already-approved Scenario 01 facts are locked at this stage:

```ts
interface Scenario01HiddenFlags {
  information_integrity: "healthy" | "degraded" | "distorted";
  speak_up_safety: "low" | "medium" | "high";
  overtime_pressure: "low" | "medium" | "high";
  baseline_alignment: "aligned" | "uncertain" | "misaligned";
}
```

Initial values:

```ts
const scenario01InitialHiddenFlags: Scenario01HiddenFlags = {
  information_integrity: "degraded",
  speak_up_safety: "low",
  overtime_pressure: "high",
  baseline_alignment: "misaligned",
};
```

These values encode already-approved story facts: the dashboard is stale / misleading, Engineering has been in sustained overtime, people are afraid to surface bad news, and the working baseline is not actually aligned.

GDD examples such as `supplier_pressure`, `scope_creep`, `technical_debt`, `media_attention`, and `governance_readiness` are **not automatically MVP registry entries**. Add one only when authored Scenario 01 content actually needs it.

Hidden Truth remains separate from the generic flag registry because it is a scenario-level run configuration selected at run start.

---

## 7. Evidence Contract

Use Static Evidence Definitions + Runtime Evidence Instances.

```ts
interface EvidenceDefinition {
  id: EvidenceId;
  title: string;
  sourceType: string;
  sourceLabel: string;
  content: string;
  truthCompatibility?: HiddenTruthId[];
}
```

```ts
type EvidenceStatus = "current" | "outdated" | "superseded";

interface EvidenceInstance {
  evidenceId: EvidenceId;
  discoveredAtEventId: EventId;
  status: EvidenceStatus;
  supersededBy?: EvidenceId;
}
```

Rules:

- static narrative content stays in Evidence definitions,
- `GameState.evidence` stores runtime references / lifecycle metadata,
- outdated or superseded Evidence remains visible in history,
- no general Evidence relationship graph in MVP,
- `supports` / `contradicts` edges are Future scope,
- real-world timestamps may exist in analytics later but never affect deterministic gameplay.

### Evidence-at-the-time judgment

For a scored decision at Event X:

```text
Decision Event X
→ reconstruct Evidence discovered before / at X
→ evaluate Judgment against that Evidence set
→ exclude later Evidence from that decision's Judgment evaluation
```

This is required for Boss evaluation and Fake Green reasoning.

---

## 8. Structured Decision History

Every scored player decision produces a durable run-history record.

The canonical `DecisionRecord` shape is defined in Section 20. Earlier or subordinate documents that show a shorter `choiceId`-only example are illustrative only and must not be implemented as a competing runtime shape.

The history record exists so replay/debug/result explanation can reconstruct:

- what the player selected,
- what Evidence existed then,
- what Judgment dimensions applied,
- which learning domains were observed.

Final score state must remain derivable from deterministic run history + final project/world state rather than opaque incremental mutations.

---

## 9. Scoring Architecture

### Source separation

The major score areas intentionally use different source data:

- **Project Performance** — derived primarily from actual final project/world state, mission outcome, residual risk, unresolved issues, and delivery consequences.
- **PM Judgment** — derived from structured decision-quality contributions evaluated using information and authority available at that decision point.
- **Discovery / Reflection** — derived from structured exploration, Evidence, investigation, and Lessons Learned contributions.

This separation enforces:

> Mission Outcome ≠ PM Judgment.

Normal Event content must not mutate aggregate score using a generic `score_delta` Effect.

### Project Performance

Project Performance should be computed by a centralized Scoring Engine from actual state. Short-term Practical Shortcut benefits should normally appear through project/world Effects rather than a parallel hand-authored Performance score.

Exact production weights and PM Style thresholds remain tuning values to calibrate through playtesting.

---

## 10. PM Judgment Dimensions

PM Judgment uses three reusable dimensions:

```ts
type PMJudgmentDimension =
  | "evidence"
  | "decision"
  | "execution";
```

Meaning:

- `evidence` — Did the player seek, recognize, and use relevant information / uncertainty available at the time?
- `decision` — Was the recommendation / trade-off reasonable given evidence, objectives, constraints, risk, and authority?
- `execution` — Was it carried forward with appropriate sequencing, ownership, governance, escalation, communication, and follow-through?

### Authored contribution scale

Use a small ordinal scale to avoid false precision:

```ts
type JudgmentRating = -2 | -1 | 0 | 1 | 2;
```

Semantic meaning:

- `-2` — materially harmful / strongly unsound
- `-1` — weak / incomplete
- `0` — mixed or genuinely neutral
- `1` — sound
- `2` — especially strong for the decision context

### Applicability rule

A missing dimension means **not evaluated by this decision**.

A value of `0` means **evaluated and neutral / mixed**.

These are not interchangeable.

```ts
interface PMJudgmentContribution {
  evidence?: JudgmentRating;
  decision?: JudgmentRating;
  execution?: JudgmentRating;
}
```

This prevents an event about stakeholder execution from silently lowering `evidence` merely because Evidence was not relevant.

### Aggregation rule

The Scoring Engine aggregates only applicable ratings.

Architecture:

```text
authored ordinal ratings
→ aggregate applicable observations by dimension
→ normalize each dimension to 0–100
→ combine dimension scores using centralized config
→ PM Judgment 0–100
```

`SCORING_IMPLEMENTATION_CONTRACT.md` owns the approved `DecisionWeight = 1 | 2 | 3` weighting contract. Dimension weights, minimum-observation rules, and final 0–100 normalization constants live in centralized scoring configuration rather than Event JSON and remain tuning values where the scoring contract leaves them open.

Outcome, Hidden Truth, and later Evidence must never retroactively rewrite a prior Judgment contribution.

---

## 11. Discovery / Reflection Contributions

Discovery / Reflection is a smaller auxiliary score category and must not reward clicking everything indiscriminately.

```ts
type DiscoveryReflectionKind =
  | "exploration"
  | "evidence"
  | "investigation"
  | "reflection";

type DiscoveryReflectionRating = -1 | 0 | 1;

interface DiscoveryReflectionContribution {
  kind: DiscoveryReflectionKind;
  rating: DiscoveryReflectionRating;
  key: string;
}
```

Rules:

- `1` = meaningful / useful contribution,
- `0` = neutral, flavor-only, or no strategic learning value,
- `-1` = materially poor reflection where the interaction explicitly evaluates learning quality,
- pure Easter eggs should normally record `0` or no contribution,
- repeated discovery of the same contribution key must not double-count,
- Lessons Learned may contribute but remains a small part of overall Judgment / reflection output as defined by product scoring docs.

Final weighting relative to Project Performance and PM Judgment remains centralized scoring configuration and tuning, not per-event arithmetic.

---

## 12. PMP Tags and Coverage

PMP-aligned profile is a learning-observation layer, not a substitute for PM Judgment and not an official PMP score.

```ts
type PmpDomain =
  | "people"
  | "process"
  | "business_environment";
```

### Skill registry

MVP skill IDs are drawn from `PMP_MAPPING.md`:

```ts
type PmpSkillId =
  | "team_leadership"
  | "psychological_safety"
  | "conflict"
  | "stakeholder_engagement"
  | "communication"
  | "schedule"
  | "cost"
  | "requirements"
  | "baseline"
  | "change"
  | "risk"
  | "procurement"
  | "quality"
  | "evidence"
  | "issue_management"
  | "governance"
  | "compliance"
  | "value"
  | "sustainability"
  | "external_impact"
  | "escalation";
```

Each skill registry entry maps to exactly one PMP domain for coverage reporting. An Event / choice may reference multiple skills and therefore multiple domains.

```ts
interface PmpTagSet {
  skills: PmpSkillId[];
}
```

### Runtime observation

When a scored decision occurs, record which tagged skills were actually observed in that decision.

```ts
interface PmpObservation {
  eventId: EventId;
  choiceId?: ChoiceId;
  skills: PmpSkillId[];
  judgmentQuality?: number;
}
```

`judgmentQuality` is derived from the decision's applicable PM Judgment contribution; do not hand-author a second independent PMP proficiency score for the same choice.

### Domain accumulator

For each domain, retain enough information to derive:

- quality score,
- relevant decision count,
- observed skill coverage,
- confidence / coverage tier.

Conceptually:

```ts
interface PmpDomainAccumulator {
  relevantDecisionIds: string[];
  observedSkills: PmpSkillId[];
  qualitySum: number;
  qualityWeight: number;
}
```

Coverage is about **how much evidence exists**, not how good the score is.

Do not use the official PMP exam domain percentages as player proficiency weights. They describe exam composition only.

Ending UI exposes only the three playful domains by default; detailed skill tags remain one level deeper.

Exact low / medium / high coverage thresholds remain centralized tuning constants so playtesting can calibrate them without rewriting Event content.

---

## 13. Declarative Trigger / Consequence Rules

Event availability and reactive consequences use a deterministic declarative condition system.

Normal content must not contain arbitrary predicate functions.

### Condition primitives

MVP supports:

```ts
type TriggerCondition =
  | FlagEqualsCondition
  | MeterCompareCondition
  | ProjectStatusCondition
  | TrustCompareCondition
  | EvidenceDiscoveredCondition
  | EvidenceStatusCondition
  | EventCompletedCondition
  | ChoiceSelectedCondition
  | APCompareCondition
  | AllCondition
  | AnyCondition
  | NotCondition;
```

Comparison operators are limited to:

```ts
type CompareOperator = "eq" | "neq" | "lt" | "lte" | "gt" | "gte";
```

Examples:

```json
{
  "all": [
    { "flag": "speak_up_safety", "op": "eq", "value": "low" },
    { "eventCompleted": "S01-CORE-02" }
  ]
}
```

```json
{
  "any": [
    { "evidenceDiscovered": "supplier-cert-gap-01" },
    { "trust": "sponsor", "op": "gte", "value": 70 }
  ]
}
```

### Trigger evaluation timing

For a completed interaction:

```text
validate selection
→ capture evidence-at-decision snapshot
→ record DecisionRecord
→ resolve Effects
→ mark Event complete
→ evaluate trigger eligibility
→ enqueue deterministic reactive Events
```

This ordering prevents later reactive Evidence from contaminating the decision that caused it.

### Reactive event rules

Reactive definitions may declare:

```ts
interface ReactiveEventRule {
  eventId: EventId;
  when: TriggerCondition;
  once: boolean;
  priority: number;
}
```

If multiple Events become eligible simultaneously:

1. higher explicit priority resolves first,
2. ties use authored scenario order,
3. Event ID lexical order is never used as gameplay ordering logic.

Triggers determine **availability / enqueueing**. Consequences still occur through normal Event interactions and Effects; trigger rules do not mutate state directly.

---

## 14. Event Definition Contract

All Scenario content uses a common Event envelope plus a typed interaction payload.

```ts
type EventKind =
  | "core"
  | "exploration"
  | "reactive"
  | "light"
  | "crisis"
  | "reflection";

interface EventDefinition {
  id: EventId;
  scenarioId: ScenarioId;
  phaseId: PhaseId;
  kind: EventKind;
  title: string;
  summary: string;
  detail?: string;
  availability?: TriggerCondition;
  interaction: EventInteraction;
  pmpTags?: PmpTagSet;
}
```

### Interaction union

MVP needs explicit interaction types for already-approved Scenario 01 mechanics:

```ts
type EventInteraction =
  | SingleChoiceInteraction
  | RankingInteraction
  | EvidenceDiagnosisInteraction
  | DecisionPackageInteraction
  | InvestigationInteraction
  | LessonsSelectInteraction;
```

- `single_choice` — standard project decision.
- `ranking` — Opening Triage prioritization.
- `evidence_diagnosis` — choose key Evidence plus diagnosis category for Fake Green.
- `decision_package` — Recommendation / Reason / Next Step.
- `investigation` — Boss source + intent investigation actions.
- `lessons_select` — Lessons Learned selection.

The canonical payload schema for each interaction is defined in Section 20. Each interaction owns its own schema rather than overloading one giant optional object.

### Standard choice shape

Where an interaction contains standard selectable choices:

```ts
interface ChoiceDefinition {
  id: ChoiceId;
  text: string;
  preview?: string;
  effects: Effect[];
  judgment?: PMJudgmentContribution;
  discoveryReflection?: DiscoveryReflectionContribution[];
  pmpTags?: PmpTagSet;
  consequenceText?: string;
  pmpLens?: PmpLensContent;
}
```

Guardrails:

- no executable callbacks,
- no arbitrary state paths,
- stable choice IDs once referenced by triggers / telemetry,
- option ordering is presentation data and may be randomized without changing identity,
- normal gameplay copy stays Cat-first; PMP terminology belongs primarily in optional Lens content.

---

## 15. Scenario Progression and Phase Rules

Event ID does not determine runtime order.

Scenario definition owns explicit phase structure and authored ordering:

```ts
interface ScenarioDefinition {
  id: ScenarioId;
  phases: PhaseDefinition[];
  hiddenTruthOptions: HiddenTruthId[];
  initialState: ScenarioInitialState;
}
```

Core progression is mandatory unless an approved branch says otherwise. Exploration / Light / Reactive Events are conditionally available around that spine.

AP remains information-gathering resource only in MVP:

- +1 base AP per phase,
- bank cap = 2,
- rare bonus AP allowed only through approved content,
- Boss grants 2 free Investigation Actions plus saved AP 1:1.

Hidden Truth is selected once at run start and earlier Evidence must remain logically compatible with it.

---

## 16. Validation Requirements

Before Scenario/Event data is accepted at build/test time, validation must reject:

- duplicate Event / Evidence / relationship / flag / skill IDs,
- unknown registry references,
- invalid hidden-flag values,
- meter IDs outside the five-meter registry,
- values outside configured bounds,
- invalid Evidence supersession references,
- triggers referencing unknown Events / choices / Evidence,
- generic state-path mutations,
- unsupported interaction types,
- malformed interaction selections or cardinalities,
- scoring dimensions outside the approved set,
- PMP skill tags outside the registry.

Prefer TypeScript discriminated unions plus runtime schema validation for authored JSON/data.

Validation failure is an authoring/build error, not a recoverable gameplay condition.

---

## 17. Determinism and Testability

Given the same:

- scenario data,
- run seed / Hidden Truth,
- ordered player selections,

…the engine must produce the same:

- state transitions,
- Evidence history,
- reactive Event eligibility,
- decision history,
- scoring inputs,
- ending inputs.

Randomness must be seeded or selected at explicit initialization boundaries. Core scored decisions must never depend on runtime AI generation.

Minimum engine-level tests should cover:

- Effect resolution + clamping,
- hidden-flag validation,
- Evidence lifecycle,
- evidence-at-the-time snapshotting,
- trigger ordering,
- PM Judgment applicability (`undefined` vs `0`),
- PMP coverage accumulation,
- deterministic replay from a decision sequence.

---

## 18. Remaining Product / Tuning Decisions

The implementation architecture above is sufficiently defined for engine work. The following are **not architecture blockers**, but must be finalized before content balancing / ending calibration is considered done:

- exact initial numeric values for the five visible meters,
- relationship/trust registry entries, defaults, and bounds used by Scenario 01,
- event-specific hidden-flag transitions beyond the locked initial story state,
- Project Performance formula and weights,
- PM Judgment dimension weights / minimum-observation tuning,
- Discovery / Reflection category weights,
- PMP coverage/confidence thresholds,
- PM Style / Almost Balanced thresholds after playtesting,
- final per-event scoring contributions and PMP tags,
- final Scenario 01 Event IDs / choice IDs as content is authored.

These values should be tuned from product intent and playtest evidence rather than inferred ad hoc by Codex.

---

## 19. Engineering Handoff Boundary

The next engineering tickets may implement the **generic contract layer** without deciding scenario-specific product behavior:

1. core TypeScript IDs / registries / state types,
2. runtime validation schemas,
3. Effect Resolver,
4. Evidence lifecycle + decision history,
5. declarative Trigger evaluator,
6. scoring accumulator interfaces (not final balance constants),
7. Event envelope + typed interaction schemas,
8. deterministic unit tests.

---

## 20. Canonical Interaction, Selection, Lens, and DecisionRecord Contracts

This section closes the schema placeholders required by Issue #11. For the types named below, **this section is canonical**. If an earlier illustrative snippet or `SCORING_IMPLEMENTATION_CONTRACT.md` uses a shorter example, implement this section and treat the shorter snippet as explanatory only.

### Shared ID aliases

```ts
type InteractionId = string;
type ChoiceId = string;
type RankingItemId = string;
type DiagnosisId = string;
type DecisionPackageOptionId = string;
type InvestigationSourceId = string;
type LessonId = string;
```

These are semantic aliases at the TypeScript boundary. Runtime validation still enforces uniqueness within the relevant Event / interaction.

### Optional PMP Lens content

PMP Lens is authored, optional, and non-blocking to normal play.

```ts
interface PmpLensOptionNote {
  optionId: string;
  note: string;
}

interface PmpLensContent {
  title?: string;
  concept: string;
  explanation: string;
  optionNotes?: PmpLensOptionNote[];
  skills?: PmpSkillId[];
}
```

Rules:

- `concept` is the concise formal PM concept or lens label.
- `explanation` provides the authored learning explanation.
- `optionNotes` may explain why specific options are strong, weak, premature, wrong-owner, or Practical Shortcut choices.
- `skills` references only registered PMP skill IDs; domain display is derived from the skill registry rather than authored independently.
- Lens content must not reveal future Hidden Truth or future latent consequences.

### Shared interaction base

```ts
interface BaseEventInteraction {
  id: InteractionId;
  decisionWeight?: DecisionWeight;
}
```

`decisionWeight` is required only when the interaction produces PM Judgment scoring under `SCORING_IMPLEMENTATION_CONTRACT.md`. An unscored Light / flavor interaction may omit it.

### 1. Single choice

```ts
interface SingleChoiceInteraction extends BaseEventInteraction {
  type: "single_choice";
  choices: ChoiceDefinition[];
}
```

Validation:

- at least two choices for a decision interaction,
- choice IDs unique within the interaction.

### 2. Ranking

```ts
interface RankingItemDefinition {
  id: RankingItemId;
  text: string;
  detail?: string;
  pmpLens?: PmpLensContent;
}

interface RankingInteraction extends BaseEventInteraction {
  type: "ranking";
  items: RankingItemDefinition[];
  rankCount: number;
}
```

`rankCount` is the exact number of distinct items the player must order. Opening Triage can therefore set `rankCount` equal to the number of issues without making that a universal engine rule.

Validation:

- item IDs unique,
- `rankCount >= 1`,
- `rankCount <= items.length`.

### 3. Evidence diagnosis

```ts
interface DiagnosisOptionDefinition {
  id: DiagnosisId;
  text: string;
  detail?: string;
  pmpLens?: PmpLensContent;
}

interface EvidenceDiagnosisInteraction extends BaseEventInteraction {
  type: "evidence_diagnosis";
  evidenceIds: EvidenceId[];
  diagnosisOptions: DiagnosisOptionDefinition[];
  minEvidenceSelections: number;
  maxEvidenceSelections: number;
}
```

Validation:

- Evidence IDs must exist in the supplied scenario registry,
- diagnosis IDs unique,
- `0 <= minEvidenceSelections <= maxEvidenceSelections`,
- `maxEvidenceSelections <= evidenceIds.length`.

The evaluator that later judges which Evidence / diagnosis combination is strong is **not** part of Issue #11.

### 4. Decision Package

Decision Package collects three independently authored components: Recommendation, Reason, and Next Step.

```ts
interface DecisionPackageOptionDefinition {
  id: DecisionPackageOptionId;
  text: string;
  detail?: string;
  judgment?: PMJudgmentContribution;
  pmpTags?: PmpTagSet;
  pmpLens?: PmpLensContent;
}

interface DecisionPackageInteraction extends BaseEventInteraction {
  type: "decision_package";
  recommendations: DecisionPackageOptionDefinition[];
  reasons: DecisionPackageOptionDefinition[];
  nextSteps: DecisionPackageOptionDefinition[];
}
```

Validation:

- IDs are unique within each component list,
- each component list contains at least one option.

Component selection is represented now; **coherence scoring across combinations and final gameplay consequences are deferred to the Decision Package evaluator ticket**. Issue #11 must not invent a coherence formula or infer Effects from the selected combination.

### 5. Investigation

Boss investigation selects one Source + one Intent per investigation action.

```ts
type InvestigationIntentId =
  | "evidence"
  | "impact"
  | "alternatives"
  | "compliance"
  | "authority";

interface InvestigationSourceDefinition {
  id: InvestigationSourceId;
  text: string;
  detail?: string;
}

interface InvestigationIntentDefinition {
  id: InvestigationIntentId;
  text: string;
  detail?: string;
}

interface InvestigationInteraction extends BaseEventInteraction {
  type: "investigation";
  sources: InvestigationSourceDefinition[];
  intents: InvestigationIntentDefinition[];
}
```

Validation:

- source IDs unique,
- intent IDs unique,
- intent IDs limited to the approved five categories.

The interaction schema represents **one investigation action**. Runtime action allowance (2 free Boss actions + saved AP) belongs to Player / Boss runtime rules, not this payload. Source × intent result lookup, Evidence reveal, and conditional consequences are deferred; Issue #11 validates the pair only.

### 6. Lessons Learned selection

```ts
interface LessonOptionDefinition {
  id: LessonId;
  text: string;
  detail?: string;
  judgment?: PMJudgmentContribution;
  discoveryReflection?: DiscoveryReflectionContribution[];
  pmpTags?: PmpTagSet;
  pmpLens?: PmpLensContent;
}

interface LessonsSelectInteraction extends BaseEventInteraction {
  type: "lessons_select";
  lessons: LessonOptionDefinition[];
  minSelections: number;
  maxSelections: number;
}
```

Validation:

- lesson IDs unique,
- `0 <= minSelections <= maxSelections`,
- `maxSelections <= lessons.length`.

The specific number of lessons a Scenario asks the player to choose is authored content, not a universal engine constant.

### Canonical DecisionSelection union

```ts
interface SingleChoiceSelection {
  type: "single_choice";
  choiceId: ChoiceId;
}

interface RankingSelection {
  type: "ranking";
  orderedItemIds: RankingItemId[];
}

interface EvidenceDiagnosisSelection {
  type: "evidence_diagnosis";
  evidenceIds: EvidenceId[];
  diagnosisId: DiagnosisId;
}

interface DecisionPackageSelection {
  type: "decision_package";
  recommendationId: DecisionPackageOptionId;
  reasonId: DecisionPackageOptionId;
  nextStepId: DecisionPackageOptionId;
}

interface InvestigationSelection {
  type: "investigation";
  sourceId: InvestigationSourceId;
  intentId: InvestigationIntentId;
}

interface LessonsSelectSelection {
  type: "lessons_select";
  lessonIds: LessonId[];
}

type DecisionSelection =
  | SingleChoiceSelection
  | RankingSelection
  | EvidenceDiagnosisSelection
  | DecisionPackageSelection
  | InvestigationSelection
  | LessonsSelectSelection;
```

Selection validation must cross-check the corresponding interaction definition, including membership, uniqueness, and cardinality.

### Canonical combined DecisionRecord

```ts
interface DecisionRecord {
  eventId: EventId;
  interactionId: InteractionId;
  selection: DecisionSelection;
  decisionWeight: DecisionWeight;
  availableEvidenceIds: EvidenceId[];
  pmJudgment?: PMJudgmentContribution;
  discoveryReflection?: DiscoveryReflectionContribution[];
  pmpTags?: PmpTagSet;
}
```

This is the single canonical runtime shape for Issue #11.

Rules:

- `selection` carries the interaction-specific selected IDs; do not add a competing top-level `choiceId` field.
- For `single_choice`, `selection.choiceId` replaces the shorter illustrative `choiceId` field shown in `SCORING_IMPLEMENTATION_CONTRACT.md`.
- `decisionWeight` uses the approved `1 | 2 | 3` contract from `SCORING_IMPLEMENTATION_CONTRACT.md`.
- `availableEvidenceIds` is captured before Effects / reactive consequences so evidence-at-the-time Judgment is reconstructable.
- `pmJudgment` is the canonical field name; earlier `judgment` shorthand in examples is not a second runtime field.
- Discovery / Reflection and PMP metadata remain distinct from PM Judgment.

For unscored interactions that do not need a `DecisionRecord`, normal run/event history may still record completion separately. Do not make `decisionWeight` optional inside `DecisionRecord` merely to store unrelated flavor history.

### Issue #11 implementation boundary

Issue #11 implements and runtime-validates the contracts in this section. It must **not** implement:

- Ranking quality evaluation,
- Evidence Diagnosis correctness evaluation,
- Decision Package coherence scoring,
- Investigation source × intent result resolution,
- Lessons Learned quality aggregation,
- Effect resolution,
- Trigger evaluation,
- aggregate score calculation.

Those behaviors require their own approved evaluator / engine contracts.
