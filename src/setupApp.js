const path = require("path");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const SwaggerParser = require("@apidevtools/swagger-parser");
const app = require("./app");
const { initializeDb } = require("./db/db");
const { registerRedis } = require("./redis/redisSessionRegistration");
const router = require("./routes/routes");
const middlewares = require("./middlewares/middlewares");

const version = "/v1";
let isInitialized = false;

async function setupApp() {
  if (isInitialized) return app;

  try {
    await registerRedis(app);

    // Mount root route endpoint
    app.get("/", (req, res) => {
      res.status(200).json({
        message: "Event Management API is running",
        status: "ok",
        health: "/health",
        docs: "/api-docs",
      });
    });

    // Mount health check endpoint
    app.use("/health", (req, res) => {
      res.status(200).json({ status: "working", env: process.env.NODE_ENV || "development" });
    });

    // Mount API routes
    app.use(version, middlewares.logRoute, router);

    // Mount swagger documentation
    let swaggerPath = path.join(__dirname, "../contracts/swagger.yaml");
    if (!fs.existsSync(swaggerPath)) {
      swaggerPath = path.join(__dirname, "../swagger.yaml");
    }

    if (fs.existsSync(swaggerPath)) {
      try {
        const swaggerDocument = await SwaggerParser.bundle(swaggerPath);
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
      } catch (err) {
        console.error("Swagger bundling error:", err.message);
      }
    }

    // Initialize DB connection pool
    await initializeDb();

    isInitialized = true;
    return app;
  } catch (err) {
    console.error("App initialization error:", err);
    throw err;
  }
}

module.exports = { setupApp };
