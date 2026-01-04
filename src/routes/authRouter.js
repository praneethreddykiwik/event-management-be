const express = require("express");
const controllers = require("../controllers/auth.controller");
const validations = require("../middlewares/validations.middleware");

const authRouter = express.Router();

authRouter.post(
  "/register",
  validations.authRegisterVal,
  controllers.registerCtrl
);

authRouter.post(
  "/login",
  validations.loginValidation,
  controllers.loadUser,
  controllers.authenticateUserCtrl
);

authRouter.get("/me", controllers.loadUserFromSessionCtrl);

authRouter.post("/logout", controllers.logoutCtrl);

module.exports = authRouter;
