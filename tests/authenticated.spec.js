import { test, expect } from '@playwright/test';

test.skip('loads in authenticated state', async ({ page }) => {
    await page.goto('/');

    // Should NOT see login overlay
    const loginOverlay = page.locator('#login-overlay');
    await expect(loginOverlay).not.toBeVisible();

    // Should see sidebar
    const sidebar = page.locator('#sidebar');
    await expect(sidebar).toBeVisible();

    // Should see user profile in sidebar (or header depending on layout)
    // Based on app.js: document.getElementById('user-photo').src = user.photoURL
    const userPhoto = page.locator('#user-photo');
    await expect(userPhoto).toBeVisible();
});
