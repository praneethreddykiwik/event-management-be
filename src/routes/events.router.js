const express = require("express");
const eventController = require("../controllers/eventsController");
const validations = require("../middlewares/validations.middleware");
const { validateSession }  = require("../middlewares/session.middleware");

const router = express.Router();

router.get("/",  validateSession, validations.getEventsVal, eventController.getEventsCtrl);

router.post(
  "/create-event",
  validations.createEventValidation,
  eventController.createEventCtrl
);
router.post(
  "/assign-event",
  validations.assignEventVal,
  eventController.assignEventCtrl
);

router.put(
  "/accept-event",
  validations.acceptEventVal,
  eventController.acceptEventCtrl
);

router.put(
  "/decline-event",
  validations.declineEventVal,
  eventController.deleteEventCtrl
);

router.put(
  "/update-event",
  validations.updateEventVal,
  eventController.updateEventCtrl
);

router.delete(
  "/delete-event",
  validations.deleteEventVal,
  eventController.deleteEventCtrl
);

module.exports = router;
