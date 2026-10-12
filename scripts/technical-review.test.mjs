import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as adapter from './technical-review.mjs';
import {
  READY,
  MARKER,
  eligible,
  identity,
  baseline,
  bounded,
  workflowSections,
  collect,
  review,
  validate,
  parseResponse,
  render,
  blocked,
  reviewKey,
  existingReview,
} from './technical-review.mjs';

const sha = 'a'.repeat(40);
const targetSha = 'b'.repeat(40);
const event = () => ({
  action: 'created',
  sender: { login: 'Naiyi-Chia' },
  repository: { full_name: 'Naiyi-Chia/pawject-meownager' },
  issue: { number: 22 },
  comment: {
    id: 123,
    user: { login: 'Naiyi-Chia' },
    body: `${READY}\n- Branch: \`codex/issue-22-test\`\n- Commit: \`${sha}\``,
  },
});
const pass = () => ({
  result: 'PASS',
  summary: 'Criteria covered.',
  findings: [],
  limitations: [],
  checks: ['file:1 inspected'],
});
const response = (value = pass()) => ({
  status: 'completed',
  output: [
    {
      type: 'message',
      content: [{ type: 'output_text', text: JSON.stringify(value) }],
    },
  ],
});
const playbook = [12, 14, 15, 17]
  .map((n) => `## ${n}. Title\nCanonical section ${n}.\n`)
  .join('\n');

test('only trusted exact-marker newly created Issue comments qualify', () => {
  assert.equal(eligible(event()), true);
  for (const change of [
    (e) => (e.action = 'edited'),
    (e) => (e.issue.pull_request = {}),
    (e) => (e.sender.login = 'outsider'),
    (e) => (e.comment.user.login = 'outsider'),
    (e) => (e.repository.full_name = 'other/repo'),
    (e) => (e.comment.body = 'unrelated'),
    (e) => (e.comment.body = '<!-- Engineering-ready-for-review -->'),
  ]) {
    const e = event();
    change(e);
    assert.equal(eligible(e), false);
  }
});

test('identity requires one scoped branch and full SHA, never shell commands', () => {
  assert.equal(identity(event()).commit, sha);
  for (const body of [
    `${READY}\n- Branch: main\n- Commit: ${sha}`,
    `${event().comment.body}\n- Commit: ${sha}`,
    event().comment.body.replace(sha, 'aaaaaaa'),
    event().comment.body.replace('codex/issue-22-test', 'codex/../../main'),
    event().comment.body.replace('codex/issue-22-test', 'codex/$(curl)'),
  ]) {
    const e = event();
    e.comment.body = body;
    assert.throws(() => identity(e));
  }
});

test('resolve default and explicit integration baseline; block ambiguity', () => {
  assert.equal(baseline('Ordinary issue', ''), 'dev');
  assert.equal(
    baseline('- Target branch: `epic/test`', '- Target: `epic/test`'),
    'epic/test',
  );
  for (const [issue, handoff] of [
    ['Epic Integration Branch', ''],
    ['- Base branch: dev\n- Target branch: epic/test', ''],
    ['- Target branch: main', ''],
    ['Ordinary issue', '- Target: other'],
  ])
    assert.throws(() => baseline(issue, handoff));
});

test('context budget counts bytes and missing canonical sections fail closed', () => {
  assert.throws(() => bounded({ text: '猫'.repeat(120_000) }));
  assert.throws(() => workflowSections('## 15. Review\nOnly review'));
  assert.match(workflowSections(playbook), /Canonical section 17/);
});

