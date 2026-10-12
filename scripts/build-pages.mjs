import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Local/PR QA uses the same source twice. Deployment checks out main/dev separately.
const temporaryOutput = await mkdtemp(join(tmpdir(), 'pawject-preview-'));
try {
  execFileSync(
    process.execPath,
    ['node_modules/typescript/bin/tsc', '--noEmit'],
    {
      stdio: 'inherit',
    },
  );
  for (const args of [
    ['build'],
    ['build', '--mode', 'dev-preview', '--outDir', temporaryOutput],
  ]) {
    execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', ...args], {
      stdio: 'inherit',
    });
  }
  await mkdir(resolve('dist/dev'), { recursive: true });
  await cp(temporaryOutput, resolve('dist/dev'), { recursive: true });
  execFileSync(process.execPath, ['scripts/verify-pages.mjs'], {
    stdio: 'inherit',
  });
} finally {
  await rm(temporaryOutput, { recursive: true, force: true });
}
