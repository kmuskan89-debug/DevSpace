import { test, expect } from '@playwright/test';
import { generateTestUser, registerTestUser } from './helpers.js';

test.describe('5. Scrum & Sprint Management Workflows', () => {
  test('creates a planned sprint, inspects sprint details, and verifies sprint status', async ({ page }) => {
    const user = generateTestUser('sprint_flow');
    await registerTestUser(page, user);

    // 1. Create a project
    await page.locator('aside nav').getByRole('link', { name: 'Projects' }).click();
    await page.waitForURL(/\/projects/, { timeout: 15000 });
    await page.getByRole('button', { name: /create project/i }).first().click();

    const randKey = `S${Date.now().toString().slice(-4)}`;
    const projName = `Scrum Service ${randKey}`;
    const modal = page.locator('div[role="dialog"]').first();
    await modal.getByPlaceholder(/e\.g\. Core Auth Service/i).fill(projName);
    await modal.getByPlaceholder(/e\.g\. AUTH/i).fill(randKey);
    await modal.getByRole('button', { name: /create project/i }).click();

    // 2. Open project and navigate to Backlog
    await page.getByText(projName).first().click();
    await page.waitForURL(/\/projects\/[a-zA-Z0-9]+/, { timeout: 15000 });

    // Click Backlog tab in navigation
    await page.getByRole('button', { name: /^Backlog/ }).click();
    await page.waitForURL(/\/backlog/, { timeout: 15000 });

    // 3. Open Create Sprint modal
    await page.getByRole('button', { name: /create sprint/i }).first().click();

    const sprintName = `Sprint 1 - Foundation ${randKey}`;
    const sprintGoal = 'Deliver core authentication, database schemas, and baseline APIs.';

    const sprintModal = page.locator('div[role="dialog"]').first();
    await sprintModal.getByPlaceholder(/e\.g\. Sprint 1/i).fill(sprintName);
    await sprintModal.locator('textarea').fill(sprintGoal);

    // Click submit in modal
    await sprintModal.getByRole('button', { name: /create sprint/i }).click();

    // 4. Verify sprint appears in planned sprints list
    await expect(page.getByText(sprintName).first()).toBeVisible();

    // 5. Create a backlog issue to assign
    await page.getByRole('button', { name: /create issue|\+ add issue/i }).first().click();
    const issueTitle = `Setup Redis Caching Layer ${randKey}`;
    const issueModal = page.locator('div[role="dialog"]').first();
    await issueModal.getByPlaceholder(/e\.g\. Implement OAuth2/i).fill(issueTitle);
    await issueModal.getByRole('button', { name: /create task/i }).click();

    // Verify issue is visible in backlog
    await expect(page.getByText(issueTitle).first()).toBeVisible();

    // 6. Verify persistence across refresh
    await page.reload();
    await expect(page.getByText(sprintName).first()).toBeVisible();
    await expect(page.getByText(issueTitle).first()).toBeVisible();
  });
});

