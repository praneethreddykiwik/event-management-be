const { buildSessionMiddleware } = require("../middlewares/session.middleware");

const registerRedis = async (app) => {
  console.log("Redis connection Starting");

  // if (!process.env.SESSION_SECRET) {
  //   console.warn("SESSION_SECRET missing (sessions will fail)");
  //   return;
  // }

  try {
    const sessionMw = await buildSessionMiddleware();
    app.use(sessionMw);
    console.log("Redis connection Success");
  } catch (e) {
    console.error("Redis connection Failed", e);
    process.exit(1);
  }
};

module.exports = { registerRedis };
