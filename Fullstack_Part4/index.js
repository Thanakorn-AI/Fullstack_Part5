// bloglist-app/index.js
require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const config = require('./utils/config');


mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`Connected to MongoDB: ${config.MONGODB_URI}`))
  .catch(error => console.log('Error connecting to MongoDB:', error.message));

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
