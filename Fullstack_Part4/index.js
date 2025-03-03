// Fullstack_Part4/index.js
require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const config = require('./utils/config');
const loginRouter = require('./routes/login');
const usersRouter = require('./routes/users');
const blogsRouter = require('./routes/blogRoutes');
const middleware = require('./utils/middleware');


mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`Connected to MongoDB: ${config.MONGODB_URI}`))
  .catch(error => console.log('Error connecting to MongoDB:', error.message));

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);
app.use('/api/blogs', blogsRouter); // Assuming blogRoutes.js from Part 5

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing');
  app.use('/api/testing', testingRouter);
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;