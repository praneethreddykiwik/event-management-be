const { createEventReqModel } = require("../models/request.model");
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
const getEventsCtrl = async (req, res) => {
  try {
    const getEventidRes = await services.getEventsService(req.query);

    return res.status(200).json(successRes("success", getEventidRes));
  } catch (err) {
    console.error("getEventsCtrl", err);
    return res.status(400).json(errorRes("server is not responing", err));
  }
};

// module.exports = { deleteEventController, getEventsCtrl };
const createEventCtrl = async (req, res) => {
  try {
    const payload = createEventReqModel(req);
    const createEventRes = await services.createEventService(payload);
    res.status(200).json(successRes("Success", createEventRes));
  } catch (error) {
    console.error("createEventCtrl", error);
    const erorRes = errorRes("getUsers Failed", {}, error.code, error);
    return res.status(400).json(erorRes);
  }
};

module.exports = { deleteEventController, createEventCtrl, getEventsCtrl };
