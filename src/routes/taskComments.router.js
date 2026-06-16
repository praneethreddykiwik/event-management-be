const express = require("express");

const controllers = require("../controllers/taskComments.controller");
const validations = require("../middlewares/validations.middleware");

const taskCommentsRouter = express.Router();

taskCommentsRouter.get(
  "/:taskUid",
  validations.getTaskCommentsVal,
  controllers.getTaskCommentsController,
);

// taskCommentsRouter.get(
//   "//details",
//   controllers.getTaskCommentByUidController,
// );

taskCommentsRouter.post(
  "/",
  validations.createTaskCommentsVal,
  controllers.createTaskCommentController,
);

taskCommentsRouter.put(
  "/",
  validations.updateTaskCommentsVal,
  controllers.updateTaskCommentController,
);

taskCommentsRouter.delete(
  "/",
  validations.deleteTaskCommentsVal,
  controllers.deleteTaskCommentController,
);

module.exports = taskCommentsRouter;
