const express = require("express");
const eventController = require("../controllers/eventsController");
const validations = require("../middlewares/validations.middleware");
const { validateSession }  = require("../middlewares/session.middleware");

const router = express.Router();

router.get("/",  validateSession, validations.getEventsVal, eventController.getEventsCtrl);

router.post(
  "/create-event",
  validateSession,
  validations.createEventValidation,
  eventController.createEventCtrl
);
router.post(
  "/assign-event",
  validateSession,
  validations.assignEventVal,
  eventController.assignEventCtrl
);

router.put(
  "/accept-event",
  validateSession,
  validations.acceptEventVal,
  eventController.acceptEventCtrl
);

router.put(
  "/decline-event",
  validateSession,
  validations.declineEventVal,
  eventController.deleteEventCtrl
);

router.put(
  "/update-event",
  validateSession,
  validations.updateEventVal,
  eventController.updateEventCtrl
);

router.delete(
  "/delete-event",
  validateSession,
  validations.deleteEventVal,
  eventController.deleteEventCtrl
);

module.exports = router;
