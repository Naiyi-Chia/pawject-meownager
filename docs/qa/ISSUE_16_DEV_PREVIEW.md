# Issue #16 — Stable Dev Preview engineering QA

Validated on 2026-10-12 with Windows, Node 24.19.0, npm 12.2.0, and Chromium. Baseline: `origin/dev` and `origin/main` at `f518ed20c4521a9ff8fee3410f374c60388aa9aa`.

Continuation validation on the same date fetched the remote branches and confirmed this scoped branch still starts at the latest `dev`, with no other remote Issue #16 branch. Lint, formatting, both builds, all 118 tests, screenshot inspection, and live URL checks were repeated successfully. The Pages API again confirmed workflow deployment and exactly the `main` / `dev` environment policies. The implementation is being committed and pushed for independent Technical Review; live Dev deployment remains pending integration.

## Implementation

- Pages workflow builds explicit `main` and `dev` checkouts. Production files go to the artifact root; Dev files go only to `dev/`. It verifies both entries/assets, then browser-tests the composed site before uploading. Both push triggers and manual branch guards are limited to `main` and `dev`.
- Whole-run concurrency uses the existing `github-pages` group. A failed build/test prevents upload/deployment, preserving the previous successful site. `deployment.txt` records both checked-out SHAs.
- Default Vite base is `/pawject-meownager/`; `dev-preview` mode uses `/pawject-meownager/dev/`, `[DEV]` in the title, and a `noindex, nofollow` robots meta tag.
- `src/platform/storage.ts` provides a lazy, namespaced storage adapter. Production keys use `pawject-meownager:production:*`; Dev keys use `pawject-meownager:dev:*`. Read/write/remove never access another environment or unprefixed legacy keys. Gameplay persistence does not exist yet; no save behavior, migration, or meta-state schema is added.
- Local composite builds and PR CI exercise both modes. Local QA builds the current checkout twice; actual deployment checks out the two source branches separately.

## Validation

| Check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run format:check` | PASS |
| `npm run build:pages` | PASS; TypeScript, production build, Dev build, composite artifact verification |
| `npm run test:pages` | PASS; 118 tests across production and Dev projects |
| `git diff --check` | PASS |
| Root and `/dev/` entry/assets | PASS; compiled HTML, CSS, entry JS and lazy-loaded Phaser runtime resolve at their respective bases with no request failures |
| Environment identification | PASS; root title has no marker, Dev title has `[DEV]`; only Dev contains `noindex, nofollow` |
| Browser persistence | PASS; real Chromium localStorage exercises the actual adapter's read/write/remove; Dev removal preserves production and legacy data; cross-path navigation/reload preserves both namespaces |
| Mobile/desktop layout | PASS at 375 × 812, 390 × 844, 844 × 390, 1440 × 900 for both paths; no overflow or console errors, same-canvas resizing passes |
| Mobile screenshot inspection | PASS; both 390 px captures are visually identical, with readable text, full canvas and no clipping. Tab markers are verified separately by browser assertions |

Reproducible screenshots are generated under ignored `test-results/shell-production-shell-renders-without-overflow-at-390×844-{production,dev}/shell.png`. Both inspected captures had SHA-256 `3C063568FD0F1C9E3198E0A73D6412E15A3636595601ADEF2F8AEA0A673863FA`.

Vite and Chromium require process-launch permission outside the Windows sandbox. Checks passed with that permission. The existing Phaser chunk-size advisory remains. No image/font assets currently exist in the foundation; those asset types have no live requests to test.

## Repository deployment configuration

Read-only Pages API confirmed `build_type: workflow`, HTTPS enabled, and the Production URL. The `github-pages` environment initially permitted only `main`. Engineering added the `dev` branch deployment policy and verified the environment now permits exactly `main` and `dev`; scoped branches remain excluded. No branch merge or deployment was performed.

## Public URL baseline and pending gates

Before integration, live Chromium QA at 390 × 844 observed:

| URL | Observed result |
| --- | --- |
| <https://naiyi-chia.github.io/pawject-meownager/> | HTTP 200; `Pawject Meownager` title, visible Phaser canvas, no HTTP asset errors; mobile screenshot inspected |
| <https://naiyi-chia.github.io/pawject-meownager/dev/> | HTTP 404; Dev Preview is not deployed yet |

Live screenshots are generated under ignored `test-results/live-production-390.png` and `test-results/live-dev-390.png`. Local path checks prove the implementation, not a deployed Dev Preview or Human Product Verify. After approved integration into `dev`, the push should deploy both paths without releasing to `main`. Verify both live URLs, asset requests, Dev robots/title markers, and `deployment.txt` source SHAs, then perform Human Product Verify.

During bootstrap, `main` still carries the previous root-only workflow. A `main` push before the new workflow reaches that branch through the normal release flow can remove `/dev/`; rerun the new workflow from `dev` after such a push. Once both branches contain the new workflow, pushes to either preserve both paths. This limitation does not require releasing to `main` to enable the first Dev Preview.

Technical Review, Integration Approval, actual deployment verification, and Human Product Verify remain pending. No gameplay, scoring, event contracts, art, or release gates were changed.
