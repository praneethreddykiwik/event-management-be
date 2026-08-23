const path = require("path");
const SwaggerParser = require("@apidevtools/swagger-parser");
const swaggerUi = require("swagger-ui-express");

const serverErrorHandler = (err) => {
  console.error("Server error:", err);
};

const appOnError = (err) => {
  console.error("App error:", err);
};

const swaggerHandler = async (app) => {
  const swaggerPath = path.join(__dirname, "../../contracts/swagger.yaml");
  const swaggerDocument = await SwaggerParser.bundle(swaggerPath);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log("Swagger mounted");
};

module.exports = {
  serverErrorHandler,
  appOnError,
  swaggerHandler,
};
