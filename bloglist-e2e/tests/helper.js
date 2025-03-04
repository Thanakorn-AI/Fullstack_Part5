// bloglist-e2e/tests/helper.js
const loginWith = async (page, username, password) => {
    await page.getByTestId('login-button').click();
    await page.getByTestId('username').fill(username);
    await page.getByTestId('password').fill(password);
    await page.getByTestId('login-button').click();
  };
 
  const createBlog = async (page, title, author, url) => {
    await page.getByRole('button', { name: 'create new blog' }).click();
    await page.locator('input[placeholder="Enter title"]').fill(title);
    await page.locator('input[placeholder="Enter author"]').fill(author);
    await page.locator('input[placeholder="Enter URL"]').fill(url);
    await page.getByRole('button', { name: 'create' }).click();

    // Wait for the blog to appear in the list
    await page.getByTestId('blog-title').filter({ hasText: `${title} ${author}` }).waitFor({ timeout: 5000 });

    // Get the blog element
    const blogElement = await page.getByTestId('blog-title').filter({ hasText: `${title} ${author}` });
  
    // Click view to see details
    await blogElement.getByTestId('view-toggle').click();
    
    // Get the ID from the like button data-testid attribute
    const likeButton = await page.getByTestId(/^like-button-/);
    const dataTestId = await likeButton.getAttribute('data-testid');
    const id = dataTestId.replace('like-button-', '');
    
    // Hide details again
    await blogElement.getByTestId('view-toggle').click();
    
    // Return blog object with id
    return {
      id,
      title,
      author,
      url
    };
  };
  
  module.exports = { loginWith, createBlog };