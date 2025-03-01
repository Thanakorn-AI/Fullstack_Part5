// middleware/tokenExtractor.js
const tokenExtractor = (request, response, next) => {
    const authHeader = request.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      request.token = authHeader.substring(7); // Extract token after "Bearer "
    } else {
      request.token = null; // No token if header is missing or malformed
    }
    next(); // Pass control to the next middleware or route handler
  };
  
  module.exports = tokenExtractor;