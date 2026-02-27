const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

const allowedOrigins = [
  "https://helm.events",
  "https://www.helm.events",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(morgan("combined"));

module.exports = app;