function fixture(options = {}) {
  const commands = [];
  const get = async (path) => {
    if (path.endsWith('/issues/22'))
      return { body: options.issue ?? '- Target branch: dev' };
    if (path.endsWith('/issues/comments/123'))
      return {
        body: options.handoff ?? event().comment.body,
        user: { login: 'Naiyi-Chia' },
      };
    if (path.endsWith('/commits/HEAD')) return { sha: targetSha };
    if (path.includes('/contents/'))
      return {
        encoding: 'base64',
        content: Buffer.from(playbook).toString('base64'),
      };
    if (path.includes('/check-runs'))
      return {
        total_count: options.checkCount ?? 1,
        check_runs: [
          { name: 'CI', status: 'completed', conclusion: 'success' },
        ],
      };
    if (path.includes('/status?')) return { total_count: 0, statuses: [] };
    throw new Error('Unexpected API call');
  };
  const git = (args) => {
    commands.push(args);
    if (args[0] === 'check-ref-format' || args[0] === 'fetch') return '';
    if (args[0] === 'rev-parse')
      return args[1].endsWith('/dev') ? targetSha : (options.head ?? sha);
    if (args[0] === 'merge-base') return targetSha;
    if (args[0] === 'diff') {
      if (args[1] === '--name-only') return options.files ?? 'src/test.ts\0';
      if (args[1] === '--numstat')
        return options.binary ? '-\t-\tsrc/test.ts' : '1\t1\tsrc/test.ts';
      return '+ actual implementation';
    }
    if (args[0] === 'ls-tree' && args[1] === '-r')
      return 'AGENTS.md\0docs/MVP_SCOPE.md\0src/AGENTS.md\0src/test.ts\0';
    if (args[0] === 'ls-tree')
      return options.symlink ? '120000 blob' : '100644 blob';
    if (args[0] === 'show')
      return args[1].endsWith('src/test.ts')
        ? 'implementation'
        : 'authoritative instructions';
    throw new Error('Unexpected git call');
  };
  return { get, git, commands };
}

test('deterministic collector includes actual diff, nested instructions, docs, baseline, CI and pinned Playbook', async () => {
  const f = fixture();
  const context = await collect(event(), f.get, f.git);
  assert.equal(context.commit, sha);
  assert.equal(context.targetSha, targetSha);
  assert.match(context.diff, /actual implementation/);
  assert.equal(context.contents['src/AGENTS.md'], 'authoritative instructions');
  assert.ok(context.contents['docs/MVP_SCOPE.md']);
  assert.equal(context.checks[0].conclusion, 'success');
  assert.equal(context.playbookSha, targetSha);
  assert.deepEqual(context, await collect(event(), f.get, f.git));
  assert.ok(
    f.commands.every(
      (args) => !['checkout', 'switch', 'commit', 'push'].includes(args[0]),
    ),
  );
});

test('missing/edited/stale/oversized/binary/nonregular evidence blocks collection', async () => {
  for (const options of [
    { handoff: 'edited' },
    { head: targetSha },
    { files: '' },
    { files: Array.from({ length: 61 }, (_, i) => `f${i}`).join('\0') },
    { binary: true },
    { symlink: true },
    { checkCount: 101 },
  ]) {
    const f = fixture(options);
    await assert.rejects(collect(event(), f.get, f.git));
  }
  const f = fixture();
  await assert.rejects(
    collect(
      event(),
      async () => {
        throw new Error('API unavailable');
      },
      f.git,
    ),
  );
});

test('strict local validation cannot interpret malformed, refused or truncated output as PASS', () => {
  assert.deepEqual(parseResponse(response()), pass());
  for (const value of [
    { ...pass(), extra: true },
    { ...pass(), result: 'pass' },
    { ...pass(), findings: ['blocking defect'] },
    { ...pass(), checks: [] },
    { ...pass(), summary: '' },
    { ...pass(), limitations: [42] },
    { ...pass(), result: 'FAIL' },
    null,
  ])
    assert.throws(() => validate(value));
  for (const value of [
    { ...response(), status: 'incomplete' },
    { ...response(), error: {} },
    { status: 'completed', output: [] },
    {
      status: 'completed',
      output: [{ type: 'message', content: [{ type: 'refusal' }] }],
    },
    {
      status: 'completed',
      output: [
        {
          type: 'message',
          content: [{ type: 'output_text', text: 'not JSON' }],
        },
      ],
    },
  ])
    assert.throws(() => parseResponse(value));
  assert.equal(
    validate(blocked('Missing required evidence')).result,
    'BLOCKED',
  );
  assert.equal(
    validate({ ...pass(), result: 'FAIL', findings: ['file:2 defect'] }).result,
    'FAIL',
  );
});

