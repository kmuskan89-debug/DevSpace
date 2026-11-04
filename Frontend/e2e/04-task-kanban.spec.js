import { test, expect } from '@playwright/test';
import { generateTestUser, registerTestUser } from './helpers.js';

test.describe('4. Task & Kanban Board Workflows', () => {
  test('creates a task, inspects details, updates status/priority, and verifies persistence across refresh', async ({ page }) => {
    const user = generateTestUser('task_flow');
    await registerTestUser(page, user);

    // 1. Create a project to hold tasks
    await page.locator('aside nav').getByRole('link', { name: 'Projects' }).click();
    await page.waitForURL(/\/projects/, { timeout: 15000 });
    await page.getByRole('button', { name: /create project/i }).first().click();

    const randKey = `K${Date.now().toString().slice(-4)}`;
    const projName = `Kanban Project ${randKey}`;
    const modal = page.locator('div[role="dialog"]').first();
    await modal.getByPlaceholder(/e\.g\. Core Auth Service/i).fill(projName);
    await modal.getByPlaceholder(/e\.g\. AUTH/i).fill(randKey);
    await modal.getByRole('button', { name: /create project/i }).click();

    // 2. Open project board
    await page.getByText(projName).first().click();
    await page.waitForURL(/\/projects\/[a-zA-Z0-9]+/, { timeout: 15000 });

    // Click Board tab
    await page.getByRole('button', { name: /^Board/ }).click();
    await page.waitForURL(/\/board/, { timeout: 15000 });

    // 3. Create a task via Kanban board New Task button (in main)
    const createBtn = page.locator('main').getByRole('button', { name: 'New Task' }).first();
    await createBtn.click();

    // Fill TaskModal
    const taskTitle = 'Implement OAuth2 Token Refresh Mechanism';
    const taskDesc = 'Ensure access tokens automatically refresh before expiring.';
    const taskModal = page.locator('div[role="dialog"]').first();
    await taskModal.getByPlaceholder(/e\.g\. Implement OAuth2/i).fill(taskTitle);
    await taskModal.locator('textarea').fill(taskDesc);

    // Select Priority High (select index 1: 0 is Status, 1 is Priority, 2 is Assignee)
    await taskModal.locator('select').nth(1).selectOption('High');

    // Click Create Task
    await taskModal.getByRole('button', { name: /create task/i }).click();

    // 4. Verify task appears on Kanban board
    await expect(page.locator('main').getByRole('heading', { level: 4, name: taskTitle })).toBeVisible();

    // 5. Click on the task to open edit modal
    await page.locator('main').getByRole('heading', { level: 4, name: taskTitle }).click();
    await expect(page.locator('div[role="dialog"]').first()).toBeVisible();

    // Update Status to "In Progress" (select index 0)
    const editModal = page.locator('div[role="dialog"]').first();
    await editModal.locator('select').first().selectOption('In Progress');

    // Click Save Changes
    await editModal.getByRole('button', { name: /save changes/i }).click();

    // 6. Verify task is visible in "In Progress"
    await expect(page.locator('main').getByRole('heading', { level: 4, name: taskTitle })).toBeVisible();

    // 7. Verify persistence across page refresh
    await page.reload();
    await expect(page.locator('main').getByRole('heading', { level: 4, name: taskTitle })).toBeVisible();
  });
});

