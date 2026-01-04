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

router.get("/", validations.getEventsVal, eventController.getEventsCtrl);

router.post(
  "/create-event",
  validations.createEventValidation,
  eventController.createEventCtrl
);

module.exports = router;
