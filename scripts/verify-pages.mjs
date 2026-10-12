import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Fail before uploading if the preview build is misconfigured or contaminates root.
const directory = resolve(process.argv[2] ?? 'dist');
for (const [relativePath, base, title] of [
  ['index.html', '/pawject-meownager/', 'Pawject Meownager'],
  ['dev/index.html', '/pawject-meownager/dev/', '[DEV] Pawject Meownager'],
]) {
  const html = await readFile(resolve(directory, relativePath), 'utf8');
  assert(
    html.includes(`<title>${title}</title>`),
    `Wrong title: ${relativePath}`,
  );
  const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)];
  assert(assets.length >= 2, `Missing compiled assets: ${relativePath}`);
  for (const [, asset] of assets) {
    assert(asset.startsWith(`${base}assets/`), `Wrong asset base: ${asset}`);
    const siteRelativePath = asset.slice('/pawject-meownager/'.length);
    await readFile(resolve(directory, siteRelativePath));
  }
  const hasNoIndex = /<meta\s+name="robots"\s+content="noindex, nofollow"/.test(
    html,
  );
  assert.equal(
    hasNoIndex,
    relativePath.startsWith('dev/'),
    'Wrong robots policy',
  );
}
console.log('Combined Pages artifact verified: production root and /dev/.');
