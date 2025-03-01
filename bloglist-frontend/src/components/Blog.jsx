// bloglist-frontend/src/components/Blog.jsx
import { useState } from 'react';
import blogService from '../services/blogs';

const Blog = ({ blog, updateBlog, deleteBlog, user }) => {
  const [visible, setVisible] = useState(false);

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  };

  const handleLike = async () => {
    const updatedBlog = { 
      ...blog, 
      likes: blog.likes + 1, 
      user: blog.user.id // Send user as ID for backend
    };
    const returnedBlog = await blogService.update(blog.id, updatedBlog);
    updateBlog(returnedBlog); // Update App’s state
  };

  const handleDelete = () => {
    if (window.confirm(`Remove ${blog.title} by ${blog.author}?`)) {
      deleteBlog(blog.id);
    }
  };

  const showDeleteButton = user && blog.user.username === user.username;

  return (
    <div style={blogStyle}>
      <div>
        {blog.title} {blog.author}
        <button onClick={() => setVisible(!visible)}>
          {visible ? 'hide' : 'view'}
        </button>
      </div>
      {visible && (
        <div>
          <p>URL: {blog.url}</p>
          <p>Likes: {blog.likes} <button onClick={handleLike}>like</button></p>
          <p>User: {blog.user.name}</p>
          {showDeleteButton && <button onClick={handleDelete}>delete</button>}
        </div>
      )}
    </div>
  );
};

export default Blog;