// bloglist-app/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const blogRoutes = require('./routes/blogRoutes');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const tokenExtractor = require('./middleware/tokenExtractor');
const userExtractor = require('./middleware/userExtractor');

const app = express();

app.use(cors());
app.use(express.json());
app.use(tokenExtractor); // Add middleware before routes

app.use('/api/blogs', userExtractor, blogRoutes); // Apply userExtractor only to /api/blogs
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

module.exports = app;
