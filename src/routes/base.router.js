const express = require("express");
const bookmarkRouter = express.Router();
const validations = require("../middlewares/validations.middleware");
const controllers = require("../controllers/bookmarks.controller");

bookmarkRouter.post(
  "/",
  validations.bookmarkReqVal,
  controllers.bookmarkReqCtrl,
);

bookmarkRouter.get(
  "/bookmark",
  validations.getBookmarkVal,
  controllers.getBookmarkByEntityCtrl,
);

module.exports = bookmarkRouter;
