const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { allowedCorsOrigins } = require("./constants/cors.config");

const app = express();

app.use(
  cors({
    origin: allowedCorsOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(morgan("combined"));

module.exports = app;
