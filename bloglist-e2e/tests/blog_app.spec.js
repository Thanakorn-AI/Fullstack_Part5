// bloglist-e2e/tests/blog_app.spec.js
const { test, expect, beforeEach, describe } = require('@playwright/test');
const { loginWith, createBlog } = require('./helper');

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:5173/api/testing/reset'); // Use proxy
    await request.post('http://localhost:5173/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen',
      },
    });

    await page.goto('/');
  });

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible();
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible();
  });

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByRole('button', { name: 'log in' }).click();
      await page.getByRole('textbox').first().fill('mluukkai');
      await page.getByRole('textbox').last().fill('salainen');
      await page.getByRole('button', { name: 'login' }).click();
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible();
    });

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByRole('button', { name: 'log in' }).click();
      await page.getByRole('textbox').first().fill('mluukkai');
      await page.getByRole('textbox').last().fill('wrong');
      await page.getByRole('button', { name: 'login' }).click();
      await expect(page.getByText('Wrong credentials')).toBeVisible(); // From App.jsx errorMessage
      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible();
    });
  });
});

describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'log in' }).click();
      await page.getByRole('textbox').first().fill('mluukkai');
      await page.getByRole('textbox').last().fill('salainen');
      await page.getByRole('button', { name: 'login' }).click();
    });
  
    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click();
      await page.getByPlaceholderText('Enter title').fill('Playwright Blog');
      await page.getByPlaceholderText('Enter author').fill('Playwright Author');
      await page.getByPlaceholderText('Enter URL').fill('http://playwrightblog.com');
      await page.getByRole('button', { name: 'create' }).click();
      await expect(page.getByText('Playwright Blog Playwright Author')).toBeVisible();
    });
  });

  test('a blog can be liked', async ({ page }) => {
    // Create a blog first
    await page.getByRole('button', { name: 'create new blog' }).click();
    await page.getByPlaceholderText('Enter title').fill('Like Test');
    await page.getByPlaceholderText('Enter author').fill('Like Author');
    await page.getByPlaceholderText('Enter URL').fill('http://liketest.com');
    await page.getByRole('button', { name: 'create' }).click();
  
    await page.getByText('Like Test Like Author').getByRole('button', { name: 'view' }).click();
    await page.getByText('Like Test Like Author').getByRole('button', { name: 'like' }).click();
    await expect(page.getByText('Likes: 1')).toBeVisible();
  });

  test('only creator sees delete button', async ({ page, request }) => {
    // Create blog as mluukkai
    await page.getByRole('button', { name: 'create new blog' }).click();
    await page.getByPlaceholderText('Enter title').fill('Creator Blog');
    await page.getByPlaceholderText('Enter author').fill('Creator Author');
    await page.getByPlaceholderText('Enter URL').fill('http://creatorblog.com');
    await page.getByRole('button', { name: 'create' }).click();
  
    // Check delete button visible for creator
    await page.getByText('Creator Blog Creator Author').getByRole('button', { name: 'view' }).click();
    await expect(page.getByText('Creator Blog Creator Author').getByRole('button', { name: 'delete' })).toBeVisible();
  
    // Log out
    await page.getByRole('button', { name: 'Logout' }).click();
  
    // Create and log in as testuser
    await request.post('/api/users', {
      data: { name: 'Test User', username: 'testuser', password: 'password123' },
    });
    await page.getByRole('button', { name: 'log in' }).click();
    await page.getByRole('textbox').first().fill('testuser');
    await page.getByRole('textbox').last().fill('password123');
    await page.getByRole('button', { name: 'login' }).click();
  
    // Check delete button not visible for testuser
    await page.getByText('Creator Blog Creator Author').getByRole('button', { name: 'view' }).click();
    await expect(page.getByText('Creator Blog Creator Author').getByRole('button', { name: 'delete' })).not.toBeVisible();
  });


  describe('Blog app', () => {
    beforeEach(async ({ page, request }) => {
      await request.post('/api/testing/reset');
      await request.post('/api/users', {
        data: { name: 'Matti Luukkainen', username: 'mluukkai', password: 'salainen' },
      });
  
      await page.goto('/');
    });
  
    describe('When logged in', () => {
      beforeEach(async ({ page }) => {
        await loginWith(page, 'mluukkai', 'salainen');
      });
  
      test('blogs are sorted by likes, most liked first', async ({ page }) => {
        // Create three blogs
        await createBlog(page, 'Blog A', 'Author A', 'http://bloga.com');
        await createBlog(page, 'Blog B', 'Author B', 'http://blogb.com');
        await createBlog(page, 'Blog C', 'Author C', 'http://blogc.com');
  
        // Like blogs: Blog A (2 likes), Blog B (1 like), Blog C (0 likes)
        await page.getByText('Blog A Author A').getByRole('button', { name: 'view' }).click();
        await page.getByText('Blog A Author A').getByRole('button', { name: 'like' }).click();
        await page.getByText('Blog A Author A').getByRole('button', { name: 'like' }).click();
  
        await page.getByText('Blog B Author B').getByRole('button', { name: 'view' }).click();
        await page.getByText('Blog B Author B').getByRole('button', { name: 'like' }).click();
  
        // Check order (most liked first: Blog A, Blog B, Blog C)
        const blogElements = await page.locator('.blogTitle').all();
        expect(await blogElements[0].textContent()).toContain('Blog A Author A');
        expect(await blogElements[1].textContent()).toContain('Blog B Author B');
        expect(await blogElements[2].textContent()).toContain('Blog C Author C');
      });
    });
  });