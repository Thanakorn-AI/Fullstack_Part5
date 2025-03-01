// bloglist-frontend/src/App.jsx
import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login';
import noteService from './services/blogs';
import Togglable from './components/Togglable';
import BlogForm from './components/BlogForm';



const App = () => {
  const blogFormRef = useRef(); 

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([])
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogs = await blogService.getAll();
        setBlogs(blogs);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };
    if (user) { // Only fetch if logged in (has token)
      fetchBlogs();
    }
  }, [user]); // Depend on user for token updates

  const Notification = ({ message, type = 'error' }) => (
    message && <div style={{ color: type === 'error' ? 'red' : 'green', padding: '10px' }}>{message}</div>
  );

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await loginService.login({ username, password });
      setUser(user); // Save token and user details
      setUsername('');
      setPassword('');
      noteService.setToken(user.token);
      window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user));
    } catch (exception) {
      setErrorMessage(exception.response?.data?.error || 'Wrong credentials');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      noteService.setToken(user.token);
    }
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem('loggedNoteappUser');
    setUser(null);
    noteService.setToken(null); // Clear token
  };


  const createBlog = async (blogObject) => {
    try {
      const blog = await blogService.create(blogObject);
      setBlogs(blogs.concat(blog));
      setSuccessMessage(`a new blog ${blogObject.title} by ${blogObject.author} added`);
      setTimeout(() => setSuccessMessage(null), 5000);
      blogFormRef.current.toggleVisibility(); // Hide form after creation
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Error creating blog');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };


  const loginForm = () => (
    <div>
      <Notification message={errorMessage} type="error" />
      <h2>Log in to application</h2>
      <form onSubmit={handleLogin}>
        <div>
          username
          <input
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );


  if (user === null) {
    return loginForm();
  }

  return (
  <div>
      <Notification message={successMessage} type="success" />
      <h2>Blogs</h2>
      <p>{user.name} logged in</p>
      <button onClick={handleLogout}>Logout</button>
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={createBlog} />
      </Togglable>
      {blogs.map(blog => (
        <Blog key={blog.id} blog={blog} />
      ))}
  </div>
  )
}

export default App