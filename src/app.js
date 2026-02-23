const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4000",
  "https://ma63kqxkyb.ap-south-1.awsapprunner.com",
];

app.use(
  cors({
    origin: "*",
    // origin: function (origin, callback) {
    //   console.log("cors origin", origin);

    //   if (!origin) {
    //     return callback(null, true);
    //   } // mobile apps, curl, etc.

    //   if (allowedOrigins.includes(origin)) {
    //     console.log("CORS allowed");
    //     return callback(null, true);
    //   }
    //   console.log("CORS not allowed");
    //   return callback(new Error("CORS not allowed"), false);
    // },
    credentials: true,
  }),
);

app.use(express.json());
app.use(morgan("combined"));

module.exports = app;
