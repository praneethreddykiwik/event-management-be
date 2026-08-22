const http = require("http");
const dotenv = require("dotenv");
dotenv.config();

const { setupApp } = require("./src/setupApp");
const { testDbConnection } = require("./src/db/testDb");

const port = process.env.PORT || 8080;

console.log("App Starting...");

const startServer = async () => {
  console.log("Starting server...");

  try {
    const app = await setupApp();

    console.log("Creating HTTP server...");
    const server = http.createServer(app);

    server.on("error", (err) => {
      console.error("Server error:", err);
    });

    app.on("error", (err) => {
      console.error("App error:", err);
    });

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
