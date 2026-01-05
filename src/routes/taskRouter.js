const express = require("express");
const controllers = require("../controllers/task.controller");
const validations = require("../middlewares/validations.middleware");

const taskRouter = express.Router();

taskRouter.get(
  "/",
  validations.getEventsTasksVal,
  controllers.getEventsTasksCtrl
);
// taskRouter.get("/:taskId", validations.getTaskByIdVal, controllers.getTaskById);
taskRouter.post("/", validations.createTaskVal, controllers.createTaskCtrl);

module.exports = taskRouter;
