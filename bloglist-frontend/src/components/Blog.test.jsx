// bloglist-frontend/src/components/Blog.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import { test, expect, vi } from 'vitest'



// Mock the blogs service module
vi.mock('../services/blogs', () => ({
  update: vi.fn(),
}))


test('renders title and author but not URL or likes by default', () => {
  const blog = {
    id: '1',
    title: 'Test Blog',
    author: 'Test Author',
    url: 'http://testblog.com',
    likes: 0,
    user: { id: 'user1', username: 'testuser', name: 'Test User' },
  }

  const mockUpdateBlog = vi.fn()
  const mockDeleteBlog = vi.fn()
  const user = { username: 'testuser', name: 'Test User' } // Mock user

  render(<Blog blog={blog} updateBlog={mockUpdateBlog} deleteBlog={mockDeleteBlog} user={user} />)

  // Check title and author are visible
  expect(screen.getByText('Test Blog Test Author')).toBeDefined()

  // Check URL and likes are not visible (queryByText returns null if not found)
  expect(screen.queryByText('URL: http://testblog.com')).toBeNull()
  expect(screen.queryByText('Likes: 0')).toBeNull()

})


test('shows URL and likes when view button is clicked', async () => {
  const blog = {
    id: '1',
    title: 'Test Blog',
    author: 'Test Author',
    url: 'http://testblog.com',
    likes: 0,
    user: { id: 'user1', username: 'testuser', name: 'Test User' },
  }
  const mockUpdateBlog = vi.fn()
  const mockDeleteBlog = vi.fn()
  const user = { username: 'testuser', name: 'Test User' } // Mock user

  render(<Blog blog={blog} updateBlog={mockUpdateBlog} deleteBlog={mockDeleteBlog} user={user} />)

  const viewButton = screen.getByText('view')
  await userEvent.click(viewButton)

  // Check URL and likes are visible
  expect(screen.getByText('URL: http://testblog.com')).toBeDefined()
  expect(screen.getByText('Likes: 0')).toBeDefined()

})

test('clicking like button twice calls updateBlog twice', async () => {
  const blog = {
    id: '1',
    title: 'Test Blog',
    author: 'Test Author',
    url: 'http://testblog.com',
    likes: 0,
    user: { id: 'user1', username: 'testuser', name: 'Test User' },
  }
  const mockUpdateBlog = vi.fn(() => Promise.resolve({ ...blog, likes: blog.likes + 1 }))
  const mockDeleteBlog = vi.fn()
  const user = { username: 'testuser', name: 'Test User' } // Mock user

  render(<Blog blog={blog} updateBlog={mockUpdateBlog} deleteBlog={mockDeleteBlog} user={user} />)

  const viewButton = screen.getByText('view')
  await userEvent.click(viewButton) // Show details first

  const likeButton = screen.getByText('like')
  await userEvent.click(likeButton) // First click
  await userEvent.click(likeButton) // Second click

  expect(mockUpdateBlog.mock.calls).toHaveLength(2) // Check called twice
})

