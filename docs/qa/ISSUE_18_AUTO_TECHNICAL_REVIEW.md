# Issue #18 — Automated Technical Review experiment

Engineering implementation evidence; this document does not grant Technical Review PASS or any Human approval.

## Adapter and permissions

`.github/workflows/technical-review.yml` accepts newly created Issue comments containing the exact `<!-- engineering-ready-for-review -->` marker only from `Naiyi-Chia` in this repository. PR comments, edited comments, unrelated comments and other actors are rejected before secret access. The deterministic collector repeats these checks and verifies that the handoff still matches its live GitHub comment.

Four jobs separate authority:

1. **collect**: read-only repository / Issue / checks / status permissions. Runs default-branch adapter code, reads the reviewed commit with Git, and never checks out or executes implementation code. Pawject API reads use its normal `GITHUB_TOKEN`; the two canonical private Playbook reads use the separate `PLAYBOOK_READ_TOKEN` added in Issue #26. The private credential is restricted by the adapter to the canonical HEAD commit lookup and the canonical document at the resulting full SHA. It is removed from Git subprocess environments and never serialized into artifacts, reviewer input, logs, or comments.
2. **claim**: Issue-comment write permission only. Creates a durable PENDING claim keyed by Issue + full commit SHA. A bot-owned existing claim/result skips the review. Workflow concurrency serializes the full lifecycle for trusted handoffs per Issue, using `queue: max` to preserve up to 100 queued runs. Other actors and unrelated comments use separate groups and cannot replace a pending trusted handoff. GitHub queue overflow/cancellation remains visible in Actions.
3. **review**: no GitHub permissions or GitHub token passed to the reviewer process. Calls a fresh Responses API request with no conversation ID, previous response, tools, or repository credentials. Only this job receives `OPENAI_API_KEY`.
4. **report**: Issue-comment write permission only, no API key. Independently validates result identity and schema, then updates the claim with PASS / FAIL / BLOCKED. Missing/malformed artifacts produce BLOCKED. Non-PASS marks the job failed. Reporting permission/network failures remain visible in Actions.

The model receives untrusted evidence separately from fixed reviewer instructions. It can return only review data; there is no code execution or action dispatcher for model output. Comments escape embedded HTML markers and mentions. No PR creation, merge, repair, Issue closure, Integration Approval, Product Verify, or Release Approval is implemented.

## Deterministic evidence and limits

The handoff must contain exactly one `Branch:` scoped branch and one `Commit:` full 40-character SHA. The SHA must match the current remote branch head. The collector pins the latest target SHA and canonical Playbook SHA, and records the merge base. Review diff is `target...head`, matching the canonical review workflow.

The default integration baseline is `dev`. An explicit Issue contract can use a standalone `Base branch:`, `Target branch:`, or `Integration baseline:` line (backticks optional). Ambiguous/conflicting contracts, a handoff target disagreement, or an unspecified Epic Integration Branch block review. `main` is not accepted as an integration target for this experiment.

Context includes Issue body, live handoff, root and applicable nested AGENTS at reviewed head and target, actual diff, all surviving changed-file contents, root product docs, commit checks/status metadata, and current Playbook sections 12, 14, 15 and 17. The execution adapter remains subordinate to these sources, with the Issue's explicit experiment restriction against automatic PR creation preserved.

Limits are 60 changed files, 350,000 UTF-8 bytes of serialized context, 100 checks and 100 commit statuses, 2 MB per API JSON response, 120-second request timeout, and 6,000 model output tokens. Required evidence is never truncated to fit. Empty changes, binary changes, nonregular changed/context files, API errors and over-budget evidence block review. The reviewer must BLOCK when supplied code surroundings or validation are insufficient. CI metadata is evidence, not a claim that the reviewer executed tests.

The parser requires completed Responses output, rejects refusals/incomplete output, and applies strict local shape, type and size checks in addition to API JSON Schema. PASS requires independent checks and zero blocking findings. A model/API failure never synthesizes PASS.

## Setup and deferred end-to-end validation

After independent Technical Review and the existing integration/product/release gates, the workflow must reach the default branch (`main`) before `issue_comment` can trigger it.

The Human configures the repository Actions secret `OPENAI_API_KEY` and API billing/limits. Never paste the credential into chat or an Issue. Optional repository variable `TECHNICAL_REVIEW_MODEL` overrides the default `gpt-6.1-sol`. No real API call or billing change was performed during implementation.

For the private canonical Playbook, the Human must also create a fine-grained GitHub PAT restricted to **only** `Naiyi-Chia/naiyi-product-playbook` with minimum repository permission **Contents: Read-only** (and GitHub's required metadata access). Save its value in Pawject's repository Actions secrets as **`PLAYBOOK_READ_TOKEN`**. Do not grant write access, change Playbook visibility, or copy the canonical document into Pawject. Do not paste or commit the token. Only the collector step receives this secret; claim, reviewer, and reporter jobs do not. The normal repository token continues to handle all Pawject API reads.

Missing/blank `PLAYBOOK_READ_TOKEN`, invalid/expired credentials, or inaccessible Playbook reads produce durable **BLOCKED** evidence before any OpenAI call, with a credential-free setup diagnostic. The collector never falls back to its Pawject token for private Playbook reads. Configure/renew the restricted token and follow the documented intentional retry procedure. After Issue #26 reaches `main` through the existing gates and Human secret setup is complete, validate with a fresh tiny implementation Issue. The current production collector cannot use this fix until it has been released.

After release, use a fresh small implementation Issue with a full-SHA Engineering Ready handoff. Confirm one durable result, inspected diff, model/commit identity, and preserved Human gates. Then test duplicate delivery/same-commit handoff, an unrelated comment, and a PR comment. Record API usage/cost and independent review quality before adopting beyond this repository. These live acceptance criteria remain pending until release and secret setup.

Claims intentionally survive interrupted runs to prevent duplicate charges. A canceled run may leave PENDING; it never implies PASS. After inspecting the Actions run and ensuring no review is still active, the owner may remove the bot claim and post a new handoff to intentionally retry the same commit. A handoff for a new commit naturally uses a new key. Re-running an entire claimed workflow does not automatically charge for a second review. Automatic repair/retry is out of scope.

## Validation

- `npm run test:review`: 14 deterministic tests, including actual workflow claim/report script execution with mocked GitHub and artifact I/O.
- Actionlint: new workflow and amended CI workflow accepted with only the exact `unexpected key "queue" for "concurrency" section` diagnostic suppressed. The released linter does not yet recognize the documented GitHub `queue: max` field; its value and cancellation compatibility are asserted in the deterministic tests. All other diagnostics remain enabled.
- `npm run lint`: PASS.
- `npm run format:check`: PASS.
- `npm run build:pages`: PASS; existing Phaser bundle-size warning remains.
- `npm run test:pages`: 118 tests PASS across production and Dev Preview, including 375 px / 390 px mobile, landscape and desktop layouts.
- `git diff --check`: PASS.

Existing Pages workflow and gameplay implementation are unchanged; CI additionally runs the deterministic review tests. True GitHub event delivery, repository permissions, configured model access, API billing, and post-release review quality are not locally verified.

Official implementation references: [Responses structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses), [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [GitHub issue_comment event](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#issue_comment), [GitHub concurrency queue](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).
