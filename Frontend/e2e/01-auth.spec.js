import { test, expect } from '@playwright/test';
import { generateTestUser, registerTestUser, loginTestUser } from './helpers.js';

test.describe('1. Authentication & Session Security Workflows', () => {
  test('validates required form fields on login attempt with empty values', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Click Sign In without entering email or password
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText('Email address is required.')).toBeVisible();
    await expect(page.getByText('Password is required.')).toBeVisible();
  });

  test('rejects invalid credentials with an informative error banner', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.getByPlaceholder('name@company.com').fill('nonexistent_user@devspace.test');
    await page.getByPlaceholder('••••••••••••').fill('WrongPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify error message is rendered
    await expect(page.getByText(/email or password is incorrect/i)).toBeVisible();
    expect(page.url()).toContain('/login');
  });

  test('registers a new user, logs in with valid credentials, and logs out successfully', async ({ page }) => {
    const user = generateTestUser('auth_flow');

    // Step 1: Register user
    await registerTestUser(page, user);
    await expect(page).toHaveURL(/\/dashboard/);

    // Step 2: Log out via user dropdown
    // Click user avatar button in Topbar
    const userMenuButton = page.locator('header').getByRole('button').filter({ has: page.locator('img, svg, div') }).last();
    await userMenuButton.click();

    // Click Sign Out
    await page.getByRole('button', { name: /sign out/i }).click();
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);

    // Step 3: Log back in with valid credentials
    await loginTestUser(page, user.email, user.password);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('redirects unauthenticated users away from protected routes to /login', async ({ page }) => {
    // Attempt direct access to protected dashboard
    await page.goto('/dashboard');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);

    // Attempt direct access to protected workspace settings
    await page.goto('/workspace/some-workspace-id/settings');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

