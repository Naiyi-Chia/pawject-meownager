# Pawject Meownager

A cute, mobile-first project management simulation with optional PMP-aligned learning.

> **Good PMs don't just know the right thing. They make the right things happen.**

## Developer setup

Requires Node.js 22.12+ (Node 24 LTS recommended) and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. After dependency setup, `npm run dev` is the single command to start the app. To inspect on a phone on the same network, use `npm run dev -- --host 0.0.0.0` and open the computer's LAN address on port 5173.

```sh
npm run lint
npm run format:check
npm run build
npx playwright install chromium
npm test
```

Browser tests run against the production build, so run `npm run build` before `npm test`. On Linux, use `npx playwright install --with-deps chromium` for browser system dependencies. `npm run preview` serves the build locally; `npm run format` formats implementation files. CI runs lint, formatting, build, and Chromium checks.

## Foundation architecture

- `src/ui/`: accessible HTML shell and responsive CSS.
- `src/game/scenes/`: Phaser scenes; currently one static technical placeholder.
- `src/game/mountGame.ts`: runtime ownership and shared canvas scaling.
- `src/content/scenarios/` and `src/content/events/`: reserved authored content boundaries.
- `src/game/state/` and `src/game/scoring/`: reserved engine boundaries.
- `tests/`: production browser smoke and viewport checks.

The foundation uses a 320 × 240 logical canvas scaled proportionally inside the same responsive shell on phones and desktop. This is a placeholder renderer size, not a gameplay or final map contract. It implements no GameState, event schema, persistence, meters, actions, scoring, or scenario content. Future implementation must follow an approved issue and the canonical docs. The pixel cat is temporary geometric art; narrative illustrations remain future scoped work.

## Product & Game Design

Start here:

- [`docs/GDD.md`](docs/GDD.md) — product vision and game-system baseline
- [`docs/MVP_SCOPE.md`](docs/MVP_SCOPE.md) — MVP guardrails
- [`docs/SCENARIO_01_HOMECOMING.md`](docs/SCENARIO_01_HOMECOMING.md) — first playable scenario
- [`docs/PMP_MAPPING.md`](docs/PMP_MAPPING.md) — PMP-aligned learning model
- [`docs/SCORING_AND_ENDINGS.md`](docs/SCORING_AND_ENDINGS.md) — Performance × Judgment, endings, PM styles
- [`docs/VISUAL_DIRECTION.md`](docs/VISUAL_DIRECTION.md) — visual system and mobile-first rules
- [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) — why major product decisions were made
- [`docs/FUTURE_BACKLOG.md`](docs/FUTURE_BACKLOG.md) — deliberately deferred ideas
- [`docs/IMPLEMENTATION_SPEC.md`](docs/IMPLEMENTATION_SPEC.md) — implementation contracts currently being defined

## Working Scenario

**Project Meow Homecoming｜喵星返航計畫**

You are the new PM of the Earth–Meow Joint Mission Office. The previous PM quit, the dashboard is green, and absolutely nothing is under control.
