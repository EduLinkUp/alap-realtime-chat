const redis = require('redis');
require('../utils/colors');

let redisClient;

const connectRedis = async () => {
  // Skip Redis if not configured
  if (!process.env.REDIS_HOST && !process.env.REDIS_URL) {
    console.log('Redis not configured - session management will use in-memory store'.yellow);
    return null;
  }

  try {
    const redisConfig = process.env.REDIS_URL 
      ? { url: process.env.REDIS_URL }
      : {
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379
          },
          password: process.env.REDIS_PASSWORD || undefined
        };

    redisClient = redis.createClient(redisConfig);

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis Client Connected'.cyan));

    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    console.warn(`Redis connection failed: ${error.message}. Continuing without Redis.`.yellow);
    return null;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    return null;
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
