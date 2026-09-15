import { defineConfig, devices } from '@playwright/test';

const PORT = 3200;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * `pnpm --filter @zrp/web test:e2e:record` liga vídeo e trace de todos os
 * cenários, para gerar evidência do fluxo. Fora disso os testes não gravam
 * nada, porque o custo por cenário não se paga no dia a dia.
 */
const RECORD = process.env.E2E_RECORD === 'true';

function reporter(): NonNullable<Parameters<typeof defineConfig>[0]['reporter']> {
  if (process.env.CI) return [['github'], ['html', { open: 'never' }]];
  if (RECORD) return [['list'], ['html', { open: 'never' }]];

  return [['list']];
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: reporter(),
  timeout: 30_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: RECORD ? 'on' : 'on-first-retry',
    video: RECORD ? 'on' : 'off',
    screenshot: RECORD ? 'on' : 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `pnpm exec next start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
