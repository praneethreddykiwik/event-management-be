const { createClient } = require("redis");

let client;

/**
 * REDIS_URL examples:
 * - Non TLS: redis://my-redis.xxxxxx.ap-south-1.cache.amazonaws.com:6379
 * - TLS:     rediss://my-redis.xxxxxx.ap-south-1.cache.amazonaws.com:6379
 */
function getRedisClient() {
  if (client) return client;

  const redisUrl = process.env.REDIS_URL;
  // const redisUrl =
  //   "rediss://master.cache-cluster-on-support.3xkamd.aps1.cache.amazonaws.com:6379";

  if (!redisUrl) throw new Error("REDIS_URL is missing");

  // const isTls = true;
  const isTls =
    process.env.REDIS_TLS === "true" || redisUrl.startsWith("rediss://");

  client = createClient({
    url: redisUrl,
    socket: {
      tls: isTls,
      // For ElastiCache TLS, many teams set this false.
      // If you want strict validation later, set it to true and use proper CA/certs.
      rejectUnauthorized: false,
      // rejectUnauthorized: process.env.REDIS_REJECT_UNAUTHORIZED !== "false",
    },
  });

  client.on("error", (err) => {
    console.error("Redis error:", err);
    process.exit(1);
  });

  return client;
}

async function connectRedis() {
  const c = getRedisClient();
  if (!c.isOpen) await c.connect();
  return c;
}

module.exports = { getRedisClient, connectRedis };
