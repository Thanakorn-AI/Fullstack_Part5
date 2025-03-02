// bloglist-frontend/src/components/BlogForm.jsx
import { useState } from 'react'
import PropTypes from 'prop-types'

const BlogForm = ({ createBlog }) => {
  const [newBlog, setNewBlog] = useState({ title: '', author: '', url: '' })

  const handleBlogSubmit = (event) => {
    event.preventDefault()
    createBlog(newBlog)
    setNewBlog({ title: '', author: '', url: '' }) // Clear form
  }

  return (
    <div>
      <h3>create new</h3>
      <form onSubmit={handleBlogSubmit}>
        <div>
          title:
          <input
            type="text"
            value={newBlog.title}
            onChange={({ target }) => setNewBlog({ ...newBlog, title: target.value })}
            placeholder='Enter title'
          />
        </div>
        <div>
          author:
          <input
            type="text"
            value={newBlog.author}
            onChange={({ target }) => setNewBlog({ ...newBlog, author: target.value })}
            placeholder='Enter author'
          />
        </div>
        <div>
          url:
          <input
            type="text"
            value={newBlog.url}
            onChange={({ target }) => setNewBlog({ ...newBlog, url: target.value })}
            placeholder='Enter URL'
          />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

BlogForm.propTypes = {
  createBlog: PropTypes.func.isRequired,
}

export default BlogForm