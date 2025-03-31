// tests/user_api.test.js
const supertest = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const app = require('../app');

const api = supertest(app);

jest.setTimeout(30000); // Increase timeout to 30 seconds

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000 // Wait longer for connection
  });
});

describe('User API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash('sekret', 10);
    const initialUser = new User({ username: 'root', name: 'Superuser', passwordHash });
    await initialUser.save();
  });

  test('creation succeeds with valid data', async () => {
    const usersAtStart = await User.find({});

    const newUser = {
      username: 'hellas',
      name: 'Arto Hellas',
      password: 'password123'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await User.find({});
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(u => u.username);
    expect(usernames).toContain('hellas');
  });

  test('creation fails if username is missing', async () => {
    const usersAtStart = await User.find({});

    const newUser = {
      name: 'Arto Hellas',
      password: 'password123'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('Username and password are required');

    const usersAtEnd = await User.find({});
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('creation fails if password is missing', async () => {
    const usersAtStart = await User.find({});

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('Username and password are required');

    const usersAtEnd = await User.find({});
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('creation fails if username is too short', async () => {
    const usersAtStart = await User.find({});

    const newUser = {
      username: 'ab',
      name: 'Short User',
      password: 'validpass'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('Username and password must be at least 3 characters long');

    const usersAtEnd = await User.find({});
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('creation fails if password is too short', async () => {
    const usersAtStart = await User.find({});

    const newUser = {
      username: 'validuser',
      name: 'Short Pass',
      password: 'ab'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('Username and password must be at least 3 characters long');

    const usersAtEnd = await User.find({});
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('creation fails if username is not unique', async () => {
    const usersAtStart = await User.find({});

    const newUser = {
      username: 'root', // Already exists from beforeEach
      name: 'Duplicate User',
      password: 'validpass'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('Username must be unique');

    const usersAtEnd = await User.find({});
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
