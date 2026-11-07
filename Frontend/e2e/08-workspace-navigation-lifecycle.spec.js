import { test, expect } from '@playwright/test';
import { generateTestUser, registerTestUser } from './helpers.js';

test.describe('8. Integrated Workspace Navigation & Lifecycle Workflows', () => {
  test('verifies workspace backlog empty state, multi-project switching, dynamic sprint board navigation, view toggles, history navigation, and workspace isolation', async ({ page }) => {
    test.slow();
    const user = generateTestUser('lifecycle_flow');
    await registerTestUser(page, user);

    // 1. Backlog empty state with 0 projects
    const backlogNav = page.locator('aside nav').getByRole('link', { name: 'Backlog' });
    await backlogNav.click();
    await page.waitForURL(/\/workspace\/[a-zA-Z0-9_-]+\/backlog/, { timeout: 15000 });

    await expect(page.getByText(/no projects in this workspace/i)).toBeVisible();
    const createProjectBtn = page.getByRole('button', { name: /create project/i }).first();
    await expect(createProjectBtn).toBeVisible();

    // 2. Click Create Project from empty state -> navigates to projects
    await createProjectBtn.click();
    await page.waitForURL(/\/projects/, { timeout: 15000 });
    await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible();

    // 3. Create Project A
    await page.getByRole('button', { name: /create project/i }).first().click();
    const randSuffix = Date.now().toString().slice(-4);
    const projAName = `Alpha Service ${randSuffix}`;
    const modalA = page.locator('div[role="dialog"]').first();
    await expect(modalA).toBeVisible();
    await modalA.getByPlaceholder(/e\.g\. Core Auth Service/i).fill(projAName);
    await modalA.getByPlaceholder(/e\.g\. AUTH/i).fill(`A${randSuffix}`);
    await modalA.getByRole('button', { name: /create project/i }).click();
    await expect(modalA).not.toBeVisible();
    await expect(page.getByRole('button', { name: projAName })).toBeVisible({ timeout: 10000 });

    // 4. Create Project B
    await page.getByRole('button', { name: /create project/i }).first().click();
    const projBName = `Beta Service ${randSuffix}`;
    const modalB = page.locator('div[role="dialog"]').first();
    await expect(modalB).toBeVisible();
    await modalB.getByPlaceholder(/e\.g\. Core Auth Service/i).fill(projBName);
    await modalB.getByPlaceholder(/e\.g\. AUTH/i).fill(`B${randSuffix}`);
    await modalB.getByRole('button', { name: /create project/i }).click();
    await expect(modalB).not.toBeVisible();
    await expect(page.getByRole('button', { name: projBName })).toBeVisible({ timeout: 10000 });

    // 5. Navigate to Workspace Backlog -> verify multi-project selector
    await backlogNav.click();
    await page.waitForURL(/\/workspace\/[a-zA-Z0-9_-]+\/backlog/, { timeout: 15000 });

    await expect(page.getByText('Workspace Backlog')).toBeVisible();
    await expect(page.getByText('2 projects')).toBeVisible();

    const projectSelect = page.locator('#workspace-backlog-project-select');
    await expect(projectSelect).toBeVisible();

    // Switch to Project B in dropdown
    const options = await projectSelect.locator('option').allInnerTexts();
    const betaOption = options.find((opt) => opt.includes(projBName));
    expect(betaOption).toBeDefined();

    await projectSelect.selectOption({ label: betaOption });
    await expect(page).toHaveURL(/\?project=[a-zA-Z0-9_-]+/);

    // 6. Navigate to Sprints via Sidebar -> verify dynamic project ID resolution
    const sprintsNav = page.locator('aside nav').getByRole('link', { name: 'Sprints' });
    await sprintsNav.click();
    await page.waitForURL(/\/projects\/[a-zA-Z0-9_-]+\/board/, { timeout: 15000 });

    // Ensure URL never has hardcoded demo project ID
    expect(page.url()).not.toContain('proj-auth-service');
    expect(page.url()).not.toContain('undefined');

    // 7. Navigate to My Tasks -> test view mode toggles
    const myTasksNav = page.locator('aside nav').getByRole('link', { name: 'My Tasks' });
    await myTasksNav.click();
    await page.waitForURL(/\/tasks/, { timeout: 15000 });

    // Toggle to Kanban Board view
    const boardViewBtn = page.getByRole('button', { name: 'Kanban Board View' });
    await boardViewBtn.click();
    await expect(boardViewBtn).toHaveClass(/font-semibold/);

    // Toggle back to Grouped Status List view
    const groupedViewBtn = page.getByRole('button', { name: 'Grouped Status List' });
    await groupedViewBtn.click();
    await expect(groupedViewBtn).toHaveClass(/font-semibold/);

    // 8. Test Browser Back and Forward navigation
    await page.goBack();
    await page.waitForURL(/\/board/, { timeout: 15000 });
    expect(sprintsNav).toHaveClass(/font-semibold/);

    await page.goForward();
    await page.waitForURL(/\/tasks/, { timeout: 15000 });
    expect(myTasksNav).toHaveClass(/font-semibold/);

    // 9. Switch workspace and verify isolation
    // Open workspace switcher dropdown
    const wsSelectorBtn = page.locator('aside').getByRole('button', { name: new RegExp(user.name, 'i') }).first();
    await wsSelectorBtn.click();

    // Click "Create Workspace" in dropdown
    await page.getByRole('button', { name: /create workspace/i }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const newWsName = `Isolated Team Space ${randSuffix}`;
    await dialog.locator('#workspace-name').fill(newWsName);
    await dialog.getByRole('button', { name: /create workspace/i }).click();

    // Wait for navigation into the new workspace
    await page.waitForURL(/\/workspace\//, { timeout: 15000 });

    // Navigate to projects in the new workspace
    const newWsProjectsNav = page.locator('aside nav').getByRole('link', { name: 'Projects' });
    await newWsProjectsNav.click();
    await page.waitForURL(/\/projects/, { timeout: 15000 });

    // Verify neither Project A nor Project B exists in the new workspace
    await expect(page.getByText(projAName)).not.toBeVisible();
    await expect(page.getByText(projBName)).not.toBeVisible();
    await expect(page.getByText(/no projects created yet/i)).toBeVisible();
  });
});
