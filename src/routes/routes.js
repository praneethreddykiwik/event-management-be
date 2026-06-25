const userRouter = require("./user.router");
const express = require("express");
const healthRouter = require("./health.router");
const tenantRouter = require("./tenant.router");
const taskRouter = require("./task.router");
const authRouter = require("./auth.router");
const eventsRouter = require("./events.router");
const { redisRouter } = require("./redis.router");
const taskCommentsRouter = require("./taskComments.router");
const bookmarkRouter = require("./base.router");

const router = express.Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/events", eventsRouter); // admins, event managers, workers, vendors
router.use("/users", userRouter); // admins, event managers, workers, vendors
router.use("/tenants", tenantRouter); // admins, event managers, workers, vendors
router.use("/tasks", taskRouter); // tasks, status updates
router.use("/tasks-comments", taskCommentsRouter); // tasks comments
// router.use("/notofications"); // WhatsApp and email integration
router.use("/redis-session", redisRouter);
router.use("/bookmark", bookmarkRouter);

module.exports = router;
