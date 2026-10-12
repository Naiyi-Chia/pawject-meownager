import { defineConfig } from '@playwright/test';

const previewOnly = process.env.PAWJECT_PREVIEW === '1';
const basePath = previewOnly
  ? '/pawject-meownager/dev/'
  : '/pawject-meownager/';
const environments =
  process.env.PAWJECT_COMPOSITE === '1'
    ? ['production', 'dev']
    : [previewOnly ? 'dev' : 'production'];

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  projects: environments.map((environment) => ({
    name: environment,
    use: {
      baseURL: `http://127.0.0.1:4173/pawject-meownager/${environment === 'dev' ? 'dev/' : ''}`,
    },
  })),
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort${previewOnly ? ' --mode dev-preview' : ''}`,
    url: `http://127.0.0.1:4173${basePath}`,
    reuseExistingServer: false,
  },
});
