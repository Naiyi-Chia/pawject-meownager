import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 1440, height: 900 },
]) {
  test(`production shell renders without overflow at ${viewport.width}×${viewport.height}`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.setViewportSize(viewport);
    await page.goto('./');
    await expect(page).toHaveTitle('Pawject Meownager');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Meownager',
    );
    await expect(page.getByRole('status')).toHaveText(
      'Placeholder scene ready',
    );
    const canvas = page.locator('#game-host canvas');
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveCount(1);
    await expect
      .poll(() => canvas.evaluate((node) => (node as HTMLCanvasElement).width))
      .toBe(320);
    const bounds = await canvas.boundingBox();
    expect(bounds!.width).toBeGreaterThan(200);
    expect(bounds!.height).toBeGreaterThan(150);
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath('shell.png'),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
}

test('the same Phaser canvas adapts from phone to desktop and back', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await expect(page.getByRole('status')).toHaveText('Placeholder scene ready');
  const canvas = page.locator('canvas');
  const original = await canvas.elementHandle();
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(async () => {
        const box = await canvas.boundingBox();
        const host = await page.locator('#game-host').boundingBox();
        return Math.abs(box!.width - host!.width);
      })
      .toBeLessThan(1);
    expect(
      await original!.evaluate(
        (node) => node === document.querySelector('canvas'),
      ),
    ).toBe(true);
    await expect(canvas).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
