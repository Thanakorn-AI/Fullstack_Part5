// Fullstack_Part4/models/blog.js
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  url: { type: String, required: true },
  likes: { type: Number, default: 0 },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Transform _id to id and remove _id and __v from the JSON output
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Convert ObjectId to string
    delete returnedObject._id; // Remove _id
    delete returnedObject.__v; // Remove version key
  }
});

const Blog = mongoose.model('Blog', blogSchema, 'Bloglist-app');

module.exports = Blog;
