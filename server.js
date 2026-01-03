const http = require("http");
const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");
const { testDbConnection } = require("./src/db/testDb");
const { initializeDb } = require("./src/db/db");
const { registerRedis } = require("./src/redis/redisSessionRegistration");
const router = require("./src/routes/routes");
const middlewares = require("./src/middlewares/middlewares");
const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const port = process.env.PORT || 3000;

console.log("App Starting...");

const startServer = async () => {
  try {
    console.log("Starting server...");

    // await registerRedis(app);

    // Mount routes AFTER session middleware
    const version = "/v1";
    app.use(version, middlewares.logRoute, router);
    console.log("Routes mounted");

    // Mount swagger
    const swaggerDocument = YAML.load(path.join(__dirname, "./swagger.yaml"));
    app.use(`/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    console.log("Swagger mounted");

    // Create HTTP server and initialize DB
    console.log("Creating HTTP server");
    const server = http.createServer(app);

    server.on("error", (err) => {
      console.error("Server error:", err);
    });

    app.on("error", (err) => {
      console.error("App error:", err);
    });

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
