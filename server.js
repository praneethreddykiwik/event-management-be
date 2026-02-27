const http = require("http");
const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");
const { testDbConnection } = require("./src/db/testDb");
const { initializeDb } = require("./src/db/db");
const { registerRedis } = require("./src/redis/redisSessionRegistration");
const router = require("./src/routes/routes");
const middlewares = require("./src/middlewares/middlewares");
const utils = require("./src/utils/server.utils");
const { mainHealth } = require("./src/controllers/health.controller");

const port = process.env.PORT || 8080;
const version = "/v1";

const startServer = async () => {
  console.log("Starting server...");

  try {
    await registerRedis(app);

    // Mount routes AFTER session middleware
    app.use("/health", mainHealth);
    app.use(version, middlewares.logRoute, router);
    console.log("Routes mounted");

    // Mount swagger
    await utils.swaggerHandler(app);

    // Create HTTP server and initialize DB
    console.log("Creating HTTP server");
    const server = http.createServer(app);
    server.on("error", utils.serverErrorHandler);
    app.on("error", utils.appOnError);

    await initializeDb();

    console.log(`Starting server on port ${port}...`);
    server.listen(port, "0.0.0.0", async () => {
      await testDbConnection();
      console.log(`Server listening... on port: ${port}`);
    });
  } catch (err) {
    console.error("Error in startServer:", err);
    process.exit(1);
  }
};

startServer();

// update swagger
// make the image sizes low
