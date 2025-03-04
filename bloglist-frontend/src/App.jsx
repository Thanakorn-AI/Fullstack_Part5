// bloglist-frontend/src/App.jsx
import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import PropTypes from 'prop-types'


const App = () => {
  const blogFormRef = useRef()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)


  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogs = await blogService.getAll()
        setBlogs(blogs)
      } catch (error) {
        console.error('Error fetching blogs:', error)
      }
    }
    if (user) { // Only fetch if logged in (has token)
      fetchBlogs()
    }
  }, [user]) // Depend on user for token updates

  const Notification = ({ message, type = 'error' }) => (
    message && <div data-testid="error-message" style={{ color: type === 'error' ? 'red' : 'green', padding: '10px' }}>{message}</div>
  )


  Notification.propTypes = {
    message: PropTypes.string,
    type: PropTypes.oneOf(['error', 'success']).isRequired,
  }


  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      setUser(user) // Save token and user details
      setUsername('')
      setPassword('')
      blogService.setToken(user.token)
      window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user))
    } catch (exception) {
      setErrorMessage(exception.response?.data?.error || 'Wrong credentials')
      setTimeout(() => setErrorMessage(null), 5000)
    }
  }

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogout = () => {
    window.localStorage.removeItem('loggedNoteappUser')
    setUser(null)
    blogService.setToken(null) // Clear token
  }


  const createBlog = async (blogObject) => {
    try {
      const blog = await blogService.create(blogObject)
      setBlogs(blogs.concat(blog))
      setSuccessMessage(`a new blog ${blogObject.title} by ${blogObject.author} added`)
      setTimeout(() => setSuccessMessage(null), 5000)
      blogFormRef.current.toggleVisibility() // Hide form after creation
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Error creating blog')
      setTimeout(() => setErrorMessage(null), 5000)
    }
  }


  const updateBlog = async (id, updatedBlog) => {
    try {
      const response = await blogService.update(id, updatedBlog);
      setBlogs(blogs.map(blog => blog.id === id ? response : blog).sort((a, b) => b.likes - a.likes));
    } catch (error) {
      console.error('Error updating blog:', error);
      setErrorMessage(error.response?.data?.error || 'Error updating blog');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const deleteBlog = async (id) => {
    await blogService.remove(id) // Use updated remove
    const updatedBlogs = await blogService.getAll() // Refetch all blogs
    setBlogs(updatedBlogs)
  }


  const loginForm = () => (
    <div data-testid="login-form">
      <Notification message={errorMessage} type="error" />
      <h2>Log in to application</h2>
      <form onSubmit={handleLogin}>
        <div>
          username
          <input
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
            data-testid="username"
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            data-testid="password"
          />
        </div>
        <button type="submit" data-testid="login-button">login</button>
      </form>
    </div>
  )


  if (user === null) {
    return loginForm()
  }

  // Sort blogs by likes (descending) before rendering
  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

  return (
    <div>
      <Notification message={successMessage} type="success" />
      <h2>Blogs</h2>
      <p>{user.name} logged in</p>
      <button onClick={handleLogout}>Logout</button>
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={createBlog} />
      </Togglable>
      {sortedBlogs.map(blog => (
        <Blog key={blog.id} blog={blog} updateBlog={updateBlog} deleteBlog={deleteBlog} user={user} />
      ))}
    </div>
  )
}

export default App