import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: {
    timeout: 8000,
  },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: 'http://localhost:5199',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  webServer: [
    {
      command: `node "${path.resolve(__dirname, '../Backend/e2e-server.js')}"`,
      port: 5055,
      timeout: 30000,
      reuseExistingServer: false,
    },
    {
      command: 'npx vite --port 5199 --mode test',
      port: 5199,
      timeout: 30000,
      reuseExistingServer: false,
    },
  ],
});

