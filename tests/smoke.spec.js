import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Our PSLE Adventure/);
});

test('shows login overlay', async ({ page }) => {
    await page.goto('/');

    // Check for login overlay
    const loginOverlay = page.locator('#login-overlay');
    await expect(loginOverlay).toBeVisible();

    // Check for login button
    const loginBtn = page.locator('button', { hasText: 'Sign in with Google' });
    await expect(loginBtn).toBeVisible();
});

