# Gameplay contracts

Issue #11 implements `docs/IMPLEMENTATION_SPEC.md`, especially the canonical Section 20. Import public types, schemas, and registries through `src/contracts/index.ts`.

- `ids.ts`: semantic ID aliases. Display text and ordering are not identity.
- `registries.ts`: five meters, four Scenario 01 flags and their exact initial values, and 21 PMP skills mapped using `docs/PMP_MAPPING.md`. No relationship targets, trust defaults, or visible meter starting values are populated.
- `schemas.ts`: strict Zod 4 structural schemas and inferred TypeScript unions, including all six interactions/selections and the canonical DecisionRecord. Unknown object fields are rejected, including callbacks, legacy history fields, and generic path mutations.
- `validation.ts`: context-aware authoring/reference checks and selection validation. Context includes scenario/phase/truth IDs, relationships, Evidence definitions, and Events. Forward references work because the complete Event registry is built before references are checked. Optional meter/flag/PMP registries default to the approved baseline; overrides must preserve approved definitions.
- `state.ts`: the six-domain GameState boundary. Project meters/status have typed fields; other child domains remain explicit generic extension boundaries because their final fields are not approved. This is not a finalized runtime GameState schema.

Zod is the only new dependency. It keeps runtime shape validation and TypeScript inference together, has no transitive dependencies, and is not imported by the app shell. The production shell does not gain validation-library bytes until future engine code uses these modules.

## Validate authored content and player selections

```ts
import { createContractValidator } from './index';

// Use approved scenario registries/content, not display text as identifiers.
const validator = createContractValidator({
  scenarioIds,
  phaseIds,
  hiddenTruthIds,
  relationships,
  evidence,
  events,
});
validator.event.parse(authoredEvent);
validator.effect.parse(authoredEffect);
validator.trigger.parse(authoredCondition);
validator.selectionFor(authoredEvent.interaction).parse(playerSelection);
validator.decisionRecord.parse(historyRecord);
```

`createContractValidator` accepts unknown input so JSON can be checked directly. Its constructor throws a Zod authoring error for invalid supplied registries or Events. Each returned schema also supports `safeParse` for an explicit success/error result. Use `ValidationContext` for authored TypeScript input shape checks. Standalone schemas check structure and fixed vocabularies; use the context-aware API to check ID uniqueness, relationships, Evidence, Events, local Lens option notes, registered skill references, and selection membership/cardinality.

All choices in a scored interaction share its `decisionWeight`; records must match that interaction's ID and weight. Missing Judgment dimensions stay absent, while an authored zero stays zero. Decision Package IDs are unique within each component list, not across all three lists. Investigation payloads represent one Source × Intent pair, not an action allowance.

## Trigger serialization

The spec names primitive conditions and provides flag/event/Evidence/trust examples. The remaining primitive field encodings are technical serialization choices, with no evaluator implemented:

| Condition           | Data shape                                                         |
| ------------------- | ------------------------------------------------------------------ |
| Flag equality       | `{ flag, op: 'eq', value }`                                        |
| Meter comparison    | `{ meter, op, value }`                                             |
| Project status      | `{ projectStatus }`                                                |
| Trust comparison    | `{ trust, op, value }`                                             |
| Evidence discovered | `{ evidenceDiscovered }`                                           |
| Evidence status     | `{ evidenceStatus: evidenceId, status }`                           |
| Event completed     | `{ eventCompleted }`                                               |
| Choice selected     | `{ choiceSelected: choiceId, eventId }`                            |
| AP comparison       | `{ ap: true, op, value }`                                          |
| Composition         | `{ all: conditions }`, `{ any: conditions }`, `{ not: condition }` |

Meter thresholds use the approved 0–100 bounds; trust comparison bounds apply only when supplied by the relationship definition. Deltas are not clamped or applied here. The named ChoiceSelectedCondition references standard single-choice choices; other interaction selections remain their own typed variants.

## Deliberately deferred

No state mutation, seeded run creation, Evidence reveal/history timing, trigger evaluation/enqueueing, selection quality assessment, Decision Package coherence, investigation lookup, scoring normalization, PMP proficiency calculation, or content balancing is implemented. Optional `PmpObservation.judgmentQuality` represents a future derived runtime value, not a second authored score.

Lens structure/references are machine-validated. Whether prose reveals future Hidden Truth or latent consequences requires human content review; schemas do not judge narrative meaning. Relationship bounds/defaults and future child-state fields require approved follow-up contracts.

`npm test` runs synthetic contract fixtures plus the existing production browser checks. The fixtures are not authored Scenario 01 events or proposed balancing values.
