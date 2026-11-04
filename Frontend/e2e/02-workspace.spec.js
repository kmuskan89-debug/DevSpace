import { test, expect } from '@playwright/test';
import { generateTestUser, registerTestUser } from './helpers.js';

test.describe('2. Workspace Management Workflows', () => {
  test('creates a workspace and navigates between multiple workspaces', async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.text().includes('REACT ERROR') || msg.text().includes('CALLER STACK') || msg.type() === 'error') {
        console.log('[BROWSER]', msg.text());
      }
    });

    const user = generateTestUser('ws_flow');
    await registerTestUser(page, user);

    // Initial default workspace is created automatically on registration
    await expect(page).toHaveURL(/\/dashboard/);

    // Click Workspace selector in the sidebar to open dropdown
    const wsSelectorBtn = page.locator('aside').getByRole('button', { name: new RegExp(user.name, 'i') }).first();
    await wsSelectorBtn.click();

    // Click Create Workspace in the dropdown
    await page.getByRole('button', { name: /create workspace/i }).first().click();

    // Wait for modal dialog to be visible
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Fill workspace creation modal
    const wsName = `Platform Eng ${Date.now().toString().slice(-4)}`;
    await dialog.locator('#workspace-name').fill(wsName);
    await dialog.getByRole('button', { name: /create workspace/i }).click();

    // Verify navigation to new workspace overview
    await page.waitForURL(/\/workspace\//, { timeout: 15000 });
    await expect(page.getByText(wsName).first()).toBeVisible();

    // Open workspace switcher again and verify both workspaces exist
    await wsSelectorBtn.click();
    await expect(page.getByText(wsName).first()).toBeVisible();
    await expect(page.getByText(`${user.name}'s Workspace`).first()).toBeVisible();

    // Switch back to original workspace
    await page.getByRole('button', { name: new RegExp(`${user.name}'s Workspace`, 'i') }).click();
    await expect(page.getByText(`${user.name}'s Workspace`).first()).toBeVisible();
  });

  test('verifies workspace details and settings accessibility', async ({ page }) => {
    const user = generateTestUser('ws_details');
    await registerTestUser(page, user);

    // Navigate to workspace settings
    await page.locator('aside button[title]').first().click();
    await page.getByRole('button', { name: /workspace settings/i }).first().click();

    await page.waitForURL(/\/settings/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /workspace settings/i })).toBeVisible();
  });
});

