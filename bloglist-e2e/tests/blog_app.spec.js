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
      await expect(page.getByText('Wrong credentials')).toBeVisible();
      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible();
    });
  });

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen');
    });

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click();
      await page.getByPlaceholderText('Enter title').fill('Playwright Blog');
      await page.getByPlaceholderText('Enter author').fill('Playwright Author');
      await page.getByPlaceholderText('Enter URL').fill('http://playwrightblog.com');
      await page.getByRole('button', { name: 'create' }).click();
      await expect(page.getByTestId('blog-title')).toBeVisible();
    });

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, 'Like Test', 'Like Author', 'http://liketest.com');
      await page.getByTestId('blog-title').getByTestId('view-toggle').click();
      await page.getByTestId('blog-title').getByTestId('like-button').click();
      await expect(page.getByText('Likes: 1')).toBeVisible();
    });

    test('a blog can be deleted by its creator', async ({ page }) => {
      await createBlog(page, 'Delete Test', 'Delete Author', 'http://deletetest.com');
      await page.getByTestId('blog-title').getByTestId('view-toggle').click();
      page.on('dialog', dialog => dialog.accept()); // Handle window.confirm
      await page.getByTestId('blog-title').getByTestId('delete-button').click();
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
      await createBlog(page, 'Blog A', 'Author A', 'http://bloga.com');
      await createBlog(page, 'Blog B', 'Author B', 'http://blogb.com');
      await createBlog(page, 'Blog C', 'Author C', 'http://blogc.com');

      await page.getByTestId('blog-title').filter({ hasText: 'Blog A Author A' }).getByTestId('view-toggle').click();
      await page.getByTestId('blog-title').filter({ hasText: 'Blog A Author A' }).getByTestId('like-button').click();
      await page.getByTestId('blog-title').filter({ hasText: 'Blog A Author A' }).getByTestId('like-button').click();

      await page.getByTestId('blog-title').filter({ hasText: 'Blog B Author B' }).getByTestId('view-toggle').click();
      await page.getByTestId('blog-title').filter({ hasText: 'Blog B Author B' }).getByTestId('like-button').click();

      const blogElements = await page.getByTestId('blog-title').all();
      expect(await blogElements[0].textContent()).toContain('Blog A Author A');
      expect(await blogElements[1].textContent()).toContain('Blog B Author B');
      expect(await blogElements[2].textContent()).toContain('Blog C Author C');
    });
  });
});