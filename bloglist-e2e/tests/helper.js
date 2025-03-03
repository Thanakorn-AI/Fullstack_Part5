// bloglist-e2e/tests/helper.js
const loginWith = async (page, username, password) => {
    await page.getByRole('button', { name: 'log in' }).click();
    await page.getByRole('textbox').first().fill(username);
    await page.getByRole('textbox').last().fill(password);
    await page.getByRole('button', { name: 'login' }).click();
  };
  
  const createBlog = async (page, title, author, url) => {
    await page.getByRole('button', { name: 'create new blog' }).click();
    await page.getByPlaceholderText('Enter title').fill(title);
    await page.getByPlaceholderText('Enter author').fill(author);
    await page.getByPlaceholderText('Enter URL').fill(url);
    await page.getByRole('button', { name: 'create' }).click();
    await page.getByText(`${title} ${author}`).waitFor();
  };
  
  module.exports = { loginWith, createBlog };