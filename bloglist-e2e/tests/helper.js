// bloglist-e2e/tests/helper.js
const loginWith = async (page, username, password) => {
    await page.getByTestId('login-button').click();
    await page.getByTestId('username').fill(username);
    await page.getByTestId('password').fill(password);
    await page.getByTestId('login-button').click();
  };
  
  const createBlog = async (page, title, author, url) => {
    await page.getByRole('button', { name: 'create new blog' }).click();
    await page.getByPlaceholderText('Enter title').fill(title);
    await page.getByPlaceholderText('Enter author').fill(author);
    await page.getByPlaceholderText('Enter URL').fill(url);
    await page.getByRole('button', { name: 'create' }).click();
    await page.getByTestId('blog-title').filter({ hasText: `${title} ${author}` }).waitFor();
  };
  
  module.exports = { loginWith, createBlog };