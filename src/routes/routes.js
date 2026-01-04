const userRouter = require("./userRouter");
const express = require("express");
const healthRouter = require("./healthRouter");
const tenantRouter = require("./tenantRouter");
const authRouter = require("./authRouter");
const eventsRouter = require("./eventsRouter");
const { redisRouter } = require("./redisRouter");
const { requireAuth } = require("../middlewares/middlewares");

const router = express.Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/events", eventsRouter); // admins, event managers, workers, vendors
router.use("/users", requireAuth, userRouter); // admins, event managers, workers, vendors
router.use("/tenants", requireAuth, tenantRouter); // admins, event managers, workers, vendors
// router.use("/tasks"); // tasks, status updates
// router.use("/notofications"); // WhatsApp and email integration
router.use("/redis-session", redisRouter);

module.exports = router;
