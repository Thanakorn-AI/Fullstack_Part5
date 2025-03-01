// Fullstack_Part4/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.post('/', async (req, res) => {
  const { username, name, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username.length < 3 || password.length < 3) {
    return res.status(400).json({ error: 'Username and password must be at least 3 characters long' });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ error: 'Username must be unique' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash
  });

  const savedUser = await user.save();
  res.status(201).json(savedUser);
});

router.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1, id: 1 });    
  res.json(users);
  });

module.exports = router;
