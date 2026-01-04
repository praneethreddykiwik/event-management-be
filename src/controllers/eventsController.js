const { successRes, errorRes } = require("../models/response.model");
const services = require("../services/event.service");

const deleteEventController = async (req, res) => {
  try {
    return res.status(200).json(successRes("Event deleted successfully"));
  } catch (err) {
    return res
      .status(500)
      .json(successRes(err.message || "Internal server error", err));
  }
};

// reference users.controller
// aadil
const getEventByUidCtrl = async (req, res) => {
  const { eventUid, tenantUid } = req.query;

  try {
    const eventid = await services.getEventByUid(tenantUid, eventUid, false);
    if (!eventid) {
      const invalidEventRes = errorRes("eventUid is not found");
      return res.status(404).json(invalidEventRes);
    }

    return res.status(200).json(successRes("success", eventid));
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorRes("server is not responing", err));
  }
};

module.exports = { deleteEventController, getEventByUidCtrl };
