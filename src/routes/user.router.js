const express = require("express");
const userController = require("../controllers/user.controller");
const validations = require("../middlewares/validations.middleware");
const { validateSession } = require("../middlewares/session.middleware");

const router = express.Router();

router.get("/", validateSession, userController.getUsersCtrl);
router.get("/event-managers", validateSession, userController.getEventManagersCtrl);
router.post("/", validateSession, validations.createUserVal, userController.createUserCtrl);
router.put("/", validateSession,validations.updateUserVal, userController.updateUserCtrl);
router.get(
  "/user-events-tasks",
  validateSession,
  validations.userEventsTasksVal,
  userController.userEventsTasksCtrl,
);
router.delete("/delete-user",validateSession, userController.deleteUserCtrl);

module.exports = router;
