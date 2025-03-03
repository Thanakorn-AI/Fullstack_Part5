// bloglist-frontend/src/components/BlogForm.test.jsx
import { render, screen } from '@testing-library/react'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'
import { test, expect, vi } from 'vitest'

test('submits new blog with correct details', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)
  const titleInput = screen.page.locator('input[placeholder="Enter title"]')
  const authorInput = screen.page.locator('input[placeholder="Enter author"]')
  const urlInput = screen.page.locator('input[placeholder="Enter URL"]')
  const createButton = screen.getByText('create')

  await user.type(titleInput, 'Test Blog')
  await user.type(authorInput, 'Test Author')
  await user.type(urlInput, 'http://testblog.com')
  await user.click(createButton)

  expect(createBlog.mock.calls[0][0]).toEqual({
    title: 'Test Blog',
    author: 'Test Author',
    url: 'http://testblog.com',
  })
})