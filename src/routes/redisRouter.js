const express = require("express");
const { errorRes } = require("../models/response.model");
const {
  getSessionCtrl,
  deleteSessionCtrl,
} = require("../controllers/redis.controller");
const { requireAuth } = require("../middlewares/middlewares");
const redisRouter = express.Router(express);

redisRouter.get("/", requireAuth, getSessionCtrl);
redisRouter.delete("/", deleteSessionCtrl);

module.exports = { redisRouter };
