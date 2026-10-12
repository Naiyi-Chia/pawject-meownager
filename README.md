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

To exercise both Pages paths together, run `npm run build:pages` then `npm run test:pages`. This builds the current checkout twice for local/PR QA; the deployment workflow instead checks out `main` and `dev` separately. To inspect the combined build, run `npm run preview` and open the root and `/dev/` paths below on localhost.

When the repository automation and API credential are configured, an Engineering Ready Issue comment from the trusted repository owner can trigger an independent automated Technical Review. Include the exact `<!-- engineering-ready-for-review -->` marker, scoped branch, and full 40-character commit SHA; the automation posts PASS, FAIL, or BLOCKED back to the same Issue. Human integration, product verification, and release gates still apply. See the [automation setup and limitations](docs/qa/ISSUE_18_AUTO_TECHNICAL_REVIEW.md).

Vite uses the repository base path in development and production. For a local production preview, run `npm run build` then `npm run preview` and open `http://localhost:4173/pawject-meownager/`.

## GitHub Pages deployment

| Branch | Environment                        | Fixed URL                                             |
| ------ | ---------------------------------- | ----------------------------------------------------- |
| `main` | Production                         | <https://naiyi-chia.github.io/pawject-meownager/>     |
| `dev`  | Dev Preview / Human Product Verify | <https://naiyi-chia.github.io/pawject-meownager/dev/> |

Repository setup: **Settings → Pages → Build and deployment → Source → GitHub Actions**. Ensure Actions are enabled and **Settings → Environments → github-pages → Deployment branches** permits both `main` and `dev`. Keep scoped branches excluded. The Dev Preview workflow can run immediately after integration into `dev`; a production release is not required to test it.

`.github/workflows/pages.yml` responds to pushes to `main` or `dev`; manual runs are restricted to those branches. Each run builds explicit `main` source at the production base and explicit `dev` source using `--mode dev-preview`. It composes `main` output at the artifact root and `dev` output in `dev/`, verifies the artifact, and runs browser checks at both paths before uploading one combined Pages artifact. A shared concurrency group serializes the entire operation. No Dev output is copied to the production root. `deployment.txt` records the two source commit SHAs for Product Verify.

Deployment is atomic: if either build or QA fails, neither path is deployed and the last successful site remains available. Foundation CI builds and tests both modes for PRs.

Vite's default base remains `/pawject-meownager/`; `dev-preview` mode uses `/pawject-meownager/dev/`, adds `[DEV]` to the tab title, and inserts `noindex, nofollow`. For a standalone local Dev build, run `npm run build -- --mode dev-preview`, then `npm run preview -- --mode dev-preview` and open `http://localhost:4173/pawject-meownager/dev/`.

Persistence must go through `getGameStorage()` in `src/platform/storage.ts`: it derives the namespace from Vite's build base (`pawject-meownager:production:*` or `pawject-meownager:dev:*`). The adapter supports read/write/remove without clearing unrelated keys or reading legacy unprefixed saves. No migration or game save behavior is introduced here; the current foundation has no persistent gameplay state. Future meta persistence must use this adapter rather than direct `localStorage`.

Bootstrap caveat: until this workflow also reaches `main` through the normal release flow, the previous main-only workflow can replace the site with a root-only artifact on a `main` push. After such a release, re-run the new Pages workflow from `dev` to restore both paths. Once both branches carry this workflow, either branch deploy preserves both environments. Do not release to `main` merely to enable the first Dev Preview.

After integration and a successful deployment, perform Human Product Verify at the Dev Preview URL, including the primary 390 px phone viewport. Confirm `[DEV]`, no indexing, correct `/dev/assets/` requests, and the `dev` SHA in `deployment.txt`. Check the production root still has no Dev marker and uses root assets. Local tests do not substitute for live smoke or Human Product Verify; normal integration and release gates still apply.

Deployment references: [Vite GitHub Pages guide](https://vite.dev/guide/static-deploy.html#github-pages) and [GitHub Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Foundation architecture

The approved contract layer is in [`src/contracts/`](src/contracts/README.md). It provides TypeScript types, registries, strict runtime schemas, and context-aware selection/reference validation. It implements no engine resolution or gameplay behavior. `npm test` includes contract fixtures and the existing production browser checks.

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
