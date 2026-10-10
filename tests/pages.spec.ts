import { expect, test } from '@playwright/test';

test('built entry and runtime assets load under the Pages repository path', async ({
  page,
  request,
}) => {
  const basePath = '/pawject-meownager/';
  const response = await request.get('./');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).not.toContain('/src/main.ts');

  const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(
    (match) => match[1],
  );
  expect(assets.some((asset) => asset.endsWith('.js'))).toBe(true);
  expect(assets.some((asset) => asset.endsWith('.css'))).toBe(true);
  for (const asset of assets) {
    expect(asset).toMatch(/^\/pawject-meownager\/assets\//);
    const assetResponse = await request.get(asset);
    expect(assetResponse.status()).toBe(200);
    expect(assetResponse.headers()['content-type']).toMatch(
      asset.endsWith('.js') ? /javascript/ : /text\/css/,
    );
  }

  const runtimeAssets: string[] = [];
  const failedAssets: string[] = [];
  page.on('response', (assetResponse) => {
    if (
      ['script', 'stylesheet'].includes(assetResponse.request().resourceType())
    ) {
      runtimeAssets.push(new URL(assetResponse.url()).pathname);
      if (!assetResponse.ok()) failedAssets.push(assetResponse.url());
    }
  });
  page.on('requestfailed', (failedRequest) =>
    failedAssets.push(failedRequest.url()),
  );
  await page.goto('./');
  await expect(page.getByRole('status')).toHaveText('Placeholder scene ready');
  await expect(page.locator('#game-host canvas')).toBeVisible();
  expect(runtimeAssets.some((asset) => asset.includes('/mountGame-'))).toBe(
    true,
  );
  expect(
    runtimeAssets.every((asset) => asset.startsWith(`${basePath}assets/`)),
  ).toBe(true);
  expect(failedAssets).toEqual([]);
});
