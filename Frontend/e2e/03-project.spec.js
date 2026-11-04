import { test, expect } from '@playwright/test';
import { generateTestUser, registerTestUser } from './helpers.js';

test.describe('3. Project Management Workflows', () => {
  test('creates a project, inspects details, and verifies persistence across page refresh', async ({ page }) => {
    const user = generateTestUser('proj_flow');
    await registerTestUser(page, user);

    // Navigate to Projects page via sidebar
    await page.locator('aside nav').getByRole('link', { name: 'Projects' }).click();
    await page.waitForURL(/\/projects/, { timeout: 15000 });

    // Open Create Project Modal
    await page.getByRole('button', { name: /create project/i }).first().click();

    // Fill project details
    const randKey = `P${Date.now().toString().slice(-4)}`;
    const projName = `Cloud Service ${randKey}`;
    const projDesc = 'End-to-end cloud infrastructure management service.';

    const modal = page.locator('div[role="dialog"]').first();
    await modal.getByPlaceholder(/e\.g\. Core Auth Service/i).fill(projName);
    await modal.getByPlaceholder(/e\.g\. AUTH/i).fill(randKey);
    await modal.locator('textarea').fill(projDesc);

    // Click submit in modal
    await modal.getByRole('button', { name: /create project/i }).click();

    // Verify project appears in the projects list
    await expect(page.getByText(projName).first()).toBeVisible();
    await expect(page.getByText(randKey).first()).toBeVisible();

    // Refresh page to verify persistence from isolated test database
    await page.reload();
    await expect(page.getByText(projName).first()).toBeVisible();
    await expect(page.getByText(randKey).first()).toBeVisible();

    // Click on the project to open project board / details
    await page.getByText(projName).first().click();
    await page.waitForURL(/\/projects\/[a-zA-Z0-9]+/, { timeout: 15000 });

    // Verify project header displays project name and key
    await expect(page.getByText(projName).first()).toBeVisible();
  });
});

