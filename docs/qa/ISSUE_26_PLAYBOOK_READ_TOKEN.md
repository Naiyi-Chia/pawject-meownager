# Issue #26 — Private Playbook read credential

Engineering implementation evidence, not Technical Review PASS or Human approval.

## Change

The collector step receives `PLAYBOOK_READ_TOKEN` separately from the normal Pawject `GH_TOKEN`. Two distinct API readers prevent fallback or credential confusion:

- Pawject Issue, handoff, checks and status reads retain the repository token.
- Only `/repos/Naiyi-Chia/naiyi-product-playbook/commits/HEAD` and `/repos/Naiyi-Chia/naiyi-product-playbook/contents/AI_PRODUCT_DEVELOPMENT_PLAYBOOK.md?ref=<full SHA>` receive the private read token. The returned commit SHA is validated before the second read. Other paths and unpinned refs are rejected before network access.

Both readers issue GET requests without write operations. Branch/diff retrieval stays on the existing read-only Git path. Both tokens are removed from Git subprocess environments. Secrets remain in collector closures and request authentication; envelope artifacts contain only evidence or sanitized results, never token values. The reviewer and reporting jobs receive no Playbook credential. No Playbook copy or visibility/permission change is introduced.

Preparation and review envelope handling are shared by the CLI and tests. Missing/blank Playbook credentials produce a specific BLOCKED setup diagnostic. Unauthorized/inaccessible API errors produce a sanitized BLOCKED access diagnostic without propagating raw error text. Failed preparation contains no partial context, and the reviewer short-circuits an existing BLOCKED result without calling OpenAI. The existing reporter writes the validated result durably to the Issue.

## Validation

- Existing and focused `npm run test:review`: 20 tests PASS. Tests cover both credential routes, actual HTTP Bearer/GET requests and 401/403/404 responses, the exact two pinned Playbook requests, prohibited routes, missing credentials, failure at either private read, hostile raw errors containing sentinel credentials, invalid returned SHA, secret absence from artifacts/reviewer payload/comments, and durable BLOCKED reporting without any OpenAI call.
- `npm run lint`: PASS.
- `npm run format:check`: PASS.
- `git diff --check`: PASS.
- Workflow Actionlint: accepted with only the existing documented diagnostic for GitHub's newer `concurrency.queue` property suppressed.

No application/gameplay/UI changes are included. Real token creation and authorization are Human setup; tests use fake sentinel credentials and do not call OpenAI or change billing. End-to-end validation remains pending release to `main`, Human secret setup, and a fresh small implementation Issue. The Engineering Ready comment on #26 will use the currently released collector, which may still report the original private-Playbook access blocker.

Setup instructions and retry behavior: [automation setup](ISSUE_18_AUTO_TECHNICAL_REVIEW.md#setup-and-deferred-end-to-end-validation). Canonical workflow semantics remain owned by the private Playbook; this adapter adds only a restricted authentication route.
