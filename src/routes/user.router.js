const express = require("express");
const userController = require("../controllers/user.controller");
const validations = require("../middlewares/validations.middleware");

const router = express.Router();

router.get("/", userController.getUsersCtrl);
router.get("/event-managers", userController.getEventManagersCtrl);
router.post(
  "/register",
  validations.createUserVal,
  userController.createUserCtrl,
);
router.put("/", validations.updateUserVal, userController.updateUserCtrl);
router.get(
  "/user-events-tasks",
  validations.userEventsTasksVal,
  userController.userEventsTasksCtrl,
);
router.delete("/delete-user", userController.deleteUserCtrl);

module.exports = router;
