// tests/blog_api.test.js
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const mongoose = require('mongoose');
const Blog = require('../models/blog');
const User = require('../models/user');
const bcrypt = require('bcrypt');

jest.setTimeout(30000);

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI);
  await User.deleteMany({});
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash,
  });
  await user.save();

  const response = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'password123' });
  token = response.body.token;
});

beforeEach(async () => {
  await Blog.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('GET /api/blogs', () => {
  test('blogs are returned as JSON and correct number of blogs', async () => {
    const blog1 = new Blog({
      title: 'Blog 1',
      author: 'Author 1',
      url: 'http://example.com/1',
      likes: 5,
      user: (await User.findOne({ username: 'testuser' }))._id, // Link to test user
    });
    const blog2 = new Blog({
      title: 'Blog 2',
      author: 'Author 2',
      url: 'http://example.com/2',
      likes: 10,
      user: (await User.findOne({ username: 'testuser' }))._id,
    });
    await blog1.save();
    await blog2.save();

    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`) // Add token
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogs = response.body;
    expect(blogs.length).toBe(2);
  });

  test('blog posts have id property instead of _id', async () => {
    const newBlog = new Blog({
      title: 'Test Blog',
      author: 'Test Author',
      url: 'http://test.com',
      likes: 3,
      user: (await User.findOne({ username: 'testuser' }))._id,
    });
    await newBlog.save();

    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`) // Add token
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blog = response.body[0];
    expect(blog.id).toBeDefined();
    expect(blog._id).toBeUndefined();
  });
});

describe('POST /api/blogs', () => {
  test('successfully creates a new blog post', async () => {
    const initialBlogs = await Blog.find({});
    const initialCount = initialBlogs.length;

    const newBlog = {
      title: 'New Test Blog',
      author: 'Test Author',
      url: 'http://testblog.com',
      likes: 7,
    };

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAfter = await Blog.find({});
    expect(blogsAfter.length).toBe(initialCount + 1);

    const returnedBlog = response.body;
    expect(returnedBlog.title).toBe(newBlog.title);
    expect(returnedBlog.author).toBe(newBlog.author);
    expect(returnedBlog.url).toBe(newBlog.url);
    expect(returnedBlog.likes).toBe(newBlog.likes);
    expect(returnedBlog.id).toBeDefined();
  });

  test('missing likes property defaults to 0', async () => {
    const newBlog = {
      title: 'Blog Without Likes',
      author: 'No Likes Author',
      url: 'http://nolikes.com',
    };

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const returnedBlog = response.body;
    expect(returnedBlog.likes).toBe(0);
  });

  test('returns 400 if title is missing', async () => {
    const newBlog = {
      author: 'No Title Author',
      url: 'http://notitle.com',
      likes: 5,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400);
  });

  test('returns 400 if url is missing', async () => {
    const newBlog = {
      title: 'No URL Blog',
      author: 'No URL Author',
      likes: 3,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400);
  });

  test('fails with 401 if no token is provided', async () => {
    const newBlog = {
      title: 'No Token Blog',
      author: 'Test Author',
      url: 'http://test.com',
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });
});

describe('DELETE /api/blogs/:id', () => {
  let user;

  beforeAll(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash('password123', 10);
    user = new User({
      username: 'testuser',
      name: 'Test User',
      passwordHash,
    });
    await user.save();

    const response = await api
      .post('/api/login')
      .send({ username: 'testuser', password: 'password123' });
    token = response.body.token;
  });

  beforeEach(async () => {
    await Blog.deleteMany({});
    const blogToDelete = new Blog({
      title: 'Blog to Delete',
      author: 'Delete Author',
      url: 'http://delete.com',
      likes: 2,
      user: user._id,
    });
    await blogToDelete.save();
  });

  test('successfully deletes an existing blog', async () => {
    const initialBlogs = await Blog.find({});
    const initialCount = initialBlogs.length;
    const blogToDelete = initialBlogs[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const blogsAfter = await Blog.find({});
    expect(blogsAfter.length).toBe(initialCount - 1);

    const blogIds = blogsAfter.map(blog => blog.id);
    expect(blogIds).not.toContain(blogToDelete.id);
  });

  test('returns 404 if blog does not exist', async () => {
    const nonExistentId = '507f1f77bcf86cd799439011';

    await api
      .delete(`/api/blogs/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});

describe('PUT /api/blogs/:id', () => {
  test('successfully updates the likes of an existing blog', async () => {
    const blogToUpdate = new Blog({
      title: 'Blog to Update',
      author: 'Update Author',
      url: 'http://update.com',
      likes: 5,
    });
    const savedBlog = await blogToUpdate.save();

    const updatedData = { likes: 10 };

    const response = await api
      .put(`/api/blogs/${savedBlog.id}`)
      .set('Authorization', `Bearer ${token}`) // Add token
      .send(updatedData)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const updatedBlog = response.body;
    expect(updatedBlog.likes).toBe(10);
    expect(updatedBlog.title).toBe(blogToUpdate.title);
    expect(updatedBlog.author).toBe(blogToUpdate.author);
    expect(updatedBlog.url).toBe(blogToUpdate.url);
    expect(updatedBlog.id).toBe(savedBlog.id);

    const blogInDb = await Blog.findById(savedBlog.id);
    expect(blogInDb.likes).toBe(10);
  });

  test('returns 404 if blog does not exist', async () => {
    const nonExistentId = '507f1f77bcf86cd799439011';
    const updatedData = { likes: 15 };

    await api
      .put(`/api/blogs/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`) // Add token
      .send(updatedData)
      .expect(404);
  });
});
