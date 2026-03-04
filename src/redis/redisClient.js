const { createClient } = require("redis");

let client;

/**
 * REDIS_HOST examples:
 * - Non TLS: redis://my-redis.xxxxxx.ap-south-1.cache.amazonaws.com:6379
 * - TLS:     rediss://my-redis.xxxxxx.ap-south-1.cache.amazonaws.com:6379
 */
function getRedisClient() {
  if (client) {
    return client;
  }
  console.log("Redis Configuration:", {
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_URL: process.env.REDIS_URL,
  });

  // Use host/port configuration (recommended for ElastiCache)
  const redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT) || 6379,
      // No TLS needed since the cluster has encryption disabled
      tls: false,
      connectTimeout: 10000,
      lazyConnect: true,
    },
    // Add retry strategy
    retry_strategy: (options) => {
      if (options.error && options.error.code === "ECONNREFUSED") {
        return new Error("The server refused the connection");
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        return new Error("Retry time exhausted");
      }
      if (options.attempt > 10) {
        return undefined;
      }
      return Math.min(options.attempt * 100, 3000);
    },
  });

  redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  redisClient.on("connect", () => {
    console.log("Redis connection Starting");
  });

  redisClient.on("ready", () => {
    console.log("Redis connection Success");
  });

  return redisClient;
}

async function connectRedis() {
  const c = getRedisClient();
  if (!c.isOpen) {
    await c.connect();
  }
  return c;
}

module.exports = { getRedisClient, connectRedis };
