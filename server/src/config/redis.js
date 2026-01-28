const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
  },
  server: {
    port: process.env.PORT || 5000,
  }
};
