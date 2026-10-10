# Issue #6 — GitHub Pages deployment QA

Validated on 2026-10-10 with Windows, Node 24.19.0, and npm 12.2.0. Baseline: latest `origin/dev`, `9afa69a`.

## Change

- Vite base path is `/pawject-meownager/`.
- A separate Pages Actions workflow builds and checks the app, uploads only `dist/`, and deploys on pushes to `main`. Manual runs are also guarded to `main`. It uses the `github-pages` environment, Pages/OIDC permissions, and serialized deployments.
- Existing foundation CI is unchanged. Its browser tests now use the repository path, with an additional regression test for production assets.
- README documents the preview URL, required Pages source setting, and post-release smoke check.
- No application code, visuals, dependencies, or gameplay contracts changed.

## Validation

| Command / check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run format:check` | PASS |
| `npm run build` | PASS; TypeScript and production build |
| `npm test` | PASS; all 6 Chromium tests |
| `git diff --check` | PASS |
| Built HTML | Compiled script and CSS URLs use `/pawject-meownager/assets/`; no `/src/main.ts` reference |
| Repository-path asset regression | Entry, CSS, and lazy-loaded Phaser runtime load successfully; script/style requests stay under the repository path |
| Foundation layout | 375 × 812, 390 × 844, 844 × 390, 1440 × 900; no overflow or browser errors; same-canvas resizing passes |
| Mobile screenshot | Visually inspected the 390 px production preview; foundation appearance unchanged |
| Diff scope | `src/` and `.github/workflows/ci.yml` unchanged |

Vite's Windows config loader and Chromium require process-launch permission outside this environment's restricted sandbox. The build and tests passed with that permission. The existing Phaser bundle-size advisory remains (~319 KB gzip); this fix does not change the runtime bundle.

## Deployment assumptions and pending verification

At implementation time, the read-only Pages API reported `build_type: legacy`, with source `main` and path `/`. This explains why raw Vite source was being served instead of compiled output.

Required one-time release setup: **Settings → Pages → Build and deployment → Source → GitHub Actions**. Actions must be enabled, and the `github-pages` environment must permit `main`. This setting and an actual deployment were not changed from the scoped engineering branch.

The workflow uses the supported action versions and pinned commits from the [Vite Pages guide](https://vite.dev/guide/static-deploy.html#github-pages), with the [GitHub Pages workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Its YAML was parsed by Prettier; actual deployment execution remains a release check.

After normal technical review, integration, and release to `main`, repeat Production Smoke at <https://naiyi-chia.github.io/pawject-meownager/>. Confirm the shell and placeholder render on a phone viewport and script/style assets have no 404s. The live production acceptance criterion is pending that deployment and smoke check; local production preview tests do not prove it. Issue #1 remains open until Production Smoke passes.
