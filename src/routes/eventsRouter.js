const express = require("express");
const eventController = require("../controllers/eventsController");
const validations = require("../middlewares/validations.middleware");

const router = express.Router();

router.post(
  "/deleteEvent",
  validations.deleteEventVal,
  eventController.deleteEventController
);
// aadil
// add router
// route /getEventByUid

router.get("/get-event-by-id", eventController.getEventByUidCtrl);

module.exports = router;
