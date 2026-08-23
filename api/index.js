// Vercel serverless entrypoint. Mirrors server.js exactly, minus http.listen —
// the app, middlewares, routes, and init order are untouched.
const dotenv = require("dotenv");
dotenv.config();

const app = require("../src/app");
const { initializeDb } = require("../src/db/db");
const { registerRedis } = require("../src/redis/redisSessionRegistration");
const router = require("../src/routes/routes");
const middlewares = require("../src/middlewares/middlewares");
const utils = require("../src/utils/server.utils");
const { mainHealth } = require("../src/controllers/health.controller");
const { validateSession } = require("../src/middlewares/session.middleware");

const version = "/v1";

let initPromise;

async function init() {
  await registerRedis(app);

  app.use("/health", mainHealth);
  app.use(version, middlewares.logRoute, validateSession, router);

  await utils.swaggerHandler(app);
  await initializeDb();

  return app;
}

module.exports = async (req, res) => {
  try {
    if (!initPromise) initPromise = init();
    const readyApp = await initPromise;
    return readyApp(req, res);
  } catch (error) {
    initPromise = undefined;
    console.error("Vercel serverless function error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ error: "Internal Server Error", details: error.message })
    );
  }
};
