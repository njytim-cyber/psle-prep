const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

module.exports = async config => {
    const { storageState } = config.projects[0].use;
    const storagePath = storageState || 'test-results/auth.json';

    const dir = path.dirname(storagePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();

    const baseURL = config.use?.baseURL || 'http://localhost:5000';
    console.log(`Global Setup: Navigating to ${baseURL}`);

    await page.goto(baseURL);

    await page.waitForTimeout(2000);

    console.log('Global Setup: Attempting signInAnonymously...');
    const result = await page.evaluate(async () => {
        try {
            if (window.signInAnonymously) {
                return await window.signInAnonymously();
            }
            return { error: 'window.signInAnonymously not found' };
        } catch (e) {
            return { error: e.toString() };
        }
    });

    if (result.error) {
        console.error('Global Setup Error:', result.error);
        fs.writeFileSync('setup-error.log', `Error: ${JSON.stringify(result.error)}`);
        console.log('Continuing without auth state...');
    } else {
        console.log('Global Setup: Signed in successfully.');
        fs.writeFileSync('setup-success.log', 'Success');

        await page.locator('#user-photo').waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });

        await page.context().storageState({ path: storagePath });
        console.log(`Global Setup: Auth state saved to ${storagePath}`);
    }

    await browser.close();
};
