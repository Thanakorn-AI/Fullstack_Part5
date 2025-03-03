// bloglist-e2e/tests/blog_app.spec.js
const { test, expect, beforeEach, describe } = require('@playwright/test');

describe('Blog app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible(); // From App.jsx <h2>
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible(); // Login button
  });
});