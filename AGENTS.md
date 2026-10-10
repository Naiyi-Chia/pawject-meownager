# AGENTS.md — Pawject Meownager

Permanent repository rules for AI / engineering agents.

## 1. Source of Truth

Before implementation, read the relevant files under `/docs`.

Canonical product references include:

- `docs/GDD.md`
- `docs/MVP_SCOPE.md`
- `docs/SCENARIO_01_HOMECOMING.md`
- `docs/PMP_MAPPING.md`
- `docs/SCORING_AND_ENDINGS.md`
- `docs/VISUAL_DIRECTION.md`
- `docs/DECISION_LOG.md`
- `docs/FUTURE_BACKLOG.md`

If code, issue text, and product docs disagree, stop and surface the conflict rather than inventing behavior.

## 2. Product Behavior Is Not Agent-Owned

Do not independently change or invent:

- scoring rules,
- PM Style logic,
- meter semantics,
- Action Point rules,
- hidden flags or their meaning,
- event branching,
- endings,
- Boss Hidden Truth behavior,
- Decision Package scoring,
- PMP domain / skill interpretation,
- player-facing learning behavior,
- MVP scope.

If one of these is underspecified, request a spec / Issue update instead of making a product decision in code.

## 3. Product Principles

Preserve these principles in all implementation work:

- **Cat-first, PMP-second.**
- **Mission Outcome ≠ PM Judgment.**
- Project Performance and PM Judgment are separate axes.
- Correct choices must not be visually identifiable simply because they are longer or more formal.
- Practical Shortcuts may provide short-term benefit while planting latent risk.
- Core events need at least one Cat Moment.
- Some Light / Absurd Events may intentionally provide no strategic or PMP learning value.
- Boss judgment is evaluated against evidence available at decision time, not hindsight.
- PMP Lens is optional and must not block normal play.

## 4. MVP Guardrail

A new feature belongs in MVP only if it materially improves at least one of:

1. Core PM simulation
2. Replayable decision loop
3. Portfolio story

Otherwise treat it as Future scope and do not implement unless an Issue explicitly promotes it into MVP.

## 5. Engineering Workflow

Follow the cross-project AI Product Development Playbook in `Naiyi-Chia/naiyi-product-playbook`.

Default branch roles:

- `main` = production / release boundary
- `dev` = integration / staging
- scoped work = feature / fix / UX branch created from latest `dev`

Do not develop product code directly on `main`.

Requirements belong in GitHub Issues. If Goal, Scope, Expected Behavior, or Acceptance Criteria changes during implementation, update the Issue before continuing.

## 6. Current Technical Direction

MVP direction unless superseded by an approved Issue / spec:

- TypeScript
- Vite
- Phaser 3 for the 2D game layer
- HTML/CSS where appropriate for shell / result surfaces
- localStorage for MVP meta persistence
- mobile-first responsive design
- target primary phone width around 390 px
- data-driven scenario / event content

Avoid introducing backend infrastructure unless explicitly scoped.

## 7. Content Architecture

Prefer data-driven content over hard-coded story branches inside UI components.

The implementation should be able to represent concepts such as:

- scenario
- event
- choices
- effects
- triggers
- hidden flags
- meter effects
- reactive consequences
- scoring contributions
- PMP domain / skill tags
- dialogue

Do not finalize schemas by inference if the implementation contract has not yet been approved.

## 8. PMP Content Guardrail

Core scored PMP learning content must remain authored / reviewable / deterministic in MVP.

Do not generate Core PMP decisions dynamically at runtime.

Do not present the game profile as an official PMP score or pass-probability prediction.

## 9. UX / Visual Guardrail

Visual direction is **Hybrid Pixel Narrative**:

- system / map layer = minimal, clean pixel-art language
- narrative / emotional layer = expressive hand-drawn illustration

Prioritize mobile readability, clear hierarchy, and one-handed tap targets over decorative complexity.

## 10. Definition of Engineering Done

An implementation task is not done merely because it compiles.

Before handoff for review:

- run relevant automated tests,
- verify expected behavior against the Issue Acceptance Criteria,
- check mobile layout when UI is affected,
- report known limitations,
- do not silently expand scope,
- provide a concise implementation / QA summary.

For gameplay work, Human Product Verify / playtest remains required before release decisions.
