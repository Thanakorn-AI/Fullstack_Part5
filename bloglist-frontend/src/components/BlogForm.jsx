// bloglist-frontend/src/components/BlogForm.jsx
import { useState } from 'react';

const BlogForm = ({ createBlog }) => {
  const [newBlog, setNewBlog] = useState({ title: '', author: '', url: '' });

  const handleBlogSubmit = (event) => {
    event.preventDefault();
    createBlog(newBlog);
    setNewBlog({ title: '', author: '', url: '' }); // Clear form
  };

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
          />
        </div>
        <div>
          author:
          <input
            type="text"
            value={newBlog.author}
            onChange={({ target }) => setNewBlog({ ...newBlog, author: target.value })}
          />
        </div>
        <div>
          url:
          <input
            type="text"
            value={newBlog.url}
            onChange={({ target }) => setNewBlog({ ...newBlog, url: target.value })}
          />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  );
};

export default BlogForm;