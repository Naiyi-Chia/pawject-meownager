# Pawject Meownager — Scoring Implementation Contract

Status: Draft for integration

This document captures the implementation contract for scoring decisions that have already been approved during the GDD v0.1 → implementation-ready specification phase.

It is subordinate to the product behavior defined in `SCORING_AND_ENDINGS.md`. If this contract and the product scoring document disagree, product behavior wins and the conflict must be surfaced before implementation.

## 1. Architecture: Structured Contributions + Centralized Scoring Engine

Scoring must not be implemented as ad-hoc aggregate score mutation inside gameplay effects.

A selected decision records structured scoring inputs, and a centralized Scoring Engine aggregates them later.

Conceptual flow:

```text
Player decision / run state / outcome
          ↓
Structured scoring inputs
          ↓
DecisionRecord + ScoringState
          ↓
Centralized Scoring Engine
          ↓
Project Performance
PM Judgment
Discovery / Reflection
          ↓
Total score + Performance × Judgment evaluation
          ↓
PM Style / ending inputs / PMP-aligned profile
```

This architecture preserves the foundational product rule:

> Mission Outcome ≠ PM Judgment.

### Source separation

- **Project Performance** is driven primarily by actual project state, mission outcome, delivery consequences, unresolved risk, and other project-result inputs.
- **PM Judgment** is driven primarily by structured decision-quality contributions evaluated against what the player could reasonably know at the time.
- **Discovery / Reflection** may be driven by exploration, Evidence, investigation, and Lessons Learned inputs.

Do not infer PM Judgment solely from final meters or final mission outcome.

A lucky successful outcome must not retroactively turn poorly supported judgment into good judgment, and a responsible decision under uncertainty must not become bad judgment merely because later Hidden Truth produced an unfavorable outcome.

## 2. PM Judgment Dimensions

PM Judgment uses exactly three reusable dimensions for MVP:

```ts
interface PMJudgmentContribution {
  evidence?: JudgmentValue;
  decision?: JudgmentValue;
  execution?: JudgmentValue;
}
```

Semantics:

- `evidence` — Did the player seek, recognize, and use the relevant information and uncertainty available at that point?
- `decision` — Was the recommendation / trade-off itself reasonable given the available evidence, objectives, constraints, risk, and authority?
- `execution` — Was the decision carried through with appropriate sequencing, governance, escalation, communication, and follow-through?

These dimensions are **not** PMP domains.

`evidence / decision / execution` answer:

> How well did the player make and carry through this decision?

`People / Process / Business Environment` answer:

> Which PMP-aligned competency areas did this content exercise or reveal?

The two layers remain independent.

## 3. Sparse Dimension Contributions

A decision only contributes to the Judgment dimensions it genuinely assesses.

```ts
interface PMJudgmentContribution {
  evidence?: JudgmentValue;
  decision?: JudgmentValue;
  execution?: JudgmentValue;
}
```

The semantic distinction is mandatory:

```text
missing = not assessed
0       = assessed, neutral / mixed
```

Examples:

```ts
// Investigation primarily assesses evidence quality.
{
  evidence: 2
}
```

```ts
// Scope negotiation assesses the decision and its execution.
{
  decision: 1,
  execution: 1
}
```

Do not fill unused dimensions with `0` merely to make the object rectangular.

This avoids diluting a dimension with events that never assessed it and supports later score / coverage / confidence interpretation.

## 4. Judgment Value Scale

MVP uses a fixed five-point authored scale:

```ts
type JudgmentValue = -2 | -1 | 0 | 1 | 2;
```

Semantic anchors:

```text
-2 = materially poor judgment
-1 = weaker than preferred
 0 = defensible / mixed / neutral
+1 = good judgment
+2 = notably strong judgment
```

The scale is intentionally coarse enough to remain reviewable across scenarios and avoid false precision.

Do not use arbitrary free-form numeric Judgment values in normal scenario content.

## 5. Decision Importance Weight

