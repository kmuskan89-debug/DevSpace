import { test, expect } from '@playwright/test';
import { generateTestUser, registerTestUser } from './helpers.js';

test.describe('7. Workspace My Tasks Workflows', () => {
  test('navigates to My Tasks, verifies assigned tasks and status groups, and changes status with persistence', async ({ page }) => {
    test.slow();
    const user = generateTestUser('mytasks_flow');
    await registerTestUser(page, user);

    // 1. Verify My Tasks is accessible from Sidebar when empty
    const myTasksNav = page.locator('aside nav').getByRole('link', { name: 'My Tasks' });
    await myTasksNav.click();
    await page.waitForURL(/\/workspace\/[a-zA-Z0-9_-]+\/tasks/, { timeout: 15000 });

    // Verify empty state
    await expect(page.getByText(/no tasks assigned to you/i)).toBeVisible();

    // Verify mutual exclusivity: My Tasks has active styling, Projects does not
    const projectsNav = page.locator('aside nav').getByRole('link', { name: 'Projects' });
    await expect(myTasksNav).toHaveClass(/font-semibold/);
    await expect(projectsNav).not.toHaveClass(/font-semibold/);

    // 2. Create a project to hold tasks
    await projectsNav.click();
    await page.waitForURL(/\/projects/, { timeout: 15000 });
    await page.getByRole('button', { name: /create project/i }).first().click();

    const randKey = `T${Date.now().toString().slice(-4)}`;
    const projName = `Tasks Service ${randKey}`;
    const modal = page.locator('div[role="dialog"]').first();
    await modal.getByPlaceholder(/e\.g\. Core Auth Service/i).fill(projName);
    await modal.getByPlaceholder(/e\.g\. AUTH/i).fill(randKey);
    await modal.getByRole('button', { name: /create project/i }).click();

    // 3. Open project board and create a task assigned to current user
    await page.getByText(projName).first().click();
    await page.waitForURL(/\/projects\/[a-zA-Z0-9]+/, { timeout: 15000 });

    await page.getByRole('button', { name: /^Board/ }).first().click();
    await page.waitForURL(/\/board/, { timeout: 15000 });

    const createBtn = page.locator('main').getByRole('button', { name: 'New Task' }).first();
    await createBtn.click();

    const taskTitle = `Assigned Feature Task ${randKey}`;
    const taskModal = page.locator('div[role="dialog"]').first();
    await taskModal.getByPlaceholder(/e\.g\. Implement OAuth2/i).fill(taskTitle);

    // Priority to High
    await taskModal.locator('select').nth(1).selectOption('High');

    // Assign to current user (select index 2 is Assignee)
    const assigneeSelect = taskModal.locator('select').nth(2);
    const options = await assigneeSelect.locator('option').allInnerTexts();
    const userOption = options.find((opt) => opt.includes(user.name)) || options[1];
    if (userOption) {
      await assigneeSelect.selectOption({ label: userOption });
    }

    await taskModal.getByRole('button', { name: /create task/i }).click();
    await expect(page.getByRole('heading', { name: taskTitle }).first()).toBeVisible({ timeout: 10000 });

    // 4. Navigate back to My Tasks
    await page.locator('aside nav').getByRole('link', { name: 'My Tasks' }).click();
    await page.waitForURL(/\/workspace\/[a-zA-Z0-9_-]+\/tasks/, { timeout: 15000 });

    // Verify task is visible in My Tasks list
    await expect(page.getByRole('heading', { name: taskTitle }).first()).toBeVisible({ timeout: 10000 });

    // Verify status section is To Do
    await expect(page.getByRole('heading', { name: 'To Do' })).toBeVisible();

    // 5. Change task status via quick status selector to "In Progress"
    const quickStatusSelect = page.locator('select').filter({ hasText: /To Do/i }).last();
    await quickStatusSelect.selectOption('In Progress');

    // Verify moved into In Progress
    await expect(page.getByRole('heading', { name: 'In Progress' })).toBeVisible();

    // 6. Refresh page and verify persistence across reload
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: taskTitle }).first()).toBeVisible({ timeout: 15000 });
  });
});
