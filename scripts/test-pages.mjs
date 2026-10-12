import { execFileSync } from 'node:child_process';

execFileSync(
  process.execPath,
  ['node_modules/@playwright/test/cli.js', 'test'],
  {
    stdio: 'inherit',
    env: { ...process.env, PAWJECT_COMPOSITE: '1' },
  },
);
