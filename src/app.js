const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:4000",
        "http://localhost:8080",
        "https://ma63kqxkyb.ap-south-1.awsapprunner.com",
      ]
).map((url) => url.trim().replace(/\/$/, ""));

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.trim().replace(/\/$/, ""));
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = origin.trim().replace(/\/$/, "");

      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      // Support any localhost or 127.0.0.1 on any port
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
        return callback(null, true);
      }

      // Support any Vercel deployment domain (*.vercel.app)
      if (/^https:\/\/.*\.vercel\.app$/.test(cleanOrigin)) {
        return callback(null, true);
      }

      console.log("CORS not allowed for origin:", origin);
      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("combined"));

module.exports = app;