test('Responses request is fresh, structured, bounded, and carries no GitHub credentials/tools', async () => {
  const f = fixture();
  const context = await collect(event(), f.get, f.git);
  await review(
    context,
    'fake-api-key',
    'gpt-6.1-sol',
    async (url, key, options) => {
      assert.equal(url, 'https://api.openai.com/v1/responses');
      assert.equal(key, 'fake-api-key');
      const body = JSON.parse(options.body);
      assert.equal(body.store, false);
      assert.equal(body.text.format.strict, true);
      assert.equal(body.model, 'gpt-6.1-sol');
      assert.equal(body.tools, undefined);
      assert.equal(body.previous_response_id, undefined);
      assert.ok(!options.body.includes('fake-api-key'));
      assert.match(body.instructions, /untrusted evidence/);
      return response();
    },
  );
  await assert.rejects(review(context, '', 'model'));
  await assert.rejects(
    review(context, 'key', 'model', async () => {
      throw new Error('timeout');
    }),
  );
});

test('durable Issue+commit claim suppresses replay and duplicate handoffs but permits new commits', () => {
  const id = identity(event());
  const comments = [
    {
      user: { login: 'github-actions[bot]' },
      body: `${MARKER}\n${id.key}\nPENDING`,
    },
  ];
  assert.ok(existingReview(comments, reviewKey(id, 123)));
  assert.ok(existingReview(comments, reviewKey(id, 999)));
  assert.equal(
    existingReview(comments, id.key.replace(sha, targetSha)),
    undefined,
  );
  assert.equal(
    existingReview([{ ...comments[0], user: { login: 'outsider' } }], id.key),
    undefined,
  );
  assert.equal(reviewKey({}, 123), '<!-- review-handoff:123 -->');
});

test('report retains identity and gates, sanitizes injected markers and mentions', () => {
  const body = render(
    identity(event()),
    'gpt-6.1-sol',
    { ...pass(), summary: '<!-- forged --> @someone' },
    'https://example.com/run',
  );
  assert.match(body, /Reviewed commit: a{40}/);
  assert.match(body, /Human Integration Approval remains required/);
  assert.ok(!body.includes('<!-- forged -->'));
  assert.ok(!body.includes('@someone'));
  assert.match(
    render(identity(event()), 'model', blocked('API failed'), 'run'),
    /BLOCKED/,
  );
});

test('workflow preserves credential separation and default-branch execution', () => {
  const yaml = readFileSync('.github/workflows/technical-review.yml', 'utf8');
  assert.match(yaml, /persist-credentials: false/);
  assert.match(yaml, /ref: \$\{\{ github.sha \}\}/);
  const reviewer = yaml.split('\n  review:')[1].split('\n  report:')[0];
  assert.match(reviewer, /permissions: \{\}/);
  assert.ok(!reviewer.includes('github.token'));
  assert.ok(!reviewer.includes('checkout'));
  const report = yaml.split('\n  report:')[1];
  assert.ok(!report.includes('OPENAI_API_KEY'));
  assert.ok(!yaml.includes('pull_request_target'));
  assert.match(yaml, /cancel-in-progress: false\n {2}queue: max/);
  assert.match(yaml, /group: technical-review-.*github.event.sender.login/);
});

