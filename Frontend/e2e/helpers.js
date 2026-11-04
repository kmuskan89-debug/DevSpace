/**
 * E2E Test Helpers for DevSpace
 */

export function generateTestUser(prefix = 'e2e_user') {
  const rand = Math.floor(Math.random() * 1000000);
  return {
    name: `User ${rand}`,
    email: `${prefix}_${rand}@devspace.test`,
    password: 'Password123!',
  };
}

export async function registerTestUser(page, user) {
  await page.goto('/register');
  await page.getByPlaceholder('Alex Rivera').fill(user.name);
  await page.getByPlaceholder('alex@company.com').fill(user.email);
  await page.getByPlaceholder('At least 8 characters').fill(user.password);
  await page.getByPlaceholder('Repeat your password').fill(user.password);
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: /create account/i }).click();

  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

export async function loginTestUser(page, email, password) {
  await page.goto('/login');
  await page.getByPlaceholder('name@company.com').fill(email);
  await page.getByPlaceholder('••••••••••••').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

