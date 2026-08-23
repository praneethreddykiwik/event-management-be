const express = require("express");
const controller = require("../controllers/health.controller");
const healthRouter = express.Router(express);

healthRouter.get("/", (req, res) => {
  console.log("Health GET request received");
  res.status(200).json({ status: "ok" });
});
healthRouter.post("/", controller.healthPost);
healthRouter.delete("/", controller.deleteHealth);
healthRouter.patch("/", controller.patchHealth);

module.exports = healthRouter;
