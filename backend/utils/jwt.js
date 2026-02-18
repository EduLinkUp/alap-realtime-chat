const jwt = require('jsonwebtoken');
const { getRedisClient } = require('../config/redis');

const generateToken = async (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });

  // Store session in Redis
  const redisClient = getRedisClient();
  const sessionData = {
    userId,
    createdAt: new Date().toISOString()
  };
  
  // Set session with expiry (7 days in seconds)
  await redisClient.setEx(
    `session:${userId}`,
    7 * 24 * 60 * 60,
    JSON.stringify(sessionData)
  );

  return token;
};

const removeToken = async (userId) => {
  const redisClient = getRedisClient();
  await redisClient.del(`session:${userId}`);
};

module.exports = { generateToken, removeToken };
