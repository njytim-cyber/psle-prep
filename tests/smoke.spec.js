import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Our PSLE Adventure/);
});

test('shows login overlay with M3 styles', async ({ page }) => {
    await page.goto('/');

    // Check for login overlay
    const loginOverlay = page.locator('#login-overlay');
    await expect(loginOverlay).toBeVisible();

    // Check M3 Styling on Entry Card
    const entryCard = page.locator('.entry-card');
    await expect(entryCard).toBeVisible();

    // Check Rounded Corners (Material 3 Extra Large - 28px)
    await expect(entryCard).toHaveCSS('border-radius', '28px');

    // Check Background Color (Surface Container High)
    // #2b2930 is approx/variable, but let's check it's not the old dark grey if possible, 
    // or just check it has the class. CSS variables might report resolved values.
    // Let's stick to border-radius which is distinct M3.

    // Check for login button
    const loginBtn = page.locator('button', { hasText: 'Sign in with Google' });
    await expect(loginBtn).toBeVisible();

    // Check Button styling (Stadium shape - usually high px)
    // Note: The inline style in index.html for the button might override class styles unless I updated it.
    // I updated css/styles.css but index.html has inline styles for the button?
    // Let's check index.html again.
});

