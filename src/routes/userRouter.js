const express = require("express");
const userController = require("../controllers/user.controller");
const validations = require("../middlewares/validations.middleware");

const router = express.Router();

router.get("/", userController.getUsersCtrl);
router.get("/me", userController.getMeCtrl);

router.put(
  "/updateEventManager",
  validations.updateEventManagerVal,
  userController.updateEventManagerCtrl
);

// router.get("/:id", userController.getUserById);

// router.post("/", userController.createUser);

// router.post("/login", userController.loginUser);

module.exports = router;
