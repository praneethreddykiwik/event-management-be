const express = require("express");
const controllers = require("../controllers/task.controller");
const validations = require("../middlewares/validations.middleware");
const { validateSession }  = require("../middlewares/session.middleware");

const taskRouter = express.Router();

taskRouter.get(
  "/",
  validateSession,
  validations.getTasksByEventUidVal,
  controllers.getTasksByEventUidCtrl,
);
// taskRouter.get('/getByQuery', )
// taskRouter.get("/:taskId", validations.getTaskByIdVal, controllers.getTaskById);
taskRouter.post("/", validateSession, validations.createTaskVal, controllers.createTaskCtrl);
taskRouter.post(
  "/assign-task",
  validateSession,
  validations.assignTaskVal,
  controllers.assignTaskCtrl,
);
taskRouter.post(
  "/accept-task",
  validateSession,
  validations.acceptTaskVal,
  controllers.acceptTaskCtrl,
);

taskRouter.post(
  "/decline-task",
  validateSession,
  validations.declineTaskVal,
  controllers.declineTaskCtrl,
);

taskRouter.post(
  "/delete-task",
  validateSession,
  validations.deleteTaskVal,
  controllers.deleteTaskCtrl,
);

// swagger not added
taskRouter.post("/edit", validateSession, validations.editTaskVal, controllers.updateTaskCtrl);
taskRouter.post("/edit", validations.editTaskVal, controllers.updateTaskCtrl);

taskRouter.get(
  "/qa-events-tasks",
  validations.qaEventsAndTasksVal,
  controllers.qaEventsAndTasksCtrl,
);

module.exports = taskRouter;
