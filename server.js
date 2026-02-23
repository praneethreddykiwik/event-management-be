const http = require("http");
// const dotenv = require("dotenv");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// dotenv.config();

const app = require("./src/app");
const { testDbConnection } = require("./src/db/testDb");
const { initializeDb } = require("./src/db/db");
const { registerRedis } = require("./src/redis/redisSessionRegistration");
const router = require("./src/routes/routes");
const middlewares = require("./src/middlewares/middlewares");
const swaggerUi = require("swagger-ui-express");
const SwaggerParser = require("@apidevtools/swagger-parser");
const path = require("path");

const port = process.env.PORT || 8080;
const version = "/v1";

console.log("App Starting...");

const startServer = async () => {
  console.log("Starting server...");

  try {
    await registerRedis(app);

    // Mount routes AFTER session middleware
    app.use("/health", (req, res) => {
      console.log("/health working");
      res.status(200).json({ status: "working" });
    });
    app.use(version, middlewares.logRoute, router);
    console.log("Routes mounted");

    // Mount swagger
    const swaggerPath = path.join(__dirname, "./contracts/swagger.yaml");
    const swaggerDocument = await SwaggerParser.bundle(swaggerPath);

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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
