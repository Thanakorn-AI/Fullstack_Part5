// Fullstack_Part4/routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const userExtractor = require('../middleware/userExtractor');
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');


const getTokenFrom = request => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};


router.get('/', async (request, response) => {
  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 });
    response.json(blogs);
  } catch (error) {
    response.status(500).json({ error: 'Error fetching blogs' });
  }
});


router.post('/', async (request, response) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' });
    }
    const user = await User.findById(decodedToken.id);
    const { title, author, url, likes } = request.body;

    const blog = new Blog({
      title,
      author,
      url,
      likes: likes !== undefined ? likes : 0,
      user: user._id
    });

    const savedBlog = await blog.save();

    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    response.status(201).json(await Blog.findById(savedBlog._id).populate('user', { username: 1, name: 1 }));

  } catch (error) {
    console.error('Error saving blog:', error);
    response.status(400).json({ error: 'Error saving the blog' });
  }
});


router.delete('/:id', userExtractor, async (request, response) => { // Add userExtractor
  const user = request.user; // Use user from middleware
  const blog = await Blog.findById(request.params.id);
  if (!blog) {
    return response.status(404).json({ error: 'Blog not found' });
  }
  if (blog.user._id.toString() !== user._id.toString()) {
    return response.status(401).json({ error: 'unauthorized' });
  }
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});



// New PUT route (Update all fields)
router.put('/:id', async (request, response) => {
  try {
    const blog = request.body;
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      { likes: blog.likes, ...blog },
      { new: true, runValidators: true }
    ).populate('user', { username: 1, name: 1 }); // Populate user for frontend
    if (!updatedBlog) {
      return response.status(404).json({ error: 'Blog not found' });
    }
    response.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    response.status(400).json({ error: 'Error updating the blog' });
  }
});




module.exports = router;