Not every scored decision has the same consequence or portfolio significance. MVP therefore supports a small discrete importance weight:

```ts
type DecisionWeight = 1 | 2 | 3;
```

Semantic anchors:

```text
1 = supporting / minor judgment moment
2 = standard core decision
3 = critical decision
```

Weight means **how important the decision is**, not **how good or bad the chosen answer is**.

### Guardrails

- All choices belonging to the same scored decision use the same weight.
- Do not increase weight merely because a specific option is especially good or especially bad.
- Do not simulate importance by duplicating the same score contribution multiple times.
- Boss / critical decisions may use weight `3`; ordinary Core decisions will commonly use weight `2`; supporting decisions may use `1`.
- Exact content assignment remains an authoring / balancing concern and may be tuned through playtest without changing the schema.

## 6. Runtime Decision Record

Illustrative runtime direction:

```ts
interface DecisionRecord {
  eventId: string;
  choiceId: string;
  decisionWeight: DecisionWeight;
  pmJudgment?: PMJudgmentContribution;
}
```

The Decision Record is an inspectable historical record. It should be sufficient for deterministic score reconstruction and result explanation without requiring UI components to mutate aggregate scores directly.

If additional scoring layers such as Discovery / Reflection are added to the Decision Record later, they must remain structured and semantically distinct from PM Judgment.

## 7. Aggregation Default

This is an implementation default, not a new player-facing scoring promise.

For each PM Judgment dimension, aggregate only the decisions that actually assessed that dimension.

Conceptually:

```text
weighted dimension mean
= Σ(judgment value × decision weight)
  / Σ(decision weight for assessed entries only)
```

Therefore:

- missing dimensions do not enter the denominator,
- `0` does enter the denominator because it means the dimension was assessed,
- decision importance affects influence without changing the authored `-2...+2` quality scale.

The weighted mean remains on the authored `-2...+2` scale internally.

A 0–100 presentation score may later be derived centrally, for example through a deterministic normalization, but exact production thresholds / rank boundaries remain playtest-calibrated as required by `SCORING_AND_ENDINGS.md`.

### Coverage guardrail

The Scoring Engine must retain enough information to know whether each Judgment dimension was meaningfully assessed in the run.

Do not fabricate missing coverage by inserting neutral values.

Scenario authoring / validation should ensure that the intended main path provides meaningful coverage across `evidence`, `decision`, and `execution`; exact minimum coverage thresholds are not locked by this contract.

## 8. Example

A Practical Shortcut may be authored as:

```ts
{
  eventId: "S01-CORE-04",
  choiceId: "take-fast-supplier-now",
  decisionWeight: 2,
  pmJudgment: {
    evidence: -2,
    decision: 0,
    execution: 1
  }
}
```

Interpretation:

- Evidence discipline was materially poor.
- The decision itself was mixed / defensible only under some constraints.
- Execution was efficient.

Separately, gameplay effects may improve schedule while planting latent risk. Those outcome effects belong to the project simulation, not to the PM Judgment object.

This is the intended Firefighter-style separation: execution success can coexist with weak judgment.

## 9. Implementation Guardrails

- No arbitrary `score_delta` field as the default gameplay scoring API.
- No hindsight-based rewriting of prior PM Judgment after Hidden Truth reveal.
- No automatic positive Judgment merely because an option uses more formal PM terminology.
- No coupling of PM Judgment dimensions to PMP domain coverage.
- No requirement that every Event carry PM Judgment scoring; Light / Absurd Events may intentionally carry none.
- Scoring remains deterministic and authored / reviewable in MVP.

## 10. Still Open

The following are intentionally not locked here and should be decided only when needed by the next implementation boundary:

- exact Project Performance formula from final state / outcome,
- exact Discovery / Reflection contribution vocabulary,
- PMP tag / coverage implementation contract,
- final 0–100 normalization and PM Style production thresholds,
- scenario-level minimum Judgment coverage validation,
- player-facing confidence / coverage presentation.

These open items must not be invented by the Engineering Agent.
