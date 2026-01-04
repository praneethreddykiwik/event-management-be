const session = require("express-session");
const connectRedisModule = require("connect-redis");

// If it's new versions: { RedisStore } or { default }
let RedisStore = connectRedisModule.RedisStore || connectRedisModule.default;
// If it's old versions: module itself is a function that needs session
if (!RedisStore && typeof connectRedisModule === "function") {
  RedisStore = connectRedisModule(session);
}

if (!RedisStore) {
  throw new Error(
    "Could not resolve RedisStore from connect-redis. Check connect-redis version."
  );
}

const { connectRedis } = require("../redis/redisClient");

async function buildSessionMiddleware() {
  const redisClient = await connectRedis();

  const isProd = process.env.NODE_ENV === "production";

  return session({
    store: new RedisStore({ client: redisClient }),
    name: process.env.SESSION_COOKIE_NAME || "emdb.sid",
    // secret: "super-secret",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,

      // App Runner is HTTPS behind proxy → in prod secure must be true.
      // For local http://localhost, keep it false otherwise cookie won’t set.
      secure: isProd,

      // If FE and BE are on different domains: use "none".
      // If same site: use "lax".
      sameSite: process.env.SESSION_SAMESITE || (isProd ? "none" : "lax"),
      // sameSite: "none",

      maxAge: Number(process.env.SESSION_MAX_AGE_MS || 86400000), // 1 day
    },
  });
}

module.exports = { buildSessionMiddleware };
