# Issue #11 — Contract layer QA

Validated on 2026-10-11 using Windows, Node 24.19.0, and npm 12.2.0. Scoped branch was rebased onto latest `dev` (`8af66c560df88d8c3271787d703b04abe65835b0`) before implementation.

## Scope and acceptance coverage

- Semantic IDs and six-domain GameState boundary; MetaState contract. Unapproved child-state fields stay generic and are not presented as a complete runtime state schema.
- Exact five-meter IDs, bounds, directionality and four project statuses; exact four Scenario 01 flags/defaults. PMP registry maps all 21 approved skill IDs to their domains.
- All seven Effect variants, Evidence definitions/instances, optional effect visibility where specified, structured Judgment/Discovery/PMP metadata, and canonical combined DecisionRecord.
- All six Section 20 interaction/selection pairs, optional Lens content, local option IDs, registered references, uniqueness, cardinality, and scored interaction/record weight consistency.
- Recursive declarative triggers and reactive rule definitions are validated, with no evaluator or enqueueing.
- Relationship definitions provide configuration slots, without populating targets/defaults/bounds from inference.
- Strict schemas reject unsupported fields and generic path mutations. Full-context construction checks authored definitions and forward references before returning validators.

## Commands and results

| Command | Result |
| --- | --- |
| `git fetch origin --prune`, `git rebase origin/dev` | PASS; branch synchronized with approved specification |
| `npm install zod@^4` | PASS; one new package, zero audit vulnerabilities |
| `npm run lint` | PASS |
| `npm run format:check` | PASS |
| `npx tsc --noEmit` / `npm run build` | PASS |
| `npm test` | PASS; 57 tests: 51 contract tests and 6 existing production browser tests |
| `git diff --check` | PASS |

Tests include valid fixtures for every interaction/selection/history pair, all seven Effects, all trigger primitive kinds and nested boolean composition, Evidence references/lifecycle, sparse Judgment semantics, and schema immutability relative to caller data. Invalid fixtures cover unknown and duplicate IDs, flag values/defaults, meter/status values, bounds, Evidence supersession, callback/path mutation shapes, interaction payloads, wrong selection types/membership/cardinality, legacy DecisionRecord fields, Judgment/weight ranges, Lens option references and PMP skills.

Boundary tests preserve zero-minimum Evidence/Lessons selection and component-local Decision Package IDs. A compile-time negative fixture verifies correlation between flag keys and their value types.

Existing production browser checks pass at 375 × 812, 390 × 844, 844 × 390, and 1440 × 900, plus same-canvas resizing and repository-path assets. Production JS/CSS chunk names and sizes remain unchanged because the shell does not import the contract layer. The existing Phaser bundle-size advisory remains.

## Dependency and architecture notes

Zod 4.6.5 is the only new dependency, with no transitive dependencies. Runtime schemas and inferred types share one representation. Existing Playwright infrastructure runs contract tests without browser fixtures alongside the established browser tests; no second test framework is added.

See `src/contracts/README.md` for API usage and technical trigger serialization. Root child-state extension types explicitly leave unapproved fields open. Fixed registries validate the approved baseline; new flags or skill vocabulary require a spec/registry update.

## Deferred behavior and limitations

No Effect application, trigger execution, reactive enqueueing, run initialization, Evidence revelation/timing reconstruction, interaction quality/coherence evaluation, score aggregation/normalization, PMP confidence thresholds, PM Style/endings, Scenario 01 authored events, or new gameplay screens were implemented.

Schema checks validate Lens structure and references, not the meaning of prose. Human content review must enforce the prohibition on revealing future Hidden Truth/latent consequences. Runtime observation quality remains a future derived value, with no new formula or authored proficiency score.

No Product Verify, integration, release, or live production verification is claimed. Future child-state fields, relationship configuration, and evaluators remain separately scoped approved work.
