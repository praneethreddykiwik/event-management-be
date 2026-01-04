const express = require("express");
const controllers = require("../controllers/task.controller");
const validations = require("../middlewares/validations.middleware");

const taskRouter = express.Router();

// taskRouter.get("/", controllers.getAllTask);
// taskRouter.get("/:taskId", validations.getTaskByIdVal, controllers.getTaskById);
taskRouter.post("/", controllers.createTaskCtrl);

module.exports = taskRouter;
