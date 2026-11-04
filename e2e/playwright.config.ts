import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

// Runs against the stack from docker-compose.e2e.yml (nginx on :8080).
// The first project signs up the first account (it becomes admin) and
// saves its session; every other test starts from that session or from
// none, and creates its own users and leads with unique names, so the
// tests can run in parallel on one database.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:8080'

// Also in tests/helpers.ts
const ADMIN_STATE = path.join(import.meta.dirname, '.auth', 'admin.json')

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /first-signup\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      testIgnore: /\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: ADMIN_STATE },
    },
  ],
})
