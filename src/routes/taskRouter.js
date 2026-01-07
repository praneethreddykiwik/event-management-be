const express = require("express");
const controllers = require("../controllers/task.controller");
const validations = require("../middlewares/validations.middleware");

const taskRouter = express.Router();

taskRouter.get(
  "/",
  validations.getTasksByEventUidVal,
  controllers.getTasksByEventUidCtrl
);
// taskRouter.get('/getByQuery', )
// taskRouter.get("/:taskId", validations.getTaskByIdVal, controllers.getTaskById);
taskRouter.post("/", validations.createTaskVal, controllers.createTaskCtrl);
taskRouter.post(
  "/assign-task",
  validations.assignTaskVal,
  controllers.assignTaskCtrl
);
taskRouter.post(
  "/accept-task",
  validations.acceptTaskVal,
  controllers.acceptTaskCtrl
);

taskRouter.post(
  "/decline-task",
  validations.declineTaskVal,
  controllers.declineTaskCtrl
);
taskRouter.put("/", controllers.updateTaskCtrl);
module.exports = taskRouter;
