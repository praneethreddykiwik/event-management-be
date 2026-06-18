const express = require("express");
const router = express.Router();
const validations = require("../middlewares/validations.middleware");

router.post("/bookmark-event", validations.bookmarkEventVal, );
