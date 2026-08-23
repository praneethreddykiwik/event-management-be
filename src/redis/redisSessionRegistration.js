const { buildSessionMiddleware } = require("../middlewares/session.middleware");

const registerRedis = async (app) => {
  console.log("Redis connection Starting");

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
