# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Frontend\e2e\02-workspace.spec.js >> 2. Workspace Management Workflows >> creates a workspace and navigates between multiple workspaces
- Location: Frontend\e2e\02-workspace.spec.js:5:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/register", waiting until "load"

```

# Test source

```ts
  1  | /**
  2  |  * E2E Test Helpers for DevSpace
  3  |  */
  4  | 
  5  | export function generateTestUser(prefix = 'e2e_user') {
  6  |   const rand = Math.floor(Math.random() * 1000000);
  7  |   return {
  8  |     name: `User ${rand}`,
  9  |     email: `${prefix}_${rand}@devspace.test`,
  10 |     password: 'Password123!',
  11 |   };
  12 | }
  13 | 
  14 | export async function registerTestUser(page, user) {
> 15 |   await page.goto('/register');
     |              ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  16 |   await page.getByPlaceholder('Alex Rivera').fill(user.name);
  17 |   await page.getByPlaceholder('alex@company.com').fill(user.email);
  18 |   await page.getByPlaceholder('At least 8 characters').fill(user.password);
  19 |   await page.getByPlaceholder('Repeat your password').fill(user.password);
  20 |   await page.locator('input[type="checkbox"]').check();
  21 |   await page.getByRole('button', { name: /create account/i }).click();
  22 | 
  23 |   // Wait for navigation to dashboard
  24 |   await page.waitForURL('**/dashboard', { timeout: 15000 });
  25 | }
  26 | 
  27 | export async function loginTestUser(page, email, password) {
  28 |   await page.goto('/login');
  29 |   await page.getByPlaceholder('name@company.com').fill(email);
  30 |   await page.getByPlaceholder('••••••••••••').fill(password);
  31 |   await page.getByRole('button', { name: /sign in/i }).click();
  32 | 
  33 |   // Wait for navigation to dashboard
  34 |   await page.waitForURL('**/dashboard', { timeout: 15000 });
  35 | }
  36 | 
  37 | 
```