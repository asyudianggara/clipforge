const Queue = require('bull');
require('dotenv').config();

const testQueue = new Queue('test-connection', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  }
});

console.log('Testing Redis Connection...');

testQueue.client.on('ready', () => {
  console.log('Redis Connection: SUCCESS ✅');
  process.exit(0);
});

testQueue.client.on('error', (err) => {
  console.error('Redis Connection: FAILED ❌');
  console.error(err.message);
  process.exit(1);
});

// Timeout fallback
setTimeout(() => {
  console.error('Redis Connection: TIMEOUT (Server might be down) ❌');
  process.exit(1);
}, 5000);
