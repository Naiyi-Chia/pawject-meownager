# Issue #1 — Foundation QA

Validated on 2026-10-10 using Windows, Node 24.19.0, and npm 12.2.0.

## Implementation

TypeScript + Vite shell with one static Phaser 3 scene. HTML owns headings and accessible scene description; Phaser owns only the placeholder canvas. Content, state, and scoring directories reserve boundaries without defining schemas or product behavior. Development hot reload destroys the previous game instance.

## Checks and results

| Check | Result |
| --- | --- |
| `npm ci` | PASS; lockfile installs cleanly, audit reports zero vulnerabilities |
| `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort` | PASS; Vite starts and serves HTTP 200 |
| `npm run lint` | PASS |
| `npm run format:check` | PASS |
| `npm run build` | PASS; TypeScript checks and production assets generated |
| `npx playwright install chromium` | PASS |
| `npm test` | PASS; 5 production browser tests |
| `git diff --check` | PASS |

Browser checks cover 375 × 812, 390 × 844, 844 × 390 landscape, and 1440 × 900 desktop. Each checks shell boot, scene readiness, visible canvas bounds, absence of horizontal overflow, and absence of browser errors. A fifth test resizes the same canvas from phone to desktop and back without remounting. Tests save screenshots under ignored `test-results/`; phone and desktop screenshots were visually inspected for readable hierarchy and visible pixel art.

## Acceptance coverage

- Local setup and the single development command are documented in README.
- Production browser tests verify the TypeScript/Vite application and placeholder Phaser scene boot successfully.
- Viewport checks verify the approximately 390 px target and responsive desktop behavior.
- Build and automated tests pass; CI runs install, lint, formatting, build, and Chromium tests.
- Reserved modules and their README files explain future ownership without defining GameState, events, effects, scoring, persistence, or gameplay rules.
- No out-of-scope product behavior is implemented.

## Assumptions and limitations

- The 320 × 240 canvas size is a technical placeholder only. It does not constrain the final map or gameplay contract and needs no product decision for this foundation issue.
- Phaser is dynamically imported after the HTML shell. Its production chunk is about 1.20 MB minified / 319 KB gzip and triggers Vite's bundle-size advisory. No production performance claim is made.
- Automated browser coverage uses Chromium. Physical phone testing, Safari/Firefox coverage, and Human Product Verify remain pending.
- Art is temporary geometry, with no hand-drawn narrative assets or gameplay controls.
- Future gameplay work must use an approved issue and finalized relevant implementation contracts.

Human Product Verify should confirm clean opening on a phone, visible responsive placeholder rendering, and that these boundaries leave the upcoming GameState/Event contracts open.
