// Fullstack_Part4/middleware/userExtractor.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userExtractor = async (request, response, next) => {
  try {
    if (!request.token) {
      return response.status(401).json({ error: 'token missing' });
    }

    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' });
    }

    const user = await User.findById(decodedToken.id);
    if (!user) {
      return response.status(401).json({ error: 'user not found' });
    }

    request.user = user; // Attach the full user object to request.user
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return response.status(401).json({ error: 'token invalid' });
    }
    return response.status(500).json({ error: 'error extracting user' });
  }

  next(); // Move to the next middleware or route handler
};

module.exports = userExtractor;
