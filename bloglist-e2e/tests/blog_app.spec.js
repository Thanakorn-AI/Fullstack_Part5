// bloglist-e2e/tests/blog_app.spec.js
const { test, expect, beforeEach, describe } = require('@playwright/test');
const { loginWith, createBlog } = require('./helper');

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset');
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen',
      },
    });

    await page.goto('/');
  });

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByTestId('login-form')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByTestId('login-button').click();
      await page.getByTestId('username').fill('mluukkai');
      await page.getByTestId('password').fill('salainen');
      await page.getByTestId('login-button').click();
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible();
    });

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByTestId('login-button').click();
      await page.getByTestId('username').fill('mluukkai');
      await page.getByTestId('password').fill('wrong');
      await page.getByTestId('login-button').click();
      await expect(page.getByTestId('error-message')).toHaveText('invalid username or password', { timeout: 10000 });
      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible();
    });
  });

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen');
    });

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click();
      await page.locator('input[placeholder="Enter title"]').fill('Playwright Blog');
      await page.locator('input[placeholder="Enter author"]').fill('Playwright Author');
      await page.locator('input[placeholder="Enter URL"]').fill('http://playwrightblog.com');
      await page.getByRole('button', { name: 'create' }).click();
      await expect(page.getByTestId('blog-title')).toBeVisible();
    });


    test('a blog can be liked', async ({ page }) => {
      const blog = await createBlog(page, 'Like Test', 'Like Author', 'http://liketest.com');
      await page.getByTestId('blog-title').getByTestId('view-toggle').click();

      // Get the initial likes count
      const initialLikesText = await page.getByText('Likes:', { exact: false }).textContent();

      await page.getByTestId(`like-button-${blog.id}`).click();

        // Wait for the likes count to change from the initial value
      await expect(async () => {
        const newLikesText = await page.getByText('Likes:', { exact: false }).textContent();
        expect(newLikesText).not.toEqual(initialLikesText);
      }).toPass({ timeout: 15000 });

      await expect(page.getByText('Likes: 1')).toBeVisible({ timeout: 5000 });
    });


    test('a blog can be deleted by its creator', async ({ page }) => {
      await createBlog(page, 'Delete Test', 'Delete Author', 'http://deletetest.com');
      await page.getByTestId('blog-title').getByTestId('view-toggle').click();
      page.on('dialog', dialog => dialog.accept()); // Handle window.confirm
      await page.getByTestId('delete-button').click();
      await expect(page.getByTestId('blog-title')).not.toBeVisible();
    });

    test('only creator sees delete button', async ({ page, request }) => {
      await createBlog(page, 'Creator Blog', 'Creator Author', 'http://creatorblog.com');
      await page.getByTestId('blog-title').getByTestId('view-toggle').click();
      await expect(page.getByTestId('delete-button')).toBeVisible();

      await page.getByRole('button', { name: 'Logout' }).click();

      await request.post('/api/users', {
        data: { name: 'Test User', username: 'testuser', password: 'password123' },
      });
      await page.getByTestId('login-button').click();
      await page.getByTestId('username').fill('testuser');
      await page.getByTestId('password').fill('password123');
      await page.getByTestId('login-button').click();

      await page.getByTestId('blog-title').getByTestId('view-toggle').click();
      await expect(page.getByTestId('delete-button')).not.toBeVisible();
    });

    test('blogs are sorted by likes, most liked first', async ({ page }) => {
      const blogA = await createBlog(page, 'Blog A', 'Author A', 'http://bloga.com');
      const blogB = await createBlog(page, 'Blog B', 'Author B', 'http://blogb.com');
      const blogC = await createBlog(page, 'Blog C', 'Author C', 'http://blogc.com');

      // Like blog A twice
      await page.getByTestId('blog-title').filter({ hasText: 'Blog A' }).getByTestId('view-toggle').click();
      await page.getByTestId(`like-button-${blogA.id}`).click();
      await expect(page.getByText('Likes: 1')).toBeVisible({ timeout: 5000 });
      await page.getByTestId(`like-button-${blogA.id}`).click();
      await expect(page.getByText('Likes: 2')).toBeVisible({ timeout: 5000 });

      // Like blog B once
      await page.getByTestId('blog-title').filter({ hasText: 'Blog B' }).getByTestId('view-toggle').click();
      await page.getByTestId(`like-button-${blogB.id}`).click();
      await expect(page.getByText('Likes: 1')).toBeVisible({ timeout: 5000 });

      // Reload the page to see the sorted list
      await page.reload();
      
      // Wait for blogs to be loaded after refresh
      await expect(page.getByTestId('blog-title').first()).toBeVisible({ timeout: 5000 });
      
      // Get all blog elements after they're loaded
      const blogElements = await page.getByTestId('blog-title').all();
      
      // Make sure we have the expected number of blogs
      expect(blogElements.length).toBeGreaterThanOrEqual(3);
      
      // Check the ordering
      const titles = await Promise.all(blogElements.map(element => element.textContent()));
      expect(titles[0]).toContain('Blog A');
      expect(titles[1]).toContain('Blog B');
      expect(titles[2]).toContain('Blog C');
    });
  });
});
