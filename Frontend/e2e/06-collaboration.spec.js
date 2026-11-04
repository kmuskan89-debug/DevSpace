import { test, expect } from '@playwright/test';
import { generateTestUser, registerTestUser } from './helpers.js';

test.describe('6. Team Collaboration & Members Workflows', () => {
  test('lists workspace members, sends invitation, and inspects roles & permissions matrix', async ({ page }) => {
    const user = generateTestUser('collab_flow');
    await registerTestUser(page, user);

    // 1. Navigate to Members page via sidebar
    await page.locator('aside nav').getByRole('link', { name: 'Members' }).click();
    await page.waitForURL(/\/members/, { timeout: 15000 });

    // 2. Verify workspace owner is in the collaborators list
    await expect(page.getByRole('heading', { name: /workspace members/i })).toBeVisible();
    await expect(page.getByText(user.name).first()).toBeVisible();
    await expect(page.getByText(/owner/i).first()).toBeVisible();

    // 3. Open Invite Member modal
    await page.getByTestId('open-invite-modal-btn').click();
    const inviteModal = page.getByRole('dialog');
    await expect(inviteModal).toBeVisible();

    // Fill invitation form
    const inviteeEmail = `invitee_${Date.now().toString().slice(-4)}@devspace.test`;
    const emailInput = inviteModal.getByPlaceholder(/colleague@company.com/i);
    await emailInput.fill(inviteeEmail);
    await emailInput.press('Enter');

    // Verify invitation confirmation / token display
    await expect(page.getByText(/invitation sent|invitation generated/i).first()).toBeVisible();

    // Close modal if still visible
    const doneBtn = page.getByRole('button', { name: /done|cancel/i });
    if (await doneBtn.isVisible()) {
      await doneBtn.click();
    }

    // 4. Switch to "Pending Invitations" tab
    await page.getByRole('button', { name: /pending invitations/i }).click();
    await expect(page.getByRole('cell', { name: inviteeEmail })).toBeVisible();

    // 5. Switch to "Roles & Permissions" matrix tab
    await page.getByRole('button', { name: /roles & permissions/i }).click();
    await expect(page.getByText(/view workspace projects/i).first()).toBeVisible();
    await expect(page.getByText(/create & edit projects/i).first()).toBeVisible();
  });
});

