import { expect, test } from '@playwright/test';
import { createGameStorage } from '../src/platform/storage';

test('game storage reads, writes and removes only its own environment keys', async ({
  page,
}) => {
  await page.goto('./');
  // Run the actual storage adapter against Chromium localStorage. No fixture save
  // is written by application boot; gameplay persistence is not implemented yet.
  const result = await page.evaluate((factorySource) => {
    const factory = new Function(
      `return (${factorySource})`,
    )() as typeof createGameStorage;
    const production = factory(localStorage, '/pawject-meownager/');
    const preview = factory(localStorage, '/pawject-meownager/dev/');
    localStorage.setItem('meta', 'legacy-production');
    production.setItem('meta', 'production-save');
    preview.setItem('meta', 'preview-save');
    const before = [production.getItem('meta'), preview.getItem('meta')];
    preview.removeItem('meta');
    const after = [production.getItem('meta'), preview.getItem('meta')];
    return {
      before,
      after,
      legacy: localStorage.getItem('meta'),
      keys: Object.keys(localStorage).sort(),
    };
  }, createGameStorage.toString());
  expect(result.before).toEqual(['production-save', 'preview-save']);
  expect(result.after).toEqual(['production-save', null]);
  expect(result.legacy).toBe('legacy-production');
  expect(result.keys).toEqual(['meta', 'pawject-meownager:production:meta']);
});

test('navigation between both deployed paths preserves isolated saves', async ({
  page,
}) => {
  test.skip(
    process.env.PAWJECT_COMPOSITE !== '1',
    'Requires the composed site',
  );
  await page.goto('/pawject-meownager/');
  await page.evaluate(() => {
    localStorage.setItem(
      'pawject-meownager:production:meta',
      'production-save',
    );
    localStorage.setItem('pawject-meownager:dev:meta', 'dev-save');
  });
  await page.goto('/pawject-meownager/dev/');
  await expect(page).toHaveTitle('[DEV] Pawject Meownager');
  await page.reload();
  await page.goto('/pawject-meownager/');
  await expect(page).toHaveTitle('Pawject Meownager');
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual({
    'pawject-meownager:production:meta': 'production-save',
    'pawject-meownager:dev:meta': 'dev-save',
  });
});
