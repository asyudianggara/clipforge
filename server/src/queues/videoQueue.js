const Queue = require('bull');
const redisConfig = require('../config/redis');

const videoQueue = new Queue('video-processing', {
  redis: redisConfig.redis
});

module.exports = videoQueue;