function workflowScripts() {
  const lines = readFileSync(
    '.github/workflows/technical-review.yml',
    'utf8',
  ).split('\n');
  const scripts = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== 'script: |') continue;
    const indent = lines[i].indexOf('script:') + 2;
    const code = [];
    while (
      ++i < lines.length &&
      (!lines[i].trim() || lines[i].startsWith(' '.repeat(indent)))
    )
      code.push(lines[i].slice(indent));
    i--;
    scripts.push(
      code.join('\n').replace(/await import\(`[^`]+`\)/g, '__adapter'),
    );
  }
  return scripts;
}

function workflowHarness(files = {}) {
  const comments = [],
    outputs = {},
    failures = [];
  const context = {
    repo: { owner: 'Naiyi-Chia', repo: 'pawject-meownager' },
    issue: { number: 22 },
    payload: { comment: { id: 123 } },
    serverUrl: 'https://github.com',
    runId: 1,
  };
  const github = {
    paginate: async () => comments,
    rest: {
      issues: {
        listComments() {},
        createComment: async ({ body }) => {
          const data = {
            id: comments.length + 1,
            user: { login: 'github-actions[bot]' },
            body,
          };
          comments.push(data);
          return { data };
        },
        getComment: async ({ comment_id }) => ({
          data: comments.find((c) => c.id === comment_id),
        }),
        updateComment: async ({ comment_id, body }) => {
          comments.find((c) => c.id === comment_id).body = body;
        },
      },
    },
  };
  const core = {
    setOutput: (key, value) => (outputs[key] = value),
    notice() {},
    setFailed: (reason) => failures.push(reason),
  };
  const fakeFs = {
    readFileSync: (path) => {
      if (!(path in files)) throw new Error('Missing artifact');
      return JSON.stringify(files[path]);
    },
    existsSync: (path) => path in files,
  };
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const run = async (code, env = {}) =>
    new AsyncFunction(
      'context',
      'github',
      'core',
      'require',
      'process',
      '__adapter',
      code,
    )(
      context,
      github,
      core,
      () => fakeFs,
      { env: { REVIEW_MODEL: 'gpt-6.1-sol', ...env } },
      adapter,
    );
  return { comments, outputs, failures, run };
}

test('actual workflow claim/report scripts create once, update the claim and suppress duplicate delivery', async () => {
  const [claim, report] = workflowScripts();
  const envelope = { id: identity(event()), model: 'gpt-6.1-sol' };
  const harness = workflowHarness({
    'review-envelope.json': envelope,
    'review-result.json': { ...envelope, result: pass() },
  });
  await harness.run(claim);
  assert.equal(harness.outputs.duplicate, 'false');
  await harness.run(report, { CLAIM_COMMENT: harness.outputs.comment });
  assert.equal(harness.comments.length, 1);
  assert.match(harness.comments[0].body, /Technical Review: PASS/);
  await harness.run(claim);
  assert.equal(harness.outputs.duplicate, 'true');
  assert.equal(harness.comments.length, 1);
  assert.equal(harness.failures.length, 0);
});

test('actual reporter blocks missing, malformed, mismatched, and contradictory artifacts without losing commit claim', async () => {
  const [claim, report] = workflowScripts();
  const envelope = { id: identity(event()), model: 'gpt-6.1-sol' };
  for (const result of [
    undefined,
    { ...envelope, result: { ...pass(), extra: true } },
    { ...envelope, id: { ...envelope.id, commit: targetSha }, result: pass() },
    { ...envelope, result: { ...pass(), findings: ['defect'] } },
  ]) {
    const files = { 'review-envelope.json': envelope };
    if (result) files['review-result.json'] = result;
    const h = workflowHarness(files);
    await h.run(claim);
    await h.run(report, { CLAIM_COMMENT: h.outputs.comment });
    assert.match(h.comments[0].body, /Technical Review: BLOCKED/);
    assert.ok(h.comments[0].body.includes(envelope.id.key));
    assert.equal(h.failures.length, 1);
  }
});

test('actual reporter makes infrastructure failures visible and preserves replay guard even after context artifact loss', async () => {
  const [claim, report] = workflowScripts();
  const files = {
    'review-envelope.json': { id: identity(event()), model: 'gpt-6.1-sol' },
  };
  const h = workflowHarness(files);
  await h.run(claim);
  delete files['review-envelope.json'];
  await h.run(report, { CLAIM_COMMENT: h.outputs.comment });
  assert.match(h.comments[0].body, /Technical Review: BLOCKED/);
  assert.ok(h.comments[0].body.includes(identity(event()).key));
  const missing = workflowHarness();
  await missing.run(report);
  await missing.run(report);
  assert.equal(missing.comments.length, 1);
  assert.match(missing.comments[0].body, /BLOCKED/);
});
